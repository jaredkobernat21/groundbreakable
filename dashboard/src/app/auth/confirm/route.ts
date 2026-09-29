import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Where a Supabase invite/reset email's link lands. Handles both shapes
// Supabase's default email templates can produce, since which one a given
// project sends depends on hosted Auth settings this sandbox can't
// inspect: the token_hash+type "verify" flow (default for the standard
// {{ .ConfirmationURL }} template) and the PKCE code-exchange flow. Only
// one of the two params will actually be present on any given request.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/set-password`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/set-password`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
