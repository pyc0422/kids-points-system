export function EmptyHouseState() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold">No kids are set up yet</h2>
      <p className="mt-2 text-sm text-zinc-500">
        The database is connected. Add kid members in Supabase for now, then this
        dashboard will show activities, balances, and charts for them.
      </p>
    </section>
  );
}
