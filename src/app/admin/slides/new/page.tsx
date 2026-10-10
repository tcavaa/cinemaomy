import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { eventLinkOptions } from "@/features/slides/admin-queries";
import { SlideForm } from "@/features/slides/components/admin/slide-form";

export const metadata = { title: "New slide" };

export default async function NewSlidePage() {
  const links = await eventLinkOptions();
  return (
    <>
      <AdminPageHeader title="New slide" back={{ href: "/admin/slides", label: "Home slider" }} />
      <Panel>
        <SlideForm eventLinks={links} />
      </Panel>
    </>
  );
}
