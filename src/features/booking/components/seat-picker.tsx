"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { SEAT_KINDS, type SeatPrices } from "@/lib/db/enums";
import { Price } from "@/components/ui/price";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SEAT_KIND_INFO, seatLabel } from "../seat-kinds";
import type { HallSeat } from "../types";
import { PLAN } from "./hall-plan/geometry";
import { HallPlan } from "./hall-plan/hall-plan";
import { MiniSeat } from "./hall-plan/mini-seat";
import type { SeatVisualState } from "./hall-plan/seat-glyph";

const STATUS_TEXT: Record<SeatVisualState, string> = {
  available: "Available",
  selected: "Selected",
  taken: "Taken",
  inactive: "Not in use",
};

const DIRECTIONS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

type Props = {
  seats: HallSeat[];
  taken: number[];
  selected: number[];
  prices: SeatPrices;
  onToggle: (seat: HallSeat) => void;
  /** While a payment is open the selection cannot change. */
  locked?: boolean;
};

export function SeatPicker({ seats, taken, selected, prices, onToggle, locked }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [focusable, setFocusable] = useState<number | null>(() => seats.find((s) => s.isActive)?.id ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);

  const takenSet = useMemo(() => new Set(taken), [taken]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // On narrow screens the plan scrolls sideways; start centred on the aisle.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  const stateOf = (seat: HallSeat): SeatVisualState =>
    !seat.isActive ? "inactive" : takenSet.has(seat.id) ? "taken" : selectedSet.has(seat.id) ? "selected" : "available";

  const describe = (seat: HallSeat, state: SeatVisualState) =>
    `Row ${seat.row}, seat ${seat.number}. ${SEAT_KIND_INFO[seat.kind].label}, ${formatMoney(prices[seat.kind])}. ${STATUS_TEXT[state]}.`;

  const shownId = hovered ?? active;
  const shown = shownId != null ? (seats.find((s) => s.id === shownId) ?? null) : null;

  function activate(seat: HallSeat) {
    setActive(seat.id);
    setFocusable(seat.id);
    if (locked) return;
    const state = stateOf(seat);
    if (state === "taken" || state === "inactive") return;
    onToggle(seat);
  }

  function nearest(from: HallSeat, [dx, dy]: [number, number]) {
    let best: HallSeat | null = null;
    let bestScore = Infinity;
    for (const seat of seats) {
      if (seat.id === from.id || !seat.isActive) continue;
      const vx = seat.x - from.x;
      const vy = seat.y - from.y;
      const along = vx * dx + vy * dy;
      if (along <= 10) continue;
      const across = Math.abs(vx * dy - vy * dx);
      const score = along + across * 2.5;
      if (score < bestScore) {
        bestScore = score;
        best = seat;
      }
    }
    return best;
  }

  function onKeyDown(event: KeyboardEvent<SVGGElement>, seat: HallSeat) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      activate(seat);
      return;
    }
    const direction = DIRECTIONS[event.key];
    if (!direction) return;
    event.preventDefault();
    const next = nearest(seat, direction);
    if (!next) return;
    setFocusable(next.id);
    setActive(next.id);
    planRef.current?.querySelector<SVGGElement>(`[data-seat-id="${next.id}"]`)?.focus();
  }

  const kindsInHall = SEAT_KINDS.filter((k) => seats.some((s) => s.kind === k && s.isActive));

  return (
    <div className="flex flex-col gap-5">
      <div ref={scrollRef} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div ref={planRef} className="relative mx-auto min-w-[540px] max-w-[860px]">
          <HallPlan
            seats={seats}
            taken={taken}
            selected={selected}
            tone="dark"
            idPrefix="booking"
            interactive
            focusableSeatId={focusable}
            activeSeatId={shownId}
            describeSeat={describe}
            onSeatActivate={activate}
            onSeatHover={(seat) => setHovered(seat?.id ?? null)}
            onSeatFocus={(seat) => {
              setActive(seat.id);
              setFocusable(seat.id);
            }}
            onSeatKeyDown={onKeyDown}
            title="Seating plan — the screen is at the top. Use the arrow keys to move between seats and Space to select."
          />

          {shown && (
            <div
              aria-hidden
              className="pointer-events-none absolute z-10 hidden -translate-x-1/2 md:block"
              style={{
                left: `${(shown.x / PLAN.width) * 100}%`,
                top: `${(shown.y / PLAN.height) * 100}%`,
                transform: `translate(-50%, calc(-100% - ${shown.kind === "armchair" ? 34 : 44}px))`,
              }}
            >
              <SeatTooltip seat={shown} state={stateOf(shown)} price={prices[shown.kind]} />
            </div>
          )}
        </div>
      </div>

      <SeatInfo seat={shown} state={shown ? stateOf(shown) : null} price={shown ? prices[shown.kind] : null} locked={locked} />

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-cream/12 pt-5">
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {kindsInHall.map((kind) => (
            <li key={kind} className="flex items-center gap-2.5">
              <MiniSeat kind={kind} state="available" />
              <span className="font-ui text-[0.9rem] leading-tight text-cream">
                {SEAT_KIND_INFO[kind].label}
                <Price tetri={prices[kind]} className="block font-label text-[0.8rem] tracking-[0.06em] text-smoke" />
              </span>
            </li>
          ))}
        </ul>
        <ul className="flex gap-5 font-meta text-[0.58rem] tracking-[0.2em] text-smoke">
          {(["available", "selected", "taken"] as const).map((state) => (
            <li key={state} className="flex items-center gap-2">
              <MiniSeat kind="armchair" state={state} className="h-5 w-6" />
              {STATUS_TEXT[state]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SeatTooltip({ seat, state, price }: { seat: HallSeat; state: SeatVisualState; price: number }) {
  return (
    <div className="relative min-w-40 bg-cream px-3.5 py-2.5 text-ink shadow-[0_18px_40px_-12px_rgb(0_0_0/0.6)]">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-poster text-[1.6rem] text-oxblood">{seatLabel(seat.row, seat.number)}</span>
        <Price tetri={price} className="font-label text-[1rem]" />
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 font-meta text-[0.56rem] tracking-[0.18em]">
        <span>{SEAT_KIND_INFO[seat.kind].label}</span>
        <span className={cn(state === "taken" ? "text-ink-3" : state === "selected" ? "text-vermilion" : "text-[#2f5536]")}>
          {STATUS_TEXT[state]}
        </span>
      </div>
      <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-cream" />
    </div>
  );
}

function SeatInfo({
  seat,
  state,
  price,
  locked,
}: {
  seat: HallSeat | null;
  state: SeatVisualState | null;
  price: number | null;
  locked?: boolean;
}) {
  return (
    <div aria-live="polite" className="flex min-h-16 items-center gap-4 border border-cream/15 px-4 py-3 md:hidden">
      {seat && state && price != null ? (
        <>
          <MiniSeat kind={seat.kind} state={state} className="h-9 w-12" />
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-3">
              <span className="font-poster text-[1.7rem] text-cream">
                Row {seat.row} · {seat.number}
              </span>
            </p>
            <p className="truncate font-ui text-[0.85rem] text-smoke">{SEAT_KIND_INFO[seat.kind].description}</p>
          </div>
          <div className="text-right">
            <Price tetri={price} className="block font-label text-[1.05rem] text-cream" />
            <p
              className={cn(
                "font-meta text-[0.55rem] tracking-[0.18em]",
                state === "taken" ? "text-smoke" : state === "selected" ? "text-vermilion" : "text-[#9fc79f]",
              )}
            >
              {STATUS_TEXT[state]}
            </p>
          </div>
        </>
      ) : (
        <p className="font-ui text-[0.92rem] text-smoke">
          {locked ? "Your seats are on hold while you pay." : "Tap a seat to see its price and whether it's free."}
        </p>
      )}
    </div>
  );
}
