"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { ActionForm, FormField, FormMessage, SubmitButton } from "@/components/forms/action-form";
import { Input, Label, Textarea } from "@/components/ui/field";
import { ImageField } from "@/features/admin/components/image-field";
import type { Page, PageFact } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { savePage } from "../../actions";
import { Markdown } from "../markdown";

export function PageForm({ slug, page }: { slug: string; page: Page | null }) {
  const [body, setBody] = useState(page?.body ?? "");
  const [preview, setPreview] = useState(false);
  const [facts, setFacts] = useState<PageFact[]>(page?.facts ?? []);

  return (
    <ActionForm action={savePage} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
          <FormField name="eyebrow" label="Small label above">
            <Input id="eyebrow" name="eyebrow" defaultValue={page?.eyebrow ?? ""} />
          </FormField>
          <FormField name="title" label="Title *">
            <Input id="title" name="title" defaultValue={page?.title ?? ""} required />
          </FormField>
        </div>
        <FormField name="lead" label="Intro paragraph" hint="The large paragraph under the title.">
          <Textarea id="lead" name="lead" rows={3} defaultValue={page?.lead ?? ""} />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">Text</Label>
            <div className="flex font-label text-[0.68rem] tracking-[0.08em]">
              {["Write", "Preview"].map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPreview(i === 1)}
                  className={cn("px-2.5 py-1", preview === (i === 1) ? "bg-ink text-paper" : "text-ink-3 hover:text-ink")}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            id="body"
            name="body"
            rows={16}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={cn("font-mono text-[0.88rem]", preview && "hidden")}
          />
          {preview && (
            <div className="min-h-64 border border-ink/20 bg-paper p-5">
              <Markdown source={body} />
            </div>
          )}
          <p className="font-ui text-[0.82rem] text-ink-3">
            Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>[link](https://…)</code>, <code>- list</code>.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Numbers row</Label>
          <p className="font-ui text-[0.82rem] text-ink-3">Big figures shown across the page, e.g. “30 — seats”.</p>
          {facts.map((fact, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                name="factValue"
                value={fact.value}
                onChange={(e) => setFacts((f) => f.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                placeholder="30"
                className="w-24"
                aria-label="Figure"
              />
              <Input
                name="factLabel"
                value={fact.label}
                onChange={(e) => setFacts((f) => f.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                placeholder="seats"
                aria-label="Label"
              />
              <button
                type="button"
                onClick={() => setFacts((f) => f.filter((_, j) => j !== i))}
                aria-label="Remove"
                className="flex size-9 shrink-0 items-center justify-center text-ink-3 hover:text-vermilion"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {facts.length < 6 && (
            <button
              type="button"
              onClick={() => setFacts((f) => [...f, { value: "", label: "" }])}
              className="inline-flex h-8 w-fit items-center gap-1.5 border border-ink/25 px-2.5 font-label text-[0.7rem] tracking-[0.08em] hover:border-ink"
            >
              <Plus className="size-3.5" /> Add a figure
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ImageField name="imageUrl" label="Image" folder="pages" defaultValue={page?.imageUrl} />
        <FormField name="imageAlt" label="Image description" hint="Read by screen readers and shown as a caption.">
          <Input id="imageAlt" name="imageAlt" defaultValue={page?.imageAlt ?? ""} />
        </FormField>
        <FormField name="seoDescription" label="Search engine description">
          <Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={page?.seoDescription ?? ""} />
        </FormField>
        <FormMessage />
        <SubmitButton size="lg" arrow pendingLabel="Saving…">
          Save page
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
