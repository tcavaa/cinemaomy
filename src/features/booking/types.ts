import type { SeatKind, SeatPrices } from "@/lib/db/enums";

export type HallSeat = {
  id: number;
  row: string;
  number: number;
  kind: SeatKind;
  x: number;
  y: number;
  rotation: number;
  isActive: boolean;
};

/** What the booking UI needs to know about a screening. Serializable. */
export type BookingScreening = {
  id: string;
  startsAt: string;
  prices: SeatPrices;
  note: string | null;
  event: { slug: string; title: string; director: string | null; year: number | null };
};
