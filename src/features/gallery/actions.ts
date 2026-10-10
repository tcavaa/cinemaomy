"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { moveGalleryImage as moveRow } from "@/features/admin/reorder";
import { requireAdmin } from "@/features/auth/session";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import { fail, formToObject, imageUrl, invalid, ok, optionalText, type FormState } from "@/lib/forms";

const { galleryImages } = schema;

const newImagesSchema = z
  .array(
    z.object({
      url: imageUrl(),
      width: z.number().int().positive().max(20000),
      height: z.number().int().positive().max(20000),
      alt: z.string().max(300).optional(),
    }),
  )
  .min(1)
  .max(50);

/** Called directly from the uploader once files are in Storage. */
export async function addGalleryImages(items: z.input<typeof newImagesSchema>): Promise<FormState> {
  await requireAdmin();
  const parsed = newImagesSchema.safeParse(items);
  if (!parsed.success) return fail("Those uploads could not be saved.");

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${galleryImages.sortOrder}), 0)::int` })
    .from(galleryImages);
  await db.insert(galleryImages).values(
    parsed.data.map((item, i) => ({
      imageUrl: item.url,
      width: item.width,
      height: item.height,
      alt: item.alt || null,
      sortOrder: max + i + 1,
    })),
  );
  updateTag(tags.gallery);
  return ok(`${parsed.data.length} ${parsed.data.length === 1 ? "photo" : "photos"} added.`);
}

const updateSchema = z.object({
  id: z.uuid(),
  alt: optionalText(300),
  caption: optionalText(200),
});

export async function updateGalleryImage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...values } = parsed.data;
  await db.update(galleryImages).set(values).where(eq(galleryImages.id, id));
  updateTag(tags.gallery);
  return ok("Saved.");
}

const idSchema = z.uuid();

export async function toggleGalleryImage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown photo.");
  await db
    .update(galleryImages)
    .set({ isPublished: sql`not ${galleryImages.isPublished}` })
    .where(eq(galleryImages.id, id.data));
  updateTag(tags.gallery);
  return ok();
}

export async function moveGalleryImage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown photo.");
  await moveRow(id.data, formData.get("direction") === "up" ? "up" : "down");
  updateTag(tags.gallery);
  return ok();
}

export async function deleteGalleryImage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown photo.");
  await db.delete(galleryImages).where(eq(galleryImages.id, id.data));
  updateTag(tags.gallery);
  return ok();
}
