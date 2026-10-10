import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { InlineAction } from "@/features/admin/components/inline-action";
import { AdminPageHeader, EmptyState } from "@/features/admin/components/page-header";
import { td, th } from "@/features/admin/components/stat";
import { toggleEventPublished } from "@/features/events/actions";
import { listEventsAdmin } from "@/features/events/admin-queries";
import { EVENT_KIND_LABEL } from "@/features/events/labels";
import { formatCompactDateTime } from "@/lib/format";

export const metadata = { title: "Program" };

export default async function EventsAdminPage() {
  const events = await listEventsAdmin();

  return (
    <>
      <AdminPageHeader
        title="Program"
        description="Films and events. Open one to edit it and manage its screenings and prices."
        actions={
          <ButtonLink href="/admin/events/new" size="sm" arrow>
            New event
          </ButtonLink>
        }
      />

      {events.length ? (
        <div className="overflow-x-auto border border-ink/15 bg-[#f4ede1]">
          <table className="w-full min-w-[46rem]">
            <thead className="border-b border-ink/10">
              <tr>
                <th className={th}>Title</th>
                <th className={th}>Next screening</th>
                <th className={th}>Screenings</th>
                <th className={th}>Visibility</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-paper/60">
                  <td className={td}>
                    <Link href={`/admin/events/${e.id}`} className="font-poster text-[1.35rem] leading-none hover:text-oxblood">
                      {e.title}
                    </Link>
                    <span className="mt-1 block text-[0.82rem] text-ink-3">
                      {[EVENT_KIND_LABEL[e.kind], e.director, e.year].filter(Boolean).join(" · ")}
                    </span>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    {e.nextScreening ? formatCompactDateTime(e.nextScreening) : <span className="text-ink-3">—</span>}
                  </td>
                  <td className={td}>{e.screeningCount}</td>
                  <td className={td}>
                    {e.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="flex justify-end gap-1">
                      <InlineAction action={toggleEventPublished} fields={{ id: e.id }} variant="quiet">
                        {e.isPublished ? "Hide" : "Publish"}
                      </InlineAction>
                      <Link href={`/admin/events/${e.id}`} className="inline-flex h-8 items-center border border-ink/25 px-2.5 font-label text-[0.7rem] tracking-[0.08em] hover:border-ink">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No events yet. Create the first one.</EmptyState>
      )}
    </>
  );
}
