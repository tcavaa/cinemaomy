"use client";

import { ActionForm, FormMessage, SubmitButton } from "@/components/forms/action-form";
import { Input } from "@/components/ui/field";
import { updateGalleryImage } from "../../actions";

export function GalleryItemForm({ id, alt, caption }: { id: string; alt: string | null; caption: string | null }) {
  return (
    <ActionForm action={updateGalleryImage} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <Input name="caption" defaultValue={caption ?? ""} placeholder="Caption (optional)" aria-label="Caption" className="h-9 text-[0.88rem]" />
      <Input name="alt" defaultValue={alt ?? ""} placeholder="Describe the photo" aria-label="Description" className="h-9 text-[0.88rem]" />
      <div className="flex items-center gap-3">
        <SubmitButton size="sm" variant="outline" pendingLabel="Saving…">
          Save
        </SubmitButton>
        <FormMessage className="text-[0.8rem]" />
      </div>
    </ActionForm>
  );
}
