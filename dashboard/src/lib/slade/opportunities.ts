import type { SupabaseClient } from "@supabase/supabase-js";
import type { OpportunityStatus, SladeOpportunity, SladeOpportunityWithRelations } from "./types";

export async function getOpportunity(supabase: SupabaseClient, id: string): Promise<SladeOpportunity | null> {
  const { data, error } = await supabase.from("slade_opportunities").select("*").eq("id", id).limit(1).returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function getOpportunitiesForSite(supabase: SupabaseClient, siteId: string): Promise<SladeOpportunity[]> {
  const { data, error } = await supabase
    .from("slade_opportunities")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOpportunitiesForContact(supabase: SupabaseClient, contactId: string): Promise<SladeOpportunity[]> {
  const { data, error } = await supabase
    .from("slade_opportunities")
    .select("*")
    .eq("contact_id", contactId)
    .order("updated_at", { ascending: false })
    .returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface OpportunityQueryOptions {
  marketIds?: string[];
  statuses?: OpportunityStatus[];
  contactId?: string;
  buyBoxId?: string;
}

// LODE's filter/browse query -- the only multi-criterion opportunity
// lookup in this file, modeled on contacts.ts's queryContacts. Embeds
// site/contact/market so a list render never N+1s; Network's per-contact
// panel also calls this (with only contactId set) rather than the lighter
// getOpportunitiesForContact, since it wants the site address for free.
export async function queryOpportunities(
  supabase: SupabaseClient,
  options: OpportunityQueryOptions = {}
): Promise<SladeOpportunityWithRelations[]> {
  let query = supabase
    .from("slade_opportunities")
    .select("*, site:slade_sites(*), contact:slade_contacts(id, first_name, last_name), market:markets(id, name, state)")
    .order("updated_at", { ascending: false });

  if (options.marketIds?.length) query = query.in("market_id", options.marketIds);
  if (options.statuses?.length) query = query.in("opportunity_status", options.statuses);
  if (options.contactId) query = query.eq("contact_id", options.contactId);
  if (options.buyBoxId) query = query.eq("buy_box_id", options.buyBoxId);

  const { data, error } = await query.returns<SladeOpportunityWithRelations[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOpportunitiesByStatus(
  supabase: SupabaseClient,
  statuses: OpportunityStatus[]
): Promise<SladeOpportunity[]> {
  const { data, error } = await supabase
    .from("slade_opportunities")
    .select("*")
    .in("opportunity_status", statuses)
    .order("updated_at", { ascending: false })
    .returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

// "Has this site already been sent to anyone / was it previously rejected"
// -- see SLADE/WORKFLOWS.md and verification check 8 (prior-history).
export async function hasSiteBeenDeliveredOrRejected(
  supabase: SupabaseClient,
  siteId: string,
  contactId?: string
): Promise<{ delivered: SladeOpportunity[]; rejected: SladeOpportunity[] }> {
  let query = supabase.from("slade_opportunities").select("*").eq("site_id", siteId).in("opportunity_status", ["delivered", "rejected"]);
  if (contactId) query = query.eq("contact_id", contactId);

  const { data, error } = await query.returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return {
    delivered: rows.filter((r) => r.opportunity_status === "delivered"),
    rejected: rows.filter((r) => r.opportunity_status === "rejected"),
  };
}

// LODE creates opportunities as 'discovered' -- never further along than
// that (see SLADE/docs/LODE.md: discovery and delivery are separate
// states). Advancing past 'discovered' is a separate, deliberate action.
export async function createOpportunity(
  supabase: SupabaseClient,
  input: Pick<SladeOpportunity, "site_id"> & Partial<Omit<SladeOpportunity, "id" | "created_at" | "updated_at" | "opportunity_status">>
): Promise<SladeOpportunity> {
  const { data, error } = await supabase
    .from("slade_opportunities")
    .insert({ ...input, opportunity_status: "discovered" })
    .select("*")
    .returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_opportunities returned no row.");
  return data[0];
}

export async function updateOpportunity(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<SladeOpportunity, "id" | "site_id" | "created_at" | "updated_at" | "opportunity_status">>
): Promise<SladeOpportunity> {
  const { data, error } = await supabase
    .from("slade_opportunities")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_opportunities ${id} not found`);
  return data[0];
}

// Status transitions go through setOpportunityStatus/evaluateVerificationGate
// in ./verification, not this file -- that's where the ready_to_deliver
// gate check lives (also exported from the ./index barrel).
