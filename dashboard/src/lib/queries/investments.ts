import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvestmentWithSource } from "@/lib/types";

// Ordered by announcement_date desc so the feed reads newest-first, same
// convention as getShifts -- but nulls (an early_signal with no announced
// date yet) sort last rather than first, so a real dated announcement
// always outranks an undated rumor.
export async function getInvestments(supabase: SupabaseClient, marketId: string): Promise<InvestmentWithSource[]> {
  // Disambiguated FK name required -- `investments` now has two paths to
  // `sources` (the direct source_id FK, and the many-to-many through
  // investment_sources for supporting sources), so a plain `sources(*)`
  // embed is rejected by PostgREST with a 300 "more than one relationship
  // found" error. That error was silently swallowed by the `data ?? []`
  // fallback below, which is exactly what happened here the first time --
  // every investment query returned empty with no visible error at all.
  const { data } = await supabase
    .from("investments")
    .select("*, source:sources!investments_source_id_fkey(*)")
    .eq("market_id", marketId)
    .order("announcement_date", { ascending: false, nullsFirst: false })
    .returns<InvestmentWithSource[]>();

  return data ?? [];
}
