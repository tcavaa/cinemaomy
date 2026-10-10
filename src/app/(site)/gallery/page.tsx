import type { Metadata } from "next";
import { PosterHeader } from "@/components/brand/poster-header";
import { Container } from "@/components/layout/container";
import { GalleryGrid } from "@/features/gallery/components/gallery-grid";
import { getPublishedGallery } from "@/features/gallery/queries";

export const metadata: Metadata = {
  title: "Gallery",
  description: "The hall, the bar and the nights at Cinema O'my.",
};

export default async function GalleryPage() {
  const images = await getPublishedGallery();

  return (
    <div className="pb-24">
      <Container className="pt-12 lg:pt-20">
        <PosterHeader
          eyebrow="Gallery"
          title="Inside O'my"
          size="lg"
          credit="The hall, the bar, the nights."
          aside={`${images.length} photographs`}
        />
        <div className="mt-12 lg:mt-16">
          {images.length ? (
            <GalleryGrid
              images={images.map((i) => ({
                id: i.id,
                imageUrl: i.imageUrl,
                alt: i.alt,
                caption: i.caption,
                width: i.width,
                height: i.height,
              }))}
            />
          ) : (
            <p className="font-serif text-[1.3rem] text-ink-2">Photos are on their way.</p>
          )}
        </div>
      </Container>
    </div>
  );
}
