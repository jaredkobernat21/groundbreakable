import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeSite } from "./types";

export async function getSite(supabase: SupabaseClient, id: string): Promise<SladeSite | null> {
  const { data, error } = await supabase.from("slade_sites").select("*").eq("id", id).limit(1).returns<SladeSite[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

// Dedup: parcel_id is the reliable identifier (hard unique index in the
// DB, see the migration). Falls back to address+city+state fuzzy match
// when no parcel_id is known yet -- common early in research, before a
// parcel has been formally identified. See SLADE/DATA_MODEL.md.
export async function findSiteByParcelOrAddress(
  supabase: SupabaseClient,
  input: { parcelId?: string | null; address?: string | null; city?: string | null; state?: string | null }
): Promise<SladeSite | null> {
  if (input.parcelId) {
    const { data, error } = await supabase.from("slade_sites").select("*").eq("parcel_id", input.parcelId).limit(1).returns<SladeSite[]>();
    if (error) throw new Error(error.message);
    if (data?.[0]) return data[0];
  }

  if (input.address) {
    let query = supabase.from("slade_sites").select("*").ilike("address", input.address.trim());
    if (input.city) query = query.ilike("city", input.city.trim());
    if (input.state) query = query.ilike("state", input.state.trim());
    const { data, error } = await query.limit(1).returns<SladeSite[]>();
    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
  }

  return null;
}

export async function findOrCreateSite(
  supabase: SupabaseClient,
  input: Partial<Omit<SladeSite, "id" | "created_at" | "updated_at">>
): Promise<{ site: SladeSite; created: boolean }> {
  const existing = await findSiteByParcelOrAddress(supabase, {
    parcelId: input.parcel_id,
    address: input.address,
    city: input.city,
    state: input.state,
  });
  if (existing) return { site: existing, created: false };

  const { data, error } = await supabase.from("slade_sites").insert(input).select("*").returns<SladeSite[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_sites returned no row.");
  return { site: data[0], created: true };
}

export async function updateSite(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<SladeSite, "id" | "created_at" | "updated_at">>
): Promise<SladeSite> {
  const { data, error } = await supabase
    .from("slade_sites")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeSite[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_sites ${id} not found`);
  return data[0];
}

export async function listSitesByMarket(supabase: SupabaseClient, marketId: string): Promise<SladeSite[]> {
  const { data, error } = await supabase
    .from("slade_sites")
    .select("*")
    .eq("market_id", marketId)
    .order("updated_at", { ascending: false })
    .returns<SladeSite[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}
