import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MetaLine } from "@/components/brand/meta-line";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { getSessionUser } from "@/features/auth/session";
import { BookingFlow } from "@/features/booking/components/booking-flow";
import { getHallSeats, getTakenSeatIds } from "@/features/booking/queries";
import { getSiteSettings } from "@/features/content/queries";
import { getScreeningForBooking } from "@/features/events/queries";
import { formatDotDate, formatTime, formatWeekday } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/book/[screeningId]">): Promise<Metadata> {
  const { screeningId } = await params;
  const screening = await getScreeningForBooking(screeningId);
  if (!screening) return { title: "Choose seats" };
  return {
    title: `Seats for ${screening.event.title}, ${formatWeekday(screening.startsAt)} ${formatDotDate(screening.startsAt)}`,
    robots: { index: false },
  };
}

export default function BookPage({ params }: PageProps<"/book/[screeningId]">) {
  return (
    <div className="theme-dark bg-velvet pb-28 text-cream lg:pb-24">
      <Suspense fallback={<BookingSkeleton />}>
        <Booking params={params} />
      </Suspense>
    </div>
  );
}

async function Booking({ params }: Pick<PageProps<"/book/[screeningId]">, "params">) {
  const { screeningId } = await params;
  const screening = await getScreeningForBooking(screeningId);
  if (!screening) notFound();

  const [seats, taken, user, settings] = await Promise.all([
    getHallSeats(),
    getTakenSeatIds(screening.id),
    getSessionUser(),
    getSiteSettings(),
  ]);

  const { event } = screening;
  const closed = screening.status === "cancelled" || !screening.salesOpen || screening.hasStarted;

  return (
    <>
      <Container className="pt-8 pb-10 lg:pt-12 lg:pb-14">
        <Link
          href={`/program/${event.slug}`}
          className="font-label text-[0.75rem] tracking-[0.12em] text-smoke transition-colors hover:text-cream"
        >
          ← {event.title}
        </Link>
        <h1 className="mt-5 font-poster text-[clamp(3rem,9vw,7.5rem)] text-cream [text-wrap:balance]">{event.title}</h1>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-credit text-[clamp(1rem,1.6vw,1.3rem)] text-cream/80">
          <span>{event.director ? `Directed by ${event.director}` : event.tagline}</span>
          {event.year && <span>({event.year})</span>}
        </div>
        <MetaLine
          value={[formatWeekday(screening.startsAt), formatDotDate(screening.startsAt), formatTime(screening.startsAt)]}
          className="mt-6 border-y border-cream/15 py-3 text-[0.7rem] text-cream sm:text-[0.8rem]"
        />
        {screening.note && <p className="mt-3 font-ui text-[0.95rem] text-smoke">{screening.note}</p>}
      </Container>

      <Container>
        {closed ? (
          <div className="flex flex-col items-start gap-6 border border-cream/15 p-8">
            <p className="font-poster text-[2.4rem] text-cream">
              {screening.status === "cancelled" ? "This screening is cancelled." : "Ticket sales are closed."}
            </p>
            <ButtonLink href="/program" variant="cream" arrow>
              See what else is on
            </ButtonLink>
          </div>
        ) : (
          <BookingFlow
            screening={{
              id: screening.id,
              startsAt: screening.startsAt.toISOString(),
              prices: screening.prices,
              note: screening.note,
              event: { slug: event.slug, title: event.title, director: event.director, year: event.year },
            }}
            seats={seats}
            initialTaken={taken}
            user={user ? { name: user.name, email: user.email, phone: user.phone } : null}
            bookingNote={settings.bookingNote}
          />
        )}
      </Container>
    </>
  );
}

function BookingSkeleton() {
  return (
    <Container className="animate-pulse pt-12">
      <div className="h-4 w-32 bg-cream/10" />
      <div className="mt-6 h-24 w-3/4 bg-cream/10" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="aspect-[10/9] bg-cream/5" />
        <div className="h-96 bg-cream/10" />
      </div>
    </Container>
  );
}
