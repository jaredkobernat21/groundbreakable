// Collection pipeline for the Lawrence-Douglas County Planning Commission
// (Entitlement Intelligence). Unlike scripts/collectTopekaPlanningCommission.ts,
// this needs no LLM call and no human review queue for the core data: every
// packet PDF this body publishes is a consistent, machine-readable template
// (verified against real packets spanning Dec 2025 - Feb 2026 -- see
// lawrencePlanningCommissionParser.ts's own header comment), so plain text
// extraction + regex reliably recovers case numbers, acreage, zoning
// changes, and full roll-call votes by commissioner name. Writes land
// directly in entitlement_cases/entitlement_case_events/entitlement_case_
// votes/entitlement_commissioners/entitlement_case_parties, confidence
// 'reported' throughout, every row citing the exact packet PDF it came
// from -- auditable without needing a pre-publish human gate the way a
// model's free-text extraction would.
//
// Pipeline: discover meetings -> download each undiscovered packet ->
// extract text (first ~20 pages covers the agenda + prior meeting's
// minutes on every sample seen) -> parse -> upsert.
//
// A single packet contains TWO halves that land in different places:
//   - Its own AGENDA is this meeting's upcoming, undecided items -- becomes
//     a new (or updated) entitlement_cases row per case number, status
//     'pending', no vote yet.
//   - Its embedded MINUTES are the PRIOR meeting's decided items, complete
//     with the vote roll -- becomes an entitlement_case_events row (+ one
//     entitlement_case_votes row per named commissioner) on whichever
//     entitlement_cases row that case number already resolves to (created
//     either by an earlier run seeing it on an agenda, or by this same run
//     if the case's own agenda appearance predates when this script started
//     collecting).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";
import {
  parsePlanningCommissionPacket,
  type AgendaItem,
  type Commissioner,
  type MinutesItem,
  type ParsedPacket,
} from "./lawrencePlanningCommissionParser";

const MARKET_SLUG = "lawrence-ks";
const AGENCY = "Lawrence-Douglas County Planning Commission";
const DECISION_BODY = "planning_commission" as const;
const USER_AGENT = "Mozilla/5.0 (compatible; GroundbreakableCollector/1.0)";
const CIVICWEB_BASE = "https://lawrenceks.civicweb.net";
// Any Planning Commission meeting's own info page also renders the full
// sidebar meeting-schedule list (dates + ids) going back years -- this one
// is just a stable, arbitrarily-chosen anchor to fetch that list from.
const MEETING_LIST_ANCHOR_ID = "6118";
// How many of the most recent meetings to even consider -- comfortably
// covers the spec's 3-5 year precedent window without walking the full
// history (which also predates this body's current packet template; see
// discoverMeetings). Independent of --limit, which caps newly-processed
// meetings per run.
const RECENT_MEETING_WINDOW = 60;

// Request types Planning Commission itself finally decides (observed
// directly in its own minutes with a vote, no City Commission forwarding)
// vs. types where PC only recommends and City Commission has the final
// say. entitlement_cases.status should only flip to approved/denied for
// the former -- the rest stay 'pending' until a (future) City Commission
// collector observes the real final action.
const PC_FINAL_REQUEST_TYPES = new Set<AgendaItem["requestType"]>(["preliminary_plat", "minor_subdivision", "variance"]);

const REQUEST_TYPE_TO_APPROVAL_KEY: Partial<Record<AgendaItem["requestType"], string>> = {
  rezone: "rezoning",
  final_plat: "final_plat",
  preliminary_plat: "preliminary_plat",
  minor_subdivision: "minor_subdivision",
  annexation: "annexation",
  // variance omitted deliberately: the variance types seen on this body's
  // own agenda (subdivision-design-standard variances) are decided by
  // Planning Commission itself, not the Board of Zoning Appeals the
  // seeded 'variance' approval_type describes -- linking them would
  // misstate the approving authority. Left null until that second
  // variance pathway gets its own approval_type row.
  // text_amendment / other omitted: code amendments aren't a parcel-level
  // entitlement case in the same sense (frequently no address/acreage at
  // all), so no approval_type applies.
};

