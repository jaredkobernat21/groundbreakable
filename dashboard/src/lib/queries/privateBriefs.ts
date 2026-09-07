import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonalizedBrief } from "@/lib/types";

// Most recent two briefs -- the newest is what renders, the one before
// it is what "Changes Since Last Brief" diffs against.
export async function getRecentBriefs(supabase: SupabaseClient, investorProfileId: string, limit = 2): Promise<PersonalizedBrief[]> {
  const { data } = await supabase
    .from("personalized_briefs")
    .select("*")
    .eq("investor_profile_id", investorProfileId)
    .order("generated_at", { ascending: false })
    .limit(limit)
    .returns<PersonalizedBrief[]>();
  return data ?? [];
}

export async function createBrief(
  supabase: SupabaseClient,
  brief: Omit<PersonalizedBrief, "id" | "created_at" | "generated_at"> & { generated_at?: string }
) {
  return supabase.from("personalized_briefs").insert(brief).select("*").single().returns<PersonalizedBrief>();
}
