"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import {
  formToObject,
  invalid,
  lariToTetri,
  ok,
  optionalImageUrl,
  optionalLink,
  optionalText,
  requiredText,
  type FormState,
} from "@/lib/forms";

const PAGE_SLUGS = ["about", "contact"] as const;

const pageSchema = z.object({
  slug: z.enum(PAGE_SLUGS),
  eyebrow: optionalText(120),
  title: requiredText("Title", 200),
  lead: optionalText(1000),
  body: optionalText(20000),
  imageUrl: optionalImageUrl(),
  imageAlt: optionalText(300),
  seoDescription: optionalText(300),
  factValue: z.union([z.string(), z.array(z.string())]).optional(),
  factLabel: z.union([z.string(), z.array(z.string())]).optional(),
});

const asArray = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export async function savePage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = pageSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { slug, factValue, factLabel, ...values } = parsed.data;

  const labels = asArray(factLabel);
  const facts = asArray(factValue)
    .map((value, i) => ({ value: value.trim(), label: (labels[i] ?? "").trim() }))
    .filter((f) => f.value && f.label)
    .slice(0, 6);

  await db
    .insert(schema.pages)
    .values({ slug, ...values, facts })
    .onConflictDoUpdate({ target: schema.pages.slug, set: { ...values, facts, updatedAt: new Date() } });

  updateTag(tags.page(slug));
  return ok("Saved — the page is updated.");
}

const settingsSchema = z.object({
  name: requiredText("Name", 120),
  tagline: optionalText(300),
  address: optionalText(200),
  district: optionalText(120),
  city: optionalText(120),
  phone: optionalText(60),
  email: z.preprocess((v) => (v === "" ? null : v), z.email("Enter a valid email").nullable()),
  instagramUrl: optionalLink(),
  facebookUrl: optionalLink(),
  mapQuery: optionalText(300),
  openingHours: optionalText(1000),
  bookingNote: optionalText(1000),
  priceArmchair: lariToTetri("Armchair price"),
  priceLounge: lariToTetri("Lounge price"),
  priceSaucer: lariToTetri("Saucer price"),
  holdMinutes: z.coerce.number().int().min(5, "At least 5 minutes").max(30, "At most 30 minutes"),
});

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { priceArmchair, priceLounge, priceSaucer, ...values } = parsed.data;
  const row = {
    ...values,
    defaultPrices: { armchair: priceArmchair, lounge: priceLounge, saucer: priceSaucer },
  };

  await db
    .insert(schema.siteSettings)
    .values({ id: 1, ...row })
    .onConflictDoUpdate({ target: schema.siteSettings.id, set: { ...row, updatedAt: new Date() } });

  updateTag(tags.settings);
  return ok("Settings saved.");
}
