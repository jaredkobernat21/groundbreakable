import type { SupabaseClient } from "@supabase/supabase-js";

// Resolves a free-text mention ("Dan", "TJ", "the Charlotte property")
// into candidate structured records. Structured lookup, not a vector
// database -- see SLADE/DATA_MODEL.md's Search / retrieval section for
// why. SLADE should disambiguate against `matches` rather than guessing
// when there's more than one plausible candidate.
export interface SearchResult {
  type: "contact" | "organization" | "site";
  id: string;
  label: string;
  detail: string | null;
}

export async function resolveEntity(supabase: SupabaseClient, query: string, limit = 5): Promise<SearchResult[]> {
  const term = `%${query.trim()}%`;
  if (!query.trim()) return [];

  const [contacts, organizations, sites] = await Promise.all([
    supabase
      .from("slade_contacts")
      .select("id, first_name, last_name, relationship_type")
      .or(`first_name.ilike.${term},last_name.ilike.${term}`)
      .limit(limit),
    supabase.from("slade_organizations").select("id, name, type").ilike("name", term).limit(limit),
    supabase.from("slade_sites").select("id, address, city, state").or(`address.ilike.${term},city.ilike.${term}`).limit(limit),
  ]);

  const results: SearchResult[] = [];

  for (const row of contacts.data ?? []) {
    results.push({
      type: "contact",
      id: row.id,
      label: [row.first_name, row.last_name].filter(Boolean).join(" "),
      detail: row.relationship_type,
    });
  }
  for (const row of organizations.data ?? []) {
    results.push({ type: "organization", id: row.id, label: row.name, detail: row.type });
  }
  for (const row of sites.data ?? []) {
    results.push({
      type: "site",
      id: row.id,
      label: row.address ?? "(no address on file)",
      detail: [row.city, row.state].filter(Boolean).join(", ") || null,
    });
  }

  return results;
}
