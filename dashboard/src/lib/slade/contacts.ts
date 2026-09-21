import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeContact, SladeContactWithOrganization } from "./types";
import { logChange } from "./changeLog";

// Fetched as a one-row array -- see the comment on getOrganization in
// ./organizations.ts for why (.single()/.maybeSingle() + .returns()
// don't combine cleanly in the installed supabase-js version).
export async function getContact(supabase: SupabaseClient, id: string): Promise<SladeContactWithOrganization | null> {
  const { data, error } = await supabase
    .from("slade_contacts")
    .select("*, organization:slade_organizations(*)")
    .eq("id", id)
    .limit(1)
    .returns<SladeContactWithOrganization[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export interface ContactQueryOptions {
  relationshipStatuses?: SladeContact["relationship_status"][];
  leadStatuses?: SladeContact["lead_status"][];
  relationshipTypes?: SladeContact["relationship_type"][];
  organizationId?: string;
  search?: string;
}

export async function queryContacts(
  supabase: SupabaseClient,
  options: ContactQueryOptions = {}
): Promise<SladeContactWithOrganization[]> {
  let query = supabase.from("slade_contacts").select("*, organization:slade_organizations(*)").order("last_contacted_at", {
    ascending: false,
    nullsFirst: false,
  });

  if (options.relationshipStatuses?.length) query = query.in("relationship_status", options.relationshipStatuses);
  if (options.leadStatuses?.length) query = query.in("lead_status", options.leadStatuses);
  if (options.relationshipTypes?.length) query = query.in("relationship_type", options.relationshipTypes);
  if (options.organizationId) query = query.eq("organization_id", options.organizationId);
  if (options.search) {
    const term = `%${options.search}%`;
    query = query.or(`first_name.ilike.${term},last_name.ilike.${term}`);
  }

  const { data, error } = await query.returns<SladeContactWithOrganization[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

// "Who needs a follow-up" -- see SLADE/WORKFLOWS.md.
export async function getFollowUpsDue(supabase: SupabaseClient, asOf = new Date()): Promise<SladeContact[]> {
  const { data, error } = await supabase
    .from("slade_contacts")
    .select("*")
    .not("next_follow_up_at", "is", null)
    .lte("next_follow_up_at", asOf.toISOString())
    .order("next_follow_up_at", { ascending: true })
    .returns<SladeContact[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Dedup: match on email or phone first (reliable), then name (fuzzy,
// surfaced as a possible duplicate rather than blocking). See
// SLADE/DATA_MODEL.md's duplicate-prevention section.
export async function findPossibleDuplicateContacts(
  supabase: SupabaseClient,
  input: { email?: string | null; phone?: string | null; firstName: string; lastName?: string | null }
): Promise<SladeContact[]> {
  const matches: SladeContact[] = [];

  if (input.email) {
    const { data, error } = await supabase
      .from("slade_contacts")
      .select("*")
      .ilike("email", input.email.trim())
      .returns<SladeContact[]>();
    if (error) throw new Error(error.message);
    matches.push(...(data ?? []));
  }

  if (input.phone) {
    const { data, error } = await supabase.from("slade_contacts").select("*").eq("phone", input.phone.trim()).returns<SladeContact[]>();
    if (error) throw new Error(error.message);
    matches.push(...(data ?? []));
  }

  if (matches.length === 0) {
    let query = supabase.from("slade_contacts").select("*").ilike("first_name", input.firstName.trim());
    if (input.lastName) query = query.ilike("last_name", input.lastName.trim());
    const { data, error } = await query.returns<SladeContact[]>();
    if (error) throw new Error(error.message);
    matches.push(...(data ?? []));
  }

  return Array.from(new Map(matches.map((m) => [m.id, m])).values());
}

export async function findOrCreateContact(
  supabase: SupabaseClient,
  input: Pick<SladeContact, "first_name"> & Partial<Omit<SladeContact, "id" | "created_at" | "updated_at">>
): Promise<{ contact: SladeContact; created: boolean; possibleDuplicates: SladeContact[] }> {
  const duplicates = await findPossibleDuplicateContacts(supabase, {
    email: input.email,
    phone: input.phone,
    firstName: input.first_name,
    lastName: input.last_name,
  });

  // An exact email or phone match is treated as the same person -- reuse
  // it rather than creating a new row. A name-only match is surfaced as a
  // possible duplicate but does NOT block creation (see tradeoff note in
  // SLADE/DATA_MODEL.md).
  const exact = duplicates.find(
    (d) => (input.email && d.email?.toLowerCase() === input.email.toLowerCase()) || (input.phone && d.phone === input.phone)
  );
  if (exact) return { contact: exact, created: false, possibleDuplicates: [] };

  const { data, error } = await supabase.from("slade_contacts").insert(input).select("*").returns<SladeContact[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_contacts returned no row.");
  return { contact: data[0], created: true, possibleDuplicates: duplicates };
}

export async function updateContact(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<SladeContact, "id" | "created_at" | "updated_at">>,
  changedBy?: string
): Promise<SladeContact> {
  const { data: beforeRows, error: beforeError } = await supabase.from("slade_contacts").select("*").eq("id", id).returns<SladeContact[]>();
  if (beforeError) throw new Error(beforeError.message);
  const before = beforeRows?.[0];
  if (!before) throw new Error(`slade_contacts ${id} not found`);

  const { data, error } = await supabase
    .from("slade_contacts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeContact[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_contacts ${id} not found after update`);

  for (const field of ["relationship_status", "lead_status"] as const) {
    if (patch[field] && patch[field] !== before[field]) {
      await logChange(supabase, {
        tableName: "slade_contacts",
        recordId: id,
        fieldName: field,
        oldValue: before[field],
        newValue: patch[field] as string,
        changedBy,
      });
    }
  }

  return data[0];
}
