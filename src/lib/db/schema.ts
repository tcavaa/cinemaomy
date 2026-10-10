// Drizzle mirror of supabase/migrations. The SQL migrations are the source of
// truth; keep this file in sync when they change.
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  BOOKING_STATUSES,
  EVENT_KINDS,
  SCREENING_STATUSES,
  SEAT_KINDS,
  SLIDE_THEMES,
  type BookedSeat,
  type PageFact,
  type SeatPrices,
} from "./enums";

export * from "./enums";

export const eventKind = pgEnum("event_kind", EVENT_KINDS);
export const seatKind = pgEnum("seat_kind", SEAT_KINDS);
export const screeningStatus = pgEnum("screening_status", SCREENING_STATUSES);
export const bookingStatus = pgEnum("booking_status", BOOKING_STATUSES);
export const slideTheme = pgEnum("slide_theme", SLIDE_THEMES);

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const admins = pgTable("admins", {
  userId: uuid().primaryKey(),
  email: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable(
  "site_settings",
  {
    id: smallint().primaryKey().default(1),
    name: text().notNull().default("Cinema O'my"),
    tagline: text(),
    address: text(),
    district: text(),
    city: text(),
    phone: text(),
    email: text(),
    instagramUrl: text(),
    facebookUrl: text(),
    mapQuery: text(),
    openingHours: text(),
    bookingNote: text(),
    defaultPrices: jsonb()
      .$type<SeatPrices>()
      .notNull()
      .default({ armchair: 1500, lounge: 2000, saucer: 2000 }),
    holdMinutes: smallint().notNull().default(15),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [check("site_settings_id_check", sql`${t.id} = 1`)],
);

export const pages = pgTable("pages", {
  slug: text().primaryKey(),
  eyebrow: text(),
  title: text().notNull(),
  lead: text(),
  body: text(),
  imageUrl: text(),
  imageAlt: text(),
  facts: jsonb().$type<PageFact[]>().notNull().default([]),
  seoDescription: text(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const slides = pgTable(
  "slides",
  {
    id: uuid().primaryKey().defaultRandom(),
    eyebrow: text(),
    title: text().notNull(),
    subtitle: text(),
    aside: text(),
    meta: text(),
    imageUrl: text().notNull(),
    imageAlt: text(),
    ctaLabel: text(),
    linkUrl: text(),
    theme: slideTheme().notNull().default("paper"),
    sortOrder: integer().notNull().default(0),
    isPublished: boolean().notNull().default(true),
    ...timestamps,
  },
  (t) => [index("slides_sort_idx").on(t.sortOrder)],
);

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid().primaryKey().defaultRandom(),
    imageUrl: text().notNull(),
    alt: text(),
    caption: text(),
    width: integer(),
    height: integer(),
    sortOrder: integer().notNull().default(0),
    isPublished: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("gallery_images_sort_idx").on(t.sortOrder)],
);

export const events = pgTable("events", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  kind: eventKind().notNull().default("film"),
  title: text().notNull(),
  originalTitle: text(),
  tagline: text(),
  director: text(),
  year: smallint(),
  country: text(),
  runtimeMinutes: smallint(),
  language: text(),
  subtitles: text(),
  synopsis: text(),
  imageUrl: text(),
  posterUrl: text(),
  trailerUrl: text(),
  isPublished: boolean().notNull().default(true),
  ...timestamps,
});

export const screenings = pgTable(
  "screenings",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    note: text(),
    prices: jsonb().$type<SeatPrices>().notNull(),
    status: screeningStatus().notNull().default("scheduled"),
    salesOpen: boolean().notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index("screenings_starts_at_idx").on(t.startsAt),
    index("screenings_event_idx").on(t.eventId),
  ],
);

export const seats = pgTable(
  "seats",
  {
    id: smallint().primaryKey().generatedAlwaysAsIdentity(),
    rowLabel: text().notNull(),
    number: smallint().notNull(),
    kind: seatKind().notNull(),
    x: real().notNull(),
    y: real().notNull(),
    rotation: real().notNull().default(0),
    isActive: boolean().notNull().default(true),
  },
  (t) => [unique("seats_row_label_number_key").on(t.rowLabel, t.number)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid().primaryKey().defaultRandom(),
    reference: text().notNull().unique(),
    screeningId: uuid()
      .notNull()
      .references(() => screenings.id, { onDelete: "restrict" }),
    status: bookingStatus().notNull().default("pending"),
    customerName: text().notNull(),
    customerEmail: text().notNull(),
    customerPhone: text(),
    amount: integer().notNull(),
    currency: text().notNull().default("GEL"),
    seats: jsonb().$type<BookedSeat[]>().notNull(),
    accessToken: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    paidAt: timestamp({ withTimezone: true }),
    checkedInAt: timestamp({ withTimezone: true }),
    paymentOrderId: text().unique(),
    paymentId: text(),
    paymentStatus: text(),
    /** auth.users.id of the customer, when booked while signed in or claimed later. */
    userId: uuid(),
    ...timestamps,
  },
  (t) => [
    index("bookings_screening_status_idx").on(t.screeningId, t.status),
    index("bookings_created_at_idx").on(t.createdAt.desc()),
    index("bookings_user_idx").on(t.userId, t.createdAt.desc()),
  ],
);

export const bookingSeats = pgTable(
  "booking_seats",
  {
    screeningId: uuid()
      .notNull()
      .references(() => screenings.id, { onDelete: "cascade" }),
    seatId: smallint()
      .notNull()
      .references(() => seats.id),
    bookingId: uuid()
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    price: integer().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.screeningId, t.seatId] }),
    index("booking_seats_booking_idx").on(t.bookingId),
    index("booking_seats_seat_idx").on(t.seatId),
  ],
);

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    bookingId: uuid().references(() => bookings.id, { onDelete: "set null" }),
    source: text().notNull(),
    orderStatus: text(),
    signatureValid: boolean().notNull(),
    payload: jsonb().$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payment_events_booking_idx").on(t.bookingId)],
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Screening = typeof screenings.$inferSelect;
export type Seat = typeof seats.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Slide = typeof slides.$inferSelect;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
