alter table public.house_members
add constraint house_members_user_id_unique unique (user_id);
