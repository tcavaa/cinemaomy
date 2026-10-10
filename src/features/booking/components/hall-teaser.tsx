import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Price } from "@/components/ui/price";
import { getSiteSettings } from "@/features/content/queries";
import { SEAT_KINDS } from "@/lib/db/enums";
import { getHallSeats } from "../queries";
import { SEAT_KIND_INFO } from "../seat-kinds";
import { HallPlan } from "./hall-plan/hall-plan";
import { MiniSeat } from "./hall-plan/mini-seat";

/** Home page section: the room, the seat types and the plan you book from. */
export async function HallTeaser() {
  const [seats, settings] = await Promise.all([getHallSeats(), getSiteSettings()]);
  const active = seats.filter((s) => s.isActive);

  return (
    <section aria-labelledby="the-hall" className="theme-dark overflow-hidden bg-velvet py-20 text-cream lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className="font-meta text-[0.64rem] text-smoke">The hall</p>
          <h2 id="the-hall" className="mt-4 font-poster text-[clamp(3rem,7vw,6.2rem)] text-cream">
            {active.length} seats.
            <br />
            <span className="text-cognac-2">Choose yours.</span>
          </h2>
          <p className="mt-6 max-w-lg font-serif text-[1.2rem] leading-relaxed text-cream/75">
            Five rows on wooden risers, velvet on the walls and leather everywhere you sit. Every seat is booked by
            name — tap it on the plan, see the price, and it&apos;s yours.
          </p>

          <ul className="mt-10 flex flex-col divide-y divide-cream/12 border-y border-cream/12">
            {SEAT_KINDS.filter((k) => active.some((s) => s.kind === k)).map((kind) => (
              <li key={kind} className="flex items-center gap-4 py-4">
                <MiniSeat kind={kind} state="available" className="h-9 w-12" />
                <div className="flex-1">
                  <p className="font-label text-[0.95rem] tracking-[0.06em]">{SEAT_KIND_INFO[kind].label}</p>
                  <p className="font-ui text-[0.88rem] text-smoke">{SEAT_KIND_INFO[kind].description}</p>
                </div>
                <p className="font-ui text-[0.88rem] text-smoke">
                  from <Price tetri={settings.defaultPrices[kind]} className="font-label text-[1rem] text-cream" />
                </p>
              </li>
            ))}
          </ul>

          <ButtonLink href="/program" variant="cream" size="lg" arrow className="mt-10">
            Pick a screening
          </ButtonLink>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] w-full">
            <Media
              src="/images/venue/hall.jpg"
              alt="The auditorium: leather armchairs on five rows facing the screen"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <div className="relative -mt-24 ml-auto w-[78%] border border-cream/15 bg-velvet-2/95 p-4 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-sm sm:-mt-32 sm:p-5">
            <HallPlan seats={seats} tone="dark" idPrefix="teaser" title="Plan of the hall" />
          </div>
        </div>
      </Container>
    </section>
  );
}
