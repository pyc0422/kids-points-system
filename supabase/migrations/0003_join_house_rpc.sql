create or replace function public.join_house(house_ref text, display_name text, role public.member_role)
returns public.houses
language plpgsql
security definer
set search_path = public
as $$
declare
  joined_house public.houses;
  house_uuid uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, display_name)
  values (auth.uid(), display_name)
  on conflict (id) do update
    set display_name = excluded.display_name;

  begin
    house_uuid := house_ref::uuid;
  exception
    when invalid_text_representation then
      house_uuid := null;
  end;

  select * into joined_house
  from public.houses
  where (house_uuid is not null and id = house_uuid)
     or upper(invite_code) = upper(house_ref)
  limit 1;

  if not found then
    raise exception 'House not found';
  end if;

  if role = 'admin' then
    raise exception 'Only the house creator can be an admin';
  end if;

  if exists (
    select 1
    from public.house_members hm
    where hm.house_id = joined_house.id
      and hm.user_id = auth.uid()
  ) then
    null;
  else
    insert into public.house_members (
      house_id,
      user_id,
      display_name,
      role,
      avatar_color
    )
    values (
      joined_house.id,
      auth.uid(),
      display_name,
      role,
      'bg-sky-500'
    );
  end if;

  update public.profiles
  set active_house_id = joined_house.id
  where id = auth.uid();

  return joined_house;
end;
$$;

grant execute on function public.join_house(text, text, public.member_role) to authenticated;
