import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { InlineAction } from "@/features/admin/components/inline-action";
import { AdminPageHeader, EmptyState } from "@/features/admin/components/page-header";
import { deleteSlide, moveSlide, toggleSlide } from "@/features/slides/actions";
import { listSlidesAdmin } from "@/features/slides/admin-queries";

export const metadata = { title: "Home slider" };

const THEME_SWATCH = { paper: "bg-paper border border-ink/20", dark: "bg-velvet", red: "bg-vermilion" } as const;

export default async function SlidesAdminPage() {
  const slides = await listSlidesAdmin();

  return (
    <>
      <AdminPageHeader
        title="Home slider"
        description="The big posters at the top of the home page, shown in this order."
        actions={
          <ButtonLink href="/admin/slides/new" size="sm" arrow>
            New slide
          </ButtonLink>
        }
      />

      {slides.length ? (
        <ol className="flex flex-col gap-3">
          {slides.map((slide, i) => (
            <li key={slide.id} className="flex flex-wrap items-center gap-4 border border-ink/15 bg-[#f4ede1] p-3 pr-4">
              <span className="w-6 text-center font-label text-[0.9rem] text-ink-3">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
              <img src={slide.imageUrl} alt="" className="h-16 w-28 object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/slides/${slide.id}`} className="font-poster text-[1.5rem] leading-none hover:text-oxblood">
                  {slide.title}
                </Link>
                <p className="mt-1 flex items-center gap-2 font-ui text-[0.85rem] text-ink-3">
                  <span className={`inline-block size-3 ${THEME_SWATCH[slide.theme]}`} aria-hidden />
                  {[slide.eyebrow, slide.meta].filter(Boolean).join(" · ")}
                </p>
              </div>
              {slide.isPublished ? <Badge tone="green">Visible</Badge> : <Badge>Hidden</Badge>}
              <div className="flex items-center gap-1">
                <InlineAction action={moveSlide} fields={{ id: slide.id, direction: "up" }} variant="quiet" title="Move up">
                  <ArrowUp className="size-3.5" aria-hidden />
                </InlineAction>
                <InlineAction action={moveSlide} fields={{ id: slide.id, direction: "down" }} variant="quiet" title="Move down">
                  <ArrowDown className="size-3.5" aria-hidden />
                </InlineAction>
                <InlineAction action={toggleSlide} fields={{ id: slide.id }} variant="quiet">
                  {slide.isPublished ? "Hide" : "Show"}
                </InlineAction>
                <Link href={`/admin/slides/${slide.id}`} className="inline-flex h-8 items-center border border-ink/25 px-2.5 font-label text-[0.7rem] tracking-[0.08em] hover:border-ink">
                  Edit
                </Link>
                <InlineAction action={deleteSlide} fields={{ id: slide.id }} variant="danger" confirm="Delete this slide?">
                  Delete
                </InlineAction>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState>No slides yet — the home page starts with the weekly program.</EmptyState>
      )}
    </>
  );
}
