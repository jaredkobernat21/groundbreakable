"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidInvitation, applyInvitation, applyPasswordReset } from "../inviteFlow";

// Secondary path off the invite page (Google is primary). The account's
// email is fixed to the invitation's -- there's no email input on this
// form -- so, unlike the OAuth callback, there's no email-match check to
// do here; the account is created with the invited address by construction.
export async function acceptInvitationWithPassword(invitationId: string, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    redirect(`/invite/${invitationId}?form_error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  }
  if (password !== confirmPassword) {
    redirect(`/invite/${invitationId}?form_error=${encodeURIComponent("Passwords don't match.")}`);
  }

  const check = await getValidInvitation(invitationId);
  if (!check.ok) {
    redirect(`/invite/${invitationId}`);
  }

  // Password-reset link (user_id set) -- update the existing account's
  // password instead of creating a new one. See inviteFlow.ts.
  if (check.invitation.user_id) {
    const applied = await applyPasswordReset(invitationId, check.invitation.user_id, password);
    if (!applied.ok) {
      redirect(`/invite/${invitationId}?form_error=${encodeURIComponent(applied.message ?? "Something went wrong.")}`);
    }

    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email: check.invitation.email, password });
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: check.invitation.email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    const message = createError?.message ?? "Failed to create account.";
    redirect(`/invite/${invitationId}?form_error=${encodeURIComponent(message)}`);
  }

  const applied = await applyInvitation(invitationId, created.user.id);
  if (!applied.ok) {
    redirect(`/invite/${invitationId}?form_error=${encodeURIComponent(applied.message ?? "Something went wrong.")}`);
  }

  // Regular cookie-bound client -- signing in here (not the admin client)
  // is what actually sets the session cookies on this response, matching
  // @supabase/ssr's normal Server Action sign-in pattern.
  const supabase = createClient();
  await supabase.auth.signInWithPassword({ email: check.invitation.email, password });

  redirect("/dashboard");
}
