import "server-only";
import { randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getSiteSettings } from "@/features/content/queries";
import { createCheckoutToken, getOrderStatus } from "@/features/payments/flitt/client";
import type { FlittOrder } from "@/features/payments/flitt/types";
import { tags } from "@/lib/cache-tags";
import { db, schema, type Tx } from "@/lib/db";
import type { BookedSeat, Booking, EventKind } from "@/lib/db/schema";
import { requestOrigin } from "@/lib/env";
import { formatCompactDateTime } from "@/lib/format";
import { MAX_SEATS_PER_BOOKING, seatLabel } from "./seat-kinds";

const { bookings, bookingSeats, events, paymentEvents, screenings, seats } = schema;

export type BookingErrorCode =
  | "not_found"
  | "sales_closed"
  | "invalid_seats"
  | "seats_taken"
  | "too_many_holds"
  | "payment_unavailable";

export class BookingError extends Error {
  constructor(
    message: string,
    readonly code: BookingErrorCode,
    readonly seatIds: number[] = [],
  ) {
    super(message);
    this.name = "BookingError";
  }
}

// Flitt orders expire this long before our seat hold does, so a payment can
// never be approved for seats we have already released.
const PAYMENT_SAFETY_MARGIN_SECONDS = 120;
const MAX_PENDING_HOLDS_PER_EMAIL = 2;
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeReference() {
  let code = "";
  for (let i = 0; i < 6; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `OMY-${code}`;
}

const makeAccessToken = () => randomBytes(24).toString("base64url");

export function tokenMatches(booking: Pick<Booking, "accessToken">, token: string | null | undefined) {
  if (!token) return false;
  const a = Buffer.from(booking.accessToken);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

const isLocalOrigin = (origin: string) => /\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(origin);

// ─── Holds ──────────────────────────────────────────────────────────────────

async function releaseSeats(tx: Tx, bookingId: string) {
  await tx.delete(bookingSeats).where(eq(bookingSeats.bookingId, bookingId));
}

/** Marks timed-out holds for a screening as expired and frees their seats. */
async function releaseExpiredHolds(tx: Tx, screeningId: string) {
  const expired = await tx
    .update(bookings)
    .set({ status: "expired" })
    .where(
      and(
        eq(bookings.screeningId, screeningId),
        eq(bookings.status, "pending"),
        lte(bookings.expiresAt, sql`now()`),
      ),
    )
    .returning({ id: bookings.id });
  if (expired.length) {
    await tx.delete(bookingSeats).where(inArray(bookingSeats.bookingId, expired.map((b) => b.id)));
  }
}

/** Marks every timed-out hold as expired (seat availability already ignores them). */
export async function expireStaleHolds() {
  await db.transaction(async (tx) => {
    const expired = await tx
      .update(bookings)
      .set({ status: "expired" })
      .where(and(eq(bookings.status, "pending"), lte(bookings.expiresAt, sql`now() - interval '2 minutes'`)))
      .returning({ id: bookings.id });
    if (expired.length) {
      await tx.delete(bookingSeats).where(inArray(bookingSeats.bookingId, expired.map((b) => b.id)));
    }
  });
}

export type ReserveInput = {
  screeningId: string;
  seatIds: number[];
  name: string;
  email: string;
  phone?: string | null;
  userId?: string | null;
};

export type Reservation = {
  booking: Booking;
  paymentToken: string;
};

/**
 * Holds the requested seats and opens a Flitt order for them. Bookings for the
 * same screening are serialised with a row lock; the booking_seats primary key
 * is the final guard against double-selling.
 */
export async function reserveSeats(input: ReserveInput): Promise<Reservation> {
  const seatIds = [...new Set(input.seatIds)];
  if (!seatIds.length) throw new BookingError("Choose at least one seat.", "invalid_seats");
  if (seatIds.length > MAX_SEATS_PER_BOOKING) {
    throw new BookingError(`You can book up to ${MAX_SEATS_PER_BOOKING} seats at once.`, "invalid_seats");
  }

  const { holdMinutes } = await getSiteSettings();
  const email = input.email.trim().toLowerCase();

  const { booking, title, startsAt } = await db.transaction(async (tx) => {
    const [screening] = await tx
      .select({
        id: screenings.id,
        startsAt: screenings.startsAt,
        status: screenings.status,
        salesOpen: screenings.salesOpen,
        prices: screenings.prices,
        title: events.title,
        isPublished: events.isPublished,
      })
      .from(screenings)
      .innerJoin(events, eq(events.id, screenings.eventId))
      .where(eq(screenings.id, input.screeningId))
      .for("update", { of: screenings });

    if (!screening || !screening.isPublished) {
      throw new BookingError("This screening does not exist.", "not_found");
    }
    if (screening.status !== "scheduled" || !screening.salesOpen || screening.startsAt.getTime() <= Date.now()) {
      throw new BookingError("Ticket sales for this screening are closed.", "sales_closed");
    }

    await releaseExpiredHolds(tx, screening.id);

    const [{ holds }] = await tx
      .select({ holds: sql<number>`count(*)::int` })
      .from(bookings)
      .where(
        and(
          eq(bookings.screeningId, screening.id),
          eq(bookings.status, "pending"),
          eq(sql`lower(${bookings.customerEmail})`, email),
        ),
      );
    if (holds >= MAX_PENDING_HOLDS_PER_EMAIL) {
      throw new BookingError(
        "You already have seats on hold for this screening. Finish that payment or wait a few minutes.",
        "too_many_holds",
      );
    }

    const seatRows = await tx.select().from(seats).where(inArray(seats.id, seatIds));
    if (seatRows.length !== seatIds.length || seatRows.some((s) => !s.isActive)) {
      throw new BookingError("Some of the selected seats are not available.", "invalid_seats");
    }

    const taken = await tx
      .select({ seatId: bookingSeats.seatId })
      .from(bookingSeats)
      .where(and(eq(bookingSeats.screeningId, screening.id), inArray(bookingSeats.seatId, seatIds)));
    if (taken.length) {
      throw new BookingError(
        "Someone has just taken one of your seats.",
        "seats_taken",
        taken.map((t) => t.seatId),
      );
    }

    const booked: BookedSeat[] = seatRows
      .sort((a, b) => a.rowLabel.localeCompare(b.rowLabel) || a.number - b.number)
      .map((s) => ({
        seatId: s.id,
        label: seatLabel(s.rowLabel, s.number),
        kind: s.kind,
        price: screening.prices[s.kind],
      }));
    const amount = booked.reduce((sum, s) => sum + s.price, 0);
    if (!(amount > 0)) throw new BookingError("These seats have no price set yet.", "sales_closed");

    const id = randomUUID();
    const [row] = await tx
      .insert(bookings)
      .values({
        id,
        reference: makeReference(),
        screeningId: screening.id,
        status: "pending",
        customerName: input.name.trim(),
        customerEmail: email,
        customerPhone: input.phone?.trim() || null,
        amount,
        currency: "GEL",
        seats: booked,
        accessToken: makeAccessToken(),
        expiresAt: sql`now() + make_interval(mins => ${holdMinutes})`,
        paymentOrderId: `omy-${id}`,
        userId: input.userId ?? null,
      })
      .returning();

    await tx.insert(bookingSeats).values(
      booked.map((s) => ({ screeningId: screening.id, seatId: s.seatId, bookingId: id, price: s.price })),
    );

    return { booking: row, title: screening.title, startsAt: screening.startsAt };
  });

  revalidateTag(tags.program, "max");

  try {
    const origin = await requestOrigin();
    const paymentToken = await createCheckoutToken({
      orderId: booking.paymentOrderId!,
      amount: booking.amount,
      currency: booking.currency,
      description: `Cinema O'my — ${title}, ${formatCompactDateTime(startsAt)} — seats ${booking.seats
        .map((s) => s.label)
        .join(", ")}`,
      email: booking.customerEmail,
      lifetimeSeconds: Math.max(holdMinutes * 60 - PAYMENT_SAFETY_MARGIN_SECONDS, 180),
      responseUrl: `${origin}/api/payments/flitt/return`,
      // Flitt cannot reach a local machine; status checks cover that case.
      serverCallbackUrl: isLocalOrigin(origin) ? undefined : `${origin}/api/payments/flitt/callback`,
      lang: "en",
    });
    return { booking, paymentToken };
  } catch (error) {
    console.error("[booking] could not open Flitt order", error);
    await db.transaction(async (tx) => {
      await releaseSeats(tx, booking.id);
      await tx.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, booking.id));
    });
    revalidateTag(tags.program, "max");
    throw new BookingError("Online payment is unavailable right now. Please try again shortly.", "payment_unavailable");
  }
}

