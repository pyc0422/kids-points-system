create extension if not exists pgcrypto;

create type public.member_role as enum ('admin', 'parent', 'kid');
create type public.reward_type as enum ('points', 'money');
create type public.activity_frequency as enum (
  'as-needed',
  'weekdays',
  'daily',
  'weekly',
  'monthly'
);
create type public.completion_status as enum (
  'pending',
  'submitted',
  'approved',
  'rejected'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.houses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.house_members (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role public.member_role not null,
  avatar_color text not null default 'bg-sky-500',
  created_at timestamptz not null default now(),
  unique (house_id, user_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  name text not null,
  description text,
  frequency public.activity_frequency not null,
  reward_type public.reward_type not null,
  reward_amount numeric(10, 2) not null check (reward_amount >= 0),
  requires_approval boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.activity_assignees (
  activity_id uuid not null references public.activities(id) on delete cascade,
  member_id uuid not null references public.house_members(id) on delete cascade,
  primary key (activity_id, member_id)
);

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  member_id uuid not null references public.house_members(id) on delete cascade,
  completed_on date not null,
  status public.completion_status not null default 'submitted',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_member_id uuid references public.house_members(id) on delete set null,
  unique (activity_id, member_id, completed_on)
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  member_id uuid not null references public.house_members(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete set null,
  type public.reward_type not null,
  amount numeric(10, 2) not null,
  note text,
  created_by_member_id uuid not null references public.house_members(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index house_members_user_id_idx on public.house_members(user_id);
create index house_members_house_id_idx on public.house_members(house_id);
create index activities_house_id_idx on public.activities(house_id);
create index activity_assignees_member_id_idx on public.activity_assignees(member_id);
create index completions_member_id_completed_on_idx on public.completions(member_id, completed_on);
create index ledger_entries_member_id_created_at_idx on public.ledger_entries(member_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.houses enable row level security;
alter table public.house_members enable row level security;
alter table public.activities enable row level security;
alter table public.activity_assignees enable row level security;
alter table public.completions enable row level security;
alter table public.ledger_entries enable row level security;

create or replace function public.current_member_role(target_house_id uuid)
returns public.member_role
language sql
security definer
set search_path = public
stable
as $$
  select hm.role
  from public.house_members hm
  where hm.house_id = target_house_id
    and hm.user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_member_id(target_house_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select hm.id
  from public.house_members hm
  where hm.house_id = target_house_id
    and hm.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_house_member(target_house_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.house_members hm
    where hm.house_id = target_house_id
      and hm.user_id = auth.uid()
  )
$$;

create or replace function public.is_parent_or_admin(target_house_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_member_role(target_house_id) in ('admin', 'parent')
$$;

create or replace function public.is_admin(target_house_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_member_role(target_house_id) = 'admin'
$$;

create policy "profiles are readable by self"
on public.profiles for select
using (id = auth.uid());

create policy "profiles are insertable by self"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles are updatable by self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "members can read their houses"
on public.houses for select
using (public.is_house_member(id));

create policy "authenticated users can create houses"
on public.houses for insert
with check (created_by = auth.uid());

create policy "admins can update houses"
on public.houses for update
using (public.is_admin(id))
with check (public.is_admin(id));

create policy "house members can read house member list"
on public.house_members for select
using (public.is_house_member(house_id));

create policy "admins can add members"
on public.house_members for insert
with check (public.is_admin(house_id));

create policy "admins can update members"
on public.house_members for update
using (public.is_admin(house_id))
with check (public.is_admin(house_id));

create policy "house members can read activities"
on public.activities for select
using (public.is_house_member(house_id));

create policy "parents and admins can create activities"
on public.activities for insert
with check (
  created_by = auth.uid()
  and public.is_parent_or_admin(house_id)
);

create policy "parents and admins can update activities"
on public.activities for update
using (public.is_parent_or_admin(house_id))
with check (public.is_parent_or_admin(house_id));

create policy "house members can read assignees"
on public.activity_assignees for select
using (
  exists (
    select 1
    from public.activities a
    where a.id = activity_id
      and public.is_house_member(a.house_id)
  )
);

create policy "parents and admins can write assignees"
on public.activity_assignees for all
using (
  exists (
    select 1
    from public.activities a
    where a.id = activity_id
      and public.is_parent_or_admin(a.house_id)
  )
)
with check (
  exists (
    select 1
    from public.activities a
    where a.id = activity_id
      and public.is_parent_or_admin(a.house_id)
  )
);

create policy "members can read relevant completions"
on public.completions for select
using (
  exists (
    select 1
    from public.house_members hm
    join public.activities a on a.id = activity_id
    where hm.id = member_id
      and (
        public.is_parent_or_admin(hm.house_id)
        or hm.user_id = auth.uid()
      )
      and a.house_id = hm.house_id
  )
);

create policy "kids can submit their own completions"
on public.completions for insert
with check (
  status = 'submitted'
  and exists (
    select 1
    from public.house_members hm
    join public.activities a on a.id = activity_id
    where hm.id = member_id
      and hm.user_id = auth.uid()
      and a.house_id = hm.house_id
  )
);

create policy "parents and admins can manage completions"
on public.completions for all
using (
  exists (
    select 1
    from public.house_members hm
    join public.activities a on a.id = activity_id
    where hm.id = member_id
      and a.house_id = hm.house_id
      and public.is_parent_or_admin(hm.house_id)
  )
)
with check (
  exists (
    select 1
    from public.house_members hm
    join public.activities a on a.id = activity_id
    where hm.id = member_id
      and a.house_id = hm.house_id
      and public.is_parent_or_admin(hm.house_id)
  )
);

create policy "members can read relevant ledger entries"
on public.ledger_entries for select
using (
  public.is_parent_or_admin(house_id)
  or member_id = public.current_member_id(house_id)
);

create policy "parents and admins can write ledger entries"
on public.ledger_entries for insert
with check (
  public.is_parent_or_admin(house_id)
  and created_by_member_id = public.current_member_id(house_id)
);

create policy "parents and admins can update ledger entries"
on public.ledger_entries for update
using (public.is_parent_or_admin(house_id))
with check (public.is_parent_or_admin(house_id));
