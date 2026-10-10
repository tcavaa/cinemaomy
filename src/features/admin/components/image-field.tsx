"use client";

import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { useActionFormState } from "@/components/forms/action-form";
import { Input, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { uploadImage } from "../upload";

type Props = {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder: string;
  hint?: string;
  aspect?: string;
  required?: boolean;
};

/** Image input: upload to Supabase Storage or paste a URL. Submits the URL as `name`. */
export function ImageField({ name, label, defaultValue, folder, hint, aspect = "aspect-[16/9]", required }: Props) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasting, setPasting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { state } = useActionFormState();
  const fieldError = state.fieldErrors?.[name]?.[0];

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { url } = await uploadImage(file, folder);
      setValue(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${name}-url`}>
        {label}
        {required && <span className="text-oxblood"> *</span>}
      </Label>
      <input type="hidden" name={name} value={value} />

      <div className={cn("group relative w-full overflow-hidden border border-ink/20 bg-paper-2", aspect)}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary URLs
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 font-ui text-[0.9rem] text-ink-3 hover:text-ink"
          >
            <ImagePlus className="size-6" strokeWidth={1.5} aria-hidden />
            Upload an image
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/80">
            <Loader2 className="size-6 animate-spin text-ink-2" aria-label="Uploading" />
          </div>
        )}
        {value && !busy && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex size-8 items-center justify-center bg-ink/80 text-cream opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 border border-ink/30 px-2.5 font-label text-[0.7rem] tracking-[0.08em] hover:border-ink disabled:opacity-50"
        >
          <ImagePlus className="size-3.5" aria-hidden /> {value ? "Replace" : "Upload"}
        </button>
        <button
          type="button"
          onClick={() => setPasting((p) => !p)}
          className="inline-flex h-8 items-center gap-1.5 px-2 font-label text-[0.7rem] tracking-[0.08em] text-ink-3 hover:text-ink"
        >
          <Link2 className="size-3.5" aria-hidden /> Use a URL
        </button>
      </div>
      {pasting && (
        <Input
          id={`${name}-url`}
          value={value}
          onChange={(e) => setValue(e.target.value.trim())}
          placeholder="https://… or /images/…"
          className="h-9 text-[0.88rem]"
        />
      )}
      {(error || fieldError) && <p className="font-ui text-[0.85rem] text-vermilion">{error ?? fieldError}</p>}
      {hint && !error && !fieldError && <p className="font-ui text-[0.82rem] text-ink-3">{hint}</p>}
    </div>
  );
}
