import type { SupabaseClient } from "@supabase/supabase-js";
import type { DevelopmentFrictionSignalWithSource } from "@/lib/types";

export async function getDevelopmentFrictionSignals(
  supabase: SupabaseClient,
  marketId: string
): Promise<DevelopmentFrictionSignalWithSource[]> {
  const { data } = await supabase
    .from("development_friction_signals")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .order("kind")
    .order("observed_date", { ascending: false })
    .returns<DevelopmentFrictionSignalWithSource[]>();

  return data ?? [];
}
