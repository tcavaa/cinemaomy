import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { InlineAction } from "@/features/admin/components/inline-action";
import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { td, th } from "@/features/admin/components/stat";
import { cancelBooking, checkInBooking, recheckPayment } from "@/features/booking/admin-actions";
import { getBookingAdmin } from "@/features/booking/admin-queries";
import { BookingStatusBadge } from "@/features/booking/components/admin/booking-status-badge";
import { SEAT_KIND_INFO } from "@/features/booking/seat-kinds";
import { formatCompactDateTime, formatLongDate, formatTime } from "@/lib/format";

export const metadata = { title: "Booking" };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 border-b border-ink/8 py-2.5 last:border-0">
      <dt className="font-meta text-[0.56rem] tracking-[0.2em] text-ink-3">{label}</dt>
      <dd className="font-ui text-[0.95rem]">{children}</dd>
    </div>
  );
}

export default async function BookingAdminPage({ params }: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params;
  const data = await getBookingAdmin(id);
  if (!data) notFound();
  const { booking, log } = data;

  return (
    <>
      <AdminPageHeader
        title={booking.reference}
        description={`${data.eventTitle} — ${formatLongDate(data.startsAt)} at ${formatTime(data.startsAt)}`}
        back={{ href: "/admin/bookings", label: "Bookings" }}
        actions={
          <>
            {booking.status === "paid" &&
              (booking.checkedInAt ? (
                <InlineAction action={checkInBooking} fields={{ id: booking.id, value: "out" }}>
                  Undo check-in
                </InlineAction>
              ) : (
                <InlineAction action={checkInBooking} fields={{ id: booking.id, value: "in" }} className="bg-ink text-paper">
                  Check in
                </InlineAction>
              ))}
            {booking.status === "pending" && (
              <InlineAction action={recheckPayment} fields={{ id: booking.id }}>
                Re-check payment
              </InlineAction>
            )}
            {!["cancelled", "expired", "refunded"].includes(booking.status) && (
              <InlineAction
                action={cancelBooking}
                fields={{ id: booking.id }}
                variant="danger"
                confirm={
                  booking.status === "paid"
                    ? "Cancel this paid booking and release its seats? You will need to refund it in the Flitt portal."
                    : "Cancel this booking and release its seats?"
                }
              >
                Cancel booking
              </InlineAction>
            )}
            <ButtonLink
              href={`/tickets/${booking.id}?k=${encodeURIComponent(booking.accessToken)}`}
              target="_blank"
              variant="outline"
              size="sm"
            >
              Customer ticket
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Booking">
          <dl>
            <Row label="Status">
              <BookingStatusBadge status={booking.status} />
              {booking.status === "conflict" && (
                <span className="mt-1 block text-[0.85rem] text-vermilion">
                  Paid after the hold expired and the seats were resold — refund in the Flitt portal.
                </span>
              )}
            </Row>
            <Row label="Guest">{booking.customerName}</Row>
            <Row label="Email">
              <a href={`mailto:${booking.customerEmail}`} className="hover:text-oxblood">
                {booking.customerEmail}
              </a>
            </Row>
            {booking.customerPhone && (
              <Row label="Phone">
                <a href={`tel:${booking.customerPhone}`} className="hover:text-oxblood">
                  {booking.customerPhone}
                </a>
              </Row>
            )}
            <Row label="Account">{booking.userId ? "Registered customer" : "Guest checkout"}</Row>
            <Row label="Booked">{formatCompactDateTime(booking.createdAt)}</Row>
            {booking.paidAt && <Row label="Paid">{formatCompactDateTime(booking.paidAt)}</Row>}
            {booking.checkedInAt && <Row label="Checked in">{formatCompactDateTime(booking.checkedInAt)}</Row>}
          </dl>
        </Panel>

        <Panel title="Seats & payment">
          <ul className="divide-y divide-ink/8">
            {booking.seats.map((s) => (
              <li key={s.seatId} className="flex items-center justify-between py-2.5 font-ui text-[0.95rem]">
                <span>
                  <span className="font-poster text-[1.4rem] text-oxblood">{s.label}</span>{" "}
                  <span className="text-ink-2">{SEAT_KIND_INFO[s.kind].label}</span>
                </span>
                <Price tetri={s.price} />
              </li>
            ))}
          </ul>
          <dl className="mt-4 border-t-2 border-ink/20 pt-2">
            <Row label="Total">
              <Price tetri={booking.amount} className="font-label" />
            </Row>
            <Row label="Flitt order">{booking.paymentOrderId ?? "—"}</Row>
            <Row label="Flitt payment">{booking.paymentId ?? "—"}</Row>
            <Row label="Flitt status">{booking.paymentStatus ?? "—"}</Row>
          </dl>
        </Panel>
      </div>

      <Panel title="Payment log" description="Every notification and status check received from Flitt." className="mt-8">
        {log.length ? (
          <div className="-mx-5 -my-5 overflow-x-auto">
            <table className="w-full min-w-[32rem]">
              <thead className="border-b border-ink/10">
                <tr>
                  <th className={th}>When</th>
                  <th className={th}>Source</th>
                  <th className={th}>Order status</th>
                  <th className={th}>Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {log.map((e) => (
                  <tr key={e.id}>
                    <td className={td}>{formatCompactDateTime(e.createdAt)}</td>
                    <td className={td}>{e.source}</td>
                    <td className={td}>{e.orderStatus ?? "—"}</td>
                    <td className={td}>{e.signatureValid ? "valid" : <span className="text-vermilion">invalid</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-ui text-[0.9rem] text-ink-3">Nothing received yet.</p>
        )}
      </Panel>
    </>
  );
}
