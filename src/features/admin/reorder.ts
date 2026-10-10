import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

type Direction = "up" | "down";

/** Swaps an item with its neighbour and renumbers the list 1…n. */
function reorder<T extends { id: string }>(rows: T[], id: string, direction: Direction) {
  const i = rows.findIndex((r) => r.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return null;
  const next = [...rows];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export async function moveSlide(id: string, direction: Direction) {
  const { slides } = schema;
  const rows = await db.select({ id: slides.id }).from(slides).orderBy(asc(slides.sortOrder), asc(slides.createdAt));
  const next = reorder(rows, id, direction);
  if (!next) return;
  await db.transaction(async (tx) => {
    for (const [index, row] of next.entries()) {
      await tx.update(slides).set({ sortOrder: index + 1 }).where(eq(slides.id, row.id));
    }
  });
}

export async function moveGalleryImage(id: string, direction: Direction) {
  const { galleryImages } = schema;
  const rows = await db
    .select({ id: galleryImages.id })
    .from(galleryImages)
    .orderBy(asc(galleryImages.sortOrder), asc(galleryImages.createdAt));
  const next = reorder(rows, id, direction);
  if (!next) return;
  await db.transaction(async (tx) => {
    for (const [index, row] of next.entries()) {
      await tx.update(galleryImages).set({ sortOrder: index + 1 }).where(eq(galleryImages.id, row.id));
    }
  });
}
