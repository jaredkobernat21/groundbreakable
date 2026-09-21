import type { SupabaseClient } from "@supabase/supabase-js";
import type { SiteFactType, SladeSiteFact } from "./types";

export async function getSiteFacts(supabase: SupabaseClient, siteId: string): Promise<SladeSiteFact[]> {
  const { data, error } = await supabase
    .from("slade_site_facts")
    .select("*")
    .eq("site_id", siteId)
    .order("fact_type")
    .order("checked_at", { ascending: false })
    .returns<SladeSiteFact[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

// The current (most recently checked) fact of a given type for a site --
// older rows for the same fact_type are history, not overwritten (see
// SLADE/DATA_MODEL.md).
export async function getCurrentSiteFact(
  supabase: SupabaseClient,
  siteId: string,
  factType: SiteFactType
): Promise<SladeSiteFact | null> {
  const { data, error } = await supabase
    .from("slade_site_facts")
    .select("*")
    .eq("site_id", siteId)
    .eq("fact_type", factType)
    .order("checked_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .returns<SladeSiteFact[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function addSiteFact(
  supabase: SupabaseClient,
  input: Pick<SladeSiteFact, "site_id" | "fact_type"> & Partial<Omit<SladeSiteFact, "id" | "created_at" | "updated_at">>
): Promise<SladeSiteFact> {
  const { data, error } = await supabase
    .from("slade_site_facts")
    .insert({ checked_at: new Date().toISOString(), ...input })
    .select("*")
    .returns<SladeSiteFact[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_site_facts returned no row.");
  return data[0];
}

// A fact is "unverified" for the purposes of the verification gate unless
// it's explicitly `verified`. Missing entirely also counts as unverified
// -- SLADE_BIBLE.md's accuracy standard treats "we don't know" and
// "we haven't confirmed it" the same way: not settled.
export function isFactVerified(fact: SladeSiteFact | null): boolean {
  return fact?.verification_status === "verified";
}
