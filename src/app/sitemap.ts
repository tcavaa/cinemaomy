import type { MetadataRoute } from "next";
import { getPublishedEventSlugs } from "@/features/events/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const events = await getPublishedEventSlugs();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/program`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/gallery`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
    ...events.map((e) => ({
      url: `${base}/program/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
