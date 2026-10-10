"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "./nav";

const linkClass =
  "relative font-label text-[0.82rem] tracking-[0.08em] text-ink transition-colors hover:text-oxblood after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-oxblood after:transition-transform after:duration-300 hover:after:scale-x-100";

export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-9">
      {MAIN_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(linkClass, active && "text-oxblood after:scale-x-100")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Same links without the active state — used as the Suspense fallback. */
export function NavLinksStatic() {
  return (
    <ul className="flex items-center gap-9">
      {MAIN_NAV.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={linkClass}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
