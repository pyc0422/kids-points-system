alter table public.ledger_entries
  add column if not exists completed_on date;

update public.ledger_entries
set completed_on = coalesce(completed_on, (created_at at time zone 'America/Chicago')::date)
where activity_id is not null
  and completed_on is null;

create index if not exists ledger_entries_member_id_completed_on_idx
  on public.ledger_entries(member_id, completed_on desc);

create index if not exists ledger_entries_activity_id_completed_on_idx
  on public.ledger_entries(activity_id, completed_on desc);
