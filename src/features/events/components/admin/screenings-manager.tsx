"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionForm, FormField, FormMessage, SubmitButton } from "@/components/forms/action-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Input, Select } from "@/components/ui/field";
import { Price } from "@/components/ui/price";
import { InlineAction } from "@/features/admin/components/inline-action";
import { SCREENING_STATUSES, type ScreeningStatus, type SeatPrices } from "@/lib/db/enums";
import { cn } from "@/lib/utils";
import { deleteScreening, saveScreening } from "../../actions";

export type AdminScreening = {
  id: string;
  date: string;
  time: string;
  label: string;
  note: string | null;
  prices: SeatPrices;
  status: ScreeningStatus;
  salesOpen: boolean;
  soldSeats: number;
  heldSeats: number;
  revenue: number;
  isPast: boolean;
};

const lari = (tetri: number) => String(tetri / 100);

function ScreeningForm({
  eventId,
  screening,
  defaults,
  onDone,
}: {
  eventId: string;
  screening?: AdminScreening;
  defaults: SeatPrices;
  onDone?: () => void;
}) {
  const prices = screening?.prices ?? defaults;
  const id = screening?.id ?? "new";
  return (
    <ActionForm action={saveScreening} resetOnSuccess={!screening} onSuccess={onDone} className="grid gap-4">
      <input type="hidden" name="eventId" value={eventId} />
      {screening && <input type="hidden" name="id" value={screening.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
        <FormField name="date" htmlFor={`date-${id}`} label="Date (Tbilisi)">
          <Input id={`date-${id}`} name="date" type="date" defaultValue={screening?.date} required />
        </FormField>
        <FormField name="time" htmlFor={`time-${id}`} label="Time">
          <Input id={`time-${id}`} name="time" type="time" step={300} defaultValue={screening?.time ?? "19:00"} required />
        </FormField>
        <FormField name="note" htmlFor={`note-${id}`} label="Note" hint='e.g. "Q&A with the director"'>
          <Input id={`note-${id}`} name="note" defaultValue={screening?.note ?? ""} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_1fr]">
        <FormField name="priceArmchair" htmlFor={`pa-${id}`} label="Armchair ₾">
          <Input id={`pa-${id}`} name="priceArmchair" inputMode="decimal" defaultValue={lari(prices.armchair)} required />
        </FormField>
        <FormField name="priceLounge" htmlFor={`pl-${id}`} label="Lounge ₾">
          <Input id={`pl-${id}`} name="priceLounge" inputMode="decimal" defaultValue={lari(prices.lounge)} required />
        </FormField>
        <FormField name="priceSaucer" htmlFor={`ps-${id}`} label="Saucer ₾">
          <Input id={`ps-${id}`} name="priceSaucer" inputMode="decimal" defaultValue={lari(prices.saucer)} required />
        </FormField>
        <FormField name="status" htmlFor={`st-${id}`} label="Status">
          <Select id={`st-${id}`} name="status" defaultValue={screening?.status ?? "scheduled"}>
            {SCREENING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "scheduled" ? "Scheduled" : "Cancelled"}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Checkbox name="salesOpen" label="Ticket sales open" defaultChecked={screening?.salesOpen ?? true} />
        <div className="flex items-center gap-3">
          <FormMessage />
          <SubmitButton variant={screening ? "ink" : "primary"} pendingLabel="Saving…">
            {screening ? "Save screening" : "Add screening"}
          </SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}

export function ScreeningsManager({
  eventId,
  screenings,
  defaults,
  capacity,
}: {
  eventId: string;
  screenings: AdminScreening[];
  defaults: SeatPrices;
  capacity: number;
}) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {screenings.length > 0 && (
        <ul className="flex flex-col divide-y divide-ink/10 border-y border-ink/15">
          {screenings.map((s) => (
            <li key={s.id} className={cn("py-4", s.isPast && editing !== s.id && "opacity-60")}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="min-w-48">
                  <p className="font-label text-[1rem] tracking-[0.04em]">{s.label}</p>
                  {s.note && <p className="font-ui text-[0.85rem] text-ink-3">{s.note}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {s.status === "cancelled" && <Badge tone="vermilion">Cancelled</Badge>}
                  {!s.salesOpen && s.status !== "cancelled" && <Badge>Sales closed</Badge>}
                  {s.isPast && <Badge>Past</Badge>}
                </div>
                <p className="font-ui text-[0.9rem] text-ink-2">
                  <span className="font-label text-ink">{s.soldSeats}</span>/{capacity} sold
                  {s.heldSeats > 0 && <span className="text-ink-3"> · {s.heldSeats} on hold</span>} ·{" "}
                  <Price tetri={s.revenue} className="text-ink" />
                </p>
                <div className="ml-auto flex items-center gap-1">
                  <Link
                    href={`/admin/screenings/${s.id}`}
                    className="inline-flex h-8 items-center px-2.5 font-label text-[0.7rem] tracking-[0.08em] text-oxblood hover:bg-ink/6"
                  >
                    Seats & guests
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditing(editing === s.id ? null : s.id)}
                    className="inline-flex h-8 items-center px-2.5 font-label text-[0.7rem] tracking-[0.08em] hover:bg-ink/6"
                  >
                    {editing === s.id ? "Close" : "Edit"}
                  </button>
                  <InlineAction
                    action={deleteScreening}
                    fields={{ id: s.id }}
                    variant="danger"
                    confirm="Delete this screening? This cannot be undone."
                  >
                    Delete
                  </InlineAction>
                </div>
              </div>
              {editing === s.id && (
                <div className="mt-4 border border-ink/15 bg-paper p-4">
                  <ScreeningForm eventId={eventId} screening={s} defaults={defaults} onDone={() => setEditing(null)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div>
        <h3 className="mb-3 font-label text-[0.78rem] tracking-[0.1em] text-oxblood">Add a screening</h3>
        <ScreeningForm eventId={eventId} defaults={defaults} />
      </div>
    </div>
  );
}
