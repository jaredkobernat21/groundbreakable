import type { SupabaseClient } from "@supabase/supabase-js";
import type { OpportunityProfile } from "@/lib/types";

// Self-service now (spec section 2): every profile is owned directly by
// the signed-in account, RLS-scoped to investor_profile_id = auth.uid()
// (or is_admin()) -- no admin-curated client row in between anymore.
export async function getOpportunityProfiles(supabase: SupabaseClient, investorProfileId: string): Promise<OpportunityProfile[]> {
  const { data } = await supabase
    .from("opportunity_profiles")
    .select("*")
    .eq("investor_profile_id", investorProfileId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<OpportunityProfile[]>();
  return data ?? [];
}

// The profile that currently drives personalization -- the first
// `is_active` row, falling back to the first profile at all if none is
// explicitly marked active.
export function getActiveOpportunityProfile(profiles: OpportunityProfile[]): OpportunityProfile | null {
  return profiles.find((p) => p.is_active) ?? profiles[0] ?? null;
}