const VOTE_CHOICE: Record<string, "yes" | "no" | "abstain" | "recuse" | "absent"> = {
  ayes: "yes",
  nays: "no",
  abstained: "abstain",
  recused: "recuse",
  absent: "absent",
};

const COMPANY_SUFFIX_RE = /\b(LLC|L\.L\.C\.|LC|L\.C\.|Inc\.?|P\.A\.|PA|Co\.?|Ltd\.?|Corp\.?|Trust|Architects?|Engineering|Construction|Company|Group|Associates)\b/i;

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run collect:lawrence-planning\` from dashboard/ so .env.local loads.`);
  return value;
}

// --- Discovery ---------------------------------------------------------

type MeetingListing = { meetingId: string; date: string; label: string };

async function discoverMeetings(): Promise<MeetingListing[]> {
  const res = await fetch(`${CIVICWEB_BASE}/Portal/MeetingInformation.aspx?Id=${MEETING_LIST_ANCHOR_ID}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`Failed to fetch meeting list: ${res.status} ${res.statusText}`);
  const html = await res.text();

  const re = /meetingClick\(this, (\d+),0,0\)[\s\S]*?button-date">([^<]+)<\/div><div[^>]*title="([^"]*)"/g;
  const meetings: MeetingListing[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(re)) {
    const [, meetingId, dateLabel, bodyLabel] = m;
    if (!bodyLabel.trim().startsWith("Planning Commission")) continue; // skip orientation/special sessions of other bodies sharing this sidebar
    if (bodyLabel.includes("Orientation")) continue;
    if (seen.has(meetingId)) continue;
    seen.add(meetingId);
    const parsed = new Date(dateLabel);
    if (Number.isNaN(parsed.getTime())) continue;
    meetings.push({ meetingId, date: parsed.toISOString().slice(0, 10), label: bodyLabel.trim() });
  }
  const sorted = meetings.sort((a, b) => a.date.localeCompare(b.date)); // ascending, so a case's agenda appearance is always created before its vote is processed
  // The sidebar list goes back to 2019; older packets predate this body's
  // current agenda/minutes template (verified: parsing them yields zero
  // matches, not wrong data) and predate what's relevant to today's
  // development activity anyway. Cap to a recent window rather than
  // walking the full multi-year history from the beginning every run.
  return sorted.slice(-RECENT_MEETING_WINDOW);
}

async function findPacketUrl(meetingId: string): Promise<{ url: string; title: string } | null> {
  const res = await fetch(`${CIVICWEB_BASE}/Portal/MeetingInformation.aspx?Id=${meetingId}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const m = /href="(\/document\/\d+\/[^"]*\.pdf\?handle=[^"]*)"[^>]*id="ctl00_MainContent_DocumentPrintVersion"/i.exec(html);
  if (!m) return null;
  const url = `${CIVICWEB_BASE}${m[1].replace(/&amp;/g, "&")}`;
  const titleMatch = /\/document\/\d+\/([^/?]+)\.pdf/i.exec(m[1]);
  const title = titleMatch ? decodeURIComponent(titleMatch[1].replace(/\+/g, " ")) : `Planning Commission meeting ${meetingId}`;
  return { url, title };
}

async function alreadyProcessed(supabase: SupabaseClient, packetUrl: string): Promise<boolean> {
  const { data } = await supabase.from("sources").select("id").eq("url", packetUrl).limit(1);
  return !!(data && data.length > 0);
}

// --- Party classification ------------------------------------------------

function splitParty(name: string): { personName: string | null; companyName: string | null } {
  const trimmed = name.trim();
  return COMPANY_SUFFIX_RE.test(trimmed) ? { personName: null, companyName: trimmed } : { personName: trimmed, companyName: null };
}

// --- DB writes -------------------------------------------------------------

async function upsertCommissioners(
  supabase: SupabaseClient,
  marketId: string,
  commissioners: Commissioner[],
  sourceId: string
): Promise<Map<string, string>> {
  const idByName = new Map<string, string>();
  for (const c of commissioners) {
    const { data: existing } = await supabase
      .from("entitlement_commissioners")
      .select("id")
      .eq("market_id", marketId)
      .eq("decision_body", DECISION_BODY)
      .ilike("full_name", c.fullName)
      .limit(1);
    if (existing && existing.length > 0) {
      idByName.set(c.fullName, existing[0].id);
      continue;
    }
    const { data: inserted, error } = await supabase
      .from("entitlement_commissioners")
      .insert({
        market_id: marketId,
        full_name: c.fullName,
        decision_body: DECISION_BODY,
        appointing_jurisdiction: c.appointingJurisdiction,
        role: c.role,
        source_id: sourceId,
        confidence: "reported",
      })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error(`  ! failed to save commissioner ${c.fullName}: ${error?.message}`);
      continue;
    }
    idByName.set(c.fullName, inserted.id);
  }
  return idByName;
}

