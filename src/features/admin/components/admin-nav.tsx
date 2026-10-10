"use client";

import {
  Armchair,
  FileText,
  Film,
  GalleryHorizontalEnd,
  Images,
  LayoutDashboard,
  Settings,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Program", icon: Film },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/slides", label: "Home slider", icon: GalleryHorizontalEnd },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/hall", label: "Hall & seats", icon: Armchair },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 px-3 font-label text-[0.8rem] tracking-[0.06em] transition-colors",
                active ? "bg-cream text-ink" : "text-cream/75 hover:bg-cream/8 hover:text-cream",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminNav({ footer }: { footer: ReactNode }) {
  const [open, setOpen] = useState(false);

  const brand = (
    <Link href="/admin" className="flex items-end gap-2 text-cream">
      <Wordmark className="h-7" />
      <span className="pb-0.5 font-meta text-[0.55rem] text-smoke">Admin</span>
    </Link>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="theme-dark sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-velvet px-3 py-6 text-cream lg:flex">
        <div className="px-3">{brand}</div>
        <nav aria-label="Admin" className="mt-10 flex-1">
          <NavList />
        </nav>
        <div className="border-t border-cream/12 px-3 pt-4">{footer}</div>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="theme-dark sticky top-0 z-40 flex h-14 items-center justify-between bg-velvet px-4 text-cream lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="font-label text-[0.8rem] tracking-[0.08em]"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div
        id="admin-drawer"
        inert={!open}
        className={cn(
          "theme-dark fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col bg-velvet px-3 py-4 text-cream transition-opacity lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Admin" className="flex-1">
          <NavList onNavigate={() => setOpen(false)} />
        </nav>
        <div className="border-t border-cream/12 px-3 pt-4">{footer}</div>
      </div>
    </>
  );
}
