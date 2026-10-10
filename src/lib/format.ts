// Formatting helpers. All dates are shown in Tbilisi time (UTC+4, no DST).

export const TIME_ZONE = "Asia/Tbilisi";
const TBILISI_OFFSET = "+04:00";
const LOCALE = "en-GB";

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options });

const timeFmt = fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const weekdayFmt = fmt({ weekday: "long" });
const weekdayShortFmt = fmt({ weekday: "short" });
const monthFmt = fmt({ month: "long" });
const monthShortFmt = fmt({ month: "short" });
const dayFmt = fmt({ day: "numeric" });
const partsFmt = fmt({ year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function parts(date: Date) {
  const p = Object.fromEntries(partsFmt.formatToParts(date).map((x) => [x.type, x.value]));
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute };
}

/** "21:00" */
export const formatTime = (date: Date) => timeFmt.format(date);
/** "Saturday" */
export const formatWeekday = (date: Date) => weekdayFmt.format(date);
/** "Sat" */
export const formatWeekdayShort = (date: Date) => weekdayShortFmt.format(date);
/** "October" */
export const formatMonth = (date: Date) => monthFmt.format(date);
/** "Oct" */
export const formatMonthShort = (date: Date) => monthShortFmt.format(date);
/** "10" */
export const formatDayOfMonth = (date: Date) => dayFmt.format(date);

/** Poster style "10.10" */
export function formatDotDate(date: Date) {
  const { day, month } = parts(date);
  return `${day}.${month}`;
}

/** "October 10" */
export const formatMonthDay = (date: Date) => `${formatMonth(date)} ${formatDayOfMonth(date)}`;

/** "Saturday, October 10" */
export const formatLongDate = (date: Date) => `${formatWeekday(date)}, ${formatMonthDay(date)}`;

/** "Sat 10 Oct, 21:00" */
export const formatCompactDateTime = (date: Date) =>
  `${formatWeekdayShort(date)} ${formatDayOfMonth(date)} ${formatMonthShort(date)}, ${formatTime(date)}`;

/** Local calendar day key, e.g. "2026-10-10" — used to group screenings by day. */
export function dayKey(date: Date) {
  const { year, month, day } = parts(date);
  return `${year}-${month}-${day}`;
}

/** Split a date into Tbilisi-local values for <input type="date"> / <input type="time">. */
export function toLocalInputs(date: Date) {
  const { year, month, day, hour, minute } = parts(date);
  return { date: `${year}-${month}-${day}`, time: `${hour}:${minute}` };
}

/** Parse Tbilisi-local date + time inputs into an absolute Date. */
export function fromLocalInputs(date: string, time: string) {
  const d = new Date(`${date}T${time}:00${TBILISI_OFFSET}`);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date or time");
  return d;
}

/** Amount in tetri → "15 ₾" / "12.50 ₾" */
export function formatMoney(tetri: number) {
  const lari = tetri / 100;
  const value = Number.isInteger(lari) ? String(lari) : lari.toFixed(2);
  return `${value} ₾`;
}

export function formatRuntime(minutes: number | null | undefined) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}
