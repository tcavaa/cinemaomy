import { NextResponse, type NextRequest } from "next/server";
import { findBooking, syncPaymentStatus, tokenMatches } from "@/features/booking/service";

/**
 * Called by the browser after the embedded checkout reports success, and by the
 * ticket page while a payment is still processing. The result always comes from
 * Flitt's signed status API, never from the client.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/bookings/[id]/verify">) {
  const { id } = await ctx.params;
  const { k } = ((await request.json().catch(() => ({}))) ?? {}) as { k?: string };

  const booking = await findBooking(id);
  if (!booking || !tokenMatches(booking, k)) {
    return NextResponse.json({ error: { code: "not_found", message: "Booking not found" } }, { status: 404 });
  }

  const synced = await syncPaymentStatus(booking);
  return NextResponse.json(
    { status: synced.status, paymentStatus: synced.paymentStatus },
    { headers: { "Cache-Control": "no-store" } },
  );
}