// ─── Payment results ────────────────────────────────────────────────────────

type PaymentSource = "callback" | "return" | "status";

function sanitizePayload(order: FlittOrder): Record<string, unknown> {
  // Test-mode hint that partially reveals how the signature was built.
  const rest: Record<string, unknown> = { ...order };
  delete rest.response_signature_string;
  return rest;
}

/** Re-inserts the seats of a booking whose hold was lost. Returns false if any seat is gone. */
async function reclaimSeats(tx: Tx, booking: Booking) {
  const inserted = await tx
    .insert(bookingSeats)
    .values(
      booking.seats.map((s) => ({
        screeningId: booking.screeningId,
        seatId: s.seatId,
        bookingId: booking.id,
        price: s.price,
      })),
    )
    .onConflictDoNothing()
    .returning({ seatId: bookingSeats.seatId });
  if (inserted.length === booking.seats.length) return true;
  await releaseSeats(tx, booking.id);
  return false;
}

/**
 * Applies a Flitt order result (from the server callback, the browser return
 * or a status check) to the booking. Idempotent.
 */
export async function applyPaymentResult(
  order: FlittOrder,
  source: PaymentSource,
  signatureValid: boolean,
): Promise<Booking | null> {
  const orderId = String(order.order_id ?? "");
  const existing = orderId
    ? await db.query.bookings.findFirst({ where: eq(bookings.paymentOrderId, orderId) })
    : undefined;

  await db.insert(paymentEvents).values({
    bookingId: existing?.id ?? null,
    source,
    orderStatus: order.order_status ?? null,
    signatureValid,
    payload: sanitizePayload(order),
  });

  if (!existing || !signatureValid) return existing ?? null;

  const updated = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(bookings).where(eq(bookings.id, existing.id)).for("update");
    const paymentId = order.payment_id != null ? String(order.payment_id) : current.paymentId;
    const update = async (values: Partial<typeof bookings.$inferInsert>) => {
      const [row] = await tx
        .update(bookings)
        .set({ paymentId, paymentStatus: order.order_status, ...values })
        .where(eq(bookings.id, current.id))
        .returning();
      return row;
    };

    switch (order.order_status) {
      case "approved": {
        if (current.status === "paid") return current;
        const amountMatches =
          Number(order.amount) === current.amount && (!order.currency || order.currency === current.currency);
        if (!amountMatches) return update({ status: "conflict" });
        if (current.status === "pending") return update({ status: "paid", paidAt: new Date() });
        // The hold was lost before the money arrived — try to take the seats back.
        const reclaimed = await reclaimSeats(tx, current);
        return update({ status: reclaimed ? "paid" : "conflict", paidAt: new Date() });
      }
      case "expired": {
        if (current.status !== "pending") return update({});
        await releaseSeats(tx, current.id);
        return update({ status: "expired" });
      }
      case "reversed": {
        if (current.status === "refunded") return current;
        await releaseSeats(tx, current.id);
        return update({ status: "refunded" });
      }
      default:
        // created / processing / declined: the customer may still retry within the hold.
        return update({});
    }
  });

  if (updated.status !== existing.status) revalidateTag(tags.program, "max");
  return updated;
}

