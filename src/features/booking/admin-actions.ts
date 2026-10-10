"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import { fail, ok, type FormState } from "@/lib/forms";
import { cancelBookingAsAdmin, findBooking, setCheckedIn, syncPaymentStatus } from "./service";

const idSchema = z.uuid();

export async function checkInBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown booking.");
  const done = await setCheckedIn(id.data, formData.get("value") !== "out");
  if (!done) return fail("Only paid bookings can be checked in.");
  refresh();
  return ok();
}

export async function cancelBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return fail("Unknown booking.");
  const result = await cancelBookingAsAdmin(id.data);
  if (!result) return fail("Booking not found.");
  refresh();
  return ok(
    "wasPaid" in result && result.wasPaid
      ? "Cancelled and seats released. Refund the payment from the Flitt merchant portal."
      : "Cancelled and seats released.",
  );
}

export async function recheckPayment(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const booking = await findBooking(String(formData.get("id") ?? ""));
  if (!booking) return fail("Booking not found.");
  const synced = await syncPaymentStatus(booking);
  refresh();
  return ok(`Status: ${synced.status}${synced.paymentStatus ? ` (Flitt: ${synced.paymentStatus})` : ""}.`);
}
