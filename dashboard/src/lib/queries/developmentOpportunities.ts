import type { SupabaseClient } from "@supabase/supabase-js";
import type { DevelopmentOpportunity, DevelopmentOpportunityWithSources, Source } from "@/lib/types";

// `source_ids` is a plain uuid[] (see schema comment -- a signal here
// can trace back to a shift, a project, or a bare `sources` row, so
// there's no single polymorphic FK a Postgres/PostgREST embed could
// follow). Sources are fetched separately and attached here instead.
export async function getDevelopmentOpportunities(
  supabase: SupabaseClient,
  marketId: string
): Promise<DevelopmentOpportunityWithSources[]> {
  const { data } = await supabase
    .from("development_opportunities")
    .select("*")
    .eq("market_id", marketId)
    .order("date_identified", { ascending: false })
    .returns<DevelopmentOpportunity[]>();

  const opportunities = data ?? [];
  const allSourceIds = Array.from(new Set(opportunities.flatMap((o) => o.source_ids)));
  if (allSourceIds.length === 0) return opportunities.map((o) => ({ ...o, sources: [] }));

  const { data: sources } = await supabase.from("sources").select("*").in("id", allSourceIds).returns<Source[]>();
  const sourceById = new Map((sources ?? []).map((s) => [s.id, s]));

  return opportunities.map((o) => ({
    ...o,
    sources: o.source_ids.map((id) => sourceById.get(id)).filter((s): s is Source => s != null),
  }));
}
