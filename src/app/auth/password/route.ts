import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(request: Request, key: "requestError" | "requestStatus", message: string) {
  const url = new URL("/", request.url);
  url.searchParams.set(key, message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const mode = String(formData.get("mode") ?? "signIn");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return redirectWithMessage(request, "requestError", "Enter both email and password.");
  }

  if (password.length < 8) {
    return redirectWithMessage(request, "requestError", "Use at least 8 characters.");
  }

  if (mode === "signUp" && password !== confirmPassword) {
    return redirectWithMessage(request, "requestError", "Passwords do not match.");
  }

  const supabase = await createClient();

  if (mode === "signUp") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return redirectWithMessage(request, "requestError", error.message);
    }

    if (data.session) {
      return NextResponse.redirect(new URL("/", request.url), 303);
    }

    return redirectWithMessage(
      request,
      "requestStatus",
      "Account created. Check your email if confirmation is enabled, then sign in with email and password.",
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirectWithMessage(request, "requestError", error.message);
  }

  return NextResponse.redirect(new URL("/", request.url), 303);
}
