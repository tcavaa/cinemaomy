import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-ink/15 pb-6">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="font-label text-[0.72rem] tracking-[0.12em] text-ink-3 hover:text-oxblood">
            ← {back.label}
          </Link>
        )}
        <h1 className="mt-2 font-poster text-[clamp(2.4rem,5vw,3.6rem)] text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl font-ui text-[0.95rem] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Panel({ title, description, children, className }: { title?: ReactNode; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-ink/15 bg-[#f4ede1] ${className ?? ""}`}>
      {(title || description) && (
        <div className="border-b border-ink/10 px-5 py-4">
          {title && <h2 className="font-label text-[0.82rem] tracking-[0.1em] text-ink">{title}</h2>}
          {description && <p className="mt-1 font-ui text-[0.88rem] text-ink-3">{description}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-ink/25 p-8 text-center font-ui text-[0.95rem] text-ink-3">{children}</p>;
}
