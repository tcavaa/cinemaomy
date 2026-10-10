import { NextResponse, type NextRequest } from "next/server";
import { applyPaymentResult } from "@/features/booking/service";
import { isAuthenticFlittPayload } from "@/features/payments/flitt/client";
import { readFlittPayload } from "@/features/payments/flitt/payload";

// Server-to-server notification from Flitt (server_callback_url).
// Flitt retries until it receives HTTP 200.
export async function POST(request: NextRequest) {
  const order = await readFlittPayload(request);
  if (!order?.order_id) return new NextResponse("Bad request", { status: 400 });

  const authentic = isAuthenticFlittPayload(order);
  try {
    await applyPaymentResult(order, "callback", authentic);
  } catch (error) {
    console.error("[flitt/callback] failed to apply payment result", error);
    return new NextResponse("Error", { status: 500 });
  }

  if (!authentic) return new NextResponse("Invalid signature", { status: 400 });
  return new NextResponse("OK", { status: 200 });
}
