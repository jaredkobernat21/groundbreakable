import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CatalystWithSource,
  OpportunityWithSource,
  OpportunityZoneWithSource,
  Parcel,
  ProjectWithSource,
} from "@/lib/types";

// The map's five layers, fetched together. Shared by the Overview page's
// embedded map and the dedicated /dashboard/map page (Phase 3) so the
// query lives in exactly one place instead of being copy-pasted between
// them -- the same real-world fact (a project, a parcel, a zoning zone)
// renders in both places off one fetch shape.
export async function getMapLayerData(supabase: SupabaseClient, marketId: string) {
  const [
    { data: projects },
    { data: parcels },
    { data: opportunities },
    { data: catalysts },
    { data: opportunityZones },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*, source:sources(*)")
      .eq("market_id", marketId)
      .order("date_updated", { ascending: false })
      .returns<ProjectWithSource[]>(),
    supabase.from("parcels").select("*").eq("market_id", marketId).returns<Parcel[]>(),
    supabase
      .from("opportunities")
      .select("*, source:sources(*)")
      .eq("market_id", marketId)
      .order("last_verified_at", { ascending: false })
      .returns<OpportunityWithSource[]>(),
    supabase
      .from("catalysts")
      .select("*, source:sources(*)")
      .eq("market_id", marketId)
      .order("last_verified_at", { ascending: false })
      .returns<CatalystWithSource[]>(),
    supabase
      .from("opportunity_zones")
      .select("*, source:sources(*)")
      .eq("market_id", marketId)
      .order("last_verified_at", { ascending: false })
      .returns<OpportunityZoneWithSource[]>(),
  ]);

  return {
    projects: projects ?? [],
    parcels: parcels ?? [],
    opportunities: opportunities ?? [],
    catalysts: catalysts ?? [],
    opportunityZones: opportunityZones ?? [],
  };
}
