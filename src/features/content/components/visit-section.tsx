import { Container } from "@/components/layout/container";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSiteSettings } from "../queries";

export function mapsLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function MapEmbed({ query, className }: { query: string; className?: string }) {
  return (
    <iframe
      title="Map"
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn("block size-full border-0 [filter:grayscale(1)_sepia(0.35)_contrast(1.05)_brightness(0.97)]", className)}
    />
  );
}

export async function VisitSection() {
  const settings = await getSiteSettings();
  if (!settings.address) return null;

  return (
    <section aria-labelledby="visit" className="py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
        <div>
          <p className="font-meta text-[0.64rem] text-ink-3">Visit</p>
          <h2 id="visit" className="mt-4 font-poster text-[clamp(2.8rem,6.4vw,6rem)] text-oxblood [text-wrap:balance]">
            {settings.address}
          </h2>
          <p className="mt-4 font-credit text-[clamp(1.05rem,1.6vw,1.35rem)] text-oxblood">
            {[settings.district, settings.city].filter(Boolean).join(", ")}
          </p>
          {settings.openingHours && (
            <p className="mt-8 max-w-md whitespace-pre-line font-serif text-[1.15rem] text-ink-2">{settings.openingHours}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {settings.mapQuery && (
              <a href={mapsLink(settings.mapQuery)} target="_blank" rel="noreferrer" className={buttonClasses({ variant: "ink" })}>
                Directions
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className={buttonClasses({ variant: "outline" })}>
                {settings.phone}
              </a>
            )}
          </div>
        </div>
        {settings.mapQuery && (
          <div className="aspect-[4/3] w-full border border-ink/20 bg-paper-2">
            <MapEmbed query={settings.mapQuery} />
          </div>
        )}
      </Container>
    </section>
  );
}
