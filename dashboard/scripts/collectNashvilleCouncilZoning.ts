// First API-based (not PDF) Plans collector -- Nashville Metro Council's
// zoning ordinances are tracked in Legistar (webapi.legistar.com), a real
// public OData REST API, no key required. This covers the Council-level
// FINAL decision stage (the same role Lawrence's City Commission
// collector plays) -- rezoning/PUD-cancellation bills requested by the
// Metro Planning Dept, each one a single Matter with its own real detail
// page.
//
// What this does NOT cover: Metro Planning COMMISSION's own earlier-stage
// case review (the initial rezoning/plat/site-plan application, before it
// ever reaches Council) isn't in Legistar at all -- confirmed by querying
// events for BodyId 232 ("Planning Commission") and finding zero, despite
// Legistar tracking Council and its committees back to 2019. Planning
// Commission publishes its own agendas as standalone PDFs on nashville.gov
// in a format this repo has no parser for yet -- a separate, larger build.
//
// Case numbers: each bill's title embeds Metro Planning's own case number
// in "(Proposal No. 2026SP-033-001)" -- that, not the Council bill number
// (BL2026-####), is what's stored as entitlement_cases.case_number, since
// it's the number that will also appear in a future Planning Commission
// collector and is what actually correlates the two stages of the same
// real-world case. The bill number is kept in ordinance_number instead.
// Falls back to the bill number as case_number on the small number of
// titles that don't match the "(Proposal No. ...)" pattern (e.g. PUD
// cancellations), so nothing is silently dropped.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseZoningBillTitle } from "./nashvilleZoningBillParser";

const MARKET_SLUG = "nashville-tn";
const LEGISTAR_CLIENT = "nashville";
const MATTERS_URL = `https://webapi.legistar.com/v1/${LEGISTAR_CLIENT}/matters`;
const BILL_MATTER_TYPE_ID = 53;
const HISTORY_MONTHS = 24; // matches the "12-24 months" historical-import window in docs/DATA_INTELLIGENCE_PIPELINE.md section 14

type Matter = {
  MatterId: number;
  MatterGuid: string;
  MatterFile: string;
  MatterTitle: string;
  MatterStatusName: string;
  MatterIntroDate: string | null;
  MatterAgendaDate: string | null;
  MatterPassedDate: string | null;
  MatterEnactmentDate: string | null;
  MatterEnactmentNumber: string | null;
  MatterRequester: string | null;
};

const STATUS_MAP: Record<string, string> = {
  Passed: "approved",
  Failed: "denied",
  Withdrawn: "withdrawn",
  "Indefinitely Deferred": "deferred",
  Held: "deferred",
  "Public Hearing": "pending",
  "Second Reading": "pending",
  "Third Reading": "pending",
  "First Reading": "pending",
  Introduced: "pending",
  Referred: "pending",
};

function mapStatus(matterStatus: string): string {
  return STATUS_MAP[matterStatus] ?? "pending";
}

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run collect:nashville-council-zoning\` from dashboard/ so .env.local loads.`);
  return value;
}

