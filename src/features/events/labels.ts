import type { EventKind } from "@/lib/db/enums";

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  film: "Film",
  premiere: "Premiere",
  special: "Special screening",
  music: "Music",
  talk: "Talk",
};

/** Filter groups on the program page. */
export const PROGRAM_FILTERS: { id: string; label: string; kinds: EventKind[] }[] = [
  { id: "all", label: "Everything", kinds: ["film", "premiere", "special", "music", "talk"] },
  { id: "films", label: "Films", kinds: ["film", "premiere"] },
  { id: "special", label: "Special nights", kinds: ["special", "music", "talk"] },
];

export function creditLine(event: { kind: EventKind; director: string | null; tagline?: string | null }) {
  if (event.director) return event.kind === "premiere" ? `A film by ${event.director}` : `Directed by ${event.director}`;
  return event.tagline ?? null;
}
