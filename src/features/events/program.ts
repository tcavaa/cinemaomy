import type { EventKind, ScreeningStatus } from "@/lib/db/enums";
import {
  dayKey,
  formatDayOfMonth,
  formatDotDate,
  formatMonth,
  formatRuntime,
  formatTime,
  formatWeekday,
  formatWeekdayShort,
} from "@/lib/format";
import { creditLine } from "./labels";
import type { ScreeningListing } from "./types";

/** Pre-formatted, serializable screening for client components (no timezone surprises). */
export type ProgramItem = {
  id: string;
  dayKey: string;
  weekday: string;
  weekdayShort: string;
  dayOfMonth: string;
  month: string;
  dotDate: string;
  time: string;
  status: ScreeningStatus;
  salesOpen: boolean;
  note: string | null;
  seatsTaken: number;
  seatsTotal: number;
  fromPrice: number;
  event: {
    slug: string;
    title: string;
    kind: EventKind;
    credit: string | null;
    year: number | null;
    details: string[];
    imageUrl: string | null;
    posterUrl: string | null;
  };
};

export function toProgramItem(s: ScreeningListing): ProgramItem {
  const { event } = s;
  return {
    id: s.id,
    dayKey: dayKey(s.startsAt),
    weekday: formatWeekday(s.startsAt),
    weekdayShort: formatWeekdayShort(s.startsAt),
    dayOfMonth: formatDayOfMonth(s.startsAt),
    month: formatMonth(s.startsAt),
    dotDate: formatDotDate(s.startsAt),
    time: formatTime(s.startsAt),
    status: s.status,
    salesOpen: s.salesOpen,
    note: s.note,
    seatsTaken: s.seatsTaken,
    seatsTotal: s.seatsTotal,
    fromPrice: Math.min(...Object.values(s.prices)),
    event: {
      slug: event.slug,
      title: event.title,
      kind: event.kind,
      credit: creditLine(event),
      year: event.year,
      details: [event.year ? String(event.year) : null, formatRuntime(event.runtimeMinutes), event.language].filter(
        Boolean,
      ) as string[],
      imageUrl: event.imageUrl,
      posterUrl: event.posterUrl,
    },
  };
}

export function groupByDay(items: ProgramItem[]) {
  const groups = new Map<string, ProgramItem[]>();
  for (const item of items) {
    const list = groups.get(item.dayKey) ?? [];
    list.push(item);
    groups.set(item.dayKey, list);
  }
  return [...groups.values()];
}
