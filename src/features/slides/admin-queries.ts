import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";

export function listSlidesAdmin() {
  return db.query.slides.findMany({ orderBy: [asc(schema.slides.sortOrder), asc(schema.slides.createdAt)] });
}

export async function getSlideAdmin(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  return (await db.query.slides.findFirst({ where: eq(schema.slides.id, id) })) ?? null;
}

/** Suggestions for the slide button link. */
export async function eventLinkOptions() {
  const rows = await db
    .select({ slug: schema.events.slug, title: schema.events.title })
    .from(schema.events)
    .orderBy(desc(schema.events.createdAt));
  return [
    { href: "/program", label: "Program" },
    { href: "/about", label: "About" },
    ...rows.map((r) => ({ href: `/program/${r.slug}`, label: r.title })),
  ];
}
