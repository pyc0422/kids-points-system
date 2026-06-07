# Supabase Setup

## 1. Create the Supabase project

1. Go to [Supabase](https://supabase.com/dashboard).
2. Create a new project.
3. Save the project password somewhere secure.
4. Wait for the project to finish provisioning.

## 2. Copy environment variables

In Supabase, open **Project Settings > API**.

Copy these values into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it in client components or commit it.

## 3. Run the SQL migrations

In Supabase, open **SQL Editor** and run these files in order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_house_creation_rpc.sql`
3. `supabase/migrations/0003_join_house_rpc.sql`
4. `supabase/migrations/0005_active_house_and_multi_membership.sql`
5. `supabase/migrations/0006_activity_repeat_on.sql`
6. `supabase/migrations/0007_update_house_details_rpc.sql`
7. `supabase/migrations/0008_join_requests_and_member_removal.sql`
8. `supabase/migrations/0009_ledger_completed_on_and_activity_edit_window.sql`
9. `supabase/migrations/0010_activity_mark_rpc.sql`
10. `supabase/migrations/0011_kindle_next_items.sql`
11. `supabase/migrations/0012_kindle_next_item_kind.sql`

The migration creates:

- house/member tables
- activities and assignees
- completions
- immutable balance ledger entries
- role enums
- Row Level Security policies
- a `create_house(house_name, display_name)` RPC that creates the first admin member
- a `join_house(house_ref, display_name, role)` RPC that accepts a house UUID or invite code
- an `update_house_details(p_house_id, p_house_name, p_member_roles)` RPC for admin edits
- a `house_join_requests` table for pending approvals
- `request_join_house`, `approve_join_request`, `deny_join_request`, and `remove_house_member` RPCs
- a `kindle_next_items` table for the PIN-protected Kindle app's future-date list
- event/birthday type fields on Kindle Next items

## 4. Enable Google login

In Supabase, open **Authentication > Providers > Google**.

You will need a Google OAuth client from [Google Cloud Console](https://console.cloud.google.com/):

1. Create or select a Google Cloud project.
2. Configure the OAuth consent screen.
3. Create an OAuth client ID for a web application.
4. Add Supabase's callback URL from the Google provider page as an authorized redirect URI.
5. Paste the Google Client ID and Client Secret into Supabase's Google provider settings.
6. Enable the provider.

Supabase's Google login docs describe the same callback requirement: [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google).

## 5. Configure app redirect URLs

In Supabase, open **Authentication > URL Configuration**.

For local development:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
```

When deployed, add the production callback URL too:

```text
https://your-domain.com/auth/callback
```

## 6. Generate fresh TypeScript DB types later

The repo includes hand-written starter types in `src/lib/supabase/database.types.ts`.
After the schema stabilizes, generate types from the real project:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > src/lib/supabase/database.types.ts
```
