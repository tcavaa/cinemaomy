import type { Event, EventKind, ScreeningStatus, SeatPrices } from "@/lib/db/schema";

export type EventSummary = Pick<
  Event,
  | "id"
  | "slug"
  | "kind"
  | "title"
  | "originalTitle"
  | "tagline"
  | "director"
  | "year"
  | "country"
  | "runtimeMinutes"
  | "language"
  | "imageUrl"
  | "posterUrl"
>;

export type ScreeningListing = {
  id: string;
  startsAt: Date;
  note: string | null;
  status: ScreeningStatus;
  salesOpen: boolean;
  prices: SeatPrices;
  seatsTaken: number;
  seatsTotal: number;
  /** As of when the listing was read (cached for about a minute). */
  hasStarted: boolean;
  event: EventSummary;
};

export type EventDetail = Event & {
  upcoming: ScreeningListing[];
  past: ScreeningListing[];
};

export type { EventKind };
