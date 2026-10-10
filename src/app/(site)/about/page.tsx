import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PosterHeader } from "@/components/brand/poster-header";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Markdown } from "@/features/content/components/markdown";
import { getPage } from "@/features/content/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return { title: page?.title ?? "About", description: page?.seoDescription ?? undefined };
}

export default async function AboutPage() {
  const page = await getPage("about");
  if (!page) notFound();

  return (
    <article className="pb-24">
      <Container className="pt-12 lg:pt-20">
        <PosterHeader eyebrow={page.eyebrow} title={page.title} size="lg" />
        {page.lead && (
          <p className="mt-10 max-w-5xl font-serif text-[clamp(1.45rem,2.7vw,2.35rem)] leading-[1.22] text-ink [text-wrap:pretty]">
            {page.lead}
          </p>
        )}
      </Container>

      {page.imageUrl && (
        <Container className="mt-14">
          <figure>
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
              <Media src={page.imageUrl} alt={page.imageAlt ?? ""} fill sizes="(min-width: 1440px) 1360px, 100vw" quality={90} preload className="object-cover" />
            </div>
            {page.imageAlt && (
              <figcaption className="mt-3 font-meta text-[0.6rem] tracking-[0.2em] text-ink-3">{page.imageAlt}</figcaption>
            )}
          </figure>
        </Container>
      )}

      {page.facts.length > 0 && (
        <Container className="mt-16">
          <dl className="grid grid-cols-3 border-y-2 border-ink">
            {page.facts.map((fact) => (
              <div key={fact.label} className="flex flex-col items-center border-l border-ink/25 py-8 first:border-l-0 lg:py-12">
                <dd className="font-poster text-[clamp(3.2rem,10vw,9rem)] leading-none text-oxblood">{fact.value}</dd>
                <dt className="order-last mt-3 font-label text-[0.8rem] tracking-[0.14em]">{fact.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      )}

      <Container className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="hidden lg:block">
          <p className="sticky top-32 font-poster text-[2.6rem] leading-[0.95] text-oxblood">Films worth leaving the house for.</p>
        </div>
        <div>
          <Markdown source={page.body} className="max-w-2xl" />
          <ButtonLink href="/program" arrow className="mt-12">
            See what&apos;s on
          </ButtonLink>
        </div>
      </Container>
    </article>
  );
}
