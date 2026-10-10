// Plain-TS mirrors of the Postgres enums, safe to import from client code.

export const EVENT_KINDS = ["film", "premiere", "special", "music", "talk"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const SEAT_KINDS = ["armchair", "lounge", "saucer"] as const;
export type SeatKind = (typeof SEAT_KINDS)[number];

export const SCREENING_STATUSES = ["scheduled", "cancelled"] as const;
export type ScreeningStatus = (typeof SCREENING_STATUSES)[number];

export const BOOKING_STATUSES = ["pending", "paid", "expired", "cancelled", "refunded", "conflict"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SLIDE_THEMES = ["paper", "dark", "red"] as const;
export type SlideTheme = (typeof SLIDE_THEMES)[number];

/** Prices in tetri (1 GEL = 100 tetri), per seat kind. */
export type SeatPrices = Record<SeatKind, number>;

export type PageFact = { value: string; label: string };

export type BookedSeat = {
  seatId: number;
  label: string;
  kind: SeatKind;
  price: number;
};
