import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { signOut } from "@/features/auth/actions";
import { requireAdmin } from "@/features/auth/session";

export const metadata: Metadata = {
  title: { template: "%s · Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-col bg-paper lg:flex-row">
      <AdminNav
        footer={
          <div className="flex flex-col gap-2 font-ui text-[0.82rem] text-smoke">
            <Link href="/" target="_blank" className="hover:text-cream">
              View site ↗
            </Link>
            <span className="truncate">{admin.email}</span>
            <form action={signOut}>
              <button type="submit" className="hover:text-cream">
                Sign out
              </button>
            </form>
          </div>
        }
      />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}

function AdminLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper font-meta text-[0.7rem] text-ink-3">
      Opening the box office…
    </div>
  );
}
