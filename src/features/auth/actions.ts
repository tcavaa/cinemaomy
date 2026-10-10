"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requestOrigin } from "@/lib/env";
import { fail, formToObject, invalid, ok, safeNext, type FormState } from "@/lib/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const email = z.email("Enter a valid email address").trim().toLowerCase();
const password = z.string().min(8, "Use at least 8 characters").max(72);

function authMessage(error: { message: string; code?: string }) {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match.";
    case "email_not_confirmed":
      return "Please confirm your email first — check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try signing in.";
    case "weak_password":
      return "That password is too weak. Try a longer one.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password"), next: z.string().optional() })
    .safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return fail(authMessage(error));

  redirect(safeNext(parsed.data.next));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Tell us your name").max(120),
      email,
      password,
      next: z.string().optional(),
    })
    .safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const next = safeNext(parsed.data.next);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${await requestOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return fail(authMessage(error));

  // Supabase returns a user without identities when the email is already registered.
  if (data.user && data.user.identities?.length === 0) {
    return fail("An account with this email already exists. Try signing in.");
  }
  if (data.session) redirect(next);

  return ok("Almost there — we've sent you a link to confirm your email.");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ email }).safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await requestOrigin()}/auth/callback?next=/account/password`,
  });
  if (error && error.code?.startsWith("over_")) return fail(authMessage(error));

  // Same answer whether or not the account exists.
  return ok("If that email has an account, a reset link is on its way.");
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ password, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" })
    .safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(authMessage(error));

  return ok("Password updated.");
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Tell us your name").max(120),
      phone: z.string().trim().max(40).optional(),
    })
    .safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.name, phone: parsed.data.phone || null },
  });
  if (error) return fail(authMessage(error));
  // Refresh so the new name is in the session token right away.
  await supabase.auth.refreshSession();

  return ok("Saved.");
}
