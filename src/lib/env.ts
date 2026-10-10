import "server-only";
import { headers } from "next/headers";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  FLITT_MERCHANT_ID: z.coerce.number().int().positive(),
  FLITT_SECRET_KEY: z.string().min(1),
  FLITT_API_URL: z.url().default("https://pay.flitt.com"),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

/** Validated server-side environment. Parsed lazily so a missing variable fails loudly at first use. */
export function serverEnv(): ServerEnv {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new Error(`Invalid environment variables:\n${issues}`);
    }
    cached = parsed.data;
  }
  return cached;
}

export function siteUrl(path = ""): string {
  return new URL(path, serverEnv().NEXT_PUBLIC_SITE_URL).toString();
}

/**
 * Origin of the current request (falls back to NEXT_PUBLIC_SITE_URL). Used for
 * links that must point back at whichever host the visitor is on — local dev
 * ports, Vercel preview URLs, the production domain.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return serverEnv().NEXT_PUBLIC_SITE_URL;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
