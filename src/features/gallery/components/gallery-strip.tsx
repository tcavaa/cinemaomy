import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { getPublishedGallery } from "../queries";
import { cn } from "@/lib/utils";

// Editorial collage on a 12 × 6 grid (row / column start / end). On phones it
// becomes a horizontal strip.
const LAYOUT = [
  "lg:[grid-area:1/1/7/6]",
  "lg:[grid-area:1/6/4/10]",
  "lg:[grid-area:2/10/5/13]",
  "lg:[grid-area:4/6/7/9]",
  "lg:[grid-area:5/9/7/13]",
];

export async function GalleryStrip() {
  const images = (await getPublishedGallery()).slice(1, 6);
  if (images.length < 3) return null;

  return (
    <section aria-labelledby="inside" className="bg-paper-2 py-20 lg:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="inside" className="font-poster text-[clamp(3rem,7vw,6rem)] text-oxblood">
            Inside O&apos;my
          </h2>
          <ButtonLink href="/gallery" variant="outline" size="sm" arrow>
            Gallery
          </ButtonLink>
        </div>

        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:h-[min(48vw,700px)] lg:grid-cols-12 lg:grid-rows-6 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {images.map((image, i) => (
            <li
              key={image.id}
              className={cn("relative aspect-[4/5] w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:aspect-auto lg:w-auto", LAYOUT[i])}
            >
              <Link href="/gallery" className="group block size-full overflow-hidden">
                <Media
                  src={image.imageUrl}
                  alt={image.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 40vw, 72vw"
                  className="object-cover transition-transform duration-[1200ms] ease-(--ease-cinema) group-hover:scale-[1.04]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
