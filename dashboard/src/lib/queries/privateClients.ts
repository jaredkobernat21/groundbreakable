import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcquisitionProfile, PrivateClient, PrivateClientWithProfiles } from "@/lib/types";

// private_clients isn't market-scoped (a single principal can be active
// across several of Groundbreakable's tracked markets, or none yet) --
// RLS (is_admin() or investor_profile_id = auth.uid()) is the only
// access filter, same shape as investor_profiles itself.
export async function getPrivateClients(supabase: SupabaseClient): Promise<PrivateClient[]> {
  const { data } = await supabase
    .from("private_clients")
    .select("*")
    .order("status", { ascending: true })
    .order("full_name", { ascending: true })
    .returns<PrivateClient[]>();
  return data ?? [];
}

export async function getPrivateClient(supabase: SupabaseClient, id: string): Promise<PrivateClientWithProfiles | null> {
  const { data: clients } = await supabase.from("private_clients").select("*").eq("id", id).returns<PrivateClient[]>();
  const client = clients?.[0];
  if (!client) return null;

  const { data: profiles } = await supabase
    .from("acquisition_profiles")
    .select("*")
    .eq("private_client_id", id)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<AcquisitionProfile[]>();

  return { ...client, acquisition_profiles: profiles ?? [] };
}

// The profile that currently drives personalization -- the first
// `is_active` row (ordered above), falling back to the first profile at
// all if none is explicitly marked active.
export function getActiveAcquisitionProfile(client: PrivateClientWithProfiles): AcquisitionProfile | null {
  return client.acquisition_profiles.find((p) => p.is_active) ?? client.acquisition_profiles[0] ?? null;
}
