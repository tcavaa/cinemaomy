import Link from "next/link";
import { Suspense } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { ButtonLink } from "@/components/ui/button";
import { getSiteSettings } from "@/features/content/queries";
import { getNextScreening } from "@/features/events/queries";
import { formatDotDate, formatTime, formatWeekdayShort } from "@/lib/format";
import { AccountLink, AccountLinkFallback } from "./account-link";
import { Container } from "./container";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, NavLinksStatic } from "./nav-links";

async function NextScreeningStrip() {
  const [settings, next] = await Promise.all([getSiteSettings(), getNextScreening()]);
  return (
    <div className="theme-dark bg-ink text-cream">
      <Container className="flex h-9 items-center justify-between gap-6 font-meta text-[0.62rem] tracking-[0.24em]">
        <span className="hidden truncate text-smoke md:block">
          {[settings.address, settings.city?.replace(/\s*\d+$/, "")].filter(Boolean).join(" · ")}
        </span>
        {next ? (
          <Link
            href={`/book/${next.id}`}
            className="group flex min-w-0 items-center gap-3 truncate hover:text-white md:justify-end"
          >
            <span className="text-smoke">Next</span>
            <span className="truncate normal-case tracking-[0.12em]">
              <span className="font-credit text-[0.82rem] tracking-normal">{next.event.title}</span>
              <span className="mx-2 text-smoke">—</span>
              {formatWeekdayShort(next.startsAt)} {formatDotDate(next.startsAt)}, {formatTime(next.startsAt)}
            </span>
            <span aria-hidden className="text-vermilion transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : (
          <span className="text-smoke">New program coming soon</span>
        )}
      </Container>
    </div>
  );
}

export async function SiteHeader() {
  const settings = await getSiteSettings();
  return (
    <>
      <NextScreeningStrip />
      <header className="sticky top-0 z-40 border-b border-ink/85 bg-paper">
        <Container className="flex h-16 items-center justify-between gap-6 lg:h-[4.75rem]">
          <Link href="/" aria-label="Cinema O'my — home" className="shrink-0 text-ink">
            <Wordmark className="h-8 lg:h-10" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <Suspense fallback={<NavLinksStatic />}>
              <NavLinks />
            </Suspense>
          </nav>

          <div className="flex items-center gap-5">
            <span className="hidden sm:block">
              <Suspense fallback={<AccountLinkFallback />}>
                <AccountLink />
              </Suspense>
            </span>
            <ButtonLink href="/program" size="sm" arrow className="hidden sm:inline-flex">
              Tickets
            </ButtonLink>
            <MobileMenu
              address={settings.address}
              phone={settings.phone}
              instagramUrl={settings.instagramUrl}
              account={
                <Suspense fallback={<AccountLinkFallback className="text-[1rem]" />}>
                  <AccountLink className="text-[1rem]" />
                </Suspense>
              }
            />
          </div>
        </Container>
      </header>
    </>
  );
}
