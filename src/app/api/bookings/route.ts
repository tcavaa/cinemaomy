import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/features/auth/session";
import { MAX_SEATS_PER_BOOKING } from "@/features/booking/seat-kinds";
import { BookingError, reserveSeats, type BookingErrorCode } from "@/features/booking/service";

const bodySchema = z.object({
  screeningId: z.uuid(),
  seatIds: z.array(z.number().int().positive()).min(1).max(MAX_SEATS_PER_BOOKING),
  name: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.email("Enter a valid email address").trim(),
  phone: z.string().trim().max(40).optional(),
});

const STATUS: Record<BookingErrorCode, number> = {
  not_found: 404,
  sales_closed: 410,
  invalid_seats: 400,
  seats_taken: 409,
  too_many_holds: 429,
  payment_unavailable: 502,
};

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Please check your details.",
          fields: z.flattenError(parsed.error).fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  const user = await getSessionUser();

  try {
    const { booking, paymentToken } = await reserveSeats({ ...parsed.data, userId: user?.id ?? null });
    return NextResponse.json(
      {
        bookingId: booking.id,
        reference: booking.reference,
        accessToken: booking.accessToken,
        amount: booking.amount,
        expiresAt: booking.expiresAt.toISOString(),
        // Seconds left on the hold by the server's clock. Browsers count down from
        // this rather than comparing expiresAt with their own (possibly wrong) clock.
        holdSeconds: Math.max(0, Math.floor((booking.expiresAt.getTime() - Date.now()) / 1000)),
        paymentToken,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message, seatIds: error.seatIds } },
        { status: STATUS[error.code] },
      );
    }
    console.error("[api/bookings] unexpected error", error);
    return NextResponse.json(
      { error: { code: "server_error", message: "Something went wrong. Please try again." } },
      { status: 500 },
    );
  }
}
