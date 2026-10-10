import type { ReactNode } from "react";
import { Figure } from "@/components/brand/figure";
import { Container } from "@/components/layout/container";

/** Two-column frame for the sign-in / registration screens. */
export function AuthShell({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden pb-24">
      <Container className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-20 lg:pt-24">
        <div className="relative">
          <h1 className="font-poster text-[clamp(3.4rem,10vw,8.5rem)] text-oxblood">{title}</h1>
          <div className="mt-8 max-w-md font-serif text-[1.2rem] leading-relaxed text-ink-2">{intro}</div>
          <Figure className="pointer-events-none mt-16 hidden h-64 text-oxblood/90 lg:block" />
        </div>
        <div className="punched-top self-start bg-[#f4ede1] p-6 shadow-[0_30px_60px_-35px_rgb(40_20_10/0.55)] [--hole:var(--color-paper)] sm:p-8">
          {children}
        </div>
      </Container>
    </div>
  );
}
