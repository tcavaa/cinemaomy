import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { omySql?: postgres.Sql };

function createClient() {
  return postgres(serverEnv().DATABASE_URL, {
    // The Supabase transaction pooler does not support prepared statements.
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

// Reuse one pool across hot reloads in development.
const client = globalForDb.omySql ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.omySql = client;

export const db = drizzle({ client, schema, casing: "snake_case" });

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export { schema };
