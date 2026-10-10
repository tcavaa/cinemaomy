import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { EventForm } from "@/features/events/components/admin/event-form";

export const metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <>
      <AdminPageHeader
        title="New event"
        description="Add the film or event first — you can add screening dates and prices right after."
        back={{ href: "/admin/events", label: "Program" }}
      />
      <Panel>
        <EventForm />
      </Panel>
    </>
  );
}
