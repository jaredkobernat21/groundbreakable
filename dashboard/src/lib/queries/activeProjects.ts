import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectWithSource } from "@/lib/types";

// Feeds the shift dashboard's "Projects" tab -- persistent, ongoing
// developments (current stage, not a point-in-time event) as opposed to
// `shifts`, which is a change-log. Reuses the pre-pivot `projects` table
// (see planIntelligence.ts for the richer parties-joined version used by
// the legacy Timeline/detail pages) rather than a new table -- a project
// like "under construction, occupancy July 2026" has no single dated
// event to hang off a shift, but fits this schema's stage column exactly.
export async function getActiveProjects(supabase: SupabaseClient, marketId: string): Promise<ProjectWithSource[]> {
  const { data } = await supabase
    .from("projects")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .order("date_updated", { ascending: false })
    .returns<ProjectWithSource[]>();

  return data ?? [];
}
