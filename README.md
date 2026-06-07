# Kids Points System

A private family web app for managing both screen-time-style points and allowance chores in one house.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres-ready client setup
- Recharts for progress charts
- Lucide React for icons

## Current Prototype

- Supabase-backed Google login and house setup.
- Kids see only their own summaries and assigned activities.
- Kids can mark only their own assigned activity as done.
- Approval-required activities move to `submitted`.
- Parents/admins can approve or reject submitted work.
- Approval creates a points or money ledger entry.
- Points and allowance balances are summarized separately.
- Activities, completions, and balance adjustments write to Supabase.
- Kindle-friendly family PIN app at `/kindle` using the same Supabase database.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Environment

Create `.env.local` when you are ready to connect a Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KINDLE_FAMILY_HOUSE_ID=
KINDLE_FAMILY_PIN=
KINDLE_SESSION_SECRET=
```

## Notes

See [docs/architecture.md](docs/architecture.md) for the permission model and database shape.
See [docs/supabase-setup.md](docs/supabase-setup.md) for the Supabase dashboard setup steps.
See [docs/docker-nas.md](docs/docker-nas.md) for NAS/Docker deployment notes. The Docker image listens on port `3000`.

The app currently creates the first house/admin after login. Adding kid/parent
members through the UI is the next backend feature; until then, additional
members can be inserted in Supabase.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
