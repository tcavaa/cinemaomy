import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { groupByDay, toProgramItem, type ProgramItem } from "../program";
import { getUpcomingScreenings } from "../queries";
import { FilmStill } from "./film-still";
import { SeatMeter } from "./seat-meter";

/** "This week" — laid out like the cinema's weekly poster: big day names, films side by side. */
export async function WeekProgram() {
  const screenings = await getUpcomingScreenings(7);
  const days = groupByDay(screenings.map(toProgramItem)).slice(0, 4);

  return (
    <section aria-labelledby="this-week" className="py-20 lg:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="this-week" className="font-label text-[0.8rem] tracking-[0.14em] text-oxblood">
            This week at O&apos;my
          </h2>
          <ButtonLink href="/program" variant="outline" size="sm" arrow>
            Full program
          </ButtonLink>
        </div>

        {days.length === 0 ? (
          <p className="mt-10 max-w-xl font-serif text-[1.3rem] text-ink-2">
            The next program is being put together. Follow us on Instagram to hear first.
          </p>
        ) : (
          <div className="mt-8">
            {days.map((day) => (
              <Day key={day[0].dayKey} items={day} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function Day({ items }: { items: ProgramItem[] }) {
  const first = items[0];
  const single = items.length === 1;
  return (
    <div className="grid gap-x-12 gap-y-6 border-t-2 border-ink py-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:py-12">
      <h3 className="flex flex-wrap items-baseline gap-x-4 text-oxblood lg:flex-col lg:gap-1">
        <span className="font-poster text-[clamp(3.2rem,7.5vw,6.2rem)]">{first.weekday}</span>
        <span className="font-credit text-[clamp(1.1rem,2vw,1.6rem)]">
          {first.month} {first.dayOfMonth}
        </span>
      </h3>
      <ul className={single ? "grid" : "grid gap-x-8 gap-y-10 sm:grid-cols-2"}>
        {items.map((item) => (
          <li key={item.id}>
            <ScreeningPoster item={item} wide={single} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScreeningPoster({ item, wide }: { item: ProgramItem; wide?: boolean }) {
  const { event } = item;
  const cancelled = item.status === "cancelled";
  return (
    <article className="group relative flex h-full flex-col">
      <h4 className="font-poster text-[clamp(2rem,3.4vw,2.9rem)] leading-[0.9] text-oxblood">
        <Link href={`/program/${event.slug}`} className="after:absolute after:inset-0">
          {event.title}
        </Link>
      </h4>
      <p className="mt-2 flex items-baseline justify-between gap-4 font-credit text-[0.95rem] text-oxblood">
        <span className="truncate">{event.credit}</span>
        <span className={cancelled ? "line-through" : undefined}>{item.time}</span>
      </p>
      <FilmStill
        title={event.title}
        imageUrl={event.imageUrl}
        posterUrl={event.posterUrl}
        sizes={wide ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"}
        className={cn(
          "mt-3 w-full transition-[filter] duration-500 group-hover:brightness-110",
          wide ? "aspect-[16/10] sm:aspect-[2/1]" : "aspect-[16/10]",
        )}
      />
      <div className="mt-3 flex items-end justify-between gap-4">
        {cancelled ? (
          <span className="font-label text-[0.75rem] text-vermilion">Cancelled</span>
        ) : (
          <SeatMeter taken={item.seatsTaken} total={item.seatsTotal} />
        )}
        {!cancelled && item.salesOpen && item.seatsTaken < item.seatsTotal && (
          <Link
            href={`/book/${item.id}`}
            className="relative z-10 font-label text-[0.78rem] tracking-[0.1em] text-ink underline decoration-oxblood decoration-2 underline-offset-4 hover:text-oxblood"
          >
            Choose seats
          </Link>
        )}
      </div>
    </article>
  );
}
