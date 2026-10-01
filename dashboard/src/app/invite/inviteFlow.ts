import { createAdminClient } from "@/lib/supabase/admin";

// Shared by both acceptance paths (the email/password Server Action and the
// Google OAuth callback route) so they can't drift into checking expiry/
// status differently. Server-only -- no "use server" directive, since this
// exports more than callable actions; imported only from route.ts/actions.ts.

export type InvitationRecord = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  status: string;
  expires_at: string;
  // Set = "reset this existing account's password" instead of "create a
  // new account." See 20261001190000_invitation_password_reset.sql.
  user_id: string | null;
  invitation_markets: { market_id: string }[];
};

// "used" and "revoked" are now distinguished (they weren't before, 2026-
// 10-01) -- revoked was previously reported to the visitor as "already been
// used," which doesn't describe what actually happened if Jared sent out a
// stale/wrong link after revoking an earlier duplicate.
export type InvalidReason = "not_found" | "expired" | "used" | "revoked";

export async function getValidInvitation(
  id: string
): Promise<{ ok: true; invitation: InvitationRecord } | { ok: false; reason: InvalidReason }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_invitations")
    .select("id, email, first_name, last_name, company_name, status, expires_at, user_id, invitation_markets(market_id)")
    .eq("id", id)
    .maybeSingle();

  if (!data) return { ok: false, reason: "not_found" };
  if (data.status === "revoked") return { ok: false, reason: "revoked" };
  if (data.status !== "pending") return { ok: false, reason: "used" };
  if (new Date(data.expires_at as string) < new Date()) return { ok: false, reason: "expired" };
  return { ok: true, invitation: data as unknown as InvitationRecord };
}

// Password-reset counterpart to applyInvitation, for a link whose user_id is
// set. Deliberately doesn't touch investor_profiles/investor_markets at all
// (unlike applyInvitation) -- that upsert hardcodes role: "developer", which
// would silently demote an admin resetting their own password, and there's
// no reason to touch an existing, already-correct profile anyway.
export async function applyPasswordReset(
  invitationId: string,
  userId: string,
  password: string
): Promise<{ ok: true } | { ok: false; reason: InvalidReason | "error"; message?: string }> {
  const admin = createAdminClient();
  const check = await getValidInvitation(invitationId);
  if (!check.ok) return check;
  if (check.invitation.user_id !== userId) return { ok: false, reason: "not_found" };

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password });
  if (updateError) return { ok: false, reason: "error", message: updateError.message };

  await admin
    .from("user_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitationId);

  return { ok: true };
}

// Turns a validated invitation into real access: profile row, assigned
// markets, invitation marked accepted. Re-validates internally (status +
// expiry) so a double-submit or a stale page can't apply the same
// invitation twice. Does NOT check that the authenticated user's email
// matches the invitation's email -- callers that authenticate via a method
// where that isn't guaranteed by construction (Google OAuth) must check
// that themselves before calling this.
export async function applyInvitation(
  invitationId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; reason: InvalidReason | "error"; message?: string }> {
  const admin = createAdminClient();
  const check = await getValidInvitation(invitationId);
  if (!check.ok) return check;

  const { invitation } = check;

  // has_all_market_access: true -- "the invitation link should give access
  // to all markets, even ones I add" (Jared, 2026-09-30). A snapshot of
  // invitation_markets rows can't satisfy "even ones I add" on its own
  // (a market created after this developer signs up would need someone to
  // go back and grant it manually) -- this flag is checked live inside
  // has_market_access() (supabase/migrations/20260930030000_all_market_
  // access_flag.sql), so every future market clears automatically. Still
  // copy invitation_markets -> investor_markets below for record-keeping/
  // display (e.g. a "primary markets" badge later) -- it just no longer
  // gates access on its own for invitation-created developers.
  // welcomed_at set immediately (2026-10-01) -- leaving it null sent every
  // brand-new invited developer through middleware's unannounced /welcome
  // detour right after "Create Account," instead of straight into
  // /dashboard. Confirmed as the real cause behind Joey Locker and Dan Lynch
  // both independently hitting "this invitation has already been used":
  // landing on an unexplained extra screen right after setting a password
  // for the first time is exactly the kind of moment where hitting the
  // browser back button is a natural reflex (especially on mobile, where
  // it's often just a swipe) -- which lands back on the now-already-
  // accepted /invite/<id> link. The invite link already told them what
  // they're getting; there's nothing /welcome needs to re-explain for this
  // path, so skip it rather than try to make the detour less confusing.
  const { error: profileError } = await admin.from("investor_profiles").upsert(
    {
      id: userId,
      first_name: invitation.first_name,
      last_name: invitation.last_name,
      full_name: `${invitation.first_name} ${invitation.last_name}`,
      company_name: invitation.company_name,
      role: "developer",
      status: "active",
      must_change_password: false,
      has_all_market_access: true,
      welcomed_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (profileError) return { ok: false, reason: "error", message: profileError.message };

  const marketIds = invitation.invitation_markets.map((m) => m.market_id);
  if (marketIds.length > 0) {
    const { error: marketsError } = await admin
      .from("investor_markets")
      .upsert(
        marketIds.map((market_id) => ({ investor_id: userId, market_id })),
        { onConflict: "investor_id,market_id" }
      );
    if (marketsError) return { ok: false, reason: "error", message: marketsError.message };
  }

  await admin
    .from("user_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitationId);

  return { ok: true };
}
