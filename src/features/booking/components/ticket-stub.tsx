import { MetaLine } from "@/components/brand/meta-line";
import { Wordmark } from "@/components/brand/wordmark";
import { Price } from "@/components/ui/price";
import type { BookedSeat } from "@/lib/db/enums";
import { formatDotDate, formatTime, formatWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SEAT_KIND_INFO } from "../seat-kinds";

type Props = {
  title: string;
  credit: string | null;
  year: number | null;
  startsAt: Date;
  seat: BookedSeat;
  reference: string;
  qrSvg: string;
  checkedIn?: boolean;
  /** Colour of the page behind the ticket, for the punched notches. */
  backdrop?: "paper" | "paper-2";
};

/** A single paper ticket with a tear-off stub, one per seat. */
export function TicketStub({ title, credit, year, startsAt, seat, reference, qrSvg, checkedIn, backdrop = "paper-2" }: Props) {
  const [row, number] = [seat.label.replace(/\d+$/, ""), seat.label.replace(/^\D+/, "")];
  const notch = backdrop === "paper" ? "before:bg-paper after:bg-paper" : "before:bg-paper-2 after:bg-paper-2";

  return (
    <article className="paper-fold grid bg-[#f4ede1] text-ink shadow-[0_24px_50px_-28px_rgb(40_20_10/0.55)] sm:grid-cols-[minmax(0,1fr)_13rem] print:shadow-none print:break-inside-avoid">
      <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <Wordmark className="h-5 text-ink" />
          <span className="font-label text-[0.7rem] tracking-[0.16em] text-oxblood">Admit one</span>
        </div>
        <h2 className="font-poster text-[clamp(2.2rem,5.5vw,3.4rem)] text-oxblood [text-wrap:balance]">{title}</h2>
        {(credit || year) && (
          <p className="-mt-2 flex items-baseline justify-between gap-4 font-credit text-[1rem] text-ink-2">
            <span>{credit}</span>
            {year && <span>({year})</span>}
          </p>
        )}
        <MetaLine
          value={[formatWeekday(startsAt), formatDotDate(startsAt), formatTime(startsAt)]}
          className="border-y border-ink/20 py-2.5 text-[0.66rem]"
        />
        <dl className="grid grid-cols-4 gap-3">
          {[
            ["Row", row],
            ["Seat", number],
            ["Chair", SEAT_KIND_INFO[seat.kind].label.replace(" chair", "")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-meta text-[0.55rem] tracking-[0.2em] text-ink-3">{label}</dt>
              <dd className="mt-1 font-label text-[1.05rem]">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="font-meta text-[0.55rem] tracking-[0.2em] text-ink-3">Price</dt>
            <dd className="mt-1 font-label text-[1.05rem]">
              <Price tetri={seat.price} />
            </dd>
          </div>
        </dl>
      </div>

      <div
        className={cn(
          "relative flex items-center gap-5 border-t-2 border-dashed border-ink/25 p-5 sm:flex-col sm:justify-center sm:gap-3 sm:border-t-0 sm:border-l-2 sm:p-6",
          "before:absolute before:size-6 before:rounded-full after:absolute after:size-6 after:rounded-full",
          "before:-left-3 before:-top-3 after:-right-3 after:-top-3 sm:after:-bottom-3 sm:after:-left-3 sm:after:right-auto sm:after:top-auto",
          notch,
        )}
      >
        <div
          className={cn("size-24 shrink-0 sm:size-32 [&_svg]:size-full", checkedIn && "opacity-25")}
          aria-label={`Ticket code ${reference}`}
          role="img"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className="sm:text-center">
          <p className="font-poster text-[2.6rem] leading-none text-ink">{seat.label}</p>
          <p className="mt-1.5 font-meta text-[0.6rem] tracking-[0.2em] text-ink-3">{reference}</p>
          {checkedIn && <p className="mt-2 font-label text-[0.7rem] text-oxblood">Checked in</p>}
        </div>
      </div>
    </article>
  );
}
