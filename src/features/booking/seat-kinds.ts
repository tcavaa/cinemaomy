import type { BookingStatus, SeatKind } from "@/lib/db/enums";

export const SEAT_KIND_INFO: Record<SeatKind, { label: string; description: string }> = {
  armchair: {
    label: "Armchair",
    description: "Leather club armchair",
  },
  lounge: {
    label: "Lounge chair",
    description: "Low leather shell chair, front row",
  },
  saucer: {
    label: "Saucer chair",
    description: "Deep bowl chair with room to curl up",
  },
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  expired: "Expired",
  cancelled: "Cancelled",
  refunded: "Refunded",
  conflict: "Needs refund",
};

export const MAX_SEATS_PER_BOOKING = 8;

export const seatLabel = (row: string, number: number) => `${row}${number}`;
