create or replace function public.apply_activity_mark(
  p_house_id uuid,
  p_activity_id uuid,
  p_member_id uuid,
  p_completed_on date,
  p_status public.completion_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  activity_row public.activities%rowtype;
  target_member public.house_members%rowtype;
  current_member public.house_members%rowtype;
  audit_note text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into activity_row
  from public.activities
  where id = p_activity_id
    and house_id = p_house_id;

  if not found then
    raise exception 'Activity not found';
  end if;

  select *
  into target_member
  from public.house_members
  where id = p_member_id
    and house_id = p_house_id;

  if not found then
    raise exception 'Member not found';
  end if;

  select *
  into current_member
  from public.house_members
  where house_id = p_house_id
    and user_id = auth.uid()
  limit 1;

  if not found then
    raise exception 'Current member not found';
  end if;

  if activity_row.frequency = 'as-needed' then
    if current_member.role not in ('admin', 'parent') and current_member.id <> target_member.id then
      raise exception 'You can only mark your own activity';
    end if;

    insert into public.ledger_entries (
      house_id,
      member_id,
      activity_id,
      completed_on,
      type,
      amount,
      created_by_member_id
    )
    values (
      p_house_id,
      p_member_id,
      p_activity_id,
      p_completed_on,
      activity_row.reward_type,
      activity_row.reward_amount,
      current_member.id
    );

    audit_note := format('Marked %s on %s', activity_row.name, p_completed_on);

    insert into public.ledger_entries (
      house_id,
      member_id,
      activity_id,
      completed_on,
      type,
      amount,
      note,
      created_by_member_id
    )
    values (
      p_house_id,
      p_member_id,
      p_activity_id,
      p_completed_on,
      activity_row.reward_type,
      0,
      audit_note,
      current_member.id
    );

    return;
  end if;

  if current_member.role in ('admin', 'parent') then
    if p_status not in ('submitted', 'approved') then
      raise exception 'Invalid status';
    end if;
  else
    if current_member.id <> target_member.id or p_status <> 'submitted' then
      raise exception 'You can only submit your own activity';
    end if;
  end if;

  insert into public.completions (
    activity_id,
    member_id,
    completed_on,
    status,
    submitted_at,
    reviewed_at,
    reviewer_member_id
  )
  values (
    p_activity_id,
    p_member_id,
    p_completed_on,
    p_status,
    now(),
    case when p_status in ('approved', 'rejected') then now() else null end,
    case when p_status in ('approved', 'rejected') then current_member.id else null end
  )
  on conflict (activity_id, member_id, completed_on)
  do update set
    status = excluded.status,
    submitted_at = excluded.submitted_at,
    reviewed_at = excluded.reviewed_at,
    reviewer_member_id = excluded.reviewer_member_id;

  if p_status = 'approved' then
    delete from public.ledger_entries
    where house_id = p_house_id
      and member_id = p_member_id
      and activity_id = p_activity_id
      and completed_on = p_completed_on;

    insert into public.ledger_entries (
      house_id,
      member_id,
      activity_id,
      completed_on,
      type,
      amount,
      created_by_member_id
    )
    values (
      p_house_id,
      p_member_id,
      p_activity_id,
      p_completed_on,
      activity_row.reward_type,
      activity_row.reward_amount,
      current_member.id
    );

    audit_note := format('Marked %s on %s', activity_row.name, p_completed_on);

    insert into public.ledger_entries (
      house_id,
      member_id,
      activity_id,
      completed_on,
      type,
      amount,
      note,
      created_by_member_id
    )
    values (
      p_house_id,
      p_member_id,
      p_activity_id,
      p_completed_on,
      activity_row.reward_type,
      0,
      audit_note,
      current_member.id
    );
  end if;
end;
$$;

create or replace function public.remove_activity_mark(
  p_house_id uuid,
  p_activity_id uuid,
  p_member_id uuid,
  p_completed_on date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  activity_row public.activities%rowtype;
  target_member public.house_members%rowtype;
  current_member public.house_members%rowtype;
  audit_note text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into activity_row
  from public.activities
  where id = p_activity_id
    and house_id = p_house_id;

  if not found then
    raise exception 'Activity not found';
  end if;

  select *
  into target_member
  from public.house_members
  where id = p_member_id
    and house_id = p_house_id;

  if not found then
    raise exception 'Member not found';
  end if;

  select *
  into current_member
  from public.house_members
  where house_id = p_house_id
    and user_id = auth.uid()
  limit 1;

  if not found then
    raise exception 'Current member not found';
  end if;

  if current_member.role not in ('admin', 'parent') and current_member.id <> target_member.id then
    raise exception 'You can only remove your own activity mark';
  end if;

  if activity_row.frequency = 'as-needed' then
    delete from public.ledger_entries
    where id = (
      select id
      from public.ledger_entries
      where house_id = p_house_id
        and member_id = p_member_id
        and activity_id = p_activity_id
        and completed_on = p_completed_on
      order by created_at desc
      limit 1
    );

    audit_note := format('Removed %s on %s', activity_row.name, p_completed_on);

    insert into public.ledger_entries (
      house_id,
      member_id,
      activity_id,
      completed_on,
      type,
      amount,
      note,
      created_by_member_id
    )
    values (
      p_house_id,
      p_member_id,
      p_activity_id,
      p_completed_on,
      activity_row.reward_type,
      0,
      audit_note,
      current_member.id
    );

    return;
  end if;

  delete from public.completions
  where activity_id = p_activity_id
    and member_id = p_member_id
    and completed_on = p_completed_on;

  delete from public.ledger_entries
  where house_id = p_house_id
    and member_id = p_member_id
    and activity_id = p_activity_id
    and completed_on = p_completed_on;

  audit_note := format('Removed %s on %s', activity_row.name, p_completed_on);

  insert into public.ledger_entries (
    house_id,
    member_id,
    activity_id,
    completed_on,
    type,
    amount,
    note,
    created_by_member_id
  )
  values (
    p_house_id,
    p_member_id,
    p_activity_id,
    p_completed_on,
    activity_row.reward_type,
    0,
    audit_note,
    current_member.id
  );
end;
$$;

grant execute on function public.apply_activity_mark(uuid, uuid, uuid, date, public.completion_status) to authenticated;
grant execute on function public.remove_activity_mark(uuid, uuid, uuid, date) to authenticated;
