import Link from "next/link";
import { getSessionUser } from "@/features/auth/session";
import { cn } from "@/lib/utils";

const base = "font-label text-[0.8rem] tracking-[0.08em] transition-colors hover:text-oxblood";

export async function AccountLink({ className }: { className?: string }) {
  const user = await getSessionUser();
  return user ? (
    <Link href="/account" className={cn(base, className)}>
      My tickets
    </Link>
  ) : (
    <Link href="/login" className={cn(base, className)}>
      Sign in
    </Link>
  );
}

export function AccountLinkFallback({ className }: { className?: string }) {
  return (
    <Link href="/account" className={cn(base, className)}>
      Account
    </Link>
  );
}
