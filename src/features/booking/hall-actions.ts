"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import { SEAT_KINDS } from "@/lib/db/enums";
import { checkbox, fail, formToObject, invalid, ok, type FormState } from "@/lib/forms";

const { seats, bookingSeats } = schema;

const seatSchema = z.object({
  id: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  rowLabel: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{1,2}$/, "Use a letter, e.g. A"),
  number: z.coerce.number().int().min(1).max(99),
  kind: z.enum(SEAT_KINDS),
  x: z.coerce.number().min(0).max(1000),
  y: z.coerce.number().min(0).max(900),
  rotation: z.coerce.number().min(-180).max(180).default(0),
  isActive: checkbox(),
});

function invalidateHall() {
  updateTag(tags.hall);
  updateTag(tags.program);
}

export async function saveSeat(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = seatSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...values } = parsed.data;

  const clash = await db.query.seats.findFirst({
    where: and(eq(seats.rowLabel, values.rowLabel), eq(seats.number, values.number), id ? ne(seats.id, id) : undefined),
    columns: { id: true },
  });
  if (clash) return fail(`Seat ${values.rowLabel}${values.number} already exists.`, { number: ["Already taken"] });

  if (id) await db.update(seats).set(values).where(eq(seats.id, id));
  else await db.insert(seats).values(values);
  invalidateHall();
  return ok(id ? "Saved." : `Seat ${values.rowLabel}${values.number} added.`);
}

export async function deleteSeat(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.coerce.number().int().positive().safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown seat.");

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingSeats)
    .where(eq(bookingSeats.seatId, id.data));
  if (count > 0) return fail("This seat has bookings — switch it off instead of deleting it.");

  await db.delete(seats).where(eq(seats.id, id.data));
  invalidateHall();
  return ok();
}
