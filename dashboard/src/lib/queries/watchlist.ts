import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrivateClientWatchlistItem, WatchlistItemType } from "@/lib/types";

export async function getWatchlist(supabase: SupabaseClient, privateClientId: string): Promise<PrivateClientWatchlistItem[]> {
  const { data } = await supabase
    .from("private_client_watchlist_items")
    .select("*")
    .eq("private_client_id", privateClientId)
    .order("added_at", { ascending: false })
    .returns<PrivateClientWatchlistItem[]>();
  return data ?? [];
}

export async function addWatchlistItem(
  supabase: SupabaseClient,
  privateClientId: string,
  itemType: WatchlistItemType,
  itemId: string,
  label: string,
  note?: string | null
) {
  return supabase
    .from("private_client_watchlist_items")
    .upsert(
      { private_client_id: privateClientId, item_type: itemType, item_id: itemId, label, note: note ?? null },
      { onConflict: "private_client_id,item_type,item_id" }
    );
}

export async function removeWatchlistItem(supabase: SupabaseClient, id: string) {
  return supabase.from("private_client_watchlist_items").delete().eq("id", id);
}
