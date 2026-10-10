"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { moveSlide as moveSlideRow } from "@/features/admin/reorder";
import { requireAdmin } from "@/features/auth/session";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import { SLIDE_THEMES } from "@/lib/db/enums";
import {
  checkbox,
  fail,
  formToObject,
  imageUrl,
  invalid,
  ok,
  optionalLink,
  optionalText,
  requiredText,
  type FormState,
} from "@/lib/forms";

const { slides } = schema;

const slideSchema = z.object({
  id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  eyebrow: optionalText(120),
  title: requiredText("Title", 160),
  subtitle: optionalText(200),
  aside: optionalText(60),
  meta: optionalText(200),
  imageUrl: imageUrl(),
  imageAlt: optionalText(300),
  ctaLabel: optionalText(60),
  linkUrl: optionalLink(),
  theme: z.enum(SLIDE_THEMES),
  isPublished: checkbox(),
});

export async function saveSlide(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = slideSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...values } = parsed.data;

  if (id) {
    await db.update(slides).set(values).where(eq(slides.id, id));
    updateTag(tags.slides);
    return ok("Slide saved.");
  }

  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${slides.sortOrder}), 0)::int` }).from(slides);
  await db.insert(slides).values({ ...values, sortOrder: max + 1 });
  updateTag(tags.slides);
  redirect("/admin/slides");
}

const idSchema = z.uuid();

export async function deleteSlide(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown slide.");
  await db.delete(slides).where(eq(slides.id, id.data));
  updateTag(tags.slides);
  if (formData.get("redirect")) redirect("/admin/slides");
  return ok();
}

export async function toggleSlide(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown slide.");
  await db.update(slides).set({ isPublished: sql`not ${slides.isPublished}` }).where(eq(slides.id, id.data));
  updateTag(tags.slides);
  return ok();
}

export async function moveSlide(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown slide.");
  await moveSlideRow(id.data, formData.get("direction") === "up" ? "up" : "down");
  updateTag(tags.slides);
  return ok();
}
