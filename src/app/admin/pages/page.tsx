import Link from "next/link";
import { AdminPageHeader } from "@/features/admin/components/page-header";
import { getPage } from "@/features/content/queries";
import { formatCompactDateTime } from "@/lib/format";

export const metadata = { title: "Pages" };

const PAGES = [
  { slug: "about", label: "About", path: "/about" },
  { slug: "contact", label: "Contact", path: "/contact" },
];

export default async function PagesAdminPage() {
  const pages = await Promise.all(PAGES.map(async (p) => ({ ...p, page: await getPage(p.slug) })));
  return (
    <>
      <AdminPageHeader
        title="Pages"
        description="The text and pictures on About and Contact. Address, phone and hours live in Settings."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {pages.map(({ slug, label, path, page }) => (
          <li key={slug}>
            <Link href={`/admin/pages/${slug}`} className="flex flex-col border border-ink/15 bg-[#f4ede1] p-6 transition-colors hover:border-ink">
              <span className="font-meta text-[0.58rem] tracking-[0.2em] text-ink-3">{path}</span>
              <span className="mt-2 font-poster text-[2.4rem] leading-none">{label}</span>
              <span className="mt-2 font-ui text-[0.9rem] text-ink-2">{page?.title ?? "Not written yet"}</span>
              {page && <span className="mt-4 font-ui text-[0.8rem] text-ink-3">Updated {formatCompactDateTime(page.updatedAt)}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
