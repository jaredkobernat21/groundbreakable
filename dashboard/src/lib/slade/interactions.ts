import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeContact, SladeInteraction } from "./types";

export async function logInteraction(
  supabase: SupabaseClient,
  input: Pick<SladeInteraction, "contact_id" | "interaction_type"> & Partial<Omit<SladeInteraction, "id" | "created_at">>
): Promise<SladeInteraction> {
  const { data, error } = await supabase.from("slade_interactions").insert(input).select("*").returns<SladeInteraction[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_interactions returned no row.");

  // Keep the contact's own last_contacted_at in sync for outbound
  // interactions -- avoids every caller having to remember to update it
  // separately.
  if (input.direction !== "inbound") {
    await supabase
      .from("slade_contacts")
      .update({ last_contacted_at: input.occurred_at ?? new Date().toISOString() })
      .eq("id", input.contact_id);
  }

  return data[0];
}

export async function getContactHistory(supabase: SupabaseClient, contactId: string): Promise<SladeInteraction[]> {
  const { data, error } = await supabase
    .from("slade_interactions")
    .select("*")
    .eq("contact_id", contactId)
    .order("occurred_at", { ascending: false })
    .returns<SladeInteraction[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

// "Who have I contacted / who hasn't responded / who's warm" -- see
// SLADE/WORKFLOWS.md. These read slade_contacts directly (lead_status is
// the source of truth for outreach state) rather than deriving from
// slade_interactions on every call.
export async function getContactsByLeadStatus(
  supabase: SupabaseClient,
  leadStatuses: SladeContact["lead_status"][]
): Promise<SladeContact[]> {
  const { data, error } = await supabase
    .from("slade_contacts")
    .select("*")
    .in("lead_status", leadStatuses)
    .order("last_contacted_at", { ascending: false, nullsFirst: true })
    .returns<SladeContact[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function getNeverContacted(supabase: SupabaseClient) {
  return getContactsByLeadStatus(supabase, ["never_contacted"]);
}

export function getNoResponse(supabase: SupabaseClient) {
  return getContactsByLeadStatus(supabase, ["no_response", "attempted"]);
}

export function getWarmProspects(supabase: SupabaseClient) {
  return getContactsByLeadStatus(supabase, ["interested", "active_conversation", "responded"]);
}
