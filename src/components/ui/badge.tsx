import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-ink/25 text-ink-2",
  red: "border-oxblood/40 bg-oxblood/8 text-oxblood",
  green: "border-[#3d6b45]/40 bg-[#3d6b45]/8 text-[#2f5536]",
  amber: "border-[#a8741a]/40 bg-[#a8741a]/10 text-[#7d560f]",
  ink: "border-ink bg-ink text-paper",
  vermilion: "border-vermilion bg-vermilion text-cream",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 border px-2 font-label text-[0.68rem] leading-none whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
