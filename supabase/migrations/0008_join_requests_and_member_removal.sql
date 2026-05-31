create type public.house_join_request_status as enum (
  'pending',
  'approved',
  'denied'
);

create table public.house_join_requests (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role public.member_role not null,
  status public.house_join_request_status not null default 'pending',
  reviewed_by_member_id uuid references public.house_members(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (house_id, requested_by)
);

create index house_join_requests_house_id_status_created_at_idx
  on public.house_join_requests(house_id, status, created_at desc);

alter table public.house_join_requests enable row level security;

create policy "requesters and house members can read join requests"
on public.house_join_requests for select
using (
  requested_by = auth.uid()
  or public.is_admin(house_id)
);

create policy "authenticated users can create join requests"
on public.house_join_requests for insert
with check (requested_by = auth.uid());

create or replace function public.request_join_house(
  p_house_ref text,
  p_display_name text,
  p_role public.member_role
)
returns public.house_join_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  target_house public.houses;
  join_request public.house_join_requests;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if btrim(coalesce(p_display_name, '')) = '' then
    raise exception 'Display name is required';
  end if;

  if p_role not in ('kid', 'parent') then
    raise exception 'Invalid role';
  end if;

  select *
  into target_house
  from public.houses
  where id::text = btrim(p_house_ref)
     or invite_code = upper(btrim(p_house_ref))
  limit 1;

  if not found then
    raise exception 'House not found';
  end if;

  if public.is_house_member(target_house.id) then
    raise exception 'You are already a member of this house';
  end if;

  insert into public.house_join_requests (
    house_id,
    requested_by,
    display_name,
    role,
    status,
    reviewed_by_member_id,
    reviewed_at
  )
  values (
    target_house.id,
    auth.uid(),
    p_display_name,
    p_role,
    'pending',
    null,
    null
  )
  on conflict (house_id, requested_by)
  do update set
    display_name = excluded.display_name,
    role = excluded.role,
    status = 'pending',
    reviewed_by_member_id = null,
    reviewed_at = null
  returning * into join_request;

  return join_request;
end;
$$;

create or replace function public.approve_join_request(
  p_house_id uuid,
  p_request_id uuid
)
returns public.house_join_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.house_join_requests;
  reviewer_member_id uuid;
  target_member_id uuid;
  current_active_house uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if public.current_member_role(p_house_id) is distinct from 'admin' then
    raise exception 'Only admins can approve join requests';
  end if;

  select *
  into request_row
  from public.house_join_requests
  where id = p_request_id
    and house_id = p_house_id
  for update;

  if not found then
    raise exception 'Join request not found';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Join request is no longer pending';
  end if;

  select id
  into reviewer_member_id
  from public.house_members
  where house_id = p_house_id
    and user_id = auth.uid()
  limit 1;

  if reviewer_member_id is null then
    raise exception 'Reviewer membership not found';
  end if;

  select id
  into target_member_id
  from public.house_members
  where house_id = p_house_id
    and user_id = request_row.requested_by
  limit 1;

  if target_member_id is null then
    insert into public.house_members (
      house_id,
      user_id,
      display_name,
      role,
      avatar_color
    )
    values (
      p_house_id,
      request_row.requested_by,
      request_row.display_name,
      request_row.role,
      'bg-sky-500'
    );
  end if;

  update public.profiles
  set active_house_id = coalesce(active_house_id, p_house_id)
  where id = request_row.requested_by;

  update public.house_join_requests
  set status = 'approved',
      reviewed_by_member_id = reviewer_member_id,
      reviewed_at = now()
  where id = request_row.id
  returning * into request_row;

  return request_row;
end;
$$;

create or replace function public.deny_join_request(
  p_house_id uuid,
  p_request_id uuid
)
returns public.house_join_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.house_join_requests;
  reviewer_member_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if public.current_member_role(p_house_id) is distinct from 'admin' then
    raise exception 'Only admins can deny join requests';
  end if;

  select *
  into request_row
  from public.house_join_requests
  where id = p_request_id
    and house_id = p_house_id
  for update;

  if not found then
    raise exception 'Join request not found';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Join request is no longer pending';
  end if;

  select id
  into reviewer_member_id
  from public.house_members
  where house_id = p_house_id
    and user_id = auth.uid()
  limit 1;

  if reviewer_member_id is null then
    raise exception 'Reviewer membership not found';
  end if;

  update public.house_join_requests
  set status = 'denied',
      reviewed_by_member_id = reviewer_member_id,
      reviewed_at = now()
  where id = request_row.id
  returning * into request_row;

  return request_row;
end;
$$;

create or replace function public.remove_house_member(
  p_house_id uuid,
  p_member_id uuid
)
returns public.house_members
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_role public.member_role;
  target_member public.house_members;
  admin_count integer;
  remaining_active_house uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select public.current_member_role(p_house_id)
  into requester_role;

  if requester_role is distinct from 'admin' then
    raise exception 'Only admins can remove house members';
  end if;

  select *
  into target_member
  from public.house_members
  where id = p_member_id
    and house_id = p_house_id
  for update;

  if not found then
    raise exception 'Member not found';
  end if;

  select count(*)
  into admin_count
  from public.house_members
  where house_id = p_house_id
    and role = 'admin';

  if target_member.role = 'admin' and admin_count <= 1 then
    raise exception 'At least one admin is required';
  end if;

  delete from public.house_members
  where id = target_member.id
  returning * into target_member;

  select hm.house_id
  into remaining_active_house
  from public.house_members hm
  where hm.user_id = target_member.user_id
  order by hm.created_at asc
  limit 1;

  update public.profiles
  set active_house_id = remaining_active_house
  where id = target_member.user_id
    and active_house_id = p_house_id;

  return target_member;
end;
$$;

grant execute on function public.request_join_house(text, text, public.member_role) to authenticated;
grant execute on function public.approve_join_request(uuid, uuid) to authenticated;
grant execute on function public.deny_join_request(uuid, uuid) to authenticated;
grant execute on function public.remove_house_member(uuid, uuid) to authenticated;
