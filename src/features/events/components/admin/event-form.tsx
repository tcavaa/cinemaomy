"use client";

import { ActionForm, FormField, FormMessage, SubmitButton } from "@/components/forms/action-form";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/field";
import { ImageField } from "@/features/admin/components/image-field";
import { EVENT_KINDS } from "@/lib/db/enums";
import type { Event } from "@/lib/db/schema";
import { EVENT_KIND_LABEL } from "../../labels";
import { saveEvent } from "../../actions";

export function EventForm({ event }: { event?: Event }) {
  return (
    <ActionForm action={saveEvent} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <FormField name="title" label="Title *">
            <Input id="title" name="title" defaultValue={event?.title} required />
          </FormField>
          <FormField name="kind" label="Type">
            <Select id="kind" name="kind" defaultValue={event?.kind ?? "film"}>
              {EVENT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {EVENT_KIND_LABEL[k]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="slug" label="URL name" hint="Leave empty to generate it from the title.">
            <Input id="slug" name="slug" defaultValue={event?.slug} placeholder="the-lobster" />
          </FormField>
          <FormField name="tagline" label="Tagline" hint='Shown above the title, e.g. "Tbilisi premiere".'>
            <Input id="tagline" name="tagline" defaultValue={event?.tagline ?? ""} />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <FormField name="director" label="Director">
            <Input id="director" name="director" defaultValue={event?.director ?? ""} />
          </FormField>
          <FormField name="year" label="Year">
            <Input id="year" name="year" type="number" inputMode="numeric" defaultValue={event?.year ?? ""} />
          </FormField>
          <FormField name="runtimeMinutes" label="Running time (min)">
            <Input id="runtimeMinutes" name="runtimeMinutes" type="number" inputMode="numeric" defaultValue={event?.runtimeMinutes ?? ""} />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="country" label="Country">
            <Input id="country" name="country" defaultValue={event?.country ?? ""} />
          </FormField>
          <FormField name="originalTitle" label="Original title">
            <Input id="originalTitle" name="originalTitle" defaultValue={event?.originalTitle ?? ""} />
          </FormField>
          <FormField name="language" label="Language">
            <Input id="language" name="language" defaultValue={event?.language ?? ""} />
          </FormField>
          <FormField name="subtitles" label="Subtitles">
            <Input id="subtitles" name="subtitles" defaultValue={event?.subtitles ?? ""} placeholder="English, Georgian" />
          </FormField>
        </div>

        <FormField name="synopsis" label="Synopsis">
          <Textarea id="synopsis" name="synopsis" rows={6} defaultValue={event?.synopsis ?? ""} />
        </FormField>

        <FormField name="trailerUrl" label="Trailer link">
          <Input id="trailerUrl" name="trailerUrl" type="url" defaultValue={event?.trailerUrl ?? ""} placeholder="https://youtube.com/…" />
        </FormField>
      </div>

      <div className="flex flex-col gap-6">
        <ImageField
          name="imageUrl"
          label="Still (landscape)"
          folder="events"
          defaultValue={event?.imageUrl}
          hint="Wide frame from the film — used on the program and the film page."
        />
        <ImageField name="posterUrl" label="Poster (portrait)" folder="posters" aspect="aspect-[3/4]" defaultValue={event?.posterUrl} />
        <Checkbox name="isPublished" label="Published on the website" defaultChecked={event?.isPublished ?? true} />
        <FormMessage />
        <SubmitButton size="lg" arrow pendingLabel="Saving…">
          {event ? "Save changes" : "Create event"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
