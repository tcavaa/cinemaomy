/**
 * Loads supabase/seed.sql (demo program, hall layout, pages, slides, gallery).
 *
 *   npm run db:seed
 */
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL_SESSION ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL — run with --env-file=.env.local");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

try {
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int from public.events`;
  if (count > 0 && !process.argv.includes("--force")) {
    console.log("The database already has events — skipping. Use --force to seed anyway.");
  } else {
    await sql.unsafe(await readFile(new URL("../supabase/seed.sql", import.meta.url), "utf8"));
    console.log("✓ Seed data loaded.");
  }
} finally {
  await sql.end();
}
