# Family Points & Allowance Architecture

## Product Rules

- Admins can manage house settings, invite members, assign roles, manage activities, and review submissions.
- Parents can manage activities and review submissions, but cannot change house settings or member roles.
- Kids can view only their own summaries, history, and assigned activities.
- Kids can mark only their own assigned activity as done.
- Kid completion creates a `submitted` record when approval is required.
- Parent/admin approval creates the immutable points or money ledger entry.
- Activities can be `points` or `money`, but those balances stay separate.

## Supabase Tables

```text
profiles
houses
house_members
activities
activity_assignees
completions
ledger_entries
```

## Completion Statuses

```ts
type CompletionStatus = "pending" | "submitted" | "approved" | "rejected";
```

Kids should only write `submitted` completions for their own member id. Approval and ledger creation should happen through trusted server code, such as a Next.js server action or route handler using the Supabase service role key.

## Supabase Authorization Shape

The migrations use Postgres Row Level Security helpers with this shape:

```sql
current_member_role(house_id)
current_member_id(house_id)
is_house_member(house_id)
is_parent_or_admin(house_id)
is_admin(house_id)
```

Rules should enforce:

- Kids can read only their own member profile, completions, and ledger entries.
- Parents/admins can read all house member progress.
- Kids can create/update only their own completion records and only to `submitted`.
- Parents/admins can approve/reject completions.
- Clients cannot create ledger entries directly. Use server code so kids cannot self-award points or money.
