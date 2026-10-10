import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stat({ label, value, hint, href, tone }: { label: string; value: ReactNode; hint?: ReactNode; href?: string; tone?: "alert" }) {
  const body = (
    <>
      <span className="font-meta text-[0.58rem] tracking-[0.2em] text-ink-3">{label}</span>
      <span className={cn("mt-2 font-poster text-[2.6rem] leading-none", tone === "alert" ? "text-vermilion" : "text-ink")}>{value}</span>
      {hint && <span className="mt-2 font-ui text-[0.82rem] text-ink-3">{hint}</span>}
    </>
  );
  const className = "flex flex-col border border-ink/15 bg-[#f4ede1] p-5";
  return href ? (
    <Link href={href} className={cn(className, "transition-colors hover:border-ink")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-20 bg-ink/10">
        <span className="absolute inset-y-0 left-0 bg-oxblood" style={{ width: `${pct}%` }} />
      </span>
      <span className="font-ui text-[0.85rem] tabular">
        {value}/{max}
      </span>
    </span>
  );
}

export const th = "px-3 py-2.5 text-left font-meta text-[0.56rem] font-normal tracking-[0.2em] text-ink-3";
export const td = "px-3 py-3 align-middle font-ui text-[0.9rem]";
