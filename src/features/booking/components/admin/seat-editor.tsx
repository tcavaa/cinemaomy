"use client";

import { ActionForm, FormMessage, SubmitButton, useActionFormState } from "@/components/forms/action-form";
import { Input, Select } from "@/components/ui/field";
import { InlineAction } from "@/features/admin/components/inline-action";
import { SEAT_KINDS } from "@/lib/db/enums";
import { cn } from "@/lib/utils";
import { deleteSeat, saveSeat } from "../../hall-actions";
import { SEAT_KIND_INFO } from "../../seat-kinds";
import type { HallSeat } from "../../types";

function NumberCell({ name, value, label, className }: { name: string; value?: number; label: string; className?: string }) {
  const { state } = useActionFormState();
  return (
    <Input
      name={name}
      type="number"
      step="any"
      defaultValue={value}
      aria-label={label}
      title={label}
      aria-invalid={Boolean(state.fieldErrors?.[name]) || undefined}
      className={cn("h-9 px-2 text-[0.88rem]", className)}
      required
    />
  );
}

function SeatFields({ seat }: { seat?: HallSeat }) {
  return (
    <>
      {seat && <input type="hidden" name="id" value={seat.id} />}
      <div className="grid grid-cols-[3.2rem_3.2rem_minmax(7rem,1fr)_4.5rem_4.5rem_4rem] items-center gap-2">
        <Input name="rowLabel" defaultValue={seat?.row ?? ""} aria-label="Row" title="Row" className="h-9 px-2 text-[0.88rem] uppercase" required />
        <NumberCell name="number" value={seat?.number} label="Seat number" />
        <Select name="kind" defaultValue={seat?.kind ?? "armchair"} aria-label="Seat type" className="h-9 text-[0.88rem]">
          {SEAT_KINDS.map((k) => (
            <option key={k} value={k}>
              {SEAT_KIND_INFO[k].label}
            </option>
          ))}
        </Select>
        <NumberCell name="x" value={seat?.x} label="Position across (0–1000)" />
        <NumberCell name="y" value={seat?.y} label="Position from the screen (0–900)" />
        <NumberCell name="rotation" value={seat?.rotation ?? 0} label="Rotation in degrees" />
      </div>
    </>
  );
}

export function SeatRow({ seat }: { seat: HallSeat }) {
  return (
    <li className="flex flex-wrap items-center gap-3 py-2">
      <ActionForm action={saveSeat} className="flex flex-wrap items-center gap-3">
        <SeatFields seat={seat} />
        <label className="flex items-center gap-1.5 font-ui text-[0.85rem]">
          <input type="checkbox" name="isActive" defaultChecked={seat.isActive} className="size-4 accent-oxblood" />
          In use
        </label>
        <SubmitButton size="sm" variant="outline" pendingLabel="…">
          Save
        </SubmitButton>
        <FormMessage className="py-0 text-[0.8rem]" />
      </ActionForm>
      <InlineAction action={deleteSeat} fields={{ id: String(seat.id) }} variant="danger" confirm={`Delete seat ${seat.row}${seat.number}?`}>
        Delete
      </InlineAction>
    </li>
  );
}

export function NewSeatForm() {
  return (
    <ActionForm action={saveSeat} resetOnSuccess className="flex flex-wrap items-center gap-3">
      <SeatFields />
      <input type="hidden" name="isActive" value="on" />
      <SubmitButton size="sm" pendingLabel="Adding…">
        Add seat
      </SubmitButton>
      <FormMessage className="py-0 text-[0.8rem]" />
    </ActionForm>
  );
}
