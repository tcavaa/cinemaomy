import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { NewSeatForm, SeatRow } from "@/features/booking/components/admin/seat-editor";
import { HallPlan } from "@/features/booking/components/hall-plan/hall-plan";
import { getHallSeats } from "@/features/booking/queries";

export const metadata = { title: "Hall & seats" };

export default async function HallAdminPage() {
  const seats = await getHallSeats();
  const rows = [...new Set(seats.map((s) => s.row))];
  const active = seats.filter((s) => s.isActive).length;

  return (
    <>
      <AdminPageHeader
        title="Hall & seats"
        description={`${active} seats in use. Switch a broken seat off to stop it being sold; change a seat's type to change its price group.`}
      />

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel title="Plan" description="Exactly what customers see. The screen is at the top; x runs 0–1000 left to right, y 0–900 from the screen.">
          <HallPlan seats={seats} tone="light" idPrefix="hall-admin" />
        </Panel>

        <Panel title="Seats">
          <p className="mb-3 grid grid-cols-[3.2rem_3.2rem_minmax(7rem,1fr)_4.5rem_4.5rem_4rem] gap-2 font-meta text-[0.52rem] tracking-[0.16em] text-ink-3">
            <span>Row</span>
            <span>No.</span>
            <span>Type</span>
            <span>X</span>
            <span>Y</span>
            <span>Turn</span>
          </p>
          <div className="flex flex-col gap-6">
            {rows.map((row) => (
              <section key={row} aria-label={`Row ${row}`}>
                <h3 className="mb-1 font-poster text-[1.6rem] text-oxblood">Row {row}</h3>
                <ul className="divide-y divide-ink/8">
                  {seats
                    .filter((s) => s.row === row)
                    .map((seat) => (
                      <SeatRow key={seat.id} seat={seat} />
                    ))}
                </ul>
              </section>
            ))}
            <section className="border-t-2 border-ink/20 pt-4">
              <h3 className="mb-2 font-label text-[0.78rem] tracking-[0.1em] text-oxblood">Add a seat</h3>
              <NewSeatForm />
            </section>
          </div>
        </Panel>
      </div>
    </>
  );
}
