import { NextResponse, type NextRequest } from "next/server";
import { getTicket, tokenMatches } from "@/features/booking/service";
import { getSiteSettings } from "@/features/content/queries";
import { requestOrigin } from "@/lib/env";

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export async function GET(request: NextRequest, ctx: RouteContext<"/api/bookings/[id]/calendar">) {
  const { id } = await ctx.params;
  const view = await getTicket(id);
  if (!view || view.booking.status !== "paid" || !tokenMatches(view.booking, request.nextUrl.searchParams.get("k"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { booking, screening, event } = view;
  const settings = await getSiteSettings();
  const origin = await requestOrigin();
  const end = new Date(screening.startsAt.getTime() + ((event.runtimeMinutes ?? 120) + 15) * 60_000);
  const seats = booking.seats.map((s) => s.label).join(", ");
  const location = [settings.name, settings.address, settings.city].filter(Boolean).join(", ");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cinema O'my//Tickets//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@cinemaomy`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(screening.startsAt)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escape(`${event.title} — ${settings.name}`)}`,
    `LOCATION:${escape(location)}`,
    `DESCRIPTION:${escape(`Seats ${seats}. Booking ${booking.reference}.\nTickets: ${origin}/tickets/${booking.id}?k=${booking.accessToken}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="cinema-omy-${booking.reference}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
