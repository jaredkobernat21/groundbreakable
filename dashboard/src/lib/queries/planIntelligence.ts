import type { SupabaseClient } from "@supabase/supabase-js";
import { filterWithinRadius, ONE_MILE_METERS } from "@/lib/geo";
import type {
  GrowthArea,
  Market,
  OpportunityType,
  OpportunityZoneWithSource,
  PlanCategory,
  PotentialSiteWithSource,
  ProjectEventWithProject,
  ProjectEventWithSource,
  ProjectPartyWithCompany,
  ProjectWithSource,
  Signal,
  SignalWithSource,
  ZoningLandUseWithSource,
} from "@/lib/types";

// Read layer over the Aug 17 2026 schema additions (companies/
// project_parties, project_events, signals, zoning_land_use). Built and
// parity-checked against the old queries in Phase 2 before anything used
// it; now the Timeline page (Phase 3) and Project detail page (Phase 4)
// read from it directly. Each function is the new-schema equivalent of
// an existing (or, for detail/nearby, newly needed) query elsewhere in
// the app -- see the comment on each.

// Equivalent of the `projects` query in dashboard/page.tsx and
// projects/page.tsx, plus the new plan_category/project_type/stage
// columns and parties (replacing the developer/contractor/investor text
// columns) joined in.
export async function getProjectsWithParties(supabase: SupabaseClient, marketId: string) {
  return supabase
    .from("projects")
    .select("*, source:sources(*), parties:project_parties(*, company:companies(*))")
    .eq("market_id", marketId)
    .order("date_updated", { ascending: false })
    .returns<(ProjectWithSource & { parties: ProjectPartyWithCompany[] })[]>();
}

// Powers a single project's history section on ProjectDetailPanel.
export async function getProjectEvents(supabase: SupabaseClient, projectId: string) {
  return supabase
    .from("project_events")
    .select("*, source:sources(*)")
    .eq("project_id", projectId)
    .order("occurred_on", { ascending: false })
    .returns<ProjectEventWithSource[]>();
}

// Powers the Home dashboard's "Recent Activity" feed. A Timeline view
// can page through this directly.
export async function getRecentProjectEvents(supabase: SupabaseClient, marketId: string, limit = 5) {
  return supabase
    .from("project_events")
    .select("*, project:projects!inner(id, title, market_id, plan_category, project_type, stage)")
    .eq("project.market_id", marketId)
    .order("occurred_on", { ascending: false })
    .limit(limit)
    .returns<ProjectEventWithProject[]>();
}

