import { z } from "zod";
import type { FormState } from "./form-state";

export type { FormState } from "./form-state";
export { initialFormState } from "./form-state";

export const ok = (message?: string): FormState => ({ status: "success", message, at: Date.now() });

export const fail = (message: string, fieldErrors?: FormState["fieldErrors"]): FormState => ({
  status: "error",
  message,
  fieldErrors,
  at: Date.now(),
});

export function invalid(error: z.ZodError): FormState {
  return fail("Please check the highlighted fields.", z.flattenError(error).fieldErrors as FormState["fieldErrors"]);
}

/** FormData → plain object; repeated keys become arrays, files are dropped. */
export function formToObject(formData: FormData) {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || typeof value !== "string") continue;
    const prev = out[key];
    if (prev === undefined) out[key] = value;
    else out[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
  }
  return out;
}

// ─── Zod helpers for form fields ────────────────────────────────────────────

/** Optional text: trims, empty → null. */
export const optionalText = (max = 2000) =>
  z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : (v ?? null)),
    z.string().max(max).nullable(),
  );

export const requiredText = (label: string, max = 500) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max);

/** Checkbox / switch: "on" | "true" → true, missing → false. */
export const checkbox = () => z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/** Optional whole number from a text/number input. */
export const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(min).max(max).nullable(),
  );

/** Price input in lari ("15" or "12.5") → integer tetri. */
export const lariToTetri = (label: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? Number(v.replace(",", ".")) : v),
    z
      .number({ error: `${label} must be a number` })
      .min(0, `${label} cannot be negative`)
      .max(10000)
      .transform((lari) => Math.round(lari * 100)),
  );

/** Internal path ("/program") or absolute http(s) URL. */
export const optionalLink = () =>
  z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : null),
    z
      .string()
      .max(1000)
      .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Use a path like /program or a full URL")
      .nullable(),
  );

/** Image reference: site-relative path or https URL. */
export const imageUrl = (label = "Image") =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(1000)
    .refine((v) => v.startsWith("/") || v.startsWith("https://"), "Upload an image or paste an https URL");

export const optionalImageUrl = () =>
  z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : null),
    z
      .string()
      .max(1000)
      .refine((v) => v.startsWith("/") || v.startsWith("https://"), "Upload an image or paste an https URL")
      .nullable(),
  );

/** Only allow same-site relative redirects. */
export function safeNext(next: unknown, fallback = "/account") {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
