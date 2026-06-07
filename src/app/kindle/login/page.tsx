import { redirect } from "next/navigation";
import { getKindleSessionHouseId } from "@/lib/kindle/auth";
import { kindleLoginAction } from "../actions";

export default async function KindleLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const houseId = await getKindleSessionHouseId();
  const { error } = await searchParams;

  if (houseId) {
    redirect("/kindle");
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
      <div className="kindle-login border-4 border-black p-6">
        <h2 className="mb-6 text-3xl font-black">Enter PIN</h2>
        <form action={kindleLoginAction} className="space-y-4">
          <label className="kindle-field block">
            <span className="kindle-label mb-2 block text-lg font-bold">Family PIN</span>
            <input
              className="w-full border-2 border-black bg-white px-4 py-4 text-3xl font-black text-black"
              inputMode="numeric"
              name="pin"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="text-lg font-bold">Try that PIN again.</p> : null}
          <button className="kindle-submit w-full bg-black px-4 py-4 text-xl font-black text-white" type="submit">
            Unlock
          </button>
        </form>
      </div>
    </section>
  );
}
