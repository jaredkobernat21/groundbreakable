import type { SupabaseClient } from "@supabase/supabase-js";
import type { CatalystEvent } from "@/lib/types";

// Backs the Timeline tab (institutional redesign, 2026-09-30). catalyst_events
// (supabase/migrations/20260930010000_refine_catalysts.sql) has been live
// since the Catalysts scoring refinement but has never been surfaced in any
// UI -- its only writer today is the admin updateCatalystStatus action, so
// this returns an empty array for almost every catalyst (all research-
// inserted rows wrote status directly, not through that action). Callers
// must degrade gracefully to created_at/last_verified_at when empty --
// that's the honest current data state, not a bug.
export async function getCatalystEvents(supabase: SupabaseClient, catalystId: string): Promise<CatalystEvent[]> {
  const { data } = await supabase
    .from("catalyst_events")
    .select("*")
    .eq("catalyst_id", catalystId)
    .order("occurred_on", { ascending: false })
    .returns<CatalystEvent[]>();
  return data ?? [];
}
