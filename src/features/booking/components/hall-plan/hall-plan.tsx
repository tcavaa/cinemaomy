import type { KeyboardEvent, PointerEvent } from "react";
import type { HallSeat } from "@/features/booking/types";
import { cn } from "@/lib/utils";
import { PLAN } from "./geometry";
import { SeatGlyph, type SeatVisualState } from "./seat-glyph";

export type HallPlanProps = {
  seats: HallSeat[];
  taken?: number[];
  selected?: number[];
  tone?: "dark" | "light";
  idPrefix?: string;
  className?: string;
  title?: string;
  /** Interactive mode — seats become keyboard/pointer targets. */
  interactive?: boolean;
  focusableSeatId?: number | null;
  activeSeatId?: number | null;
  describeSeat?: (seat: HallSeat, state: SeatVisualState) => string;
  onSeatActivate?: (seat: HallSeat) => void;
  onSeatHover?: (seat: HallSeat | null) => void;
  onSeatFocus?: (seat: HallSeat) => void;
  onSeatKeyDown?: (event: KeyboardEvent<SVGGElement>, seat: HallSeat) => void;
};

function curtain(x: number, from: number, to: number, amp: number) {
  let d = `M${x} ${from}`;
  for (let y = from; y < to; y += 24) d += ` q ${amp} 12 0 24`;
  return d;
}

function backCurtain(y: number, from: number, to: number) {
  let d = `M${from} ${y}`;
  for (let x = from; x < to; x += 24) d += ` q 12 7 24 0`;
  return d;
}

