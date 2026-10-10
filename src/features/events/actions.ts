"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import { EVENT_KINDS, SCREENING_STATUSES } from "@/lib/db/enums";
import { fromLocalInputs } from "@/lib/format";
import {
  checkbox,
  fail,
  formToObject,
  invalid,
  lariToTetri,
  ok,
  optionalImageUrl,
  optionalInt,
  optionalLink,
  optionalText,
  requiredText,
  type FormState,
} from "@/lib/forms";
import { slugify } from "@/lib/utils";

const { events, screenings, bookings } = schema;

const eventSchema = z.object({
  id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  title: requiredText("Title", 200),
  slug: z
    .string()
    .trim()
    .max(80)
    .transform((v) => slugify(v))
    .optional(),
  kind: z.enum(EVENT_KINDS),
  originalTitle: optionalText(200),
  tagline: optionalText(200),
  director: optionalText(200),
  year: optionalInt(1880, 2100),
  country: optionalText(200),
  runtimeMinutes: optionalInt(1, 1000),
  language: optionalText(200),
  subtitles: optionalText(200),
  synopsis: optionalText(5000),
  imageUrl: optionalImageUrl(),
  posterUrl: optionalImageUrl(),
  trailerUrl: optionalLink(),
  isPublished: checkbox(),
});

function invalidateEvent(...slugs: (string | undefined)[]) {
  updateTag(tags.program);
  for (const slug of slugs) if (slug) updateTag(tags.event(slug));
}

export async function saveEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = eventSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { id, slug: rawSlug, ...values } = parsed.data;
  const slug = rawSlug || slugify(values.title);
  if (!slug) return fail("Please check the highlighted fields.", { slug: ["Add a URL name using letters or numbers"] });

  const clash = await db.query.events.findFirst({
    where: id ? and(eq(events.slug, slug), ne(events.id, id)) : eq(events.slug, slug),
    columns: { id: true },
  });
  if (clash) return fail("Please check the highlighted fields.", { slug: ["Another event already uses this URL"] });

  if (id) {
    const before = await db.query.events.findFirst({ where: eq(events.id, id), columns: { slug: true } });
    if (!before) return fail("This event no longer exists.");
    await db.update(events).set({ ...values, slug }).where(eq(events.id, id));
    invalidateEvent(before.slug, slug);
    return ok("Saved.");
  }

  const [created] = await db.insert(events).values({ ...values, slug }).returning({ id: events.id });
  invalidateEvent(slug);
  redirect(`/admin/events/${created.id}?created=1`);
}

export async function deleteEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown event.");

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .innerJoin(screenings, eq(screenings.id, bookings.screeningId))
    .where(eq(screenings.eventId, id.data));
  if (count > 0) return fail("This event has bookings, so it can't be deleted. Unpublish it instead.");

  const [deleted] = await db.delete(events).where(eq(events.id, id.data)).returning({ slug: events.slug });
  invalidateEvent(deleted?.slug);
  redirect("/admin/events");
}

export async function toggleEventPublished(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown event.");
  const [row] = await db
    .update(events)
    .set({ isPublished: sql`not ${events.isPublished}` })
    .where(eq(events.id, id.data))
    .returning({ slug: events.slug });
  invalidateEvent(row?.slug);
  return ok();
}

// ─── Screenings ─────────────────────────────────────────────────────────────

const screeningSchema = z.object({
  id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  eventId: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  note: optionalText(300),
  priceArmchair: lariToTetri("Armchair price"),
  priceLounge: lariToTetri("Lounge price"),
  priceSaucer: lariToTetri("Saucer price"),
  status: z.enum(SCREENING_STATUSES).default("scheduled"),
  salesOpen: checkbox(),
});

async function eventSlug(eventId: string) {
  const row = await db.query.events.findFirst({ where: eq(events.id, eventId), columns: { slug: true } });
  return row?.slug;
}

export async function saveScreening(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = screeningSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;

  let startsAt: Date;
  try {
    startsAt = fromLocalInputs(d.date, d.time);
  } catch {
    return fail("Please check the highlighted fields.", { date: ["Invalid date"] });
  }

  const values = {
    eventId: d.eventId,
    startsAt,
    note: d.note,
    prices: { armchair: d.priceArmchair, lounge: d.priceLounge, saucer: d.priceSaucer },
    status: d.status,
    salesOpen: d.salesOpen,
  };

  if (d.id) await db.update(screenings).set(values).where(eq(screenings.id, d.id));
  else await db.insert(screenings).values(values);

  invalidateEvent(await eventSlug(d.eventId));
  return ok(d.id ? "Screening updated." : "Screening added.");
}

export async function deleteScreening(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown screening.");

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(eq(bookings.screeningId, id.data));
  if (count > 0) return fail("This screening has bookings. Cancel it instead of deleting.");

  const [row] = await db.delete(screenings).where(eq(screenings.id, id.data)).returning({ eventId: screenings.eventId });
  if (row) invalidateEvent(await eventSlug(row.eventId));
  return ok("Screening deleted.");
}
