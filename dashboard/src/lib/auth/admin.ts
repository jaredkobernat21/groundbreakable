import type { SupabaseClient } from "@supabase/supabase-js";

// Used by the investor-header admin entry-point link (dashboard/layout.tsx).
// The existing inline admin checks duplicated across /dashboard/admin/*
// pages are left as-is (out of scope here) -- RLS (is_admin()) is the real
// gate in both cases, this is just a UX nicety.
export async function isAdmin(supabase: SupabaseClient, userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase.from("investor_profiles").select("role").eq("id", userId).single();
  return data?.role === "admin";
}
