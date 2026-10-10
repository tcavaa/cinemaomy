import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { AdminPageHeader, EmptyState, Panel } from "@/features/admin/components/page-header";
import { Meter, Stat, td, th } from "@/features/admin/components/stat";
import { getDashboard } from "@/features/booking/admin-queries";
import { BookingStatusBadge } from "@/features/booking/components/admin/booking-status-badge";
import { formatCompactDateTime } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { upcoming, recent, totals } = await getDashboard();

  return (
    <>
      <AdminPageHeader
        title="Box office"
        description="What's coming up, what's selling, and anything that needs a hand."
        actions={
          <>
            <ButtonLink href="/admin/events/new" size="sm" arrow>
              New event
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="sm" target="_blank">
              View site
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue · 30 days" value={<Price tetri={totals.revenue30} />} />
        <Stat label="Tickets · 30 days" value={totals.tickets30} />
        <Stat label="Seats on hold now" value={totals.pending} hint="Customers in checkout" href="/admin/bookings?status=pending" />
        <Stat
          label="Need a refund"
          value={totals.conflicts}
          tone={totals.conflicts ? "alert" : undefined}
          hint={totals.conflicts ? "Paid after their hold expired" : "All clear"}
          href="/admin/bookings?status=conflict"
        />
      </div>

      <div className="mt-8 grid gap-8 2xl:grid-cols-2">
        <Panel title="Coming up">
          {upcoming.length ? (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="w-full min-w-[34rem]">
                <thead className="border-b border-ink/10">
                  <tr>
                    <th className={th}>When</th>
                    <th className={th}>Film</th>
                    <th className={th}>Sold</th>
                    <th className={th}>Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  {upcoming.map((s) => (
                    <tr key={s.id} className="hover:bg-paper/60">
                      <td className={`${td} whitespace-nowrap`}>{formatCompactDateTime(s.startsAt)}</td>
                      <td className={td}>
                        <Link href={`/admin/screenings/${s.id}`} className="font-label text-[0.88rem] hover:text-oxblood">
                          {s.title}
                        </Link>
                        {s.status === "cancelled" && <span className="ml-2 text-vermilion">cancelled</span>}
                      </td>
                      <td className={td}>
                        <Meter value={s.soldSeats} max={s.capacity} />
                        {s.heldSeats > 0 && <span className="font-ui text-[0.78rem] text-ink-3">+{s.heldSeats} on hold</span>}
                      </td>
                      <td className={td}>
                        <Price tetri={s.revenue} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>
              Nothing scheduled. <Link href="/admin/events" className="text-oxblood underline">Add screenings</Link>.
            </EmptyState>
          )}
        </Panel>

        <Panel title="Latest bookings">
          {recent.length ? (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="w-full min-w-[34rem]">
                <thead className="border-b border-ink/10">
                  <tr>
                    <th className={th}>Booking</th>
                    <th className={th}>Film</th>
                    <th className={th}>Seats</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  {recent.map((b) => (
                    <tr key={b.id} className="hover:bg-paper/60">
                      <td className={td}>
                        <Link href={`/admin/bookings/${b.id}`} className="font-label text-[0.85rem] hover:text-oxblood">
                          {b.reference}
                        </Link>
                        <span className="block text-[0.82rem] text-ink-3">{b.customerName}</span>
                      </td>
                      <td className={td}>
                        {b.eventTitle}
                        <span className="block text-[0.82rem] text-ink-3">{formatCompactDateTime(b.startsAt)}</span>
                      </td>
                      <td className={td}>{b.seats.map((s) => s.label).join(", ")}</td>
                      <td className={td}>
                        <BookingStatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No bookings yet.</EmptyState>
          )}
        </Panel>
      </div>
    </>
  );
}
