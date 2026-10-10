import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PosterHeader } from "@/components/brand/poster-header";
import { Container } from "@/components/layout/container";
import { buttonClasses } from "@/components/ui/button";
import { Markdown } from "@/features/content/components/markdown";
import { MapEmbed, mapsLink } from "@/features/content/components/visit-section";
import { getPage, getSiteSettings } from "@/features/content/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return { title: page?.title ?? "Contact", description: page?.seoDescription ?? undefined };
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="pt-1 font-meta text-[0.6rem] tracking-[0.2em] text-ink-3">{label}</dt>
      <dd className="font-ui text-[1.05rem]">{children}</dd>
    </div>
  );
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);

  return (
    <div className="pb-24">
      <Container className="pt-12 lg:pt-20">
        <PosterHeader eyebrow={page?.eyebrow ?? "Contact"} title={page?.title ?? "Find us"} size="lg" />
        {page?.lead && (
          <p className="mt-10 max-w-4xl font-serif text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.25] text-ink">{page.lead}</p>
        )}
      </Container>

      <Container className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          {settings.address && (
            <p className="font-poster text-[clamp(2.4rem,4.6vw,4rem)] text-oxblood">{settings.address}</p>
          )}
          <p className="mt-3 font-credit text-[1.2rem] text-oxblood">
            {[settings.district, settings.city].filter(Boolean).join(", ")}
          </p>

          <dl className="mt-10 border-t-2 border-ink">
            {settings.phone && (
              <Row label="Phone">
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-oxblood">
                  {settings.phone}
                </a>
              </Row>
            )}
            {settings.email && (
              <Row label="Email">
                <a href={`mailto:${settings.email}`} className="hover:text-oxblood">
                  {settings.email}
                </a>
              </Row>
            )}
            {settings.instagramUrl && (
              <Row label="Instagram">
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-oxblood">
                  @{settings.instagramUrl.replace(/\/$/, "").split("/").pop()}
                </a>
              </Row>
            )}
            {settings.facebookUrl && (
              <Row label="Facebook">
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-oxblood">
                  Facebook
                </a>
              </Row>
            )}
            {settings.openingHours && (
              <Row label="Doors">
                <span className="whitespace-pre-line">{settings.openingHours}</span>
              </Row>
            )}
          </dl>

          <Markdown source={page?.body} className="mt-10 max-w-xl" />

          {settings.mapQuery && (
            <a href={mapsLink(settings.mapQuery)} target="_blank" rel="noreferrer" className={`${buttonClasses({ variant: "ink" })} mt-10`}>
              Open in Google Maps
            </a>
          )}
        </div>

        {settings.mapQuery && (
          <div className="min-h-[420px] border border-ink/20 bg-paper-2 lg:min-h-full">
            <MapEmbed query={settings.mapQuery} className="min-h-[420px]" />
          </div>
        )}
      </Container>
    </div>
  );
}
