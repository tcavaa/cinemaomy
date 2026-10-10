import type { Metadata } from "next";
import Link from "next/link";
import { PosterHeader } from "@/components/brand/poster-header";
import { Container } from "@/components/layout/container";
import { ProgramList } from "@/features/events/components/program-list";
import { EVENT_KIND_LABEL } from "@/features/events/labels";
import { toProgramItem } from "@/features/events/program";
import { getRecentScreenings, getUpcomingScreenings } from "@/features/events/queries";

export const metadata: Metadata = {
  title: "Program",
  description: "What's on at Cinema O'my — screenings, premieres and special nights. Choose your seat and book online.",
};

export default async function ProgramPage() {
  const [upcoming, recent] = await Promise.all([getUpcomingScreenings(), getRecentScreenings()]);
  const items = upcoming.map(toProgramItem);
  const range = items.length ? `${items[0].dotDate} — ${items[items.length - 1].dotDate}` : null;

  // One entry per film for the archive.
  const archive = [...new Map(recent.map((s) => [s.event.slug, toProgramItem(s)])).values()].slice(0, 12);

  return (
    <div className="pb-24">
      <Container className="pt-12 lg:pt-20">
        <PosterHeader
          eyebrow="What's on"
          title="Program"
          size="xl"
          credit="Thirty seats a night. Pick yours."
          aside={range}
        />
        <div className="mt-12 lg:mt-16">
          <ProgramList items={items} />
        </div>
      </Container>

      {archive.length > 0 && (
        <section className="mt-24 bg-paper-2 py-16 lg:py-20">
          <Container>
            <h2 className="font-label text-[0.8rem] tracking-[0.14em] text-oxblood">Recently shown</h2>
            <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {archive.map((item) => (
                <li key={item.event.slug} className="border-t border-ink/25 pt-4">
                  <Link href={`/program/${item.event.slug}`} className="group block">
                    <p className="font-meta text-[0.56rem] tracking-[0.2em] text-ink-3">
                      {item.weekdayShort} {item.dotDate} · {EVENT_KIND_LABEL[item.event.kind]}
                    </p>
                    <p className="mt-2 font-poster text-[1.9rem] leading-[0.92] text-ink transition-colors group-hover:text-oxblood">
                      {item.event.title}
                    </p>
                    {item.event.credit && <p className="mt-1 font-credit text-[0.92rem] text-ink-2">{item.event.credit}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </div>
  );
}
