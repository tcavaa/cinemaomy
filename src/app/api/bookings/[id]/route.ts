import { NextResponse, type NextRequest } from "next/server";
import { findBooking, releaseHold, tokenMatches } from "@/features/booking/service";

/** Customer abandons a pending payment: release the held seats. */
export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  const { id } = await ctx.params;
  const { k } = ((await request.json().catch(() => ({}))) ?? {}) as { k?: string };

  const booking = await findBooking(id);
  if (!booking || !tokenMatches(booking, k)) {
    return NextResponse.json({ error: { code: "not_found", message: "Booking not found" } }, { status: 404 });
  }

  const updated = await releaseHold(booking);
  return NextResponse.json({ status: updated.status }, { headers: { "Cache-Control": "no-store" } });
}
