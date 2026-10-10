import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin } from "@/lib/env";
import { safeNext } from "@/lib/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Landing point for Supabase email links (sign-up confirmation, password reset)
// using the default PKCE flow: ?code=… is exchanged for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = await requestOrigin();
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL("/login?error=link", origin));
}
