import { notFound } from "next/navigation";
import { InlineAction } from "@/features/admin/components/inline-action";
import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { deleteSlide } from "@/features/slides/actions";
import { eventLinkOptions, getSlideAdmin } from "@/features/slides/admin-queries";
import { SlideForm } from "@/features/slides/components/admin/slide-form";

export const metadata = { title: "Edit slide" };

export default async function EditSlidePage({ params }: PageProps<"/admin/slides/[id]">) {
  const { id } = await params;
  const [slide, links] = await Promise.all([getSlideAdmin(id), eventLinkOptions()]);
  if (!slide) notFound();
  return (
    <>
      <AdminPageHeader
        title={slide.title}
        back={{ href: "/admin/slides", label: "Home slider" }}
        actions={
          <InlineAction action={deleteSlide} fields={{ id: slide.id, redirect: "1" }} variant="danger" confirm="Delete this slide?">
            Delete slide
          </InlineAction>
        }
      />
      <Panel>
        <SlideForm slide={slide} eventLinks={links} />
      </Panel>
    </>
  );
}