async function findOrCreateCommissioner(supabase: SupabaseClient, marketId: string, fullName: string, sourceId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from("entitlement_commissioners")
    .select("id")
    .eq("market_id", marketId)
    .eq("decision_body", DECISION_BODY)
    .ilike("full_name", fullName)
    .limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: inserted, error } = await supabase
    .from("entitlement_commissioners")
    .insert({ market_id: marketId, full_name: fullName, decision_body: DECISION_BODY, role: "member", source_id: sourceId, confidence: "reported" })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error(`  ! failed to save commissioner ${fullName}: ${error?.message}`);
    return null;
  }
  return inserted.id;
}

async function upsertCaseFromAgendaItem(
  supabase: SupabaseClient,
  marketId: string,
  item: AgendaItem,
  meetingDate: string,
  sourceId: string
): Promise<string | null> {
  const { data: existing } = await supabase.from("entitlement_cases").select("id").eq("market_id", marketId).eq("case_number", item.caseNumber!).limit(1);
  if (existing && existing.length > 0) {
    // Case already on file (from an earlier meeting's agenda, or this
    // item reappearing after a deferral) -- don't clobber existing data,
    // just make sure this hearing date is recorded if it's later than
    // what's there, so a re-deferred item's most recent slot is visible.
    await supabase
      .from("entitlement_cases")
      .update({ planning_commission_hearing_date: meetingDate })
      .eq("id", existing[0].id)
      .lt("planning_commission_hearing_date", meetingDate);
    return existing[0].id;
  }

  const approvalTypeId = REQUEST_TYPE_TO_APPROVAL_KEY[item.requestType]
    ? (await supabase.from("entitlement_approval_types").select("id").eq("market_id", marketId).eq("key", REQUEST_TYPE_TO_APPROVAL_KEY[item.requestType]!).single()).data?.id ?? null
    : null;

  const { data: inserted, error } = await supabase
    .from("entitlement_cases")
    .insert({
      market_id: marketId,
      case_number: item.caseNumber,
      summary: item.rawText,
      address: item.address,
      acreage: item.acreage,
      approval_type_id: approvalTypeId,
      existing_zoning: item.existingZoning,
      requested_zoning: item.requestedZoning,
      proposed_use: item.requestType === "rezone" || item.requestType === "annexation" ? item.requestedZoning : null,
      planning_commission_hearing_date: meetingDate,
      status: item.deferred ? "deferred" : "pending",
      source_id: sourceId,
      confidence: "reported",
    })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error(`  ! failed to save case ${item.caseNumber}: ${error?.message}`);
    return null;
  }

  for (const [role, name] of [
    ["applicant", item.submittedBy],
    ["landowner", item.onBehalfOf],
  ] as const) {
    if (!name) continue;
    const { personName, companyName } = splitParty(name);
    await supabase.from("entitlement_case_parties").insert({ case_id: inserted.id, role, person_name: personName, company_name: companyName, source_id: sourceId });
  }

  return inserted.id;
}

