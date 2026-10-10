import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { Figure } from "@/components/brand/figure";
import { Wordmark } from "@/components/brand/wordmark";
import { getSiteSettings } from "@/features/content/queries";
import { Container } from "./container";
import { MAIN_NAV } from "./nav";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-label text-[0.72rem] tracking-[0.14em] text-vermilion">{title}</h2>
      <div className="flex flex-col gap-1.5 font-ui text-[0.95rem] leading-snug text-cream/85">{children}</div>
    </div>
  );
}

const linkClass = "w-fit transition-colors hover:text-white";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const mapsUrl = settings.mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.mapQuery)}`
    : null;

  return (
    <footer className="theme-dark relative overflow-hidden bg-velvet text-cream">
      <Container className="relative pt-16 lg:pt-24">
        <div className="flex items-end gap-10">
          <Wordmark className="w-full max-w-[1100px] text-cream xl:max-w-none xl:flex-1" />
          {/* The figure from the logo, rising from the rule below. */}
          <Figure className="-mb-14 hidden h-[clamp(13rem,21vw,19rem)] shrink-0 text-[#b8352a] lg:-mb-20 xl:block" />
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-cream/15 pt-10 md:grid-cols-4 lg:mt-20">
          <Column title="Visit">
            {settings.address && <span>{settings.address}</span>}
            <span>{[settings.district, settings.city].filter(Boolean).join(", ")}</span>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className={`${linkClass} mt-1 text-cream underline decoration-cream/30 underline-offset-4`}>
                Directions
              </a>
            )}
          </Column>

          <Column title="Contact">
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className={linkClass}>
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className={linkClass}>
                {settings.email}
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className={linkClass}>
                Instagram
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className={linkClass}>
                Facebook
              </a>
            )}
          </Column>

          <Column title="Cinema">
            {MAIN_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
            <Link href="/account" className={linkClass}>
              My tickets
            </Link>
          </Column>

          <Column title="Doors">
            {settings.openingHours && <p className="whitespace-pre-line">{settings.openingHours}</p>}
            {settings.bookingNote && <p className="text-[0.86rem] text-smoke">{settings.bookingNote}</p>}
          </Column>
        </div>

        <div className="relative mt-16 flex flex-col gap-3 border-t border-cream/15 py-6 font-meta text-[0.6rem] tracking-[0.22em] text-smoke sm:flex-row sm:items-center sm:justify-between">
          <span>
            © <CurrentYear /> {settings.name}
          </span>
          <span>Card payments by Flitt</span>
          <Link href="/admin" className="w-fit hover:text-cream">
            Staff
          </Link>
        </div>

      </Container>
    </footer>
  );
}
