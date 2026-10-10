import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/auth-forms";
import { getSessionUser } from "@/features/auth/session";
import { safeNext } from "@/lib/forms";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthShell
      title="Join us"
      intro={
        <p>
          An account keeps every ticket you buy in one place and remembers your details for next time. You can still
          book without one.
        </p>
      }
    >
      <Suspense fallback={<div className="h-96" />}>
        <Register searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Register({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const next = safeNext((await searchParams).next);
  if (await getSessionUser()) redirect(next);
  return <RegisterForm next={next} />;
}
