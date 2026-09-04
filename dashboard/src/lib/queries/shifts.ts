import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShiftAudience, ShiftCategory, ShiftWithSource } from "@/lib/types";

export type ShiftFilters = {
  since: string; // YYYY-MM-DD, inclusive lower bound on event_date
  categories?: ShiftCategory[]; // omit/empty = all categories
  audience?: ShiftAudience; // omit = no persona filter
};

// Single query against the `shifts` table (see
// supabase/migrations/20260904000000_roq_shift_schema.sql), same
// "one fetch shape shared by every surface that renders it" convention as
// getMapLayerData in mapLayers.ts.
export async function getShifts(supabase: SupabaseClient, marketId: string, filters: ShiftFilters): Promise<ShiftWithSource[]> {
  let query = supabase
    .from("shifts")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .gte("event_date", filters.since)
    .order("event_date", { ascending: false });

  if (filters.categories && filters.categories.length > 0) {
    query = query.in("category", filters.categories);
  }
  if (filters.audience) {
    query = query.overlaps("audience", [filters.audience]);
  }

  const { data } = await query.returns<ShiftWithSource[]>();
  return data ?? [];
}
