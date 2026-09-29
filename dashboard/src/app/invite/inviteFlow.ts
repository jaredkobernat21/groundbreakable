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
  invitation_markets: { market_id: string }[];
};

export type InvalidReason = "not_found" | "expired" | "used";

export async function getValidInvitation(
  id: string
): Promise<{ ok: true; invitation: InvitationRecord } | { ok: false; reason: InvalidReason }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_invitations")
    .select("id, email, first_name, last_name, company_name, status, expires_at, invitation_markets(market_id)")
    .eq("id", id)
    .maybeSingle();

  if (!data) return { ok: false, reason: "not_found" };
  if (data.status !== "pending") return { ok: false, reason: "used" };
  if (new Date(data.expires_at as string) < new Date()) return { ok: false, reason: "expired" };
  return { ok: true, invitation: data as unknown as InvitationRecord };
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
