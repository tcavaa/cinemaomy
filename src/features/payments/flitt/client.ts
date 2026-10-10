import "server-only";
import { serverEnv } from "@/lib/env";
import { signFlittParams, verifyFlittSignature } from "./signature";
import type { CheckoutTokenRequest, FlittFailure, FlittOrder } from "./types";

export class FlittError extends Error {
  constructor(
    message: string,
    readonly code?: string | number,
  ) {
    super(message);
    this.name = "FlittError";
  }
}

async function post<T>(path: string, request: Record<string, unknown>): Promise<T> {
  const { FLITT_API_URL, FLITT_SECRET_KEY } = serverEnv();
  const body = { request: { ...request, signature: signFlittParams(FLITT_SECRET_KEY, request) } };

  const res = await fetch(new URL(path, FLITT_API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new FlittError(`Flitt responded with HTTP ${res.status}`);

  const json = (await res.json()) as { response?: T | FlittFailure };
  const response = json.response;
  if (!response) throw new FlittError("Malformed Flitt response");
  if ((response as FlittFailure).response_status === "failure") {
    const failure = response as FlittFailure;
    throw new FlittError(failure.error_message, failure.error_code);
  }
  return response as T;
}

/**
 * Creates a Flitt order and returns the payment token used by the embedded
 * checkout (POST /api/checkout/token).
 */
export async function createCheckoutToken(input: CheckoutTokenRequest): Promise<string> {
  const { FLITT_MERCHANT_ID } = serverEnv();
  const request: Record<string, unknown> = {
    merchant_id: FLITT_MERCHANT_ID,
    order_id: input.orderId,
    order_desc: input.description,
    amount: input.amount,
    currency: input.currency,
    lifetime: input.lifetimeSeconds,
    sender_email: input.email,
    lang: input.lang,
    response_url: input.responseUrl,
    server_callback_url: input.serverCallbackUrl,
  };
  for (const key of Object.keys(request)) if (request[key] === undefined) delete request[key];

  const response = await post<{ token?: string }>("/api/checkout/token", request);
  if (!response.token) throw new FlittError("Flitt did not return a payment token");
  return response.token;
}

/** Authoritative order status straight from Flitt (POST /api/status/order_id). */
export async function getOrderStatus(orderId: string): Promise<FlittOrder> {
  const { FLITT_MERCHANT_ID, FLITT_SECRET_KEY } = serverEnv();
  const order = await post<FlittOrder>("/api/status/order_id", {
    merchant_id: FLITT_MERCHANT_ID,
    order_id: orderId,
  });
  if (!verifyFlittSignature(FLITT_SECRET_KEY, order)) {
    throw new FlittError("Flitt status response failed signature verification");
  }
  return order;
}

/** Validates a callback/redirect payload signed by Flitt. */
export function isAuthenticFlittPayload(payload: Record<string, unknown>): boolean {
  const { FLITT_SECRET_KEY, FLITT_MERCHANT_ID } = serverEnv();
  if (String(payload.merchant_id) !== String(FLITT_MERCHANT_ID)) return false;
  return verifyFlittSignature(FLITT_SECRET_KEY, payload);
}
