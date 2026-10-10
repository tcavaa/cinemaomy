import { cn } from "@/lib/utils";

/**
 * The spaced-out bottom line of the posters: "SATURDAY   10.10   18:00".
 * Accepts either a "·"-separated string or a list of parts.
 */
export function MetaLine({ value, className }: { value: string | (string | null | undefined)[]; className?: string }) {
  const parts = (typeof value === "string" ? value.split("·") : value)
    .map((p) => p?.trim())
    .filter(Boolean) as string[];
  if (!parts.length) return null;

  return (
    <p className={cn("flex items-baseline justify-between gap-x-6 gap-y-1 font-meta tabular", className)}>
      {parts.map((part, i) => (
        <span key={`${part}-${i}`} className={cn(i === parts.length - 1 && parts.length > 1 && "text-right")}>
          {part}
        </span>
      ))}
    </p>
  );
}
