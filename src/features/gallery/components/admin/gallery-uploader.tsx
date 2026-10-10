"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { uploadImage, type UploadedImage } from "@/features/admin/upload";
import { cn } from "@/lib/utils";
import { addGalleryImages } from "../../actions";

export function GalleryUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function upload(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setMessage(null);
    setProgress({ done: 0, total: images.length });
    const uploaded: (UploadedImage & { alt?: string })[] = [];
    const failed: string[] = [];
    for (const file of images) {
      try {
        const result = await uploadImage(file, "gallery");
        uploaded.push({ ...result, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
      } catch (error) {
        failed.push(error instanceof Error ? error.message : file.name);
      }
      setProgress((p) => p && { ...p, done: p.done + 1 });
    }
    if (uploaded.length) {
      const result = await addGalleryImages(uploaded);
      setMessage({ tone: result.status === "error" ? "error" : "ok", text: result.message ?? "" });
      router.refresh();
    }
    if (failed.length) setMessage({ tone: "error", text: failed[0] });
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    upload([...e.dataTransfer.files]);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-oxblood bg-oxblood/5" : "border-ink/25",
        )}
      >
        {progress ? (
          <>
            <Loader2 className="size-6 animate-spin text-ink-2" aria-hidden />
            <p className="font-ui text-[0.95rem]" role="status">
              Uploading {progress.done + 1 > progress.total ? progress.total : progress.done + 1} of {progress.total}…
            </p>
          </>
        ) : (
          <>
            <ImagePlus className="size-7 text-ink-3" strokeWidth={1.5} aria-hidden />
            <p className="font-ui text-[0.95rem] text-ink-2">Drop photos here, or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-10 items-center bg-ink px-4 font-label text-[0.78rem] tracking-[0.08em] text-paper hover:bg-ink-2"
            >
              Choose photos
            </button>
            <p className="font-ui text-[0.8rem] text-ink-3">Large photos are resized in your browser before upload.</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => upload([...(e.target.files ?? [])])}
        />
      </div>
      {message && (
        <p role="status" className={cn("mt-3 font-ui text-[0.9rem]", message.tone === "error" ? "text-vermilion" : "text-[#2f5536]")}>
          {message.text}
        </p>
      )}
    </div>
  );
}
