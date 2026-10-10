import "server-only";
import type { NextRequest } from "next/server";
import type { FlittOrder } from "./types";

/** Reads a Flitt callback / redirect body (JSON or form-encoded, wrapped in `response` or flat). */
export async function readFlittPayload(request: NextRequest): Promise<FlittOrder | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown> | null;
      const data = (body?.response ?? body) as FlittOrder | null;
      return data && typeof data === "object" ? data : null;
    }
    const form = await request.formData();
    const data: Record<string, string> = {};
    for (const [key, value] of form.entries()) if (typeof value === "string") data[key] = value;
    return Object.keys(data).length ? (data as unknown as FlittOrder) : null;
  } catch {
    return null;
  }
}
