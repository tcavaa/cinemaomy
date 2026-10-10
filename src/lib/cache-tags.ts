// Cache tags shared by "use cache" readers and the mutations that invalidate them.
export const tags = {
  settings: "settings",
  page: (slug: string) => `page:${slug}`,
  slides: "slides",
  gallery: "gallery",
  /** Anything listing screenings or seat availability counts. */
  program: "program",
  event: (slug: string) => `event:${slug}`,
  hall: "hall",
} as const;
