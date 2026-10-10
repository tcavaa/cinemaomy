import "server-only";
import { and, asc, eq, inArray, or, sql, gt } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import type { HallSeat } from "./types";

export type { HallSeat } from "./types";

/** The hall layout. Rarely changes; invalidated from the admin hall editor. */
export async function getHallSeats(): Promise<HallSeat[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.hall);

  const rows = await db.query.seats.findMany({
    orderBy: [asc(schema.seats.rowLabel), asc(schema.seats.number)],
  });
  return rows.map((s) => ({
    id: s.id,
    row: s.rowLabel,
    number: s.number,
    kind: s.kind,
    x: s.x,
    y: s.y,
    rotation: s.rotation,
    isActive: s.isActive,
  }));
}

/** Live (uncached) list of seat ids that are sold or currently held for a screening. */
export async function getTakenSeatIds(screeningId: string): Promise<number[]> {
  const rows = await db
    .select({ seatId: schema.bookingSeats.seatId })
    .from(schema.bookingSeats)
    .innerJoin(schema.bookings, eq(schema.bookings.id, schema.bookingSeats.bookingId))
    .where(
      and(
        eq(schema.bookingSeats.screeningId, screeningId),
        or(
          eq(schema.bookings.status, "paid"),
          and(eq(schema.bookings.status, "pending"), gt(schema.bookings.expiresAt, sql`now()`)),
        ),
      ),
    );
  return rows.map((r) => r.seatId);
}

export async function getSeatsByIds(ids: number[]) {
  if (!ids.length) return [];
  return db.select().from(schema.seats).where(inArray(schema.seats.id, ids));
}
