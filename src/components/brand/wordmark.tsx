import { cn } from "@/lib/utils";

/**
 * The "(inema O'my" wordmark, drawn as a CSS mask so it takes the current text
 * colour — ink on paper, cream on velvet.
 */
export function Wordmark({ className, label = "Cinema O'my" }: { className?: string; label?: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("block aspect-[1783/546] bg-current", className)}
      style={{
        maskImage: "url(/brand/wordmark.png)",
        WebkitMaskImage: "url(/brand/wordmark.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
      }}
    />
  );
}
