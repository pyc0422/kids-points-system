"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signInWithGoogle() {
    setError(null);
    setStatus(null);
    setIsSubmitting(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    if (data?.url) {
      window.location.assign(data.url);
      return;
    }

    setIsSubmitting(false);
  }

  async function sendMagicLink() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter an email address.");
      return;
    }

    setError(null);
    setStatus(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (magicLinkError) {
      setError(magicLinkError.message);
      setIsSubmitting(false);
      return;
    }

    setStatus(`Check ${trimmedEmail} for the sign-in link.`);
    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-500">Family Points & Allowance</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Use Google or email magic link to access your private family house.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Continue with Google
          </button>

          <div className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            <button
              type="button"
              onClick={sendMagicLink}
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send magic link
            </button>
          </div>
        </div>

        {status ? (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {status}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
