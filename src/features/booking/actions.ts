"use server";

import { refresh } from "next/cache";
import { getSessionUser } from "@/features/auth/session";
import { fail, ok, type FormState } from "@/lib/forms";
import { claimBooking, findBooking, tokenMatches } from "./service";

/** Attach a guest booking to the signed-in account; the ticket token proves ownership. */
export async function claimTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return fail("Sign in first.");

  const booking = await findBooking(String(formData.get("bookingId") ?? ""));
  if (!booking || !tokenMatches(booking, String(formData.get("k") ?? ""))) {
    return fail("We couldn't find that booking.");
  }

  const claimed = await claimBooking(booking, user.id);
  if (!claimed) return fail("This booking already belongs to another account.");

  refresh();
  return ok("Saved to your account.");
}
