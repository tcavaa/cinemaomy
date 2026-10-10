"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import { EVENT_KIND_LABEL, PROGRAM_FILTERS } from "../labels";
import { groupByDay, type ProgramItem } from "../program";
import { FilmStill } from "./film-still";
import { SeatMeter } from "./seat-meter";

export function ProgramList({ items }: { items: ProgramItem[] }) {
  const [filter, setFilter] = useState("all");
  const kinds = PROGRAM_FILTERS.find((f) => f.id === filter)?.kinds ?? [];
  const days = useMemo(
    () => groupByDay(items.filter((i) => kinds.includes(i.event.kind))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, filter],
  );

  return (
    <div>
      <div role="tablist" aria-label="Filter the program" className="flex flex-wrap gap-2">
        {PROGRAM_FILTERS.map((f) => {
          const count = items.filter((i) => f.kinds.includes(i.event.kind)).length;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              disabled={!count}
              className={cn(
                "flex h-9 items-center gap-2 border px-3.5 font-label text-[0.74rem] tracking-[0.08em] transition-colors disabled:opacity-35",
                filter === f.id ? "border-ink bg-ink text-paper" : "border-ink/30 text-ink hover:border-ink",
              )}
            >
              {f.label}
              <span className="font-meta text-[0.58rem] tracking-[0.1em] opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {days.length === 0 ? (
        <p className="mt-16 font-serif text-[1.3rem] text-ink-2">
          Nothing in this part of the program yet. New dates are announced on Instagram first.
        </p>
      ) : (
        <div className="mt-10 border-t-2 border-ink">
          {days.map((day) => {
            const first = day[0];
            return (
              <section
                key={first.dayKey}
                aria-label={`${first.weekday}, ${first.month} ${first.dayOfMonth}`}
                className="grid gap-x-10 border-b border-ink/25 py-6 md:grid-cols-[11rem_minmax(0,1fr)] lg:py-8"
              >
                <div className="mb-4 flex items-baseline gap-3 md:sticky md:top-28 md:mb-0 md:flex-col md:gap-1 md:self-start">
                  <span className="font-poster text-[4.2rem] leading-[0.8] text-oxblood md:text-[5.5rem]">{first.dayOfMonth}</span>
                  <span className="font-label text-[0.82rem] tracking-[0.12em]">
                    {first.weekday}
                    <span className="ml-2 text-ink-3 md:ml-0 md:block">{first.month}</span>
                  </span>
                </div>
                <ul className="flex flex-col divide-y divide-ink/12">
                  {day.map((item) => (
                    <ProgramRow key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgramRow({ item }: { item: ProgramItem }) {
  const { event } = item;
  const cancelled = item.status === "cancelled";
  const soldOut = item.seatsTaken >= item.seatsTotal;
  const bookable = !cancelled && item.salesOpen && !soldOut;

  return (
    <li className="group grid grid-cols-[4.2rem_minmax(0,1fr)] gap-x-4 gap-y-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[5.5rem_9rem_minmax(0,1fr)] lg:grid-cols-[5.5rem_11rem_minmax(0,1fr)_10rem_auto] lg:items-center lg:gap-x-8">
      <time className={cn("font-label text-[1.5rem] tracking-[0.02em] tabular lg:text-[1.8rem]", cancelled && "line-through opacity-50")}>
        {item.time}
      </time>

      <Link
        href={`/program/${event.slug}`}
        tabIndex={-1}
        aria-hidden
        className="hidden aspect-[16/10] w-full sm:block"
      >
        <FilmStill
          title={event.title}
          imageUrl={event.imageUrl}
          posterUrl={event.posterUrl}
          sizes="176px"
          className="size-full transition-[filter] duration-500 group-hover:brightness-110"
        />
      </Link>

      <div className="min-w-0">
        <p className="mb-1.5 flex flex-wrap gap-x-3 font-meta text-[0.58rem] tracking-[0.2em] text-ink-3">
          <span className="text-oxblood">{EVENT_KIND_LABEL[event.kind]}</span>
          {item.note && <span>{item.note}</span>}
          {cancelled && <span className="text-vermilion">Cancelled</span>}
        </p>
        <h3 className="font-poster text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[0.9] text-ink transition-colors group-hover:text-oxblood">
          <Link href={`/program/${event.slug}`}>{event.title}</Link>
        </h3>
        <p className="mt-1.5 font-credit text-[0.98rem] text-ink-2">
          {[event.credit, ...event.details].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="col-start-2 flex items-center justify-between gap-4 sm:col-start-3 lg:col-start-auto lg:block">
        {!cancelled && <SeatMeter taken={item.seatsTaken} total={item.seatsTotal} />}
        <p className="font-ui text-[0.85rem] text-ink-3 lg:mt-2">
          from <Price tetri={item.fromPrice} className="text-ink" />
        </p>
      </div>

      <div className="col-start-2 sm:col-start-3 lg:col-start-auto">
        {bookable ? (
          <Link href={`/book/${item.id}`} className={buttonClasses({ size: "md" })}>
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
