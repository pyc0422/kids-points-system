create or replace function public.create_house(house_name text, display_name text)
returns public.houses
language plpgsql
security definer
set search_path = public
as $$
declare
  created_house public.houses;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, display_name)
  values (auth.uid(), display_name)
  on conflict (id) do update
    set display_name = excluded.display_name;

  insert into public.houses (name, created_by)
  values (house_name, auth.uid())
  returning * into created_house;

  insert into public.house_members (
    house_id,
    user_id,
    display_name,
    role,
    avatar_color
  )
  values (
    created_house.id,
    auth.uid(),
    display_name,
    'admin',
    'bg-sky-500'
  );

  return created_house;
end;
$$;

grant execute on function public.create_house(text, text) to authenticated;
