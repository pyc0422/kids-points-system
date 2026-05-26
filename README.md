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

- Role switcher for admin, parent, and kid views.
- Kids see only their own summaries and assigned activities.
- Kids can mark only their own assigned activity as done.
- Approval-required activities move to `submitted`.
- Parents/admins can approve or reject submitted work.
- Approval creates a points or money ledger entry.
- Points and allowance balances are summarized separately.

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
```

## Notes

See [docs/architecture.md](docs/architecture.md) for the permission model and database shape.
See [docs/supabase-setup.md](docs/supabase-setup.md) for the Supabase dashboard setup steps.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
