import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

/** The signed-in user, verified from the session JWT. Deduplicated per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    name: typeof meta.full_name === "string" && meta.full_name ? meta.full_name : null,
    phone: typeof meta.phone === "string" && meta.phone ? meta.phone : null,
  };
});

export const isAdmin = cache(async (userId: string) => {
  const row = await db.query.admins.findFirst({
    where: eq(schema.admins.userId, userId),
    columns: { userId: true },
  });
  return Boolean(row);
});

export async function requireUser(next = "/account"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (!(await isAdmin(user.id))) redirect("/account?notice=admin-only");
  return user;
}
