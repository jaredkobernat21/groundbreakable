import type { SupabaseClient } from "@supabase/supabase-js";
import type { Catalyst, CatalystWithSources, Source } from "@/lib/types";

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

  const catalysts = data ?? [];
  const allAdditionalIds = Array.from(new Set(catalysts.flatMap((c) => c.additional_source_ids)));
  if (allAdditionalIds.length === 0) return catalysts.map((c) => ({ ...c, additionalSources: [] }));

  const { data: sources } = await supabase.from("sources").select("*").in("id", allAdditionalIds).returns<Source[]>();
  const sourceById = new Map((sources ?? []).map((s) => [s.id, s]));

  return catalysts.map((c) => ({
    ...c,
    additionalSources: c.additional_source_ids.map((id) => sourceById.get(id)).filter((s): s is Source => s != null),
  }));
}
