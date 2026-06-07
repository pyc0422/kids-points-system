create table if not exists public.kindle_next_items (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  due_on date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists kindle_next_items_house_due_on_idx
  on public.kindle_next_items(house_id, due_on asc, created_at asc);

alter table public.kindle_next_items enable row level security;
