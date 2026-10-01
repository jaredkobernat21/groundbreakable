"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Same appOrigin() pattern as admin/users/actions.ts -- no dedicated app-URL
// env var exists in this project.
function appOrigin(): string {
  const h = headers();
  const host = h.get("host") ?? "app.groundbreakable.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

// Self-service counterpart to the admin "Reset Password" button (2026-10-01).
// Deliberately does NOT call supabase.auth.resetPasswordForEmail -- this
// project's Auth email deliverability is unverified (same unresolved gap as
// the notify-submission webhook's Resend sends, which currently only land in
// Jared's own inbox until groundbreakable.com is a verified sending domain).
// Instead this mints the same kind of one-time user_invitations link the
// admin tool uses, then drops a row in password_reset_requests purely to
// trigger the existing notify_submission() webhook -- Jared gets the ready-
// to-send link by email and forwards it himself. Appropriate for this early,
// low-volume, high-touch stage; can move to fully automatic delivery later
// once email deliverability is sorted, without changing the link mechanism
// itself.
//
// Always resolves the same way regardless of whether the email matches an
// account -- a different outcome for "no account" would let this form be
// used to enumerate who has access.
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;

  const admin = createAdminClient();
  const existingUsers = await admin.auth.admin
    .listUsers()
    .then(({ data }) => data.users)
    .catch(() => []);
  const user = existingUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return;

  const { data: profile } = await admin
    .from("investor_profiles")
    .select("first_name, last_name, company_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: invitation } = await admin
    .from("user_invitations")
    .insert({
      email: user.email,
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      company_name: profile?.company_name ?? null,
      user_id: user.id,
    })
    .select("id")
    .single();
  if (!invitation) return;

  await admin.from("password_reset_requests").insert({
    email: user.email,
    reset_link: `${appOrigin()}/invite/${invitation.id}`,
  });
}
