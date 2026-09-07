import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrivateBrief } from "@/lib/types";

// Most recent two briefs -- the newest is what renders, the one before
// it is what "Changes Since Last Brief" (section 11.6) diffs against.
export async function getRecentBriefs(supabase: SupabaseClient, privateClientId: string, limit = 2): Promise<PrivateBrief[]> {
  const { data } = await supabase
    .from("private_briefs")
    .select("*")
    .eq("private_client_id", privateClientId)
    .order("generated_at", { ascending: false })
    .limit(limit)
    .returns<PrivateBrief[]>();
  return data ?? [];
}

export async function createBrief(
  supabase: SupabaseClient,
  brief: Omit<PrivateBrief, "id" | "created_at" | "generated_at"> & { generated_at?: string }
) {
  return supabase.from("private_briefs").insert(brief).select("*").single().returns<PrivateBrief>();
}
