alter table public.kindle_next_items
  add column if not exists kind text not null default 'event'
    check (kind in ('event', 'birthday'));

alter table public.kindle_next_items
  add column if not exists original_date date;
