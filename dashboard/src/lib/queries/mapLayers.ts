import type { SupabaseClient } from "@supabase/supabase-js";
import { getActiveSignals, getGrowthAreas, getPotentialSites, hydrateOpportunitySignals } from "@/lib/queries/planIntelligence";
import type {
  CatalystWithSource,
  OpportunityWithSource,
  OpportunityZoneWithSource,
  Parcel,
  ProjectWithSource,
} from "@/lib/types";

// The map's seven layers, fetched together. Shared by the Overview page's
// embedded map and the dedicated /dashboard/map page (Phase 3) so the
// query lives in exactly one place instead of being copy-pasted between
// them -- the same real-world fact (a project, a parcel, a zoning zone)
// renders in both places off one fetch shape. growthAreas/potentialSites
// (Phase 5) reuse the same functions the Potential map layer's own read
// path uses, not a separate query.
export async function getMapLayerData(supabase: SupabaseClient, marketId: string) {
  const [
    { data: projects },
    { data: parcels },
    { data: opportunities },
    { data: catalysts },
    { data: opportunityZones },
    { data: growthAreas },
    { data: potentialSites },
    { data: activeSignals },
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
    getGrowthAreas(supabase, marketId),
    getPotentialSites(supabase, marketId),
    getActiveSignals(supabase, marketId),
  ]);

  return {
    projects: projects ?? [],
    parcels: parcels ?? [],
    opportunities: hydrateOpportunitySignals(opportunities ?? [], activeSignals ?? []),
    catalysts: catalysts ?? [],
    opportunityZones: opportunityZones ?? [],
    growthAreas: growthAreas ?? [],
    potentialSites: potentialSites ?? [],
  };
}
