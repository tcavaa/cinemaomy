import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot it?" intro={<p>It happens. Tell us your email and we&apos;ll send a link to set a new password.</p>}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
