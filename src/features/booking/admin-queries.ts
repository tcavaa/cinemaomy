import "server-only";
import { and, desc, eq, gt, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/db/enums";
import { expireStaleHolds } from "./service";

const { bookings, events, screenings, paymentEvents } = schema;

const listColumns = {
  id: bookings.id,
  reference: bookings.reference,
  status: bookings.status,
  customerName: bookings.customerName,
  customerEmail: bookings.customerEmail,
  amount: bookings.amount,
  seats: bookings.seats,
  createdAt: bookings.createdAt,
  paidAt: bookings.paidAt,
  checkedInAt: bookings.checkedInAt,
  expiresAt: bookings.expiresAt,
  screeningId: screenings.id,
  startsAt: screenings.startsAt,
  eventTitle: events.title,
};

export type AdminBookingRow = Awaited<ReturnType<typeof listBookings>>[number];

export async function listBookings(filters: { status?: string; q?: string; screeningId?: string; limit?: number } = {}) {
  await expireStaleHolds();
  const where: (SQL | undefined)[] = [];
  if (filters.status && (BOOKING_STATUSES as readonly string[]).includes(filters.status)) {
    where.push(eq(bookings.status, filters.status as BookingStatus));
  }
  if (filters.screeningId && z.uuid().safeParse(filters.screeningId).success) {
    where.push(eq(bookings.screeningId, filters.screeningId));
  }
  const q = filters.q?.trim();
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    where.push(
      or(ilike(bookings.reference, like), ilike(bookings.customerName, like), ilike(bookings.customerEmail, like)),
    );
  }

  return db
    .select(listColumns)
    .from(bookings)
    .innerJoin(screenings, eq(screenings.id, bookings.screeningId))
    .innerJoin(events, eq(events.id, screenings.eventId))
    .where(and(...where))
    .orderBy(desc(bookings.createdAt))
    .limit(filters.limit ?? 200);
}

export async function getBookingAdmin(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const [row] = await db
    .select({
      booking: bookings,
      startsAt: screenings.startsAt,
      screeningId: screenings.id,
      eventTitle: events.title,
      eventId: events.id,
    })
    .from(bookings)
    .innerJoin(screenings, eq(screenings.id, bookings.screeningId))
    .innerJoin(events, eq(events.id, screenings.eventId))
    .where(eq(bookings.id, id))
    .limit(1);
  if (!row) return null;

  const log = await db
    .select({
      id: paymentEvents.id,
      source: paymentEvents.source,
      orderStatus: paymentEvents.orderStatus,
      signatureValid: paymentEvents.signatureValid,
      createdAt: paymentEvents.createdAt,
    })
    .from(paymentEvents)
    .where(eq(paymentEvents.bookingId, id))
    .orderBy(desc(paymentEvents.createdAt));

  return { ...row, log };
}

const soldSeats = sql<number>`(
  select count(*)::int from booking_seats bs join bookings b on b.id = bs.booking_id
  where bs.screening_id = "screenings"."id" and b.status = 'paid'
)`.mapWith(Number);

const heldSeats = sql<number>`(
  select count(*)::int from booking_seats bs join bookings b on b.id = bs.booking_id
  where bs.screening_id = "screenings"."id" and b.status = 'pending' and b.expires_at > now()
)`.mapWith(Number);

const revenue = sql<number>`(
  select coalesce(sum(b.amount), 0)::int from bookings b
  where b.screening_id = "screenings"."id" and b.status = 'paid'
)`.mapWith(Number);

const checkedIn = sql<number>`(
  select coalesce(sum(jsonb_array_length(b.seats)), 0)::int from bookings b
  where b.screening_id = "screenings"."id" and b.status = 'paid' and b.checked_in_at is not null
)`.mapWith(Number);

export const screeningStatsColumns = { soldSeats, heldSeats, revenue, checkedIn };

export async function getDashboard() {
  const capacity = sql<number>`(select count(*)::int from seats where is_active)`.mapWith(Number);

  const [upcoming, recent, totals] = await Promise.all([
    db
      .select({
        id: screenings.id,
        startsAt: screenings.startsAt,
        status: screenings.status,
        title: events.title,
        eventId: events.id,
        capacity,
        ...screeningStatsColumns,
      })
      .from(screenings)
      .innerJoin(events, eq(events.id, screenings.eventId))
      .where(gt(screenings.startsAt, sql`now() - interval '3 hours'`))
      .orderBy(screenings.startsAt)
      .limit(8),
    listBookings({ limit: 8 }),
    db
      .select({
        revenue30: sql<number>`coalesce(sum(${bookings.amount}) filter (where ${bookings.status} = 'paid' and ${bookings.paidAt} > now() - interval '30 days'), 0)::int`.mapWith(Number),
        tickets30: sql<number>`coalesce(sum(jsonb_array_length(${bookings.seats})) filter (where ${bookings.status} = 'paid' and ${bookings.paidAt} > now() - interval '30 days'), 0)::int`.mapWith(Number),
        pending: sql<number>`count(*) filter (where ${bookings.status} = 'pending' and ${bookings.expiresAt} > now())::int`.mapWith(Number),
        conflicts: sql<number>`count(*) filter (where ${bookings.status} = 'conflict')::int`.mapWith(Number),
      })
      .from(bookings),
  ]);

  return { upcoming, recent, totals: totals[0] };
}

export async function getScreeningBookings(screeningId: string) {
  await expireStaleHolds();
  return db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      status: bookings.status,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      amount: bookings.amount,
      seats: bookings.seats,
      checkedInAt: bookings.checkedInAt,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(and(eq(bookings.screeningId, screeningId), inArray(bookings.status, ["paid", "pending", "conflict"])))
    .orderBy(desc(bookings.createdAt));
}
