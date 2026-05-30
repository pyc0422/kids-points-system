create or replace function public.update_house_details(
  p_house_id uuid,
  p_house_name text,
  p_member_roles jsonb
)
returns public.houses
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_house public.houses;
  current_count integer;
  provided_count integer;
  admin_count integer;
  item jsonb;
  member_uuid uuid;
  new_role public.member_role;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if public.current_member_role(p_house_id) is distinct from 'admin' then
    raise exception 'Only admins can edit house settings';
  end if;

  if btrim(coalesce(p_house_name, '')) = '' then
    raise exception 'House name is required';
  end if;

  if jsonb_typeof(p_member_roles) <> 'array' then
    raise exception 'Member roles must be an array';
  end if;

  select count(*)
  into current_count
  from public.house_members
  where house_id = p_house_id;

  provided_count := jsonb_array_length(p_member_roles);
  if provided_count <> current_count then
    raise exception 'Member roles are incomplete';
  end if;

  select count(*)
  into admin_count
  from jsonb_array_elements(p_member_roles) as elem
  where coalesce(elem->>'role', '') = 'admin';

  if admin_count < 1 then
    raise exception 'At least one admin is required';
  end if;

  update public.houses
  set name = p_house_name
  where id = p_house_id
  returning * into updated_house;

  for item in select * from jsonb_array_elements(p_member_roles) loop
    member_uuid := coalesce(item->>'member_id', item->>'memberId')::uuid;
    new_role := (item->>'role')::public.member_role;

    if not exists (
      select 1
      from public.house_members
      where id = member_uuid
        and house_id = p_house_id
    ) then
      raise exception 'Member not found';
    end if;

    update public.house_members
    set role = new_role
    where id = member_uuid
      and house_id = p_house_id;
  end loop;

  return updated_house;
end;
$$;

grant execute on function public.update_house_details(uuid, text, jsonb) to authenticated;
