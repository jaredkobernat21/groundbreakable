import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketIndicatorWithSource, MarketOverview, MarketOverviewWithSources, Source } from "@/lib/types";

export async function getMarketIndicators(supabase: SupabaseClient, marketId: string): Promise<MarketIndicatorWithSource[]> {
  const { data } = await supabase
    .from("market_indicators")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .returns<MarketIndicatorWithSource[]>();

  return data ?? [];
}

// `source_ids` on market_overviews is a plain uuid[] (a narrative can
// cite several sources, no single FK an embed could follow) -- sources
// are fetched separately and attached here, same pattern as
// getDevelopmentOpportunities.
export async function getMarketOverview(supabase: SupabaseClient, marketId: string): Promise<MarketOverviewWithSources | null> {
  const { data } = await supabase.from("market_overviews").select("*").eq("market_id", marketId).returns<MarketOverview[]>();

  const overview = data?.[0];
  if (!overview) return null;

  if (overview.source_ids.length === 0) return { ...overview, sources: [] };

  const { data: sources } = await supabase.from("sources").select("*").in("id", overview.source_ids).returns<Source[]>();
  return { ...overview, sources: sources ?? [] };
}
