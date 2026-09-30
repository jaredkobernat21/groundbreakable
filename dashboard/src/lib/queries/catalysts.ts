import type { SupabaseClient } from "@supabase/supabase-js";
import type { Catalyst, CatalystWithSources, Source } from "@/lib/types";

async function attachSources(
  supabase: SupabaseClient,
  catalysts: (Catalyst & { source: Source | null })[]
): Promise<CatalystWithSources[]> {
  const allAdditionalIds = Array.from(new Set(catalysts.flatMap((c) => c.additional_source_ids)));
  if (allAdditionalIds.length === 0) return catalysts.map((c) => ({ ...c, additionalSources: [] }));

  const { data: sources } = await supabase.from("sources").select("*").in("id", allAdditionalIds).returns<Source[]>();
  const sourceById = new Map((sources ?? []).map((s) => [s.id, s]));

  return catalysts.map((c) => ({
    ...c,
    additionalSources: c.additional_source_ids.map((id) => sourceById.get(id)).filter((s): s is Source => s != null),
  }));
}

// additional_source_ids is a plain uuid[] (same reasoning as
// development_opportunities.source_ids -- no single polymorphic FK a
// PostgREST embed could follow), so those sources are fetched separately
// and attached here, same pattern as getDevelopmentOpportunities.
export async function getCatalystsWithSource(supabase: SupabaseClient, marketId: string): Promise<CatalystWithSources[]> {
  const { data } = await supabase
    .from("catalysts")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .order("last_verified_at", { ascending: false })
    .returns<(Catalyst & { source: Source | null })[]>();

  return attachSources(supabase, data ?? []);
}

// National map (Jared, 2026-09-30): every catalyst the signed-in investor
// can see, across every accessible market, in one fetch. No market_id
// filter -- catalysts_select_with_access RLS (`using
// (public.has_market_access(market_id))`) already scopes results correctly
// per investor, so this needs no new access-control logic, only the
// existing filter removed.
export async function getNationalCatalystsWithSource(supabase: SupabaseClient): Promise<CatalystWithSources[]> {
  const { data } = await supabase
    .from("catalysts")
    .select("*, source:sources(*)")
    .order("last_verified_at", { ascending: false })
    .returns<(Catalyst & { source: Source | null })[]>();

  return attachSources(supabase, data ?? []);
}
