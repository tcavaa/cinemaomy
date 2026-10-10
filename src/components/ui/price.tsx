import { cn } from "@/lib/utils";

/** "15 ₾" — the lari sign is set in the sans face, which draws it properly. */
export function Price({ tetri, className }: { tetri: number; className?: string }) {
  const lari = tetri / 100;
  const value = Number.isInteger(lari) ? String(lari) : lari.toFixed(2);
  return (
    <span className={cn("tabular whitespace-nowrap", className)}>
      {value}
      <span className="ml-[0.15em] font-sans text-[0.72em] font-semibold [font-variation-settings:'wdth'_100]">₾</span>
    </span>
  );
}
