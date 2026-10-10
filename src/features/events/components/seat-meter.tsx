import { cn } from "@/lib/utils";

/** "12 seats left" with a strip of tiny seats, one per seat in the hall. */
export function SeatMeter({
  taken,
  total,
  tone = "light",
  showStrip = true,
  className,
}: {
  taken: number;
  total: number;
  tone?: "light" | "dark";
  showStrip?: boolean;
  className?: string;
}) {
  const left = Math.max(0, total - taken);
  const label = left === 0 ? "Sold out" : left <= 5 ? `Last ${left} ${left === 1 ? "seat" : "seats"}` : `${left} seats left`;
  const urgent = left <= 5;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span
        className={cn(
          "font-label text-[0.72rem] tracking-[0.1em]",
          urgent ? "text-vermilion" : tone === "dark" ? "text-cream/80" : "text-ink-2",
        )}
      >
        {label}
      </span>
      {showStrip && total > 0 && (
        <span aria-hidden className="flex gap-[2px]">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-[3px]",
                i < taken
                  ? tone === "dark"
                    ? "bg-cream/20"
                    : "bg-ink/15"
                  : tone === "dark"
                    ? "bg-cognac-2"
                    : "bg-cognac",
              )}
            />
          ))}
        </span>
      )}
    </div>
  );
}