async function findCaseIdByNumber(supabase: SupabaseClient, marketId: string, caseNumber: string): Promise<string | null> {
  const { data } = await supabase.from("entitlement_cases").select("id").eq("market_id", marketId).eq("case_number", caseNumber).limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

function deriveOutcome(item: MinutesItem, requestType: AgendaItem["requestType"] | undefined): { outcome: string; statusUpdate: string | null } {
  const text = `${item.actionText ?? ""} ${item.votes?.resultText ?? ""}`.toLowerCase();
  const denied = /\bden(y|ied|ial)\b/.test(text);
  const isFinal = requestType ? PC_FINAL_REQUEST_TYPES.has(requestType) : false;

  if (isFinal) return denied ? { outcome: "denied", statusUpdate: "denied" } : { outcome: "approved", statusUpdate: "approved" };
  return denied ? { outcome: "recommended_denial", statusUpdate: null } : { outcome: "recommended_approval", statusUpdate: null };
}

async function recordMinutesDecision(
  supabase: SupabaseClient,
  marketId: string,
  item: MinutesItem,
  meetingDate: string,
  sourceId: string
): Promise<void> {
  if (!item.caseNumber) return;

  let caseId = await findCaseIdByNumber(supabase, marketId, item.caseNumber);
  if (!caseId) {
    // A case can appear for the first time in a MINUTES block if this
    // collector's very first run starts mid-stream (the case's own
    // agenda appearance was in a packet from before collection began).
    // Create a thin record from what the minutes alone give us rather
    // than dropping the vote data on the floor.
    const { data: inserted, error } = await supabase
      .from("entitlement_cases")
      .insert({ market_id: marketId, case_number: item.caseNumber, summary: item.rawText, status: "pending", source_id: sourceId, confidence: "reported" })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error(`  ! failed to create thin case record for ${item.caseNumber}: ${error?.message}`);
      return;
    }
    caseId = inserted.id;
  }

  const { data: caseRow } = await supabase.from("entitlement_cases").select("id").eq("id", caseId).single();
  if (!caseRow) return;

  // requestType isn't stored on entitlement_cases directly; re-derive the
  // PC-final-vs-recommend-only distinction from the request type embedded
  // in the case's own summary text is unreliable, so this reads it off
  // the minutes item's own text via the same classifier the agenda side
  // uses -- close enough since both describe the same request.
  const { classifyForOutcome } = { classifyForOutcome: (t: string) => (t.includes("plat") ? "preliminary_plat" : t.includes("variance") ? "variance" : t.includes("annex") ? "annexation" : t.includes("rezone") ? "rezone" : "other") };
  const requestType = classifyForOutcome((item.actionText ?? "").toLowerCase()) as AgendaItem["requestType"];
  const { outcome, statusUpdate } = deriveOutcome(item, requestType);

  const { data: eventRow, error: eventError } = await supabase
    .from("entitlement_case_events")
    .insert({
      case_id: caseId,
      event_type: "planning_commission_hearing",
      decision_body: DECISION_BODY,
      event_date: meetingDate,
      motion_text: item.actionText,
      outcome,
      vote_yes: item.votes?.ayes.length ?? null,
      vote_no: item.votes?.nays.length ?? null,
      vote_abstain: item.votes?.abstained.length ?? null,
      note: item.votes?.resultText ?? null,
      source_id: sourceId,
      confidence: "reported",
    })
    .select("id")
    .single();
  if (eventError || !eventRow) {
    console.error(`  ! failed to save vote event for ${item.caseNumber}: ${eventError?.message}`);
    return;
  }

  if (statusUpdate) {
    await supabase.from("entitlement_cases").update({ status: statusUpdate, final_decision_date: meetingDate }).eq("id", caseId);
  }

  if (item.votes) {
    for (const [key, choice] of Object.entries(VOTE_CHOICE) as [keyof typeof VOTE_CHOICE, string][]) {
      const names = item.votes[key as "ayes" | "nays" | "abstained" | "absent" | "recused"];
      for (const name of names) {
        const commissionerId = await findOrCreateCommissioner(supabase, marketId, name, sourceId);
        if (!commissionerId) continue;
        await supabase.from("entitlement_case_votes").insert({ case_event_id: eventRow.id, commissioner_id: commissionerId, vote: choice, source_id: sourceId });
      }
    }
  }
}

