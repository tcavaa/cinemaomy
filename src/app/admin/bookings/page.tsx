import Form from "next/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Price } from "@/components/ui/price";
import { AdminPageHeader, EmptyState } from "@/features/admin/components/page-header";
import { td, th } from "@/features/admin/components/stat";
import { listBookings } from "@/features/booking/admin-queries";
import { BookingStatusBadge } from "@/features/booking/components/admin/booking-status-badge";
import { BOOKING_STATUS_LABEL } from "@/features/booking/seat-kinds";
import { BOOKING_STATUSES } from "@/lib/db/enums";
import { formatCompactDateTime } from "@/lib/format";

export const metadata = { title: "Bookings" };

export default async function BookingsAdminPage({ searchParams }: PageProps<"/admin/bookings">) {
  const query = await searchParams;
  const status = typeof query.status === "string" ? query.status : "";
  const q = typeof query.q === "string" ? query.q : "";
  const rows = await listBookings({ status, q });

  return (
    <>
      <AdminPageHeader title="Bookings" description="Search by reference, name or email. Paid bookings can be checked in at the door." />

      <Form action="/admin/bookings" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-72">
          <Input name="q" defaultValue={q} placeholder="OMY-…, name or email" aria-label="Search bookings" />
        </div>
        <div className="w-48">
          <Select name="status" defaultValue={status} aria-label="Status">
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="ink">
          Filter
        </Button>
        {(q || status) && (
          <Link href="/admin/bookings" className="font-ui text-[0.9rem] text-ink-3 hover:text-ink">
            Clear
          </Link>
        )}
      </Form>

      {rows.length ? (
        <div className="overflow-x-auto border border-ink/15 bg-[#f4ede1]">
          <table className="w-full min-w-[52rem]">
            <thead className="border-b border-ink/10">
              <tr>
                <th className={th}>Booking</th>
                <th className={th}>Screening</th>
                <th className={th}>Seats</th>
                <th className={th}>Amount</th>
                <th className={th}>Status</th>
                <th className={th}>Booked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((b) => (
                <tr key={b.id} className="hover:bg-paper/60">
                  <td className={td}>
                    <Link href={`/admin/bookings/${b.id}`} className="font-label text-[0.88rem] hover:text-oxblood">
                      {b.reference}
                    </Link>
                    <span className="block text-[0.82rem] text-ink-3">
                      {b.customerName} · {b.customerEmail}
                    </span>
                  </td>
                  <td className={td}>
                    <Link href={`/admin/screenings/${b.screeningId}`} className="hover:text-oxblood">
                      {b.eventTitle}
                    </Link>
                    <span className="block text-[0.82rem] text-ink-3">{formatCompactDateTime(b.startsAt)}</span>
                  </td>
                  <td className={`${td} font-label`}>{b.seats.map((s) => s.label).join(", ")}</td>
                  <td className={td}>
                    <Price tetri={b.amount} />
                  </td>
                  <td className={td}>
                    <BookingStatusBadge status={b.status} />
                    {b.checkedInAt && <span className="ml-2 text-[0.8rem] text-ink-3">checked in</span>}
                  </td>
                  <td className={`${td} whitespace-nowrap text-ink-3`}>{formatCompactDateTime(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No bookings match.</EmptyState>
      )}
    </>
  );
}
