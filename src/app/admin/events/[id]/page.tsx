import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { InlineAction } from "@/features/admin/components/inline-action";
import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { getHallSeats } from "@/features/booking/queries";
import { getSiteSettings } from "@/features/content/queries";
import { deleteEvent } from "@/features/events/actions";
import { getEventAdmin } from "@/features/events/admin-queries";
import { EventForm } from "@/features/events/components/admin/event-form";
import { ScreeningsManager, type AdminScreening } from "@/features/events/components/admin/screenings-manager";
import { formatCompactDateTime, toLocalInputs } from "@/lib/format";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params, searchParams }: PageProps<"/admin/events/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [data, settings, seats] = await Promise.all([getEventAdmin(id), getSiteSettings(), getHallSeats()]);
  if (!data) notFound();
  const { event } = data;

  const screenings: AdminScreening[] = data.screenings.map((s) => ({
    ...toLocalInputs(s.startsAt),
    id: s.id,
    label: formatCompactDateTime(s.startsAt),
    note: s.note,
    prices: s.prices,
    status: s.status,
    salesOpen: s.salesOpen,
    soldSeats: s.soldSeats,
    heldSeats: s.heldSeats,
    revenue: s.revenue,
    isPast: s.isPast,
  }));

  return (
    <>
      <AdminPageHeader
        title={event.title}
        back={{ href: "/admin/events", label: "Program" }}
        actions={
          <>
            <ButtonLink href={`/program/${event.slug}`} target="_blank" variant="outline" size="sm">
              View on site
            </ButtonLink>
            <InlineAction
              action={deleteEvent}
              fields={{ id: event.id }}
              variant="danger"
              confirm={`Delete “${event.title}” and all its screenings? This cannot be undone.`}
            >
              Delete event
            </InlineAction>
          </>
        }
      />

      {query.created && (
        <p role="status" className="mb-6 border-l-2 border-[#3d6b45] pl-3 font-ui text-[0.95rem] text-[#2f5536]">
          Event created. Now add its screenings below.
        </p>
      )}

      <div className="flex flex-col gap-8">
        <Panel title="Screenings & prices" description="Times are Tbilisi time. Prices are per seat type.">
          <ScreeningsManager
            eventId={event.id}
            screenings={screenings}
            defaults={settings.defaultPrices}
            capacity={seats.filter((s) => s.isActive).length}
          />
        </Panel>
        <Panel title="Details">
          <EventForm event={event} />
        </Panel>
      </div>
    </>
  );
}
