"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// A readable temporary password -- avoids ambiguous characters (0/O, 1/l/I)
// since an admin will be reading this aloud or texting it, not the
// developer typing a long random string off a screen unaided.
function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

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
  const tempPassword = generateTempPassword();

  // Admin-set temporary password (Jared, 2026-09-29) -- the invite-email
  // path hit repeated Supabase Auth-settings issues that couldn't be
  // reliably resolved; this needs no email delivery at all, so it works
  // immediately. must_change_password forces them to /set-password on
  // first login (see middleware.ts) before they can reach the dashboard.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });
  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Failed to create user.");
  }

  const { error: profileError } = await admin.from("investor_profiles").insert({
    id: created.user.id,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    company_name: companyName,
    role: "developer",
    status: "active",
    must_change_password: true,
  });
  if (profileError) {
    throw new Error(`User created, but failed to create profile: ${profileError.message}`);
  }

  if (marketIds.length > 0) {
    const { error: marketsError } = await admin
      .from("investor_markets")
      .insert(marketIds.map((marketId) => ({ investor_id: created.user!.id, market_id: marketId })));
    if (marketsError) {
      throw new Error(`User and profile created, but failed to assign markets: ${marketsError.message}`);
    }
  }

  revalidatePath("/dashboard/admin/users");
  redirect(
    `/dashboard/admin/users?created_email=${encodeURIComponent(email)}&created_password=${encodeURIComponent(tempPassword)}`
  );
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
