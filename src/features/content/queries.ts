import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import { db, schema } from "@/lib/db";
import type { Page, SiteSettings } from "@/lib/db/schema";

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  name: "Cinema O'my",
  tagline: null,
  address: null,
  district: null,
  city: "Tbilisi",
  phone: null,
  email: null,
  instagramUrl: null,
  facebookUrl: null,
  mapQuery: null,
  openingHours: null,
  bookingNote: null,
  defaultPrices: { armchair: 1500, lounge: 2000, saucer: 2000 },
  holdMinutes: 15,
  updatedAt: new Date(0),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.settings);

  const row = await db.query.siteSettings.findFirst({ where: eq(schema.siteSettings.id, 1) });
  return row ?? FALLBACK_SETTINGS;
}

export async function getPage(slug: string): Promise<Page | null> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.page(slug));

  const row = await db.query.pages.findFirst({ where: eq(schema.pages.slug, slug) });
  return row ?? null;
}
