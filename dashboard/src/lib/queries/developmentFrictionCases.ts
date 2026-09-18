import type { SupabaseClient } from "@supabase/supabase-js";
import type { DevelopmentFrictionCaseWithSource } from "@/lib/types";

// Deliberately no .eq("market_id", ...) -- Development Friction is browsed
// across every market the signed-in user has access to at once (see
// ShiftDashboardView's "Friction" group), unlike every other query in this
// folder. RLS (has_market_access) still scopes the result set to markets
// the user can actually see.
export async function getDevelopmentFrictionCases(supabase: SupabaseClient): Promise<DevelopmentFrictionCaseWithSource[]> {
  const { data } = await supabase
    .from("development_friction_cases")
    .select("*, source:sources(*), market:markets(id,name,slug,state), timeline_events:development_friction_timeline_events(*)")
    .order("created_at", { ascending: false })
    .returns<DevelopmentFrictionCaseWithSource[]>();

  return data ?? [];
}
