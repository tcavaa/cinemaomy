import { defineConfig } from "drizzle-kit";

// Migrations live in supabase/migrations as plain SQL; drizzle-kit is used for
// `studio` and `check` against the live database.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables may come from the environment instead (CI, Vercel).
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  casing: "snake_case",
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.DATABASE_URL_SESSION ?? process.env.DATABASE_URL!,
  },
});
