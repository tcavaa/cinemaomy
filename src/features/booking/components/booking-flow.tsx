"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Price } from "@/components/ui/price";
import { FlittCheckout } from "@/features/payments/components/flitt-checkout";
import { cn } from "@/lib/utils";
import { MAX_SEATS_PER_BOOKING, SEAT_KIND_INFO, seatLabel } from "../seat-kinds";
import type { BookingScreening, HallSeat } from "../types";
import { HoldTimer } from "./hold-timer";
import { SeatPicker } from "./seat-picker";

type Step = "seats" | "details" | "payment";

type Reservation = {
  bookingId: string;
  reference: string;
  accessToken: string;
  amount: number;
  expiresAt: string;
  paymentToken: string;
};

type Customer = { name: string; email: string; phone: string };

type Props = {
  screening: BookingScreening;
  seats: HallSeat[];
  initialTaken: number[];
  user: { name: string | null; email: string; phone: string | null } | null;
  bookingNote: string | null;
};

const POLL_MS = 15_000;

export function BookingFlow({ screening, seats, initialTaken, user, bookingNote }: Props) {
  const router = useRouter();
  const [taken, setTaken] = useState(initialTaken);
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<Step>("seats");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [paymentState, setPaymentState] = useState<"open" | "verifying" | "expired">("open");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const panelRef = useRef<HTMLDivElement>(null);

  const seatById = useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats]);
  const selectedSeats = selected.map((id) => seatById.get(id)!).filter(Boolean);
  const total = selectedSeats.reduce((sum, s) => sum + screening.prices[s.kind], 0);

  // ── Live availability ──────────────────────────────────────────────────────
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  });

  const refreshTaken = useCallback(async () => {
    const res = await fetch(`/api/screenings/${screening.id}/seats`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const { taken: latest } = (await res.json()) as { taken: number[] };
    setTaken(latest);
    const lost = selectedRef.current.filter((id) => latest.includes(id));
    if (!lost.length) return;
    setSelected((current) => current.filter((id) => !latest.includes(id)));
    const labels = lost.map((id) => seatById.get(id)).map((s) => s && seatLabel(s.row, s.number));
    setNotice(`${labels.join(", ")} ${lost.length === 1 ? "was" : "were"} just taken by someone else.`);
  }, [screening.id, seatById]);

  useEffect(() => {
    if (step === "payment") return;
    const id = window.setInterval(refreshTaken, POLL_MS);
    const onFocus = () => refreshTaken();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [step, refreshTaken]);

  // ── Seats ──────────────────────────────────────────────────────────────────
  function toggleSeat(seat: HallSeat) {
    setNotice(null);
    if (selected.includes(seat.id)) {
      setSelected(selected.filter((id) => id !== seat.id));
    } else if (selected.length >= MAX_SEATS_PER_BOOKING) {
      setNotice(`You can book up to ${MAX_SEATS_PER_BOOKING} seats at a time.`);
    } else {
      setSelected([...selected, seat.id]);
    }
  }

  function goToDetails() {
    if (!selected.length) return;
    setStep("details");
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  // ── Hold + payment ─────────────────────────────────────────────────────────
  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screeningId: screening.id, seatIds: selected, ...customer }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setReservation(body as Reservation);
        setPaymentState("open");
        setPaymentError(null);
        setStep("payment");
        requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        return;
      }
      const error = (body.error ?? {}) as { code?: string; message?: string; seatIds?: number[]; fields?: Record<string, string[]> };
      if (error.code === "seats_taken" && error.seatIds?.length) {
        const lost = error.seatIds;
        setTaken((t) => [...new Set([...t, ...lost])]);
        setSelected((s) => s.filter((id) => !lost.includes(id)));
        setStep("seats");
      }
      if (error.fields) setFieldErrors(error.fields);
      setNotice(error.message ?? "Something went wrong. Please try again.");
    } catch {
      setNotice("We couldn't reach the box office. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onPaid() {
    if (!reservation) return;
    setPaymentState("verifying");
    await fetch(`/api/bookings/${reservation.bookingId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ k: reservation.accessToken }),
    }).catch(() => null);
    router.push(`/tickets/${reservation.bookingId}?k=${encodeURIComponent(reservation.accessToken)}`);
  }

  async function abandonHold(nextStep: Step = "seats") {
    if (reservation) {
      const { bookingId, accessToken } = reservation;
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k: accessToken }),
      }).catch(() => null);
      const data = res?.ok ? ((await res.json()) as { status?: string }) : null;
      // The payment may have gone through in the meantime.
      if (data?.status === "paid") {
        router.push(`/tickets/${bookingId}?k=${encodeURIComponent(accessToken)}`);
        return;
      }
    }
    setReservation(null);
    setStep(nextStep);
    refreshTaken();
  }

  const locked = step === "payment";
  const stepIndex = { seats: 0, details: 1, payment: 2 }[step];

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_430px]">
      <section aria-label="Choose your seats" className={cn("min-w-0 transition-opacity", locked && "opacity-60")}>
        <SeatPicker
          seats={seats}
          taken={taken}
          selected={selected}
          prices={screening.prices}
          onToggle={toggleSeat}
          locked={locked}
        />
      </section>

      <div ref={panelRef} className="min-w-0 scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
        <div className="punched-top bg-paper text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]">
          <ol className="grid grid-cols-3 border-b border-ink/15 font-label text-[0.7rem] tracking-[0.1em]">
            {["Seats", "Details", "Payment"].map((label, i) => (
              <li
                key={label}
                aria-current={i === stepIndex ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 px-4 py-3",
                  i === stepIndex ? "text-oxblood" : i < stepIndex ? "text-ink" : "text-ink-3/60",
                  i > 0 && "border-l border-ink/10",
                )}
              >
                <span className="font-meta text-[0.55rem] tracking-[0.15em]">0{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <SelectedSeats
              seats={selectedSeats}
              prices={screening.prices}
              editable={step === "seats"}
              onRemove={toggleSeat}
            />

            <div className="flex items-baseline justify-between border-t border-dashed border-ink/25 pt-4">
              <span className="font-label text-[0.78rem] tracking-[0.1em] text-ink-2">Total</span>
              <Price tetri={reservation?.amount ?? total} className="font-poster text-[2.4rem] text-ink" />
            </div>

            {notice && (
              <p role="alert" className="border-l-2 border-vermilion pl-3 font-ui text-[0.92rem] text-vermilion">
                {notice}
              </p>
            )}

            {step === "seats" && (
              <>
                <Button size="lg" arrow disabled={!selected.length} onClick={goToDetails} className="w-full">
                  {selected.length ? "Continue" : "Choose your seats"}
                </Button>
                {bookingNote && <p className="font-ui text-[0.85rem] leading-snug text-ink-3">{bookingNote}</p>}
              </>
            )}

            {step === "details" && (
              <form method="post" onSubmit={submitDetails} noValidate className="flex flex-col gap-4">
                <Field label="Name" htmlFor="name" error={fieldErrors.name}>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                  />
                </Field>
                <Field label="Email" htmlFor="email" error={fieldErrors.email} hint="Your ticket link is shown here and kept with your booking.">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                  />
                </Field>
                <Field label="Phone (optional)" htmlFor="phone" error={fieldErrors.phone}>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                  />
                </Field>
                {!user && (
                  <p className="font-ui text-[0.85rem] text-ink-3">
                    <Link href={`/login?next=/book/${screening.id}`} className="text-oxblood underline underline-offset-3">
                      Sign in
                    </Link>{" "}
                    to keep your tickets in your account — or continue as a guest.
                  </p>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("seats")} disabled={busy}>
                    Back
                  </Button>
                  <Button type="submit" size="md" arrow disabled={busy} className="flex-1">
                    {busy ? "Holding your seats…" : "Go to payment"}
                  </Button>
                </div>
              </form>
            )}

            {step === "payment" && reservation && (
              <div className="flex flex-col gap-4">
                {paymentState !== "expired" && (
                  <HoldTimer
                    expiresAt={reservation.expiresAt}
                    onExpire={() => setPaymentState("expired")}
                    className="border-y border-ink/15 py-2.5 text-ink-2"
                  />
                )}

                {paymentState === "open" && (
                  <>
                    <FlittCheckout
                      token={reservation.paymentToken}
                      onSuccess={onPaid}
                      onError={(message) => setPaymentError(message)}
                    />
                    {paymentError && (
                      <p role="alert" className="font-ui text-[0.9rem] text-vermilion">
                        {paymentError} You can try again while your seats are held.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => abandonHold("seats")}
                      className="self-start font-ui text-[0.88rem] text-ink-3 underline underline-offset-3 hover:text-ink"
                    >
                      Change seats
                    </button>
                  </>
                )}

                {paymentState === "verifying" && (
                  <p role="status" className="py-10 text-center font-meta text-[0.7rem] text-ink-2">
                    Confirming your payment…
                  </p>
                )}

                {paymentState === "expired" && (
                  <div className="flex flex-col gap-4 py-4">
                    <p className="font-ui text-[0.95rem]">
                      Your hold ran out, so the seats went back on sale. If they are still free you can pick them again.
                    </p>
                    <Button arrow onClick={() => abandonHold("seats")}>
                      Choose seats again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {step === "seats" && selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream/15 bg-velvet-2/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div className="text-cream">
              <p className="font-label text-[0.8rem] tracking-[0.08em]">
                {selected.length} {selected.length === 1 ? "seat" : "seats"} ·{" "}
                <Price tetri={total} />
              </p>
              <p className="font-ui text-[0.8rem] text-smoke">
                {selectedSeats.map((s) => seatLabel(s.row, s.number)).join(", ")}
              </p>
            </div>
            <Button variant="cream" arrow onClick={goToDetails}>
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedSeats({
  seats,
  prices,
  editable,
  onRemove,
}: {
  seats: HallSeat[];
  prices: BookingScreening["prices"];
  editable: boolean;
  onRemove: (seat: HallSeat) => void;
}) {
  if (!seats.length) {
    return (
      <p className="font-ui text-[0.95rem] leading-snug text-ink-2">
        Pick seats on the plan. Each one shows its price and whether it is still free.
      </p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-ink/10">
      {seats.map((seat) => (
        <li key={seat.id} className="flex items-center gap-3 py-2.5">
          <span className="w-12 font-poster text-[1.6rem] text-oxblood">{seatLabel(seat.row, seat.number)}</span>
          <span className="flex-1 font-ui text-[0.92rem] text-ink-2">{SEAT_KIND_INFO[seat.kind].label}</span>
          <Price tetri={prices[seat.kind]} className="font-label text-[0.95rem]" />
          {editable && (
            <button
              type="button"
              onClick={() => onRemove(seat)}
              aria-label={`Remove seat ${seatLabel(seat.row, seat.number)}`}
              className="-mr-1 flex size-8 items-center justify-center text-ink-3 hover:text-vermilion"
            >
              <svg aria-hidden viewBox="0 0 12 12" className="size-2.5" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
