"use client";

import Link from "next/link";
import { ActionForm, FormField, FormMessage, SubmitButton, useActionFormState } from "@/components/forms/action-form";
import { Input } from "@/components/ui/field";
import { requestPasswordReset, signIn, signUp, updatePassword, updateProfile } from "../actions";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  return (
    <ActionForm action={signIn} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      {notice && <p className="border-l-2 border-vermilion pl-3 font-ui text-[0.92rem] text-vermilion">{notice}</p>}
      <FormField name="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormField name="password" label="Password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </FormField>
      <FormMessage />
      <SubmitButton size="lg" arrow pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
      <div className="flex flex-wrap justify-between gap-3 font-ui text-[0.9rem]">
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-oxblood underline underline-offset-3">
          Create an account
        </Link>
        <Link href="/forgot-password" className="text-ink-3 hover:text-ink">
          Forgot password?
        </Link>
      </div>
    </ActionForm>
  );
}

function RegisterFields({ next }: { next: string }) {
  const { state } = useActionFormState();
  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-poster text-[2.2rem] leading-none text-oxblood">Check your inbox.</p>
        <p className="font-ui text-[0.98rem] text-ink-2">{state.message}</p>
        <p className="font-ui text-[0.9rem] text-ink-3">
          Already confirmed?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-oxblood underline underline-offset-3">
            Sign in
          </Link>
        </p>
      </div>
    );
  }
  return (
    <>
      <input type="hidden" name="next" value={next} />
      <FormField name="name" label="Name">
        <Input id="name" name="name" autoComplete="name" required />
      </FormField>
      <FormField name="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormField name="password" label="Password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </FormField>
      <FormMessage />
      <SubmitButton size="lg" arrow pendingLabel="Creating your account…" className="w-full">
        Create account
      </SubmitButton>
      <p className="font-ui text-[0.9rem] text-ink-3">
        Have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-oxblood underline underline-offset-3">
          Sign in
        </Link>
      </p>
    </>
  );
}

export function RegisterForm({ next }: { next: string }) {
  return (
    <ActionForm action={signUp} className="flex flex-col gap-5">
      <RegisterFields next={next} />
    </ActionForm>
  );
}

export function ForgotPasswordForm() {
  return (
    <ActionForm action={requestPasswordReset} className="flex flex-col gap-5">
      <FormField name="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormMessage />
      <SubmitButton size="lg" arrow pendingLabel="Sending…" className="w-full">
        Send reset link
      </SubmitButton>
      <Link href="/login" className="font-ui text-[0.9rem] text-ink-3 hover:text-ink">
        Back to sign in
      </Link>
    </ActionForm>
  );
}

export function NewPasswordForm() {
  return (
    <ActionForm action={updatePassword} resetOnSuccess className="flex flex-col gap-5">
      <FormField name="password" label="New password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </FormField>
      <FormField name="confirm" label="Repeat it">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </FormField>
      <FormMessage />
      <SubmitButton arrow pendingLabel="Saving…">
        Save password
      </SubmitButton>
    </ActionForm>
  );
}

export function ProfileForm({ name, phone, email }: { name: string | null; phone: string | null; email: string }) {
  return (
    <ActionForm action={updateProfile} className="flex flex-col gap-5">
      <FormField name="email-display" label="Email">
        <Input id="email-display" value={email} disabled readOnly />
      </FormField>
      <FormField name="name" label="Name">
        <Input id="name" name="name" defaultValue={name ?? ""} autoComplete="name" required />
      </FormField>
      <FormField name="phone" label="Phone" hint="Used to prefill bookings.">
        <Input id="phone" name="phone" type="tel" defaultValue={phone ?? ""} autoComplete="tel" />
      </FormField>
      <FormMessage />
      <SubmitButton variant="ink" pendingLabel="Saving…" className="self-start">
        Save
      </SubmitButton>
    </ActionForm>
  );
}
