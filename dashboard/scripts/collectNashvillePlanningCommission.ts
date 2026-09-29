// Second Nashville Plans collector -- Metro Planning COMMISSION's own
// case review (the earlier stage, before a case ever reaches Council;
// see collectNashvilleCouncilZoning.ts for that later stage). Unlike
// Council's Legistar API, this data only exists as PDF "Action Agenda"
// documents on nashville.gov -- no structured API found (confirmed: the
// Planning Commission body has zero events in Legistar despite Council
// data back to 2019). PDF parsing is genuinely the right tool here per
// docs/DATA_INTELLIGENCE_PIPELINE.md's API > GIS > CSV > PDF preference
// order -- there's no higher-priority source available for this stage.
//
// Discovery: the meeting-documents listing page
// (nashville.gov/departments/planning/boards/planning-commission/meeting-documents)
// paginates real "Planning Commission Meeting, Action Agenda, <date>"
// links in its own link text -- both the document type and the meeting
// date are readable straight from the anchor text, no separate date
// lookup needed.
//
// Case numbers use the SAME scheme as collectNashvilleCouncilZoning.ts's
// case_number (Metro Planning's own "2026Z-XXXPR-001"/"2026SP-XXX-001"
// proposal numbers) -- running both collectors lets a case created by one
// get enriched by the other via the shared case_number, never duplicated.
// Enrichment only ever fills currently-null fields, never overwrites a
// real value already on file, in either direction.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseActionAgenda, mapActionToStatus, type ParsedActionItem } from "./nashvillePlanningCommissionParser";

const MARKET_SLUG = "nashville-tn";
const BASE_URL = "https://www.nashville.gov";
const MEETING_DOCS_URL = `${BASE_URL}/departments/planning/boards/planning-commission/meeting-documents`;
const USER_AGENT = "Mozilla/5.0 (compatible; GroundbreakableCollector/1.0)";
const HISTORY_MONTHS = 24;

type AgendaListing = { url: string; meetingDate: string; label: string };

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run collect:nashville-planning-commission\` from dashboard/ so .env.local loads.`);
  return value;
}

async function discoverActionAgendas(): Promise<AgendaListing[]> {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - HISTORY_MONTHS);

  const found: AgendaListing[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < 40; page++) {
    const res = await fetch(`${MEETING_DOCS_URL}?page=${page}`, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) break;
    const html = await res.text();

    const re = /<a href="([^"]+\.pdf)"[^>]*>\s*Planning Commission Meeting, Action Agenda, ([^<]+?)\s*<\/a>/g;
    let matchCount = 0;
    let oldestOnPage: Date | null = null;
    for (const m of html.matchAll(re)) {
      matchCount++;
      const url = m[1].startsWith("http") ? m[1] : `${BASE_URL}${m[1]}`;
      if (seen.has(url)) continue;
      seen.add(url);
      const label = m[2].trim();
      const meetingDate = new Date(label);
      if (Number.isNaN(meetingDate.getTime())) continue;
      if (!oldestOnPage || meetingDate < oldestOnPage) oldestOnPage = meetingDate;
      found.push({ url, meetingDate: meetingDate.toISOString().slice(0, 10), label });
    }

    if (matchCount === 0) break; // no more Action Agenda links -- end of pagination
    if (oldestOnPage && oldestOnPage < cutoff) break;
  }

  return found;
}

async function fetchAgendaText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  return result.text;
}

async function ensureSource(supabase: SupabaseClient, listing: AgendaListing): Promise<string> {
  const { data: existing } = await supabase.from("sources").select("id").eq("url", listing.url).limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: inserted, error } = await supabase
    .from("sources")
    .insert({
      agency: "Metro Nashville Planning Commission",
      title: `Planning Commission Action Agenda, ${listing.label}`,
      source_type: "agency_document",
      url: listing.url,
      published_date: listing.meetingDate,
    })
    .select("id")
    .single();
  if (error || !inserted) throw new Error(`Failed to create source row for ${listing.url}: ${error?.message}`);
  return inserted.id;
}

const COMPANY_SUFFIX_RE = /\b(LLC|L\.L\.C\.|LC|L\.C\.|Inc\.?|P\.A\.|PA|Co\.?|Ltd\.?|Corp\.?|Trust|Group|Associates|Holdings|Properties|Surveying)\b/i;

function splitParty(name: string): { personName: string | null; companyName: string | null } {
  const trimmed = name.trim();
  return COMPANY_SUFFIX_RE.test(trimmed) ? { personName: null, companyName: trimmed } : { personName: trimmed, companyName: null };
}

