import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectPersonWithSource } from "@/lib/types";

// Feeds the shift dashboard's Developers/Contractors tabs, and the
// per-project/per-shift "who's involved" sections -- see project_people
// migration for why this is a standalone table rather than the old
// companies/project_parties pair.
export async function getProjectPeople(supabase: SupabaseClient, marketId: string): Promise<ProjectPersonWithSource[]> {
  const { data } = await supabase
    .from("project_people")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .order("event_date", { ascending: false })
    .returns<ProjectPersonWithSource[]>();

  return data ?? [];
}
