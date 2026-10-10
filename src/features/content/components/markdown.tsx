import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/** Renders admin-written Markdown. Raw HTML is not allowed (react-markdown default). */
export function Markdown({ source, className }: { source: string | null | undefined; className?: string }) {
  if (!source?.trim()) return null;
  return (
    <div className={cn("prose-omy", className)}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
