"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single()
    : { data: null };
  if (profile?.role !== "admin") {
    throw new Error("Admin access required.");
  }
}

// No dedicated app-URL env var exists in this project -- every other
// absolute-link spot (auth/confirm/route.ts) derives origin from the
// current request instead, so this does the same via next/headers rather
// than introducing a new env var for one feature.
function appOrigin(): string {
  const h = headers();
  const host = h.get("host") ?? "app.groundbreakable.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

// Invitation-link onboarding (Jared, 2026-09-29) -- replaces the earlier
// admin-set temporary password flow, which worked but meant Jared relaying
// a password by phone/text, which read as unprofessional. This mints a
// single-use, 7-day link instead; no password exists until the developer
// sets their own. Creating a real credential path is more sensitive than
// this codebase's other admin actions (which trust the page-level redirect
// + RLS write policy), so this re-checks admin explicitly, same as the
// temp-password version did.
export async function createInvitation(formData: FormData) {
  await requireAdmin();

  const firstName = str(formData, "first_name");
  const lastName = str(formData, "last_name");
  const email = str(formData, "email");
  const companyName = str(formData, "company_name");
  const marketIds = formData.getAll("market_ids").filter((v): v is string => typeof v === "string");

  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required.");
  }

  const admin = createAdminClient();

  // auth.users isn't reachable through the regular RLS-aware client --
  // listUsers() is the only way to check for a pre-existing account before
  // minting an invitation that could never be redeemed.
  const {
    data: { users: existingUsers },
  } = await admin.auth.admin.listUsers();
  if (existingUsers.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account already exists for this email.");
  }

  const supabase = createClient();
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();

  const { data: invitation, error: inviteError } = await supabase
    .from("user_invitations")
    .insert({
      email,
      first_name: firstName,
      last_name: lastName,
      company_name: companyName,
      invited_by: adminUser?.id ?? null,
    })
    .select("id")
    .single();
  if (inviteError || !invitation) {
    throw new Error(inviteError?.message ?? "Failed to create invitation.");
  }

  if (marketIds.length > 0) {
    const { error: marketsError } = await supabase
      .from("invitation_markets")
      .insert(marketIds.map((marketId) => ({ invitation_id: invitation.id, market_id: marketId })));
    if (marketsError) {
      throw new Error(`Invitation created, but failed to assign markets: ${marketsError.message}`);
    }
  }

  revalidatePath("/dashboard/admin/users");
  redirect(
    `/dashboard/admin/users?invite_link=${encodeURIComponent(`${appOrigin()}/invite/${invitation.id}`)}&invite_email=${encodeURIComponent(email)}`
  );
}

export async function revokeInvitation(formData: FormData) {
  await requireAdmin();
  const invitationId = str(formData, "invitation_id");
  if (!invitationId) throw new Error("Missing invitation id.");

  const supabase = createClient();
  const { error } = await supabase
    .from("user_invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("status", "pending");
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/users");
}

export async function updateUser(formData: FormData) {
  const userId = str(formData, "user_id");
  const companyName = str(formData, "company_name");
  const status = str(formData, "status");
  if (!userId || !status) throw new Error("Missing user id or status.");

  const supabase = createClient();
  const { error } = await supabase
    .from("investor_profiles")
    .update({ company_name: companyName, status })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/users");
}

export async function setUserMarkets(formData: FormData) {
  const userId = str(formData, "user_id");
  if (!userId) throw new Error("Missing user id.");
  const marketIds = formData.getAll("market_ids").filter((v): v is string => typeof v === "string");

  const supabase = createClient();

  const { error: deleteError } = await supabase.from("investor_markets").delete().eq("investor_id", userId);
  if (deleteError) throw new Error(deleteError.message);

  if (marketIds.length > 0) {
    const { error: insertError } = await supabase
      .from("investor_markets")
      .insert(marketIds.map((marketId) => ({ investor_id: userId, market_id: marketId })));
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath("/dashboard/admin/users");
}