export function HallPlan({
  seats,
  taken = [],
  selected = [],
  tone = "dark",
  idPrefix = "hall",
  className,
  title = "Seating plan. The screen is at the top.",
  interactive = false,
  focusableSeatId,
  activeSeatId,
  describeSeat,
  onSeatActivate,
  onSeatHover,
  onSeatFocus,
  onSeatKeyDown,
}: HallPlanProps) {
  const takenSet = new Set(taken);
  const selectedSet = new Set(selected);
  const line = tone === "dark" ? "#efe4d2" : "#1b1512";

  const rows = Object.entries(
    seats.reduce<Record<string, number[]>>((acc, s) => {
      (acc[s.row] ??= []).push(s.y);
      return acc;
    }, {}),
  ).map(([row, ys]) => ({ row, y: ys.reduce((a, b) => a + b, 0) / ys.length }));

  const stateOf = (seat: HallSeat): SeatVisualState =>
    !seat.isActive ? "inactive" : takenSet.has(seat.id) ? "taken" : selectedSet.has(seat.id) ? "selected" : "available";

  const { aisle, screen } = PLAN;
  const treads: number[] = [];
  for (let y = aisle.top + 12; y < aisle.bottom; y += 32) treads.push(y);

  return (
    <svg
      viewBox={`0 0 ${PLAN.width} ${PLAN.height}`}
      className={cn("block h-auto w-full select-none", className)}
      role="group"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${idPrefix}-beam`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={line} stopOpacity="0" />
          <stop offset="1" stopColor={line} stopOpacity={tone === "dark" ? 0.07 : 0.05} />
        </linearGradient>
        <radialGradient id={`${idPrefix}-glow`} cx="0.5" cy="0" r="0.6">
          <stop offset="0" stopColor={tone === "dark" ? "#f5e6cc" : "#931a14"} stopOpacity={tone === "dark" ? 0.32 : 0.12} />
          <stop offset="1" stopColor={tone === "dark" ? "#f5e6cc" : "#931a14"} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${idPrefix}-lamp`}>
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Room */}
      <g aria-hidden>
        <path d={`M500 842 L${screen.x1} ${screen.y + 8} L${screen.x2} ${screen.y + 8} Z`} fill={`url(#${idPrefix}-beam)`} />
        <ellipse cx="500" cy={screen.y} rx="380" ry="120" fill={`url(#${idPrefix}-glow)`} />
        <path
          d={`M${screen.x1} ${screen.y} Q500 ${screen.y - 14} ${screen.x2} ${screen.y}`}
          stroke={tone === "dark" ? "#f3e7d3" : "#1b1512"}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <text
          x="500"
          y={screen.y + 40}
          textAnchor="middle"
          fill={line}
          fillOpacity="0.55"
          className="font-meta"
          style={{ fontSize: 17, letterSpacing: "0.5em" }}
        >
          SCREEN
        </text>

        <g stroke={line} strokeOpacity="0.2" fill="none" strokeWidth="2">
          <path d={curtain(24, 30, 846, 7)} />
          <path d={curtain(976, 30, 846, -7)} />
          <path d={backCurtain(856, 24, 976)} />
        </g>

        {/* Wall lamps, between rows B and C as in the room */}
        {[
          [22, 428],
          [978, 428],
        ].map(([cx, cy]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r="26" fill={`url(#${idPrefix}-lamp)`} opacity={tone === "dark" ? 0.55 : 0.35} />
            <circle cx={cx} cy={cy} r="5" fill={tone === "dark" ? "#ffe2b5" : "#b0623b"} />
          </g>
        ))}

        <g stroke={line} strokeOpacity="0.16" strokeWidth="2">
          {PLAN.risers.map((y) =>
            y < aisle.bottom ? (
              <g key={y}>
                <line x1="60" y1={y} x2={aisle.x1} y2={y} />
                <line x1={aisle.x2} y1={y} x2="940" y2={y} />
              </g>
            ) : (
              <line key={y} x1="60" y1={y} x2="940" y2={y} />
            ),
          )}
        </g>

        <g stroke={line} strokeOpacity="0.22" strokeWidth="2">
          <line x1={aisle.x1} y1={aisle.top} x2={aisle.x1} y2={aisle.bottom} />
          <line x1={aisle.x2} y1={aisle.top} x2={aisle.x2} y2={aisle.bottom} />
          {treads.map((y) => (
            <line key={y} x1={aisle.x1 + 10} y1={y} x2={aisle.x2 - 10} y2={y} strokeOpacity="0.14" />
          ))}
        </g>

        {rows.map(({ row, y }) => (
          <g key={row} fill={line} fillOpacity="0.5" className="font-label" style={{ fontSize: 22 }}>
            <text x={PLAN.rowLabelX.left} y={y} textAnchor="middle" dominantBaseline="central">
              {row}
            </text>
            <text x={PLAN.rowLabelX.right} y={y} textAnchor="middle" dominantBaseline="central">
              {row}
            </text>
          </g>
        ))}
      </g>

      {/* Seats */}
      <g>
        {seats.map((seat) => {
          const state = stateOf(seat);
          const isActive = activeSeatId === seat.id;
          const disabled = state === "taken" || state === "inactive";
          return (
            <g
              key={seat.id}
              transform={`translate(${seat.x} ${seat.y})`}
              data-seat-id={seat.id}
              {...(interactive
                ? {
                    role: "checkbox",
                    "aria-checked": state === "selected",
                    "aria-disabled": disabled || undefined,
                    "aria-label": describeSeat?.(seat, state) ?? `Row ${seat.row}, seat ${seat.number}`,
                    tabIndex: state === "inactive" ? undefined : focusableSeatId === seat.id ? 0 : -1,
                    onClick: () => onSeatActivate?.(seat),
                    onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && onSeatHover?.(seat),
                    onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && onSeatHover?.(null),
                    onFocus: () => onSeatFocus?.(seat),
                    onKeyDown: (e: KeyboardEvent<SVGGElement>) => onSeatKeyDown?.(e, seat),
                  }
                : {})}
              className={cn(
                "outline-none",
                interactive && (disabled ? "cursor-not-allowed" : "cursor-pointer"),
                "[&:hover>.seat-body]:brightness-110",
              )}
            >
              {isActive && interactive && (
                <circle
                  r={seat.kind === "saucer" ? 70 : 56}
                  fill="none"
                  stroke={tone === "dark" ? "#efe4d2" : "#931a14"}
                  strokeOpacity="0.7"
                  strokeWidth="2.5"
                  strokeDasharray="6 7"
                />
              )}
              <g
                className="seat-body transition-transform duration-300 ease-(--ease-cinema)"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: state === "selected" ? "scale(1.08)" : undefined,
                }}
              >
                <g transform={seat.rotation ? `rotate(${seat.rotation})` : undefined}>
                  <SeatGlyph kind={seat.kind} state={state} tone={tone} number={seat.number} />
                </g>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
