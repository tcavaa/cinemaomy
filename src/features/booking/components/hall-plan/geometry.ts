// Plan geometry of the hall, in the same units as seats.x / seats.y.
// The screen is at the top; row A is closest to it.

export const PLAN = {
  width: 1000,
  height: 900,
  screen: { x1: 170, x2: 830, y: 74 },
  aisle: { x1: 456, x2: 544, top: 168, bottom: 684 },
  /** Front edge of each riser, front to back. */
  risers: [174, 302, 428, 554, 682, 828],
  rowLabelX: { left: 38, right: 962 },
} as const;

export const SEAT_SIZE = {
  armchair: { w: 78, h: 70 },
  lounge: { w: 88, h: 88 },
  saucer: { w: 120, h: 84 },
} as const;
