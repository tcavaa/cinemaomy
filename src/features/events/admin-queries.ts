import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { screeningStatsColumns } from "@/features/booking/admin-queries";
import { db, schema } from "@/lib/db";

const { events, screenings } = schema;

export async function listEventsAdmin() {
  const rows = await db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      kind: events.kind,
      director: events.director,
      year: events.year,
      isPublished: events.isPublished,
      imageUrl: events.imageUrl,
      posterUrl: events.posterUrl,
      createdAt: events.createdAt,
      nextScreening: sql<Date | null>`(select min(s.starts_at) from screenings s where s.event_id = "events"."id" and s.starts_at > now())`.mapWith(
        (v) => (v ? new Date(v) : null),
      ),
      lastScreening: sql<Date | null>`(select max(s.starts_at) from screenings s where s.event_id = "events"."id")`.mapWith(
        (v) => (v ? new Date(v) : null),
      ),
      screeningCount: sql<number>`(select count(*)::int from screenings s where s.event_id = "events"."id")`.mapWith(Number),
    })
    .from(events)
    .orderBy(desc(events.createdAt));

  // Upcoming first (soonest on top), then the rest by most recent screening.
  return rows.sort((a, b) => {
    if (a.nextScreening && b.nextScreening) return a.nextScreening.getTime() - b.nextScreening.getTime();
    if (a.nextScreening) return -1;
    if (b.nextScreening) return 1;
    return (b.lastScreening?.getTime() ?? 0) - (a.lastScreening?.getTime() ?? 0);
  });
}

export async function getEventAdmin(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const event = await db.query.events.findFirst({ where: eq(events.id, id) });
  if (!event) return null;

  const rows = await db
    .select({
      id: screenings.id,
      startsAt: screenings.startsAt,
      note: screenings.note,
      prices: screenings.prices,
      status: screenings.status,
      salesOpen: screenings.salesOpen,
      ...screeningStatsColumns,
      isPast: sql<boolean>`${screenings.startsAt} < now()`,
    })
    .from(screenings)
    .where(eq(screenings.eventId, id))
    .orderBy(asc(screenings.startsAt));

  return { event, screenings: rows };
}

export async function getScreeningAdmin(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const [row] = await db
    .select({
      id: screenings.id,
      startsAt: screenings.startsAt,
      note: screenings.note,
      prices: screenings.prices,
      status: screenings.status,
      salesOpen: screenings.salesOpen,
      eventId: events.id,
      eventTitle: events.title,
      eventSlug: events.slug,
      ...screeningStatsColumns,
    })
    .from(screenings)
    .innerJoin(events, eq(events.id, screenings.eventId))
    .where(eq(screenings.id, id))
    .limit(1);
  return row ?? null;
}
