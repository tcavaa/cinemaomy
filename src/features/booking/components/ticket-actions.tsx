"use client";

import { ActionForm, FormMessage, SubmitButton } from "@/components/forms/action-form";
import { Button } from "@/components/ui/button";
import { claimTicket } from "../actions";

export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      Print
    </Button>
  );
}

export function ClaimTicketForm({ bookingId, accessToken }: { bookingId: string; accessToken: string }) {
  return (
    <ActionForm action={claimTicket} className="flex flex-wrap items-center gap-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="k" value={accessToken} />
      <SubmitButton size="sm" variant="ink" pendingLabel="Saving…">
        Save to my account
      </SubmitButton>
      <FormMessage />
    </ActionForm>
  );
}