/** Asks Flitt for the authoritative status of a pending booking and applies it. */
export async function syncPaymentStatus(booking: Booking): Promise<Booking> {
  if (booking.status !== "pending" || !booking.paymentOrderId) return booking;
  try {
    const order = await getOrderStatus(booking.paymentOrderId);
    return (await applyPaymentResult(order, "status", true)) ?? booking;
  } catch (error) {
    console.warn("[booking] status check failed", error);
    return booking;
  }
}

/** Customer gave up on paying: free the seats (unless the payment already went through). */
export async function releaseHold(booking: Booking): Promise<Booking> {
  const synced = await syncPaymentStatus(booking);
  if (synced.status !== "pending") return synced;

  const updated = await db.transaction(async (tx) => {
    await releaseSeats(tx, synced.id);
    const [row] = await tx
      .update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.id, synced.id), eq(bookings.status, "pending")))
      .returning();
    return row ?? synced;
  });
  revalidateTag(tags.program, "max");
  return updated;
}

// ─── Reads ──────────────────────────────────────────────────────────────────

export async function findBooking(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return (await db.query.bookings.findFirst({ where: eq(bookings.id, id) })) ?? null;
}

const ticketColumns = {
  booking: bookings,
  upcoming: sql<boolean>`${screenings.startsAt} >= now()`,
  screening: {
    id: screenings.id,
    startsAt: screenings.startsAt,
    note: screenings.note,
    status: screenings.status,
  },
  event: {
    slug: events.slug,
    title: events.title,
    kind: events.kind,
    director: events.director,
    year: events.year,
    runtimeMinutes: events.runtimeMinutes,
    imageUrl: events.imageUrl,
    posterUrl: events.posterUrl,
  },
};

