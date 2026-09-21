import type { SupabaseClient } from "@supabase/supabase-js";
import type { OpportunityStatus, ReportSectionKey, SladeOpportunity, SladeReport } from "./types";

// A report can only be generated from an opportunity that's cleared
// screening/research -- this is a downstream convenience gate, not the
// real one (the real one is the verification gate in verification.ts,
// enforced at the DB level on slade_opportunities itself). See
// SLADE/templates/opportunity_report_template.md for the section list.
const REPORTABLE_STATUSES: OpportunityStatus[] = ["qualified", "ready_to_deliver", "delivered"];

export const REPORT_SECTION_ORDER: ReportSectionKey[] = [
  "executive_thesis",
  "property_snapshot",
  "why_it_matters",
  "development_potential",
  "planning_zoning",
  "infrastructure",
  "entitlement_path",
  "market_context",
  "risks",
  "unknowns",
  "next_steps",
  "sources",
];

export function canGenerateReport(opportunity: Pick<SladeOpportunity, "opportunity_status">): boolean {
  return REPORTABLE_STATUSES.includes(opportunity.opportunity_status);
}

// Returns an empty section skeleton in the canonical order -- callers
// (SLADE, or a future admin UI) fill in `content`/`source_ids` per
// section rather than inventing their own shape.
export function buildReportSkeleton(): SladeReport["sections"] {
  return Object.fromEntries(REPORT_SECTION_ORDER.map((key) => [key, { content: "", source_ids: [] }])) as SladeReport["sections"];
}

export async function createReport(
  supabase: SupabaseClient,
  opportunity: Pick<SladeOpportunity, "opportunity_status" | "id" | "site_id" | "contact_id">,
  input: Partial<Omit<SladeReport, "id" | "created_at" | "updated_at" | "opportunity_id" | "site_id" | "contact_id">> = {}
): Promise<SladeReport> {
  if (!canGenerateReport(opportunity)) {
    throw new Error(
      `Cannot generate a report for an opportunity in status "${opportunity.opportunity_status}" — it must be qualified or later.`
    );
  }

  const { data, error } = await supabase
    .from("slade_reports")
    .insert({
      opportunity_id: opportunity.id,
      site_id: opportunity.site_id,
      contact_id: opportunity.contact_id,
      sections: buildReportSkeleton(),
      ...input,
    })
    .select("*")
    .returns<SladeReport[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_reports returned no row.");
  return data[0];
}

export async function getReport(supabase: SupabaseClient, id: string): Promise<SladeReport | null> {
  const { data, error } = await supabase.from("slade_reports").select("*").eq("id", id).limit(1).returns<SladeReport[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function updateReportSection(
  supabase: SupabaseClient,
  id: string,
  section: ReportSectionKey,
  content: string,
  sourceIds: string[] = []
): Promise<SladeReport> {
  const report = await getReport(supabase, id);
  if (!report) throw new Error(`Report ${id} not found`);

  const sections = { ...report.sections, [section]: { content, source_ids: sourceIds } };

  const { data, error } = await supabase
    .from("slade_reports")
    .update({ sections, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeReport[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_reports ${id} not found`);
  return data[0];
}