function toDateOnly(value: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

function legistarDetailUrl(matter: Matter): string {
  return `https://nashville.legistar.com/LegislationDetail.aspx?ID=${matter.MatterId}&GUID=${matter.MatterGuid}`;
}

async function fetchRecentPlanningMatters(): Promise<Matter[]> {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - HISTORY_MONTHS);

  const all: Matter[] = [];
  const pageSize = 1000;
  for (let skip = 0; ; skip += pageSize) {
    const params = new URLSearchParams({
      "$filter": `MatterTypeId eq ${BILL_MATTER_TYPE_ID} and MatterRequester eq 'Metro Planning Dept'`,
      "$orderby": "MatterIntroDate desc",
      "$top": String(pageSize),
      "$skip": String(skip),
    });
    const res = await fetch(`${MATTERS_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`Legistar query failed (${res.status})`);
    const page = (await res.json()) as Matter[];
    if (page.length === 0) break;

    for (const matter of page) {
      if (matter.MatterIntroDate && new Date(matter.MatterIntroDate) < cutoff) {
        return all; // paged in intro-date-desc order -- once we're past the cutoff, everything after is older
      }
      all.push(matter);
    }
    if (page.length < pageSize) break;
  }
  return all;
}

async function ensureSource(supabase: SupabaseClient, matter: Matter): Promise<string> {
  const url = legistarDetailUrl(matter);
  const { data: existing } = await supabase.from("sources").select("id").eq("url", url).limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: inserted, error } = await supabase
    .from("sources")
    .insert({
      agency: "Metro Nashville Council (Legistar)",
      title: `${matter.MatterFile}: ${matter.MatterTitle.slice(0, 200)}`,
      source_type: "agency_document",
      url,
    })
    .select("id")
    .single();
  if (error || !inserted) throw new Error(`Failed to create source row for ${matter.MatterFile}: ${error?.message}`);
  return inserted.id;
}

async function upsertCase(supabase: SupabaseClient, marketId: string, matter: Matter): Promise<void> {
  const parsed = parseZoningBillTitle(matter.MatterTitle);
  const caseNumber = parsed.proposalNumber ?? matter.MatterFile;
  const status = mapStatus(matter.MatterStatusName);
  const hearingDate = toDateOnly(matter.MatterAgendaDate);
  const finalDecisionDate = toDateOnly(matter.MatterPassedDate);
  const ordinanceAdoptedDate = toDateOnly(matter.MatterEnactmentDate);

  const { data: existing } = await supabase.from("entitlement_cases").select("id").eq("market_id", marketId).eq("case_number", caseNumber).limit(1);

  const sourceId = await ensureSource(supabase, matter);

  let caseId: string;
  if (existing && existing.length > 0) {
    caseId = existing[0].id;
    await supabase
      .from("entitlement_cases")
      .update({ status, city_commission_hearing_date: hearingDate, final_decision_date: finalDecisionDate, ordinance_adopted_date: ordinanceAdoptedDate })
      .eq("id", caseId);
  } else {
    const { data: inserted, error } = await supabase
      .from("entitlement_cases")
      .insert({
        market_id: marketId,
        case_number: caseNumber,
        summary: matter.MatterTitle,
        address: parsed.address,
        acreage: parsed.acreage,
        existing_zoning: parsed.existingZoning,
        requested_zoning: parsed.requestedZoning,
        proposed_use: parsed.useDescription,
        city_commission_hearing_date: hearingDate,
        final_decision_date: finalDecisionDate,
        ordinance_number: matter.MatterFile,
        ordinance_adopted_date: ordinanceAdoptedDate,
        status,
        source_id: sourceId,
        confidence: "verified",
      })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error(`  ! failed to save case ${caseNumber} (${matter.MatterFile}): ${error?.message}`);
      return;
    }
    caseId = inserted.id;
  }

  if (hearingDate || finalDecisionDate) {
    await supabase.from("entitlement_case_events").insert({
      case_id: caseId,
      event_type: "council_action",
      decision_body: "city_commission",
      event_date: finalDecisionDate ?? hearingDate!,
      outcome: status,
      note: `Metro Council status: ${matter.MatterStatusName}`,
      source_id: sourceId,
      confidence: "verified",
    });
  }
}

async function main() {
  const supabaseUrl = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: market, error: marketError } = await supabase.from("markets").select("id").eq("slug", MARKET_SLUG).single();
  if (marketError || !market) throw new Error(`Market ${MARKET_SLUG} not found: ${marketError?.message}`);
  const marketId = market.id as string;

  console.log(`Fetching Metro Planning Dept zoning bills from the last ${HISTORY_MONTHS} months...`);
  const matters = await fetchRecentPlanningMatters();
  console.log(`Fetched ${matters.length} bills.`);

  let processed = 0;
  for (const matter of matters) {
    await upsertCase(supabase, marketId, matter);
    processed++;
    if (processed % 100 === 0) console.log(`  ${processed}/${matters.length} processed...`);
  }

  console.log(`Done. Processed ${processed} zoning bills for Nashville (market ${marketId}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
