"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "./nav";

type Props = {
  address?: string | null;
  phone?: string | null;
  instagramUrl?: string | null;
  account: ReactNode;
};

export function MobileMenu({ address, phone, instagramUrl, account }: Props) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-10 items-center gap-2.5 pl-2 font-label text-[0.8rem] tracking-[0.08em] lg:hidden"
      >
        Menu
        <span aria-hidden className="flex w-5 flex-col gap-[5px]">
          <span className="h-[1.5px] w-full bg-current" />
          <span className="h-[1.5px] w-3/4 self-end bg-current" />
        </span>
      </button>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          "theme-dark fixed inset-0 z-50 flex flex-col bg-velvet text-cream transition-[opacity,visibility] duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" onClick={close} aria-label="Cinema O'my — home">
            <Wordmark className="h-8" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="flex h-10 items-center gap-2 font-label text-[0.8rem] tracking-[0.08em]"
          >
            Close
            <svg aria-hidden viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        <nav aria-label="Main" className="flex flex-1 flex-col justify-center px-4 sm:px-6">
          <ol className="flex flex-col gap-1">
            {[{ href: "/", label: "Home" }, ...MAIN_NAV].map((item, i) => (
              <li
                key={item.href}
                className={cn(
                  "border-b border-cream/12 transition-[opacity,transform] duration-500 ease-(--ease-cinema)",
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
              >
                <Link href={item.href} onClick={close} className="flex items-baseline gap-4 py-3">
                  <span className="font-meta text-[0.65rem] text-smoke tabular">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-poster text-[clamp(2.75rem,13vw,4.5rem)] text-cream">{item.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-4 border-t border-cream/12 px-4 py-6 font-ui text-[0.92rem] text-smoke sm:px-6" onClick={close}>
          <div className="text-cream">{account}</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {address && <span>{address}</span>}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-cream">
                {phone}
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-cream">
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
