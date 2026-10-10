import { HallTeaser } from "@/features/booking/components/hall-teaser";
import { VisitSection } from "@/features/content/components/visit-section";
import { WeekProgram } from "@/features/events/components/week-program";
import { GalleryStrip } from "@/features/gallery/components/gallery-strip";
import { HeroSlider, type HeroSlide } from "@/features/slides/components/hero-slider";
import { getPublishedSlides } from "@/features/slides/queries";

export default async function HomePage() {
  const slides = await getPublishedSlides();
  const heroSlides: HeroSlide[] = slides.map((s) => ({
    id: s.id,
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    aside: s.aside,
    meta: s.meta,
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt,
    ctaLabel: s.ctaLabel,
    linkUrl: s.linkUrl,
    theme: s.theme,
  }));

  return (
    <>
      {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}
      <WeekProgram />
      <HallTeaser />
      <GalleryStrip />
      <VisitSection />
    </>
  );
}
