import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Flitt signature (docs.flitt.com/api/building-signature):
// sha1 over the payment secret followed by every non-empty parameter value,
// ordered alphabetically by parameter name and joined with "|". Lowercase hex.

const EXCLUDED = new Set(["signature", "response_signature_string"]);

type Params = Record<string, unknown>;

function signatureBase(secret: string, params: Params) {
  const values = Object.keys(params)
    .filter((key) => !EXCLUDED.has(key))
    .sort()
    .map((key) => params[key])
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map((value) => String(value));
  return [secret, ...values].join("|");
}

export function signFlittParams(secret: string, params: Params): string {
  return createHash("sha1").update(signatureBase(secret, params), "utf8").digest("hex");
}

export function verifyFlittSignature(secret: string, params: Params): boolean {
  const received = typeof params.signature === "string" ? params.signature.toLowerCase() : "";
  if (received.length !== 40) return false;
  const expected = signFlittParams(secret, params);
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
