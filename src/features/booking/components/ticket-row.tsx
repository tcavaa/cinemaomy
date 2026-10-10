import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import type { BookingStatus } from "@/lib/db/enums";
import { formatDayOfMonth, formatMonthShort, formatTime, formatWeekdayShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_LABEL } from "../seat-kinds";
import type { TicketView } from "../service";

const TONE: Record<BookingStatus, BadgeTone> = {
  paid: "green",
  pending: "amber",
  conflict: "vermilion",
  refunded: "neutral",
  expired: "neutral",
  cancelled: "neutral",
};

/** One booking in "My tickets", drawn as a small ticket stub. */
export function TicketRow({ view, past }: { view: TicketView; past?: boolean }) {
  const { booking, screening, event } = view;
  return (
    <li>
      <Link
        href={`/tickets/${booking.id}?k=${encodeURIComponent(booking.accessToken)}`}
        className={cn(
          "group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center border border-ink/20 bg-[#f4ede1] transition-colors hover:border-ink sm:grid-cols-[6rem_minmax(0,1fr)_auto]",
          past && "opacity-70 hover:opacity-100",
        )}
      >
        <div className="flex h-full flex-col items-center justify-center border-r-2 border-dashed border-ink/20 py-4">
          <span className="font-poster text-[2.6rem] leading-none text-oxblood">{formatDayOfMonth(screening.startsAt)}</span>
          <span className="mt-1 font-meta text-[0.55rem] tracking-[0.16em] text-ink-3">
            {formatWeekdayShort(screening.startsAt)} {formatMonthShort(screening.startsAt)}
          </span>
        </div>
        <div className="min-w-0 px-4 py-4 sm:px-6">
          <p className="truncate font-poster text-[1.8rem] leading-[0.95] text-ink group-hover:text-oxblood">{event.title}</p>
          <p className="mt-1.5 font-ui text-[0.9rem] text-ink-2">
            {formatTime(screening.startsAt)} · Seats {booking.seats.map((s) => s.label).join(", ")} ·{" "}
            <Price tetri={booking.amount} />
          </p>
          <p className="mt-1 font-meta text-[0.55rem] tracking-[0.18em] text-ink-3">{booking.reference}</p>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-4 border-t border-ink/10 px-4 py-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-t-0 sm:px-6">
          <Badge tone={TONE[booking.status]}>{BOOKING_STATUS_LABEL[booking.status]}</Badge>
          <span className="font-label text-[0.75rem] tracking-[0.1em] text-oxblood">Open ticket →</span>
        </div>
      </Link>
    </li>
  );
}
