import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getTakenSeatIds } from "@/features/booking/queries";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/screenings/[id]/seats">) {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: { code: "not_found", message: "Unknown screening" } }, { status: 404 });
  }
  const taken = await getTakenSeatIds(id);
  return NextResponse.json({ taken }, { headers: { "Cache-Control": "no-store" } });
}