// The Timeline page's feed (Phase 3) -- full chronological project_events
// history for a market, optionally narrowed to one Plans category. Same
// underlying rows getRecentProjectEvents above uses for the Home news
// feed, just without the fixed limit and with the category filter §14
// asks for.
export async function getProjectEventsFeed(
  supabase: SupabaseClient,
  marketId: string,
  options: { limit?: number; planCategory?: PlanCategory } = {}
) {
  let query = supabase
    .from("project_events")
    .select("*, project:projects!inner(id, title, market_id, plan_category, project_type, stage)")
    .eq("project.market_id", marketId)
    .order("occurred_on", { ascending: false });

  if (options.planCategory) {
    query = query.eq("project.plan_category", options.planCategory);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  return query.returns<ProjectEventWithProject[]>();
}

export type ProjectDetail = ProjectWithSource & { parties: ProjectPartyWithCompany[]; market: Market };

// The Project detail page's (Phase 4) primary fetch: one project plus
// its source, parties/companies, and market. RLS (has_market_access via
// the project's market_id) is the real access gate -- this just asks for
// one row by id instead of a whole market's worth. Fetched as a one-row
// array (matching this codebase's existing .returns<T[]>() convention)
// rather than .maybeSingle(), which doesn't combine cleanly with
// .returns() in the installed supabase-js version.
export async function getProjectDetail(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*, source:sources(*), parties:project_parties(*, company:companies(*)), market:markets(*)")
    .eq("id", projectId)
    .limit(1)
    .returns<ProjectDetail[]>();

  return { data: data?.[0] ?? null, error };
}

// "Related Intelligence: Nearby Projects" (§15) -- same haversine-radius
// approach DevelopmentIntelligenceView already uses for a selected
// project's nearby opportunities (src/lib/geo.ts), just project-to-
// project. projects doesn't have a geography column (only parcels/
// growth_areas/zoning_land_use got one in Phase 1), so this stays a
// client-side radius filter over the market's projects rather than a
// PostGIS query -- matches the existing precedent, no schema change
// needed for it.
export async function getNearbyProjects(
  supabase: SupabaseClient,
  marketId: string,
  excludeProjectId: string,
  center: { lat: number; lng: number },
  radiusMeters = ONE_MILE_METERS
) {
  const { data, error } = await supabase
    .from("projects")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .neq("id", excludeProjectId)
    .returns<ProjectWithSource[]>();

  if (error || !data) return { data: null, error };

  return {
    data: filterWithinRadius(center, radiusMeters, data, (p) => ({ lat: p.latitude, lng: p.longitude })),
    error: null,
  };
}

// Equivalent of the `opportunities` query in dashboard/page.tsx --
// signals is one row per detection instead of one opportunities row with
// a signals[] array, so "still active" here means resolved_date is null
// (the array had no way to represent a signal resolving at all).
export async function getActiveSignals(supabase: SupabaseClient, marketId: string) {
  return supabase
    .from("signals")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .is("resolved_date", null)
    .order("detected_date", { ascending: false })
    .returns<SignalWithSource[]>();
}

// Same as getActiveSignals but across every market -- for the admin
// Opportunities list, which (unlike every investor-facing page) isn't
// scoped to one market at a time.
export async function getAllActiveSignals(supabase: SupabaseClient) {
  return supabase.from("signals").select("*").is("resolved_date", null).returns<Signal[]>();
}

// Computes each opportunity's live signals[] purely from the `signals`
// table -- opportunities.signals[] is gone (Phase 7, Tier 3 dropped it
// once nothing read it anymore), so this is the only source now. An
// opportunity with zero unresolved signals is filtered out entirely
// rather than rendered signal-less -- once every signal on it resolves
// (a lien paid off, a listing pulled), it's no longer "worth a closer
// look," discussed and confirmed directly rather than assumed.
export function attachLiveOpportunitySignals<T extends { id: string }>(
  opportunities: T[],
  activeSignals: Pick<Signal, "opportunity_id" | "signal_type">[]
): (T & { signals: OpportunityType[] })[] {
  const byOpportunity = new Map<string, OpportunityType[]>();
  for (const signal of activeSignals) {
    if (!signal.opportunity_id) continue;
    const existing = byOpportunity.get(signal.opportunity_id);
    if (existing) existing.push(signal.signal_type);
    else byOpportunity.set(signal.opportunity_id, [signal.signal_type]);
  }
  return opportunities
    .map((opportunity) => ({ ...opportunity, signals: byOpportunity.get(opportunity.id) ?? [] }))
    .filter((opportunity) => opportunity.signals.length > 0);
}

// Potential's two map layers (Phase 5). Both tables start empty for every
// market -- unlike Plans, nothing here is transcribed from a source
// document, so there's no backfill to run and no collection pipeline to
// point at; a human curates these through the admin pages.
export async function getGrowthAreas(supabase: SupabaseClient, marketId: string) {
  return supabase.from("growth_areas").select("*").eq("market_id", marketId).order("name").returns<GrowthArea[]>();
}

export async function getPotentialSites(supabase: SupabaseClient, marketId: string) {
  return supabase
    .from("potential_sites")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<PotentialSiteWithSource[]>();
}

// Equivalent of the `opportunity_zones` query -- zoning_land_use also
// carries future_land_use/overlay rows once those start getting curated
// (Phase 4+), so this defaults to current_zoning to match what
// opportunity_zones only ever held.
export async function getZoningLandUse(
  supabase: SupabaseClient,
  marketId: string,
  layerType: "current_zoning" | "future_land_use" | "overlay" = "current_zoning"
) {
  return supabase
    .from("zoning_land_use")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .eq("layer_type", layerType)
    .order("last_verified_at", { ascending: false })
    .returns<ZoningLandUseWithSource[]>();
}

// Reshapes zoning_land_use rows into the OpportunityZoneWithSource shape
// (boundary/zoning_district/rezoning_notes) that DevelopmentMap and
// OpportunityZoneDetailPanel already render -- a read-compatibility shim
// so the map's "Favorable Zoning" layer can switch to the real PostGIS
// table (zoning_land_use has a spatial index; opportunity_zones stored
// raw GeoJSON in jsonb) without every consumer needing new field names.
// layer_type/district_code's broader vocabulary is dropped here since
// nothing downstream reads it yet -- current_zoning is the only layer
// getMapLayerData asks for, matching what opportunity_zones only ever held.
export function zoningLandUseAsOpportunityZone(rows: ZoningLandUseWithSource[]): OpportunityZoneWithSource[] {
  return rows.map((row) => ({
    id: row.id,
    market_id: row.market_id,
    title: row.title,
    description: row.description,
    zoning_district: row.district_code,
    rezoning_notes: row.regulatory_notes,
    boundary: row.geom,
    source_id: row.source_id,
    confidence: row.confidence,
    last_verified_at: row.last_verified_at,
    created_at: row.created_at,
    source: row.source,
  }));
}
