alter table public.profiles
add column if not exists active_house_id uuid references public.houses(id) on delete set null;

alter table public.house_members
drop constraint if exists house_members_user_id_unique;
