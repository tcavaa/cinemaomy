import "server-only";
import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export function listGalleryAdmin() {
  return db.query.galleryImages.findMany({
    orderBy: [asc(schema.galleryImages.sortOrder), asc(schema.galleryImages.createdAt)],
  });
}
