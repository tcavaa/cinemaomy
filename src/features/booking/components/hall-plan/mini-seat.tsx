import type { SeatKind } from "@/lib/db/enums";
import { cn } from "@/lib/utils";
import { SeatGlyph, type SeatVisualState } from "./seat-glyph";

/** A single seat glyph at icon size, for legends. */
export function MiniSeat({
  kind,
  state,
  tone = "dark",
  className,
}: {
  kind: SeatKind;
  state: SeatVisualState;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <svg viewBox="-64 -48 128 96" className={cn("h-7 w-9 shrink-0", className)} aria-hidden>
      <SeatGlyph kind={kind} state={state} tone={tone} showNumber={false} />
    </svg>
  );
}
