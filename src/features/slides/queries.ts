import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";

export async function getPublishedSlides() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.slides);

  return db.query.slides.findMany({
    where: eq(schema.slides.isPublished, true),
    orderBy: [asc(schema.slides.sortOrder), asc(schema.slides.createdAt)],
  });
}
