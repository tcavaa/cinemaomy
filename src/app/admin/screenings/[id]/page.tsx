import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { InlineAction } from "@/features/admin/components/inline-action";
import { AdminPageHeader, EmptyState, Panel } from "@/features/admin/components/page-header";
import { Stat, td, th } from "@/features/admin/components/stat";
import { checkInBooking } from "@/features/booking/admin-actions";
import { getScreeningBookings } from "@/features/booking/admin-queries";
import { BookingStatusBadge } from "@/features/booking/components/admin/booking-status-badge";
import { HallPlan } from "@/features/booking/components/hall-plan/hall-plan";
import { MiniSeat } from "@/features/booking/components/hall-plan/mini-seat";
import { getHallSeats, getTakenSeatIds } from "@/features/booking/queries";
import { getScreeningAdmin } from "@/features/events/admin-queries";
import { formatLongDate, formatTime } from "@/lib/format";

export const metadata = { title: "Screening" };

export default async function ScreeningAdminPage({ params }: PageProps<"/admin/screenings/[id]">) {
  const { id } = await params;
  const screening = await getScreeningAdmin(id);
  if (!screening) notFound();

  const [seats, guests, taken] = await Promise.all([getHallSeats(), getScreeningBookings(id), getTakenSeatIds(id)]);
  const capacity = seats.filter((s) => s.isActive).length;
  const sold = guests.filter((g) => g.status === "paid").flatMap((g) => g.seats.map((s) => s.seatId));
  const held = taken.filter((seatId) => !sold.includes(seatId));

  return (
    <>
      <AdminPageHeader
        title={screening.eventTitle}
        description={`${formatLongDate(screening.startsAt)} at ${formatTime(screening.startsAt)}${screening.note ? ` — ${screening.note}` : ""}`}
        back={{ href: `/admin/events/${screening.eventId}`, label: "Event" }}
        actions={
          <ButtonLink href={`/book/${screening.id}`} target="_blank" variant="outline" size="sm">
            Booking page
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Sold" value={`${screening.soldSeats}/${capacity}`} />
        <Stat label="On hold" value={screening.heldSeats} hint="Customers paying right now" />
        <Stat label="Checked in" value={`${screening.checkedIn}/${screening.soldSeats}`} />
        <Stat label="Revenue" value={<Price tetri={screening.revenue} />} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel title="Seats">
          <HallPlan seats={seats} selected={sold} taken={held} tone="light" idPrefix="admin-plan" title="Seat sheet" />
          <ul className="mt-4 flex flex-wrap gap-5 font-ui text-[0.85rem] text-ink-2">
            <li className="flex items-center gap-2">
              <MiniSeat kind="armchair" state="selected" tone="light" className="h-5 w-6" /> Sold
            </li>
            <li className="flex items-center gap-2">
              <MiniSeat kind="armchair" state="taken" tone="light" className="h-5 w-6" /> On hold
            </li>
            <li className="flex items-center gap-2">
              <MiniSeat kind="armchair" state="available" tone="light" className="h-5 w-6" /> Free
            </li>
          </ul>
        </Panel>

        <Panel title="Guest list">
          {guests.length ? (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="w-full min-w-[36rem]">
                <thead className="border-b border-ink/10">
                  <tr>
                    <th className={th}>Seats</th>
                    <th className={th}>Guest</th>
                    <th className={th}>Status</th>
                    <th className={th}>Door</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  {guests.map((g) => (
                    <tr key={g.id}>
                      <td className={`${td} font-label`}>{g.seats.map((s) => s.label).join(", ")}</td>
                      <td className={td}>
                        <Link href={`/admin/bookings/${g.id}`} className="hover:text-oxblood">
                          {g.customerName}
                        </Link>
                        <span className="block text-[0.8rem] text-ink-3">
                          {g.reference} · {g.customerPhone ?? g.customerEmail}
                        </span>
                      </td>
                      <td className={td}>
                        <BookingStatusBadge status={g.status} />
                      </td>
                      <td className={td}>
                        {g.status === "paid" &&
                          (g.checkedInAt ? (
                            <InlineAction action={checkInBooking} fields={{ id: g.id, value: "out" }} variant="quiet">
                              ✓ In · undo
                            </InlineAction>
                          ) : (
                            <InlineAction action={checkInBooking} fields={{ id: g.id, value: "in" }}>
                              Check in
                            </InlineAction>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No bookings for this screening yet.</EmptyState>
          )}
        </Panel>
      </div>
    </>
  );
}
