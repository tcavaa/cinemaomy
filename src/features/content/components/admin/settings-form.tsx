"use client";

import type { ReactNode } from "react";
import { ActionForm, FormField, FormMessage, SubmitButton } from "@/components/forms/action-form";
import { Input, Textarea } from "@/components/ui/field";
import type { SiteSettings } from "@/lib/db/schema";
import { saveSettings } from "../../actions";

const lari = (tetri: number) => String(tetri / 100);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-ink/15 pt-6 first:border-0 first:pt-0">
      <legend className="mb-1 font-label text-[0.78rem] tracking-[0.1em] text-oxblood">{title}</legend>
      {children}
    </fieldset>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  return (
    <ActionForm action={saveSettings} className="flex max-w-4xl flex-col gap-8">
      <Section title="Cinema">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="name" label="Name *">
            <Input id="name" name="name" defaultValue={settings.name} required />
          </FormField>
          <FormField name="tagline" label="Tagline">
            <Input id="tagline" name="tagline" defaultValue={settings.tagline ?? ""} />
          </FormField>
        </div>
      </Section>

      <Section title="Address & contact">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField name="address" label="Street address" className="sm:col-span-3">
            <Input id="address" name="address" defaultValue={settings.address ?? ""} />
          </FormField>
          <FormField name="district" label="District">
            <Input id="district" name="district" defaultValue={settings.district ?? ""} />
          </FormField>
          <FormField name="city" label="City / postcode">
            <Input id="city" name="city" defaultValue={settings.city ?? ""} />
          </FormField>
          <FormField name="phone" label="Phone">
            <Input id="phone" name="phone" type="tel" defaultValue={settings.phone ?? ""} />
          </FormField>
          <FormField name="email" label="Email">
            <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} />
          </FormField>
          <FormField name="instagramUrl" label="Instagram link">
            <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
          </FormField>
          <FormField name="facebookUrl" label="Facebook link">
            <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
          </FormField>
          <FormField name="mapQuery" label="Map search" hint="What Google Maps should look up." className="sm:col-span-3">
            <Input id="mapQuery" name="mapQuery" defaultValue={settings.mapQuery ?? ""} />
          </FormField>
        </div>
        <FormField name="openingHours" label="Doors / opening hours">
          <Textarea id="openingHours" name="openingHours" rows={3} defaultValue={settings.openingHours ?? ""} />
        </FormField>
      </Section>

      <Section title="Tickets">
        <div className="grid gap-5 sm:grid-cols-4">
          <FormField name="priceArmchair" label="Armchair ₾" hint="Default for new screenings">
            <Input id="priceArmchair" name="priceArmchair" inputMode="decimal" defaultValue={lari(settings.defaultPrices.armchair)} />
          </FormField>
          <FormField name="priceLounge" label="Lounge chair ₾">
            <Input id="priceLounge" name="priceLounge" inputMode="decimal" defaultValue={lari(settings.defaultPrices.lounge)} />
          </FormField>
          <FormField name="priceSaucer" label="Saucer chair ₾">
            <Input id="priceSaucer" name="priceSaucer" inputMode="decimal" defaultValue={lari(settings.defaultPrices.saucer)} />
          </FormField>
          <FormField name="holdMinutes" label="Seat hold (minutes)" hint="Time to finish paying">
            <Input id="holdMinutes" name="holdMinutes" type="number" min={5} max={30} defaultValue={settings.holdMinutes} />
          </FormField>
        </div>
        <FormField name="bookingNote" label="Note on the booking page">
          <Textarea id="bookingNote" name="bookingNote" rows={3} defaultValue={settings.bookingNote ?? ""} />
        </FormField>
      </Section>

      <div className="flex items-center gap-4">
        <SubmitButton size="lg" arrow pendingLabel="Saving…">
          Save settings
        </SubmitButton>
        <FormMessage />
      </div>
    </ActionForm>
  );
}
