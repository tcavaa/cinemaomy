import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full border border-ink/25 bg-paper/60 px-3.5 font-ui text-[0.98rem] text-ink placeholder:text-ink-3/70 transition-colors hover:border-ink/45 focus:border-ink focus:bg-paper focus:outline-none aria-invalid:border-vermilion disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "h-11 appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-3.5 top-1/2 h-1.5 w-2.5 -translate-y-1/2 text-ink-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <path d="M1 1l4 4 4-4" />
      </svg>
    </div>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("font-label text-[0.74rem] text-ink-2", className)} {...props} />;
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 font-ui text-[0.95rem]", className)}>
      <input
        type="checkbox"
        className="peer size-4.5 cursor-pointer appearance-none border border-ink/50 bg-paper transition-colors checked:border-oxblood checked:bg-oxblood"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string[] | string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {message ? (
        <p id={`${htmlFor}-error`} className="font-ui text-[0.85rem] text-vermilion">
          {message}
        </p>
      ) : hint ? (
        <p className="font-ui text-[0.82rem] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
