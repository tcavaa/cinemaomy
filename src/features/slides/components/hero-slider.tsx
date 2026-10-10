"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { MetaLine } from "@/components/brand/meta-line";
import { Container } from "@/components/layout/container";
import { ButtonArrow } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import type { SlideTheme } from "@/lib/db/enums";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  aside: string | null;
  meta: string | null;
  imageUrl: string;
  imageAlt: string | null;
  ctaLabel: string | null;
  linkUrl: string | null;
  theme: SlideTheme;
};

const INTERVAL_MS = 7000;

const THEMES: Record<SlideTheme, { section: string; title: string; text: string; muted: string; cta: string; rule: string }> = {
  paper: {
    section: "bg-paper text-ink",
    title: "text-oxblood",
    text: "text-oxblood",
    muted: "text-ink-3",
    cta: "bg-oxblood text-cream hover:bg-oxblood-2",
    rule: "border-ink/25",
  },
  dark: {
    section: "theme-dark bg-velvet text-cream",
    title: "text-cream",
    text: "text-cream/85",
    muted: "text-smoke",
    cta: "bg-cream text-ink hover:bg-white",
    rule: "border-cream/20",
  },
  red: {
    section: "theme-dark bg-vermilion text-ink",
    title: "text-cream",
    text: "text-ink",
    muted: "text-ink/70",
    cta: "bg-ink text-cream hover:bg-velvet-3",
    rule: "border-ink/30",
  },
};

function titleSize(title: string) {
  if (title.length > 22) return "text-[clamp(2.8rem,7.2vw,7.4rem)]";
  if (title.length > 14) return "text-[clamp(3.2rem,8.6vw,9rem)]";
  return "text-[clamp(3.6rem,11vw,11rem)]";
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  // Autoplay is off when the visitor prefers less motion, until they press play.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;
  const [hovering, setHovering] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const count = slides.length;
  const slide = slides[index];
  const theme = THEMES[slide.theme];

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || hovering) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, hovering, count, go]);

  function onPointerDown(e: PointerEvent) {
    pointerStart.current = e.clientX;
  }
  function onPointerUp(e: PointerEvent) {
    if (pointerStart.current == null) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  }

  const isExternal = slide.linkUrl?.startsWith("http");

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className={cn("relative overflow-hidden transition-colors duration-700 ease-(--ease-curtain)", theme.section)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <Container className="flex flex-col pt-6 pb-8 lg:pt-9 lg:pb-11">
        {/* Top row: eyebrow + controls */}
        <div className="flex items-center justify-between gap-6">
          <p key={`eyebrow-${slide.id}`} className={cn("animate-fade font-meta text-[0.64rem]", theme.muted)}>
            {slide.eyebrow ?? " "}
          </p>
          {count > 1 && (
            <div className="flex items-center gap-4">
              <span className="font-meta text-[0.62rem] tabular" aria-live="polite">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <span aria-hidden className={cn("relative hidden h-px w-20 sm:block", theme.rule, "border-t")}>
                <span
                  key={`progress-${index}-${paused || hovering}`}
                  className="absolute -top-px left-0 h-px w-full origin-left bg-current"
                  style={{
                    animation: paused || hovering ? "none" : `progress ${INTERVAL_MS}ms linear both`,
                    transform: paused || hovering ? "scaleX(0)" : undefined,
                  }}
                />
              </span>
              <div className="flex">
                <SlideButton label="Previous slide" onClick={() => go(index - 1)} direction="prev" />
                <SlideButton label="Next slide" onClick={() => go(index + 1)} direction="next" />
              </div>
              <button
                type="button"
                onClick={() => setUserPaused(!paused)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                className="hidden size-9 items-center justify-center opacity-70 hover:opacity-100 sm:flex"
              >
                {paused ? (
                  <svg aria-hidden viewBox="0 0 10 12" className="size-2.5 fill-current">
                    <path d="M0 0l10 6-10 6z" />
                  </svg>
                ) : (
                  <svg aria-hidden viewBox="0 0 10 12" className="size-2.5 fill-current">
                    <path d="M0 0h3v12H0zM7 0h3v12H7z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Title block */}
        <div key={`text-${slide.id}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}>
          <h2 className={cn("mt-4 animate-rise font-poster [text-wrap:balance]", titleSize(slide.title), theme.title)}>
            {slide.title}
          </h2>
          {(slide.subtitle || slide.aside) && (
            <div
              className={cn(
                "mt-[clamp(0.8rem,1.8vw,1.6rem)] flex animate-fade items-baseline justify-between gap-6 font-credit text-[clamp(1rem,1.6vw,1.35rem)] [animation-delay:150ms]",
                theme.text,
              )}
            >
              <span>{slide.subtitle}</span>
              {slide.aside && <span>{slide.aside}</span>}
            </div>
          )}
        </div>

        {/* Picture */}
        <div
          className="relative mt-5 h-[clamp(240px,44vh,560px)] w-full touch-pan-y overflow-hidden bg-ink lg:mt-7"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {slides.map((s, i) => (
            <Media
              key={s.id}
              src={s.imageUrl}
              alt={i === index ? (s.imageAlt ?? "") : ""}
              aria-hidden={i !== index}
              fill
              sizes="(min-width: 1440px) 1360px, 100vw"
              quality={90}
              preload={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              className={cn(
                "object-cover transition-[opacity,transform] duration-[1400ms] ease-(--ease-cinema)",
                i === index ? "scale-100 opacity-100" : "scale-[1.05] opacity-0",
              )}
            />
          ))}
          <div aria-hidden className="paper-fold pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light" />
        </div>

        {/* Bottom line */}
        <div
          key={`meta-${slide.id}`}
          className={cn("mt-5 flex animate-fade flex-col gap-4 border-b pb-1 sm:flex-row sm:items-center sm:gap-10 lg:mt-6", theme.rule)}
        >
          {slide.meta && (
            <MetaLine value={slide.meta} className={cn("flex-1 text-[0.72rem] sm:text-[0.85rem]", theme.text)} />
          )}
          {slide.linkUrl && (
            <Link
              href={slide.linkUrl}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className={cn(
                "group/btn mb-3 inline-flex h-12 items-center justify-center gap-3 px-6 font-label text-[0.86rem] transition-colors sm:mb-2",
                theme.cta,
              )}
            >
              {slide.ctaLabel ?? "Find out more"}
              <ButtonArrow />
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}

function SlideButton({ label, onClick, direction }: { label: string; onClick: () => void; direction: "prev" | "next" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-9 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
    >
      <svg aria-hidden viewBox="0 0 20 10" className={cn("h-2.5 w-5", direction === "prev" && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M0 5h18M14 1l4 4-4 4" />
      </svg>
    </button>
  );
}
