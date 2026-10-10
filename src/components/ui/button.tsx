import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap font-label transition-[background-color,color,border-color,opacity] duration-200 disabled:pointer-events-none disabled:opacity-45";

const variants = {
  primary: "bg-oxblood text-cream hover:bg-oxblood-2",
  ink: "bg-ink text-paper hover:bg-ink-2",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
  cream: "bg-cream text-ink hover:bg-white",
  "outline-cream": "border border-cream/45 text-cream hover:border-cream hover:bg-cream hover:text-ink",
  ghost: "text-ink hover:bg-ink/6",
  "ghost-cream": "text-cream hover:bg-cream/10",
  danger: "border border-vermilion/60 text-vermilion hover:bg-vermilion hover:text-cream",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-[0.78rem]",
  md: "h-11 px-5 text-[0.86rem]",
  lg: "h-14 px-7 text-[0.95rem]",
  icon: "size-10",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show a trailing arrow that nudges on hover. */
  arrow?: boolean;
};

export function buttonClasses({ variant = "primary", size = "md" }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size]);
}

function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 10"
      className="h-2.5 w-5 shrink-0 transition-transform duration-300 ease-(--ease-cinema) group-hover/btn:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M0 5h18M14 1l4 4-4 4" />
    </svg>
  );
}

function Content({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );
}

export function Button({
  variant,
  size,
  arrow,
  className,
  children,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return (
    <button type={type} className={cn(buttonClasses({ variant, size }), className)} {...props}>
      <Content arrow={arrow}>{children}</Content>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  arrow,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return (
    <Link className={cn(buttonClasses({ variant, size }), className)} {...props}>
      <Content arrow={arrow}>{children}</Content>
    </Link>
  );
}

export { Arrow as ButtonArrow };
