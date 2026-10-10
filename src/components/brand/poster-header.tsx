import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  credit?: ReactNode;
  aside?: ReactNode;
  tone?: "paper" | "dark";
  size?: "xl" | "lg" | "md";
  className?: string;
  as?: "h1" | "h2";
};

const sizes = {
  xl: "text-[clamp(3.6rem,13vw,12.5rem)]",
  lg: "text-[clamp(3.2rem,10vw,9rem)]",
  md: "text-[clamp(2.6rem,7vw,6rem)]",
};

// Room for descenders (g, y, p) under the tight 0.86 line height.
const creditGap = { xl: "mt-[clamp(1rem,2.6vw,2.4rem)]", lg: "mt-[clamp(0.9rem,2vw,1.8rem)]", md: "mt-4" };

/** Big red title with the "Directed by … (year)" line underneath, as on the posters. */
export function PosterHeader({ eyebrow, title, credit, aside, tone = "paper", size = "lg", className, as: Tag = "h1" }: Props) {
  const dark = tone === "dark";
  return (
    <header className={cn("flex flex-col", className)}>
      {eyebrow && (
        <p className={cn("mb-4 font-meta text-[0.66rem]", dark ? "text-smoke" : "text-ink-3")}>{eyebrow}</p>
      )}
      <Tag className={cn("font-poster [text-wrap:balance]", sizes[size], dark ? "text-cream" : "text-oxblood")}>{title}</Tag>
      {(credit || aside) && (
        <div
          className={cn(
            creditGap[size],
            "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-credit text-[clamp(1rem,1.7vw,1.4rem)]",
            dark ? "text-cream/80" : "text-oxblood",
          )}
        >
          <span>{credit}</span>
          {aside && <span>{aside}</span>}
        </div>
      )}
    </header>
  );
}
