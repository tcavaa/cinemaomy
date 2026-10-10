import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { PageForm } from "@/features/content/components/admin/page-form";
import { getPage } from "@/features/content/queries";

export const metadata = { title: "Edit page" };

const TITLES: Record<string, string> = { about: "About", contact: "Contact" };

export default async function EditPageAdmin({ params }: PageProps<"/admin/pages/[slug]">) {
  const { slug } = await params;
  if (!TITLES[slug]) notFound();
  const page = await getPage(slug);

  return (
    <>
      <AdminPageHeader
        title={TITLES[slug]}
        back={{ href: "/admin/pages", label: "Pages" }}
        actions={
          <ButtonLink href={`/${slug}`} target="_blank" variant="outline" size="sm">
            View page
          </ButtonLink>
        }
      />
      <Panel>
        <PageForm slug={slug} page={page} />
      </Panel>
    </>
  );
}
