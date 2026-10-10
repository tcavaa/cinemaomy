import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InlineAction } from "@/features/admin/components/inline-action";
import { AdminPageHeader, EmptyState, Panel } from "@/features/admin/components/page-header";
import { deleteGalleryImage, moveGalleryImage, toggleGalleryImage } from "@/features/gallery/actions";
import { listGalleryAdmin } from "@/features/gallery/admin-queries";
import { GalleryItemForm } from "@/features/gallery/components/admin/gallery-item-form";
import { GalleryUploader } from "@/features/gallery/components/admin/gallery-uploader";

export const metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  const images = await listGalleryAdmin();

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Photos for the gallery page. The second to sixth photos also appear on the home page."
      />

      <Panel title="Add photos" className="mb-8">
        <GalleryUploader />
      </Panel>

      {images.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {images.map((image, i) => (
            <li key={image.id} className="flex flex-col border border-ink/15 bg-[#f4ede1]">
              <div className="relative aspect-[4/3] bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={image.imageUrl} alt={image.alt ?? ""} className="size-full object-cover" />
                <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 font-label text-[0.7rem] text-cream">{i + 1}</span>
                {!image.isPublished && (
                  <span className="absolute right-2 top-2">
                    <Badge tone="ink">Hidden</Badge>
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3">
                <GalleryItemForm id={image.id} alt={image.alt} caption={image.caption} />
                <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-ink/10 pt-2">
                  <InlineAction action={moveGalleryImage} fields={{ id: image.id, direction: "up" }} variant="quiet" title="Move earlier">
                    <ArrowUp className="size-3.5" aria-hidden />
                  </InlineAction>
                  <InlineAction action={moveGalleryImage} fields={{ id: image.id, direction: "down" }} variant="quiet" title="Move later">
                    <ArrowDown className="size-3.5" aria-hidden />
                  </InlineAction>
                  <InlineAction action={toggleGalleryImage} fields={{ id: image.id }} variant="quiet">
                    {image.isPublished ? "Hide" : "Show"}
                  </InlineAction>
                  <span className="flex-1" />
                  <InlineAction action={deleteGalleryImage} fields={{ id: image.id }} variant="danger" confirm="Remove this photo from the gallery?">
                    Delete
                  </InlineAction>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No photos yet.</EmptyState>
      )}
    </>
  );
}
