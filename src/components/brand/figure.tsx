import { cn } from "@/lib/utils";

/** The red figure with raised arms from the logo, as a recolourable mask. */
export function Figure({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block aspect-[357/629] bg-current", className)}
      style={{
        maskImage: "url(/brand/figure.png)",
        WebkitMaskImage: "url(/brand/figure.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "bottom center",
        WebkitMaskPosition: "bottom center",
      }}
    />
  );
}