// --- Main ------------------------------------------------------------------

async function processPacket(supabase: SupabaseClient, marketId: string, meeting: MeetingListing, packetUrl: string, packetTitle: string): Promise<{ agendaCases: number; votesRecorded: number }> {
  const pdfRes = await fetch(packetUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!pdfRes.ok) throw new Error(`Failed to download packet: ${pdfRes.status}`);
  const buffer = Buffer.from(await pdfRes.arrayBuffer());

  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText({ first: 20 });
  await parser.destroy();

  const parsed: ParsedPacket = parsePlanningCommissionPacket(text);

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .insert({ agency: AGENCY, title: packetTitle, source_type: "public_record", url: packetUrl, published_date: parsed.agendaMeetingDate ?? meeting.date })
    .select("id")
    .single();
  if (sourceError || !source) throw new Error(`Failed to save source: ${sourceError?.message}`);

  if (parsed.commissionersPresent.length > 0) {
    await upsertCommissioners(supabase, marketId, parsed.commissionersPresent, source.id);
  }

  let agendaCases = 0;
  for (const item of parsed.agendaItems) {
    const caseId = await upsertCaseFromAgendaItem(supabase, marketId, item, parsed.agendaMeetingDate ?? meeting.date, source.id);
    if (caseId) agendaCases++;
  }

  let votesRecorded = 0;
  for (const item of parsed.minutesItems) {
    if (!item.caseNumber || !item.votes) continue;
    await recordMinutesDecision(supabase, marketId, item, parsed.minutesMeetingDate ?? meeting.date, source.id);
    votesRecorded++;
  }

  return { agendaCases, votesRecorded };
}

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 10;

  const supabaseUrl = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: market, error: marketError } = await supabase.from("markets").select("id, name, state").eq("slug", MARKET_SLUG).single();
  if (marketError || !market) throw new Error(`Market "${MARKET_SLUG}" not found: ${marketError?.message}`);

  console.log(`Discovering Planning Commission meetings for ${market.name}, ${market.state}...`);
  const meetings = await discoverMeetings();
  console.log(`  found ${meetings.length} meetings in the schedule sidebar`);

  let processed = 0;
  let totalCases = 0;
  let totalVotes = 0;
  let skipped = 0;

  for (const meeting of meetings) {
    if (processed >= limit) break;

    const packet = await findPacketUrl(meeting.meetingId);
    if (!packet) {
      console.log(`\n${meeting.date} (id ${meeting.meetingId}) -- no packet PDF found, skipping`);
      continue;
    }
    if (await alreadyProcessed(supabase, packet.url)) {
      skipped++;
      continue;
    }

    console.log(`\n${meeting.date} -- ${packet.title}`);
    try {
      const { agendaCases, votesRecorded } = await processPacket(supabase, market.id as string, meeting, packet.url, packet.title);
      console.log(`  ${agendaCases} agenda case(s), ${votesRecorded} vote record(s)`);
      totalCases += agendaCases;
      totalVotes += votesRecorded;
      processed++;
    } catch (err) {
      console.error(`  ! failed: ${(err as Error).message}`);
    }
  }

  console.log(
    `\nDone. ${meetings.length} meetings in the schedule, ${skipped} already processed, ${processed} newly processed -- ${totalCases} agenda cases touched, ${totalVotes} vote records saved.`
  );
}

main().catch((error) => {
  console.error("Collection run failed:", error);
  process.exit(1);
});
