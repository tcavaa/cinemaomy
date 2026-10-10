import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { NewPasswordForm } from "@/features/auth/components/auth-forms";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "New password", robots: { index: false } };

export default function PasswordPage() {
  return (
    <AuthShell title="New password" intro={<p>Choose a new password for your account.</p>}>
      <Suspense fallback={<div className="h-64" />}>
        <Gate />
      </Suspense>
    </AuthShell>
  );
}

async function Gate() {
  await requireUser("/account/password");
  return (
    <div className="flex flex-col gap-6">
      <NewPasswordForm />
      <Link href="/account" className="font-ui text-[0.9rem] text-ink-3 hover:text-ink">
        Back to my tickets
      </Link>
    </div>
  );
}
