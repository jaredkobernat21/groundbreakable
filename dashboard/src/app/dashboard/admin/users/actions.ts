"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Hardcoded rather than read from a request -- Server Actions have no
// access to the request URL the way a Route Handler does, and this is the
// one confirmed production domain the invite email's link needs to land
// on. Update here if the app ever moves domains.
const APP_URL = "https://app.groundbreakable.com";

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

// Creating a real login credential is meaningfully more sensitive than the
// rest of this codebase's admin actions (which trust the page-level
// redirect + RLS write policy) -- worth an explicit re-check here as a
// deliberate exception, not an oversight of the established convention.
export async function createUser(formData: FormData) {
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

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${APP_URL}/auth/confirm`,
  });
  if (inviteError || !invited.user) {
    throw new Error(inviteError?.message ?? "Failed to invite user.");
  }

  const { error: profileError } = await admin.from("investor_profiles").insert({
    id: invited.user.id,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    company_name: companyName,
    role: "developer",
    status: "active",
  });
  if (profileError) {
    throw new Error(`User invited, but failed to create profile: ${profileError.message}`);
  }

  if (marketIds.length > 0) {
    const { error: marketsError } = await admin
      .from("investor_markets")
      .insert(marketIds.map((marketId) => ({ investor_id: invited.user!.id, market_id: marketId })));
    if (marketsError) {
      throw new Error(`User and profile created, but failed to assign markets: ${marketsError.message}`);
    }
  }

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