export type TicketView = {
  booking: Booking;
  upcoming: boolean;
  screening: { id: string; startsAt: Date; note: string | null; status: "scheduled" | "cancelled" };
  event: {
    slug: string;
    title: string;
    kind: EventKind;
    director: string | null;
    year: number | null;
    runtimeMinutes: number | null;
    imageUrl: string | null;
    posterUrl: string | null;
  };
};

export async function getTicket(bookingId: string): Promise<TicketView | null> {
  if (!/^[0-9a-f-]{36}$/i.test(bookingId)) return null;
  const [row] = await db
    .select(ticketColumns)
    .from(bookings)
    .innerJoin(screenings, eq(screenings.id, bookings.screeningId))
    .innerJoin(events, eq(events.id, screenings.eventId))
    .where(eq(bookings.id, bookingId))
    .limit(1);
  return row ?? null;
}

export async function listUserTickets(userId: string): Promise<TicketView[]> {
  return db
    .select(ticketColumns)
    .from(bookings)
    .innerJoin(screenings, eq(screenings.id, bookings.screeningId))
    .innerJoin(events, eq(events.id, screenings.eventId))
    .where(
      and(eq(bookings.userId, userId), inArray(bookings.status, ["paid", "pending", "conflict", "refunded"])),
    )
    .orderBy(desc(screenings.startsAt));
}

/** Attach a guest booking to the signed-in account (proof of ownership: the ticket token). */
export async function claimBooking(booking: Booking, userId: string) {
  if (booking.userId) return booking.userId === userId;
  const [row] = await db
    .update(bookings)
    .set({ userId })
    .where(and(eq(bookings.id, booking.id), sql`${bookings.userId} is null`))
    .returning({ id: bookings.id });
  return Boolean(row);
}

// ─── Admin ──────────────────────────────────────────────────────────────────

/** Cancels a booking and frees its seats. Paid bookings must be refunded in the Flitt portal. */
export async function cancelBookingAsAdmin(bookingId: string) {
  const updated = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(bookings).where(eq(bookings.id, bookingId)).for("update");
    if (!current || current.status === "cancelled") return current ?? null;
    await releaseSeats(tx, current.id);
    const [row] = await tx.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, current.id)).returning();
    return { ...row, wasPaid: current.status === "paid" };
  });
  revalidateTag(tags.program, "max");
  return updated;
}

export async function setCheckedIn(bookingId: string, checkedIn: boolean) {
  const [row] = await db
    .update(bookings)
    .set({ checkedInAt: checkedIn ? new Date() : null })
    .where(and(eq(bookings.id, bookingId), eq(bookings.status, "paid")))
    .returning({ id: bookings.id });
  return Boolean(row);
}
