import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFollowedMarketIds(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data } = await supabase.from("market_follows").select("market_id").eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.market_id as string));
}

export async function followMarket(supabase: SupabaseClient, userId: string, marketId: string) {
  const { error } = await supabase.from("market_follows").insert({ user_id: userId, market_id: marketId });
  if (error) throw new Error(error.message);
}

export async function unfollowMarket(supabase: SupabaseClient, userId: string, marketId: string) {
  const { error } = await supabase.from("market_follows").delete().eq("user_id", userId).eq("market_id", marketId);
  if (error) throw new Error(error.message);
}
