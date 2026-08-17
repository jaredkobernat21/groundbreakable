import type { SupabaseClient } from "@supabase/supabase-js";
import { filterWithinRadius, ONE_MILE_METERS } from "@/lib/geo";
import type {
  Market,
  PlanCategory,
  ProjectEventWithProject,
  ProjectEventWithSource,
  ProjectPartyWithCompany,
  ProjectPhase2Fields,
  ProjectWithSource,
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
    .returns<(ProjectWithSource & ProjectPhase2Fields & { parties: ProjectPartyWithCompany[] })[]>();
}

// Equivalent of a single project's history section on ProjectDetailPanel
// -- today reads project_updates, this reads project_events (the
// generalized, richer-vocabulary replacement).
export async function getProjectEvents(supabase: SupabaseClient, projectId: string) {
  return supabase
    .from("project_events")
    .select("*, source:sources(*)")
    .eq("project_id", projectId)
    .order("occurred_on", { ascending: false })
    .returns<ProjectEventWithSource[]>();
}

// Equivalent of the Home dashboard's "Recent Activity" feed (currently
// reads project_updates joined to projects). Same shape, new source
// table -- a Timeline view can page through this directly.
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

export type ProjectDetail = ProjectWithSource & ProjectPhase2Fields & { parties: ProjectPartyWithCompany[]; market: Market };

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
