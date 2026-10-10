import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Everything except static assets and the Flitt server-to-server endpoints.
  matcher: [
    "/((?!_next/static|_next/image|images/|brand/|icon\\.png|apple-icon\\.png|opengraph-image|robots\\.txt|sitemap\\.xml|api/payments/).*)",
  ],
};
