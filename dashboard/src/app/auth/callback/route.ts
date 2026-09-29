import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyInvitation, getValidInvitation } from "@/app/invite/inviteFlow";

// Where Google OAuth lands after Supabase's own /auth/v1/callback finishes
// the provider handshake and redirects back to the app with a `code` (PKCE
// flow, not the implicit/hash-fragment flow /login's effect handles --
// signInWithOAuth uses `code` by default). `invitation` is the id we passed
// through in redirectTo when the button was clicked.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const invitationId = searchParams.get("invitation");

  if (!code || !invitationId) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient();
  const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError || !data.user) {
    return NextResponse.redirect(`${origin}/invite/${invitationId}?error=google_failed`);
  }

  // The invitation was issued to a specific email -- signing in with a
  // different Google account must not grant access, even though Supabase
  // already happily created/authenticated that account.
  const invitedEmail = data.user.email;
  const check = await getValidInvitation(invitationId);
  if (!check.ok) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/invite/${invitationId}?error=invalid`);
  }
  if (!invitedEmail || invitedEmail.toLowerCase() !== check.invitation.email.toLowerCase()) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/invite/${invitationId}?error=${encodeURIComponent("email_mismatch:" + check.invitation.email)}`
    );
  }

  const applied = await applyInvitation(invitationId, data.user.id);
  if (!applied.ok) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/invite/${invitationId}?error=apply_failed`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
