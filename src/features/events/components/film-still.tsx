import { Media } from "@/components/ui/media";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  imageUrl: string | null;
  posterUrl?: string | null;
  sizes: string;
  className?: string;
  preload?: boolean;
  quality?: number;
};

/**
 * A film still in a fixed frame. When there is no image, it falls back to a
 * typographic card in the style of the cinema's posters.
 */
export function FilmStill({ title, imageUrl, posterUrl, sizes, className, preload, quality = 80 }: Props) {
  const src = imageUrl ?? posterUrl;
  return (
    <div className={cn("relative overflow-hidden bg-ink", className)}>
      {src ? (
        <Media
          src={src}
          alt=""
          fill
          sizes={sizes}
          quality={quality}
          preload={preload}
          className={cn("object-cover", !imageUrl && "object-top")}
        />
      ) : (
        <div className="@container paper-fold absolute inset-0 flex items-end bg-oxblood p-[8%]">
          <span className="font-poster text-[clamp(1.5rem,13cqw,5rem)] text-cream [text-wrap:balance]">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
