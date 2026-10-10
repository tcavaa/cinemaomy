"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Media } from "@/components/ui/media";

export type GalleryItem = {
  id: string;
  imageUrl: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

/** Masonry of photos; click to open a full-screen viewer (arrows, Esc, swipe). */
export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);

  const show = useCallback(
    (i: number) => setOpen(((i % images.length) + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open != null && !dialog.open) dialog.showModal();
    if (open == null && dialog.open) dialog.close();
  }, [open]);

  function onKeyDown(e: KeyboardEvent) {
    if (open == null) return;
    if (e.key === "ArrowRight") show(open + 1);
    if (e.key === "ArrowLeft") show(open - 1);
  }

  function onPointerUp(e: PointerEvent) {
    if (startX.current == null || open == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 50) show(open + (dx < 0 ? 1 : -1));
  }

  const current = open != null ? images[open] : null;

  return (
    <>
      <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {images.map((image, i) => (
          <li key={image.id} className="mb-5 break-inside-avoid">
            <button
              type="button"
              onClick={() => show(i)}
              className="group block w-full text-left"
              aria-label={`Open photo: ${image.alt ?? image.caption ?? `photo ${i + 1}`}`}
            >
              <span
                className="relative block w-full overflow-hidden bg-paper-3"
                style={{ aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : "4 / 5" }}
              >
                <Media
                  src={image.imageUrl}
                  alt={image.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] ease-(--ease-cinema) group-hover:scale-[1.03]"
                />
              </span>
              {image.caption && (
                <span className="mt-2 block font-meta text-[0.58rem] tracking-[0.2em] text-ink-3">{image.caption}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onKeyDown={onKeyDown}
        aria-label="Photo viewer"
        className="theme-dark m-0 h-dvh max-h-none w-screen max-w-none bg-velvet/97 p-0 text-cream backdrop:bg-velvet/80"
      >
        {current && (
          <div
            className="flex h-full flex-col"
            onPointerDown={(e) => (startX.current = e.clientX)}
            onPointerUp={onPointerUp}
          >
            <div className="flex items-center justify-between px-4 py-4 font-meta text-[0.62rem] sm:px-8">
              <span className="tabular">
                {String((open ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => setOpen(null)} className="flex h-10 items-center gap-2 font-label text-[0.8rem] tracking-[0.08em]">
                Close
                <svg aria-hidden viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 1l10 10M11 1L1 11" />
                </svg>
              </button>
            </div>
            <div className="relative flex-1">
              <Media key={current.id} src={current.imageUrl} alt={current.alt ?? ""} fill sizes="100vw" quality={90} className="animate-fade object-contain" />
              <button
                type="button"
                onClick={() => show((open ?? 0) - 1)}
                aria-label="Previous photo"
                className="absolute inset-y-0 left-0 hidden w-1/4 items-center justify-start pl-6 opacity-0 transition-opacity hover:opacity-100 sm:flex"
              >
                <span className="font-label text-[0.8rem]">← Prev</span>
              </button>
              <button
                type="button"
                onClick={() => show((open ?? 0) + 1)}
                aria-label="Next photo"
                className="absolute inset-y-0 right-0 hidden w-1/4 items-center justify-end pr-6 opacity-0 transition-opacity hover:opacity-100 sm:flex"
              >
                <span className="font-label text-[0.8rem]">Next →</span>
              </button>
            </div>
            <p className="min-h-14 px-4 py-4 text-center font-serif text-[1.05rem] text-cream/80 sm:px-8">
              {current.caption ?? current.alt}
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
