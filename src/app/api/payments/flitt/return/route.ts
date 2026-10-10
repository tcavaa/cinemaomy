import { NextResponse, type NextRequest } from "next/server";
import { applyPaymentResult } from "@/features/booking/service";
import { isAuthenticFlittPayload } from "@/features/payments/flitt/client";
import { readFlittPayload } from "@/features/payments/flitt/payload";
import { requestOrigin } from "@/lib/env";

// Flitt sends the customer's browser here (response_url) once a payment finishes.
export async function POST(request: NextRequest) {
  const origin = await requestOrigin();
  const order = await readFlittPayload(request);
  const fallback = new URL("/program", origin);
  if (!order?.order_id) return NextResponse.redirect(fallback, 303);

  const authentic = isAuthenticFlittPayload(order);
  const booking = await applyPaymentResult(order, "return", authentic).catch((error) => {
    console.error("[flitt/return] failed to apply payment result", error);
    return null;
  });

  // Only hand out the private ticket link for a genuine, signed payload.
  if (!booking || !authentic) return NextResponse.redirect(fallback, 303);
  const ticket = new URL(`/tickets/${booking.id}`, origin);
  ticket.searchParams.set("k", booking.accessToken);
  return NextResponse.redirect(ticket, 303);
}

export async function GET() {
  return NextResponse.redirect(new URL("/account", await requestOrigin()), 303);
}
