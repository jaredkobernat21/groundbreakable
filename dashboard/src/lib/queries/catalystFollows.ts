import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFollowedCatalystIds(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data } = await supabase.from("catalyst_follows").select("catalyst_id").eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.catalyst_id as string));
}

export async function followCatalyst(supabase: SupabaseClient, userId: string, catalystId: string) {
  const { error } = await supabase.from("catalyst_follows").insert({ user_id: userId, catalyst_id: catalystId });
  if (error) throw new Error(error.message);
}

export async function unfollowCatalyst(supabase: SupabaseClient, userId: string, catalystId: string) {
  const { error } = await supabase.from("catalyst_follows").delete().eq("user_id", userId).eq("catalyst_id", catalystId);
  if (error) throw new Error(error.message);
}
