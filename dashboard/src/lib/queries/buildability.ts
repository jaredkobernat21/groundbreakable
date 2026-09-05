import type { SupabaseClient } from "@supabase/supabase-js";
import type { ZoningLandUseWithSource } from "@/lib/types";

// Feeds the shift dashboard's "Buildability" tab -- only rows curated
// with the buildability_summary fields filled in are useful there (a
// bare current_zoning row from an older pass, e.g. Topeka's D3/PUD
// opportunity-zoning rows, has none of those columns set and just won't
// render a detail panel worth showing). Filtering server-side on
// buildability_summary not being null keeps the map layer to only the
// districts actually researched for this feature.
export async function getBuildabilityZones(supabase: SupabaseClient, marketId: string): Promise<ZoningLandUseWithSource[]> {
  const { data } = await supabase
    .from("zoning_land_use")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .eq("layer_type", "current_zoning")
    .not("buildability_summary", "is", null)
    .returns<ZoningLandUseWithSource[]>();

  return data ?? [];
}
