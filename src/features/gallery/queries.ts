import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";

export async function getPublishedGallery() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.gallery);

  return db.query.galleryImages.findMany({
    where: eq(schema.galleryImages.isPublished, true),
    orderBy: [asc(schema.galleryImages.sortOrder), asc(schema.galleryImages.createdAt)],
  });
}
