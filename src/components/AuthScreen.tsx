"use client";

import { createClient } from "@/lib/supabase/client";

export function AuthScreen() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-500">Family Points & Allowance</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Use Google to access your private family house.
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Continue with Google
        </button>
      </section>
    </main>
  );
}
