import type { SupabaseClient } from "@supabase/supabase-js";
import type { WatchlistItem, WatchlistItemType } from "@/lib/types";

export async function getWatchlist(supabase: SupabaseClient, investorProfileId: string): Promise<WatchlistItem[]> {
  const { data } = await supabase
    .from("watchlist_items")
    .select("*")
    .eq("investor_profile_id", investorProfileId)
    .order("added_at", { ascending: false })
    .returns<WatchlistItem[]>();
  return data ?? [];
}

export async function addWatchlistItem(
  supabase: SupabaseClient,
  investorProfileId: string,
  itemType: WatchlistItemType,
  itemId: string,
  label: string,
  note?: string | null
) {
  return supabase
    .from("watchlist_items")
    .upsert(
      { investor_profile_id: investorProfileId, item_type: itemType, item_id: itemId, label, note: note ?? null },
      { onConflict: "investor_profile_id,item_type,item_id" }
    );
}

export async function removeWatchlistItem(supabase: SupabaseClient, id: string) {
  return supabase.from("watchlist_items").delete().eq("id", id);
}
