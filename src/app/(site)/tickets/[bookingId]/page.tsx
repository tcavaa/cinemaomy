import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { getSessionUser } from "@/features/auth/session";
import { PaymentPending } from "@/features/booking/components/payment-pending";
import { ClaimTicketForm, PrintButton } from "@/features/booking/components/ticket-actions";
import { TicketStub } from "@/features/booking/components/ticket-stub";
import { qrSvg } from "@/features/booking/qr";
import { getTicket, tokenMatches } from "@/features/booking/service";
import { getSiteSettings } from "@/features/content/queries";
import { requestOrigin } from "@/lib/env";
import { formatLongDate, formatTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your tickets",
  robots: { index: false, follow: false },
};

export default function TicketPage({ params, searchParams }: PageProps<"/tickets/[bookingId]">) {
  return (
    <div className="bg-paper-2 pb-24">
      <Suspense fallback={<Container className="py-24 font-meta text-[0.7rem] text-ink-3">Loading your tickets…</Container>}>
        <Ticket params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Ticket({ params, searchParams }: PageProps<"/tickets/[bookingId]">) {
  const [{ bookingId }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.k === "string" ? query.k : undefined;

  const view = await getTicket(bookingId);
  if (!view) notFound();
  const user = await getSessionUser();
  const isOwner = Boolean(user && view.booking.userId === user.id);
  if (!isOwner && !tokenMatches(view.booking, token)) notFound();

  const { booking, screening, event } = view;
  const settings = await getSiteSettings();
  const origin = await requestOrigin();
  const accessToken = booking.accessToken;
  const credit = event.director ? `Directed by ${event.director}` : null;

  if (booking.status === "pending") {
    return (
      <Container className="py-16 lg:py-24">
        <Header eyebrow={`Booking ${booking.reference}`} title="Almost there" />
        <div className="mt-10">
          <PaymentPending bookingId={booking.id} accessToken={accessToken} />
        </div>
      </Container>
    );
  }

  if (booking.status !== "paid") {
    const copy: Record<string, { title: string; text: string }> = {
      expired: {
        title: "This hold expired",
        text: "The payment wasn't completed in time, so the seats went back on sale. Nothing was charged.",
      },
      cancelled: { title: "Booking cancelled", text: "This booking was cancelled and its seats released." },
      refunded: { title: "Refunded", text: "This booking was refunded. The money goes back to the card you paid with." },
      conflict: {
        title: "We owe you a refund",
        text: `Your payment arrived after the seats had been released, and someone else took them. We'll refund you — call us${
          settings.phone ? ` on ${settings.phone}` : ""
        } if you'd like to sort out other seats instead.`,
      },
    };
    const { title, text } = copy[booking.status] ?? copy.cancelled;
    return (
      <Container className="py-16 lg:py-24">
        <Header eyebrow={`Booking ${booking.reference}`} title={title} />
        <p className="mt-6 max-w-xl font-serif text-[1.2rem] text-ink-2">{text}</p>
        <ButtonLink href="/program" arrow className="mt-10">
          See the program
        </ButtonLink>
      </Container>
    );
  }

  const codes = await qrSvg(`${origin}/admin/bookings/${booking.id}`);
  const calendarHref = `/api/bookings/${booking.id}/calendar?k=${encodeURIComponent(accessToken)}`;

  return (
    <Container className="py-12 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6 print:hidden">
        <Header
          eyebrow={`Booking ${booking.reference}`}
          title={booking.seats.length > 1 ? "You're in — all of you." : "You're in."}
        />
        <div className="flex flex-wrap gap-3">
          <PrintButton />
          <ButtonLink href={calendarHref} variant="outline" size="sm" prefetch={false}>
            Add to calendar
          </ButtonLink>
        </div>
      </div>

      <p className="mt-6 max-w-2xl font-serif text-[1.15rem] leading-relaxed text-ink-2 print:hidden">
        {formatLongDate(screening.startsAt)} at {formatTime(screening.startsAt)}
        {settings.address ? `, ${settings.address}` : ""}. Show the code at the door — on your phone is fine.{" "}
        {settings.openingHours}
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {booking.seats.map((seat) => (
          <TicketStub
            key={seat.seatId}
            title={event.title}
            credit={credit}
            year={event.year}
            startsAt={screening.startsAt}
            seat={seat}
            reference={booking.reference}
            qrSvg={codes}
            checkedIn={Boolean(booking.checkedInAt)}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-2 print:hidden">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 font-ui text-[0.95rem]">
          <dt className="text-ink-3">Name</dt>
          <dd>{booking.customerName}</dd>
          <dt className="text-ink-3">Paid</dt>
          <dd>
            <Price tetri={booking.amount} />
          </dd>
          <dt className="text-ink-3">Reference</dt>
          <dd className="tabular">{booking.reference}</dd>
        </dl>

        <div className="flex flex-col items-start gap-3">
          {user ? (
            booking.userId === user.id ? (
              <p className="font-ui text-[0.95rem] text-ink-2">
                Saved in{" "}
                <Link href="/account" className="text-oxblood underline underline-offset-3">
                  My tickets
                </Link>
                .
              </p>
            ) : booking.userId ? null : (
              <>
                <p className="font-ui text-[0.95rem] text-ink-2">Keep these tickets with your account:</p>
                <ClaimTicketForm bookingId={booking.id} accessToken={accessToken} />
              </>
            )
          ) : (
            <p className="font-ui text-[0.95rem] text-ink-2">
              Bookmark this page — it is your ticket.{" "}
              <Link
                href={`/register?next=${encodeURIComponent(`/tickets/${booking.id}?k=${accessToken}`)}`}
                className="text-oxblood underline underline-offset-3"
              >
                Create an account
              </Link>{" "}
              to keep all your tickets in one place.
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-meta text-[0.65rem] text-ink-3">{eyebrow}</p>
      <h1 className="mt-3 font-poster text-[clamp(3rem,8vw,6.5rem)] text-oxblood">{title}</h1>
    </div>
  );
}