async function upsertCase(supabase: SupabaseClient, marketId: string, item: ParsedActionItem, meetingDate: string, sourceId: string): Promise<void> {
  const status = mapActionToStatus(item.actionText);

  const { data: existing } = await supabase
    .from("entitlement_cases")
    .select("id, address, acreage, existing_zoning, requested_zoning, proposed_use, planning_commission_hearing_date")
    .eq("market_id", marketId)
    .eq("case_number", item.caseNumber)
    .limit(1);

  let caseId: string;
  if (existing && existing.length > 0) {
    const row = existing[0];
    caseId = row.id;
    // Enrich only -- fill currently-null fields, never overwrite a real value.
    const patch: Record<string, unknown> = { planning_commission_hearing_date: row.planning_commission_hearing_date ?? meetingDate };
    if (row.address == null && item.address) patch.address = item.address;
    if (row.acreage == null && item.acreage != null) patch.acreage = item.acreage;
    if (row.existing_zoning == null && item.existingZoning) patch.existing_zoning = item.existingZoning;
    if (row.requested_zoning == null && item.requestedZoning) patch.requested_zoning = item.requestedZoning;
    if (row.proposed_use == null && item.useDescription) patch.proposed_use = item.useDescription;
    await supabase.from("entitlement_cases").update(patch).eq("id", caseId);
  } else {
    const { data: inserted, error } = await supabase
      .from("entitlement_cases")
      .insert({
        market_id: marketId,
        case_number: item.caseNumber,
        summary: item.useDescription
          ? `Request to rezone from ${item.existingZoning ?? "?"} to ${item.requestedZoning ?? "?"}, to permit ${item.useDescription}.`
          : item.existingZoning
            ? `Request to rezone from ${item.existingZoning} to ${item.requestedZoning}.`
            : null,
        address: item.address,
        acreage: item.acreage,
        existing_zoning: item.existingZoning,
        requested_zoning: item.requestedZoning,
        proposed_use: item.useDescription,
        council_district: item.councilDistrict,
        planning_commission_hearing_date: meetingDate,
        ordinance_number: item.relatedBillNumber,
        status,
        source_id: sourceId,
        confidence: "verified",
      })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error(`  ! failed to save case ${item.caseNumber}: ${error?.message}`);
      return;
    }
    caseId = inserted.id;

    for (const [role, name] of [
      ["applicant", item.applicant],
      ["owner", item.owner],
    ] as const) {
      if (!name) continue;
      const { personName, companyName } = splitParty(name);
      await supabase.from("entitlement_case_parties").insert({ case_id: caseId, role, person_name: personName, company_name: companyName, source_id: sourceId });
    }
  }

  await supabase.from("entitlement_case_events").insert({
    case_id: caseId,
    event_type: "planning_commission_action",
    decision_body: "planning_commission",
    event_date: meetingDate,
    outcome: status,
    motion_text: item.actionText,
    vote_yes: item.voteYes,
    vote_no: item.voteNo,
    source_id: sourceId,
    confidence: "verified",
  });
}

async function main() {
  const supabaseUrl = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: market, error: marketError } = await supabase.from("markets").select("id").eq("slug", MARKET_SLUG).single();
  if (marketError || !market) throw new Error(`Market ${MARKET_SLUG} not found: ${marketError?.message}`);
  const marketId = market.id as string;

  console.log(`Discovering Action Agendas from the last ${HISTORY_MONTHS} months...`);
  const listings = await discoverActionAgendas();
  console.log(`Found ${listings.length} agendas.`);

  let totalItems = 0;
  for (const listing of listings) {
    console.log(`Processing ${listing.label}...`);
    let text: string;
    try {
      text = await fetchAgendaText(listing.url);
    } catch (err) {
      console.error(`  ! failed to fetch/parse PDF: ${(err as Error).message}`);
      continue;
    }
    const items = parseActionAgenda(text);
    if (items.length === 0) {
      console.log(`  ! no items extracted -- possible format mismatch, skipping`);
      continue;
    }
    const sourceId = await ensureSource(supabase, listing);
    for (const item of items) {
      await upsertCase(supabase, marketId, item, listing.meetingDate, sourceId);
      totalItems++;
    }
    console.log(`  ${items.length} items processed.`);
  }

  console.log(`Done. Processed ${totalItems} Planning Commission items across ${listings.length} agendas for Nashville (market ${marketId}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
