import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PosterHeader } from "@/components/brand/poster-header";
import { Container } from "@/components/layout/container";
import { buttonClasses } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Price } from "@/components/ui/price";
import { SEAT_KIND_INFO } from "@/features/booking/seat-kinds";
import { getSiteSettings } from "@/features/content/queries";
import { FilmStill } from "@/features/events/components/film-still";
import { SeatMeter } from "@/features/events/components/seat-meter";
import { creditLine, EVENT_KIND_LABEL } from "@/features/events/labels";
import { getEventBySlug } from "@/features/events/queries";
import type { ScreeningListing } from "@/features/events/types";
import { SEAT_KINDS } from "@/lib/db/enums";
import { formatDotDate, formatRuntime, formatTime, formatWeekday, formatWeekdayShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/program/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Not found" };
  const image = event.imageUrl ?? event.posterUrl;
  return {
    title: event.title,
    description: event.synopsis?.slice(0, 180) ?? `${event.title} at Cinema O'my, Tbilisi.`,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default function EventPage({ params }: PageProps<"/program/[slug]">) {
  return (
    <Suspense fallback={<EventSkeleton />}>
      <EventView params={params} />
    </Suspense>
  );
}

async function EventView({ params }: Pick<PageProps<"/program/[slug]">, "params">) {
  const { slug } = await params;
  const [event, settings] = await Promise.all([getEventBySlug(slug), getSiteSettings()]);
  if (!event) notFound();

  const eyebrow = [EVENT_KIND_LABEL[event.kind], event.tagline].filter(Boolean).join(" · ");
  const facts = [
    ["Original title", event.originalTitle],
    ["Director", event.director],
    ["Country", event.country],
    ["Year", event.year ? String(event.year) : null],
    ["Running time", formatRuntime(event.runtimeMinutes)],
    ["Language", event.language],
    ["Subtitles", event.subtitles],
  ].filter(([, v]) => v) as [string, string][];

  const portraitOnly = !event.imageUrl && Boolean(event.posterUrl);

  return (
    <article className="pb-24">
      <Container className="pt-8 lg:pt-12">
        <nav aria-label="Breadcrumb" className="font-label text-[0.74rem] tracking-[0.12em] text-ink-3">
          <Link href="/program" className="hover:text-oxblood">
            Program
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{event.title}</span>
        </nav>

        <div className={cn("mt-8 grid gap-10", portraitOnly && "lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end")}>
          <PosterHeader
            eyebrow={eyebrow}
            title={event.title}
            credit={creditLine(event)}
            aside={event.year ? `(${event.year})` : null}
            size="lg"
          />
          {portraitOnly && (
            <div className="relative aspect-[3/4] w-full max-w-sm shadow-[0_30px_60px_-35px_rgb(40_20_10/0.6)]">
              <Media src={event.posterUrl!} alt={`Poster for ${event.title}`} fill sizes="384px" className="object-cover" preload />
            </div>
          )}
        </div>

        {!portraitOnly && (
          <FilmStill
            title={event.title}
            imageUrl={event.imageUrl}
            sizes="(min-width: 1440px) 1360px, 100vw"
            quality={90}
            preload
            className="mt-8 aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]"
          />
        )}
      </Container>

      <Container className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20">
        <div>
          {event.synopsis && (
            <p className="max-w-3xl font-serif text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.45] text-ink [text-wrap:pretty]">
              {event.synopsis}
            </p>
          )}
          {facts.length > 0 && (
            <dl className="mt-12 grid max-w-3xl grid-cols-[auto_1fr] gap-x-10 border-t border-ink/25">
              {facts.map(([label, value]) => (
                <div key={label} className="col-span-2 grid grid-cols-subgrid border-b border-ink/12 py-3">
                  <dt className="font-meta text-[0.6rem] tracking-[0.2em] text-ink-3">{label}</dt>
                  <dd className="font-ui text-[1rem]">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {event.trailerUrl && (
            <a
              href={event.trailerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 font-label text-[0.8rem] tracking-[0.1em] text-oxblood underline underline-offset-4"
            >
              Watch the trailer ↗
            </a>
          )}
        </div>

        <aside aria-label="Screenings" className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-label text-[0.8rem] tracking-[0.14em] text-oxblood">Screenings</h2>
          {event.upcoming.length ? (
            <ul className="mt-4 flex flex-col gap-4">
              {event.upcoming.map((s) => (
                <ScreeningCard key={s.id} screening={s} />
              ))}
            </ul>
          ) : (
            <div className="mt-4 border border-ink/20 p-6">
              <p className="font-serif text-[1.15rem] text-ink-2">No upcoming screenings right now.</p>
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block font-label text-[0.78rem] text-oxblood underline underline-offset-4">
                  New dates go up on Instagram first
                </a>
              )}
            </div>
          )}
          {event.past.length > 0 && (
            <p className="mt-6 font-ui text-[0.88rem] text-ink-3">
              Previously shown{" "}
              {event.past
                .slice(0, 3)
                .map((s) => `${formatWeekdayShort(s.startsAt)} ${formatDotDate(s.startsAt)}`)
                .join(", ")}
              .
            </p>
          )}
        </aside>
      </Container>
    </article>
  );
}

function ScreeningCard({ screening: s }: { screening: ScreeningListing }) {
  const cancelled = s.status === "cancelled";
  const soldOut = s.seatsTaken >= s.seatsTotal;
  const bookable = !cancelled && s.salesOpen && !soldOut;
  return (
    <li className="punched-top border border-ink/20 bg-[#f4ede1] p-5 [--hole:var(--color-paper)]">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-poster text-[2rem] leading-none">
          {formatWeekday(s.startsAt)} <span className="text-oxblood">{formatDotDate(s.startsAt)}</span>
        </p>
        <time className="font-label text-[1.4rem] tabular">{formatTime(s.startsAt)}</time>
      </div>
      {s.note && <p className="mt-2 font-ui text-[0.9rem] text-ink-2">{s.note}</p>}
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-ui text-[0.88rem] text-ink-2">
        {SEAT_KINDS.map((kind) => (
          <li key={kind}>
            {SEAT_KIND_INFO[kind].label} <Price tetri={s.prices[kind]} className="text-ink" />
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-end justify-between gap-4">
        {cancelled ? (
          <span className="font-label text-[0.8rem] text-vermilion">Cancelled</span>
        ) : (
          <SeatMeter taken={s.seatsTaken} total={s.seatsTotal} />
        )}
        {bookable ? (
          <Link href={`/book/${s.id}`} className={buttonClasses({ size: "md" })}>
            Choose seats
          </Link>
        ) : (
          <span className={cn(buttonClasses({ variant: "outline", size: "md" }), "pointer-events-none opacity-50")}>
            {cancelled ? "Cancelled" : soldOut ? "Sold out" : "Closed"}
          </span>
        )}
      </div>
    </li>
  );
}

function EventSkeleton() {
  return (
    <Container className="animate-pulse pt-16 pb-24">
      <div className="h-4 w-40 bg-ink/10" />
      <div className="mt-8 h-28 w-2/3 bg-ink/10" />
      <div className="mt-8 aspect-[21/9] bg-ink/10" />
    </Container>
  );
}
