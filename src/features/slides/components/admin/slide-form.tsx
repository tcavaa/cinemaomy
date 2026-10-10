"use client";

import { useState } from "react";
import { ActionForm, FormField, FormMessage, SubmitButton } from "@/components/forms/action-form";
import { Checkbox, Input, Label, Select } from "@/components/ui/field";
import { ImageField } from "@/features/admin/components/image-field";
import { SLIDE_THEMES, type SlideTheme } from "@/lib/db/enums";
import type { Slide } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { saveSlide } from "../../actions";

const THEME_LABEL: Record<SlideTheme, string> = {
  paper: "Paper — cream with red type",
  dark: "Velvet — dark with cream type",
  red: "Vermilion — red with cream type",
};

const PREVIEW: Record<SlideTheme, { bg: string; title: string; text: string }> = {
  paper: { bg: "bg-paper", title: "text-oxblood", text: "text-oxblood" },
  dark: { bg: "bg-velvet", title: "text-cream", text: "text-cream/80" },
  red: { bg: "bg-vermilion", title: "text-cream", text: "text-ink" },
};

export function SlideForm({ slide, eventLinks }: { slide?: Slide; eventLinks: { href: string; label: string }[] }) {
  const [v, setV] = useState({
    eyebrow: slide?.eyebrow ?? "",
    title: slide?.title ?? "",
    subtitle: slide?.subtitle ?? "",
    aside: slide?.aside ?? "",
    meta: slide?.meta ?? "",
    theme: (slide?.theme ?? "paper") as SlideTheme,
    linkUrl: slide?.linkUrl ?? "",
  });
  const set = (key: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [key]: e.target.value }));
  const p = PREVIEW[v.theme];

  return (
    <ActionForm action={saveSlide} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {slide && <input type="hidden" name="id" value={slide.id} />}

      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="eyebrow" label="Small label" hint='"Now showing", "Tbilisi premiere"…'>
            <Input id="eyebrow" name="eyebrow" value={v.eyebrow} onChange={set("eyebrow")} />
          </FormField>
          <FormField name="theme" label="Colour">
            <Select id="theme" name="theme" value={v.theme} onChange={set("theme")}>
              {SLIDE_THEMES.map((t) => (
                <option key={t} value={t}>
                  {THEME_LABEL[t]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField name="title" label="Big title *">
          <Input id="title" name="title" value={v.title} onChange={set("title")} required />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <FormField name="subtitle" label="Line under the title" hint='"Directed by …"'>
            <Input id="subtitle" name="subtitle" value={v.subtitle} onChange={set("subtitle")} />
          </FormField>
          <FormField name="aside" label="Right side" hint='"(2015)"'>
            <Input id="aside" name="aside" value={v.aside} onChange={set("aside")} />
          </FormField>
        </div>
        <FormField name="meta" label="Bottom line" hint='Parts separated by "·", e.g. "Saturday · 10.10 · 21:00".'>
          <Input id="meta" name="meta" value={v.meta} onChange={set("meta")} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
          <FormField name="ctaLabel" label="Button text">
            <Input id="ctaLabel" name="ctaLabel" defaultValue={slide?.ctaLabel ?? "Choose seats"} />
          </FormField>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkUrl">Button link</Label>
            <Input id="linkUrl" name="linkUrl" value={v.linkUrl} onChange={set("linkUrl")} list="slide-links" placeholder="/program/the-lobster" />
            <datalist id="slide-links">
              {eventLinks.map((l) => (
                <option key={l.href} value={l.href}>
                  {l.label}
                </option>
              ))}
            </datalist>
            <p className="font-ui text-[0.82rem] text-ink-3">Start typing to pick a film, or paste any link.</p>
          </div>
        </div>
        <ImageField name="imageUrl" label="Picture" folder="slides" defaultValue={slide?.imageUrl} required hint="Wide, at least 2000 px." />
        <FormField name="imageAlt" label="Picture description">
          <Input id="imageAlt" name="imageAlt" defaultValue={slide?.imageAlt ?? ""} />
        </FormField>
        <Checkbox name="isPublished" label="Show on the home page" defaultChecked={slide?.isPublished ?? true} />
        <FormMessage />
        <SubmitButton size="lg" arrow pendingLabel="Saving…" className="self-start">
          {slide ? "Save slide" : "Add slide"}
        </SubmitButton>
      </div>

      <div className="xl:sticky xl:top-8 xl:self-start">
        <p className="mb-2 font-meta text-[0.58rem] tracking-[0.2em] text-ink-3">Preview</p>
        <div className={cn("p-5 transition-colors", p.bg)}>
          <p className={cn("font-meta text-[0.5rem] opacity-70", p.text)}>{v.eyebrow || " "}</p>
          <p className={cn("mt-2 font-poster text-[2.6rem] [text-wrap:balance]", p.title)}>{v.title || "Title"}</p>
          <div className={cn("mt-3 flex justify-between font-credit text-[0.85rem]", p.text)}>
            <span>{v.subtitle}</span>
            <span>{v.aside}</span>
          </div>
          <div className="mt-3 aspect-[2.6/1] bg-ink/70" />
          <p className={cn("mt-3 flex justify-between font-meta text-[0.5rem]", p.text)}>
            {(v.meta || "Day · Date · Time").split("·").map((part, i) => (
              <span key={i}>{part.trim()}</span>
            ))}
          </p>
        </div>
      </div>
    </ActionForm>
  );
}
