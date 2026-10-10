import "server-only";
import { and, asc, desc, eq, gt, lt, sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import type { EventDetail, ScreeningListing } from "./types";

const { events, screenings } = schema;

// Seats held by paid bookings or by holds that have not expired yet.
const seatsTaken = sql<number>`(
  select count(*)::int from booking_seats bs
  join bookings b on b.id = bs.booking_id
  where bs.screening_id = "screenings"."id"
    and (b.status = 'paid' or (b.status = 'pending' and b.expires_at > now()))
)`.mapWith(Number);

const seatsTotal = sql<number>`(select count(*)::int from seats where is_active)`.mapWith(Number);

const listingColumns = {
  id: screenings.id,
  startsAt: screenings.startsAt,
  note: screenings.note,
  status: screenings.status,
  salesOpen: screenings.salesOpen,
  prices: screenings.prices,
  seatsTaken,
  seatsTotal,
  hasStarted: sql<boolean>`"screenings"."starts_at" <= now()`,
  event: {
    id: events.id,
    slug: events.slug,
    kind: events.kind,
    title: events.title,
    originalTitle: events.originalTitle,
    tagline: events.tagline,
    director: events.director,
    year: events.year,
    country: events.country,
    runtimeMinutes: events.runtimeMinutes,
    language: events.language,
    imageUrl: events.imageUrl,
    posterUrl: events.posterUrl,
  },
};

function listScreenings(where: SQL | undefined, order: "asc" | "desc" = "asc") {
  return db
    .select(listingColumns)
    .from(screenings)
    .innerJoin(events, eq(events.id, screenings.eventId))
    .where(and(eq(events.isPublished, true), where))
    .orderBy(order === "asc" ? asc(screenings.startsAt) : desc(screenings.startsAt));
}

/** Screenings that have not started yet, optionally limited to the next `days` days. */
export async function getUpcomingScreenings(days?: number): Promise<ScreeningListing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(tags.program);

  return listScreenings(
    and(
      gt(screenings.startsAt, sql`now()`),
      days ? lt(screenings.startsAt, sql`now() + make_interval(days => ${days})`) : undefined,
    ),
  );
}

export async function getRecentScreenings(days = 45): Promise<ScreeningListing[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.program);

  return listScreenings(
    and(
      lt(screenings.startsAt, sql`now()`),
      gt(screenings.startsAt, sql`now() - make_interval(days => ${days})`),
    ),
    "desc",
  );
}

export async function getNextScreening(): Promise<ScreeningListing | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(tags.program);

  const [next] = await listScreenings(
    and(gt(screenings.startsAt, sql`now()`), eq(screenings.status, "scheduled")),
  ).limit(1);
  return next ?? null;
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(tags.program, tags.event(slug));

  const event = await db.query.events.findFirst({
    where: and(eq(events.slug, slug), eq(events.isPublished, true)),
  });
  if (!event) return null;

  const rows = await db
    .select({ ...listingColumns, isUpcoming: sql<boolean>`${screenings.startsAt} > now()` })
    .from(screenings)
    .innerJoin(events, eq(events.id, screenings.eventId))
    .where(eq(screenings.eventId, event.id))
    .orderBy(asc(screenings.startsAt));

  return {
    ...event,
    upcoming: rows.filter((r) => r.isUpcoming),
    past: rows.filter((r) => !r.isUpcoming).reverse(),
  };
}

export async function getScreeningForBooking(id: string): Promise<ScreeningListing | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(tags.program);

  if (!z.uuid().safeParse(id).success) return null;
  const [row] = await listScreenings(eq(screenings.id, id)).limit(1);
  return row ?? null;
}

export async function getPublishedEventSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.program);

  return db
    .select({ slug: events.slug, updatedAt: events.updatedAt })
    .from(events)
    .where(eq(events.isPublished, true));
}
