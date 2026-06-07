"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthScreen() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signInWithGoogle() {
    setError(null);
    setStatus(null);
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setError("Could not start Google sign-in.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Enter an email address.");
      return;
    }

    setError(null);
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not send the link.");
        return;
      }

      setEmail("");
      setStatus(payload?.message ?? `Check ${trimmedEmail} for the sign-in link.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not send the link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signInWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Enter both email and password.");
      return;
    }

    setError(null);
    setStatus(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setStatus("Signed in successfully.");
      window.location.assign("/");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signUpWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Enter both email and password.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setStatus(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setStatus(
        "Account created. Check your email if confirmation is enabled, then sign in with email and password."
      );
      setMode("signIn");
      setConfirmPassword("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-500">Family Points & Allowance</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Use email and password first, or Google if you prefer.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "signIn" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signUp")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "signUp" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-white"
              }`}
            >
              Create account
            </button>
          </div>

          <form className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-4" onSubmit={mode === "signIn" ? signInWithPassword : signUpWithPassword}>
            <div className="text-sm font-semibold text-zinc-950">
              {mode === "signIn" ? "Email and password" : "Create your account"}
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                inputMode="email"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            {mode === "signUp" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                />
              </label>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSubmitting
                ? mode === "signIn"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signIn"
                  ? "Sign in with email and password"
                  : "Create account"}
            </button>
          </form>

          <form className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4" onSubmit={sendMagicLink}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                inputMode="email"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send magic link"}
            </button>
          </form>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Continue with Google
          </button>
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
