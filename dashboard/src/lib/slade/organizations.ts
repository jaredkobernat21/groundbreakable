import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeOrganization } from "./types";
import { logChange } from "./changeLog";

// Fetched as a one-row array (this codebase's established convention --
// see the comment on getProjectDetail in lib/queries/planIntelligence.ts):
// .maybeSingle()/.single() don't combine cleanly with .returns() in the
// installed supabase-js version.
export async function getOrganization(supabase: SupabaseClient, id: string): Promise<SladeOrganization | null> {
  const { data, error } = await supabase.from("slade_organizations").select("*").eq("id", id).limit(1).returns<SladeOrganization[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function listOrganizations(
  supabase: SupabaseClient,
  options: { search?: string } = {}
): Promise<SladeOrganization[]> {
  let query = supabase.from("slade_organizations").select("*").order("name");
  if (options.search) {
    query = query.ilike("name", `%${options.search}%`);
  }
  const { data, error } = await query.returns<SladeOrganization[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Case-insensitive exact-name match -- the dedup check every insert path
// should call first. See SLADE/DATA_MODEL.md's duplicate-prevention
// section: name-based matching is a find-first check, not a DB
// constraint, because a hard unique constraint on name is too strict for
// legitimately distinct organizations that happen to share a name.
export async function findOrganizationByName(supabase: SupabaseClient, name: string): Promise<SladeOrganization | null> {
  const { data, error } = await supabase
    .from("slade_organizations")
    .select("*")
    .ilike("name", name.trim())
    .limit(1)
    .returns<SladeOrganization[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function findOrCreateOrganization(
  supabase: SupabaseClient,
  input: Pick<SladeOrganization, "name"> & Partial<Omit<SladeOrganization, "id" | "created_at" | "updated_at">>
): Promise<{ organization: SladeOrganization; created: boolean }> {
  const existing = await findOrganizationByName(supabase, input.name);
  if (existing) return { organization: existing, created: false };

  const { data, error } = await supabase.from("slade_organizations").insert(input).select("*").returns<SladeOrganization[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_organizations returned no row.");
  return { organization: data[0], created: true };
}

export async function updateOrganization(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<SladeOrganization, "id" | "created_at" | "updated_at">>,
  changedBy?: string
): Promise<SladeOrganization> {
  const before = await getOrganization(supabase, id);

  const { data, error } = await supabase
    .from("slade_organizations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeOrganization[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_organizations ${id} not found`);

  if (before && patch.relationship_status && patch.relationship_status !== before.relationship_status) {
    await logChange(supabase, {
      tableName: "slade_organizations",
      recordId: id,
      fieldName: "relationship_status",
      oldValue: before.relationship_status,
      newValue: patch.relationship_status,
      changedBy,
    });
  }

  return data[0];
}
