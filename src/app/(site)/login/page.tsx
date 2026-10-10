import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/auth-forms";
import { getSessionUser } from "@/features/auth/session";
import { safeNext } from "@/lib/forms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const NOTICES: Record<string, string> = {
  link: "That link is invalid or has expired. Try again, or sign in with your password.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthShell
      title="Sign in"
      intro={<p>All your tickets in one place, and your details filled in when you book.</p>}
    >
      <Suspense fallback={<div className="h-80" />}>
        <Login searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const query = await searchParams;
  const next = safeNext(query.next);
  if (await getSessionUser()) redirect(next);
  const notice = typeof query.error === "string" ? NOTICES[query.error] : undefined;
  return <LoginForm next={next} notice={notice} />;
}
