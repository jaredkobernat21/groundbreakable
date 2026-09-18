// Collection pipeline for the Lawrence City Commission -- the counterpart
// to collectLawrencePlanningCommission.ts. Same no-API, no-human-review
// approach (see that file's header comment for why), but City Commission
// publishes differently: its own minutes are a standalone document per
// meeting, filed in a separate year-indexed archive, not embedded in the
// next meeting's agenda packet the way Planning Commission does it. So
// discovery here has two parts -- the regular meeting-schedule sidebar
// (for each meeting's own upcoming agenda) and the minutes archive (for
// that same meeting's actual vote record, once published).
//
// Unlike Planning Commission, City Commission is (with rare exception)
// the FINAL decision-maker on whatever reaches it -- so a recorded action
// here always updates entitlement_cases.status, never just an
// "recommended_*" outcome.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";
import {
  parseCityCommissionAgenda,
  parseCityCommissionMinutes,
  type AgendaItem,
  type Commissioner,
  type MinutesItem,
} from "./lawrencePlanningCommissionParser";

const MARKET_SLUG = "lawrence-ks";
const AGENCY = "Lawrence City Commission";
const DECISION_BODY = "city_commission" as const;
const USER_AGENT = "Mozilla/5.0 (compatible; GroundbreakableCollector/1.0)";
const CIVICWEB_BASE = "https://lawrenceks.civicweb.net";
const MEETING_LIST_ANCHOR_ID = "218"; // any City Commission meeting's info page renders the full sidebar schedule
const MINUTES_ARCHIVE_INDEX_URL = `${CIVICWEB_BASE}/filepro/documents/5524/`; // the "Minutes Archives" link off any City Commission meeting page -- a year-indexed folder tree
const RECENT_MEETING_WINDOW = 60;

const VOTE_CHOICE: Record<string, "yes" | "no" | "abstain" | "recuse" | "absent"> = {
  ayes: "yes",
  nays: "no",
  abstained: "abstain",
  recused: "recuse",
  absent: "absent",
};

const REQUEST_TYPE_TO_APPROVAL_KEY: Partial<Record<AgendaItem["requestType"], string>> = {
  rezone: "rezoning",
  final_plat: "final_plat",
  preliminary_plat: "preliminary_plat",
  minor_subdivision: "minor_subdivision",
  annexation: "annexation",
};

const COMPANY_SUFFIX_RE = /\b(LLC|L\.L\.C\.|LC|L\.C\.|Inc\.?|P\.A\.|PA|Co\.?|Ltd\.?|Corp\.?|Trust|Architects?|Engineering|Construction|Company|Group|Associates)\b/i;

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run collect:lawrence-city-commission\` from dashboard/ so .env.local loads.`);
  return value;
}

function splitParty(name: string): { personName: string | null; companyName: string | null } {
  const trimmed = name.trim();
  return COMPANY_SUFFIX_RE.test(trimmed) ? { personName: null, companyName: trimmed } : { personName: trimmed, companyName: null };
}

// --- Discovery: meeting schedule ------------------------------------------

type MeetingListing = { meetingId: string; date: string; label: string };

async function discoverMeetings(): Promise<MeetingListing[]> {
  const res = await fetch(`${CIVICWEB_BASE}/Portal/MeetingInformation.aspx?Id=${MEETING_LIST_ANCHOR_ID}`, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Failed to fetch meeting list: ${res.status} ${res.statusText}`);
  const html = await res.text();

  const re = /meetingClick\(this, (\d+),0,0\)[\s\S]*?button-date">([^<]+)<\/div><div[^>]*title="([^"]*)"/g;
  const meetings: MeetingListing[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(re)) {
    const [, meetingId, dateLabel, bodyLabel] = m;
    if (!bodyLabel.trim().startsWith("City Commission")) continue;
    if (seen.has(meetingId)) continue;
    seen.add(meetingId);
    const parsed = new Date(dateLabel);
    if (Number.isNaN(parsed.getTime())) continue;
    meetings.push({ meetingId, date: parsed.toISOString().slice(0, 10), label: bodyLabel.trim() });
  }
  const sorted = meetings.sort((a, b) => a.date.localeCompare(b.date));
  return sorted.slice(-RECENT_MEETING_WINDOW);
}

async function findAgendaPacketUrl(meetingId: string): Promise<{ url: string; title: string } | null> {
  const res = await fetch(`${CIVICWEB_BASE}/Portal/MeetingInformation.aspx?Id=${meetingId}`, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  const html = await res.text();
  const m = /href="(\/document\/\d+\/[^"]*\.pdf\?handle=[^"]*)"[^>]*id="ctl00_MainContent_DocumentPrintVersion"/i.exec(html);
  if (!m) return null;
  const url = `${CIVICWEB_BASE}${m[1].replace(/&amp;/g, "&")}`;
  const titleMatch = /\/document\/\d+\/([^/?]+)\.pdf/i.exec(m[1]);
  const title = titleMatch ? decodeURIComponent(titleMatch[1].replace(/\+/g, " ")) : `City Commission meeting ${meetingId}`;
  return { url, title };
}

// --- Discovery: minutes archive --------------------------------------------
// A separate document tree, indexed by year, entirely distinct from the
// meeting-schedule sidebar above. Each entry's own link text states the
// exact meeting date in plain English ("City Commission - Jan 03 2023 -
// Minutes - Pdf"), which is what's matched against a given meeting's date
// to find its vote record.

type MinutesEntry = { date: string; documentId: string; title: string };
const minutesIndexCache = new Map<string, MinutesEntry[]>(); // year -> entries, fetched at most once per run

async function getYearFolderIds(): Promise<Map<string, string>> {
  const res = await fetch(MINUTES_ARCHIVE_INDEX_URL, { headers: { "User-Agent": USER_AGENT } });
  const html = await res.text();
  const years = new Map<string, string>();
  for (const m of html.matchAll(/href="(\/filepro\/documents\/\d+)"[^>]*>\s*(\d{4})\s*<\/a>/g)) {
    years.set(m[2], `${CIVICWEB_BASE}${m[1]}`);
  }
  return years;
}

async function getMinutesForYear(year: string, yearFolderUrl: string): Promise<MinutesEntry[]> {
  if (minutesIndexCache.has(year)) return minutesIndexCache.get(year)!;
  const res = await fetch(yearFolderUrl, { headers: { "User-Agent": USER_AGENT } });
  const html = await res.text();
  const entries: MinutesEntry[] = [];
  for (const m of html.matchAll(/href="(\/document\/(\d+))"[^>]*>\s*City Commission - ([A-Za-z]+ \d{1,2} \d{4}) - Minutes - Pdf\s*<\/a>/g)) {
    const parsed = new Date(m[3]);
    if (Number.isNaN(parsed.getTime())) continue;
    entries.push({ date: parsed.toISOString().slice(0, 10), documentId: m[2], title: `City Commission - ${m[3]} - Minutes - Pdf` });
  }
  minutesIndexCache.set(year, entries);
  return entries;
}

async function findMinutesUrl(meetingDate: string, yearFolders: Map<string, string>): Promise<{ url: string; title: string } | null> {
  const year = meetingDate.slice(0, 4);
  const folderUrl = yearFolders.get(year);
  if (!folderUrl) return null;
  const entries = await getMinutesForYear(year, folderUrl);
  const match = entries.find((e) => e.date === meetingDate);
  if (!match) return null;
  return { url: `${CIVICWEB_BASE}/document/${match.documentId}`, title: match.title };
}

async function alreadyProcessed(supabase: SupabaseClient, url: string): Promise<boolean> {
  const { data } = await supabase.from("sources").select("id").eq("url", url).limit(1);
  return !!(data && data.length > 0);
}

// --- DB writes (mirrors collectLawrencePlanningCommission.ts) --------------

async function findOrCreateCommissioner(supabase: SupabaseClient, marketId: string, fullName: string, sourceId: string, role: Commissioner["role"] = "member"): Promise<string | null> {
  const { data: existing } = await supabase.from("entitlement_commissioners").select("id").eq("market_id", marketId).eq("decision_body", DECISION_BODY).ilike("full_name", fullName).limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: inserted, error } = await supabase
    .from("entitlement_commissioners")
    .insert({ market_id: marketId, full_name: fullName, decision_body: DECISION_BODY, role, source_id: sourceId, confidence: "reported" })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error(`  ! failed to save commissioner ${fullName}: ${error?.message}`);
    return null;
  }
  return inserted.id;
}

async function upsertCommissioners(supabase: SupabaseClient, marketId: string, commissioners: Commissioner[], sourceId: string): Promise<void> {
  for (const c of commissioners) {
    await findOrCreateCommissioner(supabase, marketId, c.fullName, sourceId, c.role);
  }
}

async function upsertCaseFromAgendaItem(supabase: SupabaseClient, marketId: string, item: AgendaItem, meetingDate: string, sourceId: string): Promise<void> {
  const { data: existing } = await supabase.from("entitlement_cases").select("id").eq("market_id", marketId).eq("case_number", item.caseNumber!).limit(1);
  if (existing && existing.length > 0) {
    await supabase
      .from("entitlement_cases")
      .update({ city_commission_hearing_date: meetingDate })
      .eq("id", existing[0].id)
      .lt("city_commission_hearing_date", meetingDate);
    return;
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
      city_commission_hearing_date: meetingDate,
      status: item.deferred ? "deferred" : "pending",
      source_id: sourceId,
      confidence: "reported",
    })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error(`  ! failed to save case ${item.caseNumber}: ${error?.message}`);
    return;
  }

  for (const [role, name] of [
    ["applicant", item.submittedBy],
    ["landowner", item.onBehalfOf],
  ] as const) {
    if (!name) continue;
    const { personName, companyName } = splitParty(name);
    await supabase.from("entitlement_case_parties").insert({ case_id: inserted.id, role, person_name: personName, company_name: companyName, source_id: sourceId });
  }
}

function deriveOutcome(item: MinutesItem): { outcome: string; status: string } {
  const text = `${item.actionText ?? ""} ${item.votes?.resultText ?? ""}`.toLowerCase();
  const denied = /\bden(y|ied|ial)\b/.test(text);
  return denied ? { outcome: "denied", status: "denied" } : { outcome: "approved", status: "approved" };
}

function extractOrdinanceNumber(text: string): string | null {
  const m = /Ordinance No\.\s*(\d+)/i.exec(text) ?? /Resolution No\.\s*(\d+)/i.exec(text);
  return m ? m[1] : null;
}

async function recordMinutesDecision(supabase: SupabaseClient, marketId: string, item: MinutesItem, meetingDate: string, sourceId: string): Promise<void> {
  if (!item.caseNumber) return;

  let caseId: string | null = null;
  const { data: existing } = await supabase.from("entitlement_cases").select("id").eq("market_id", marketId).eq("case_number", item.caseNumber).limit(1);
  if (existing && existing.length > 0) {
    caseId = existing[0].id;
  } else {
    // First appearance of this case is City Commission's own final vote --
    // happens when a case's Planning Commission history predates this
    // collector's window. A thin record beats losing the vote entirely.
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

  const { outcome, status } = deriveOutcome(item);
  const ordinanceNumber = extractOrdinanceNumber(`${item.actionText ?? ""} ${item.rawText}`);

  const { data: eventRow, error: eventError } = await supabase
    .from("entitlement_case_events")
    .insert({
      case_id: caseId,
      event_type: "city_commission_hearing",
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

  await supabase
    .from("entitlement_cases")
    .update({ status, final_decision_date: meetingDate, ...(ordinanceNumber ? { ordinance_number: ordinanceNumber, ordinance_adopted_date: meetingDate } : {}) })
    .eq("id", caseId);

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

async function processMeeting(
  supabase: SupabaseClient,
  marketId: string,
  meeting: MeetingListing,
  yearFolders: Map<string, string>
): Promise<{ agendaCases: number; votesRecorded: number }> {
  let agendaCases = 0;
  let votesRecorded = 0;

  const agendaPacket = await findAgendaPacketUrl(meeting.meetingId);
  if (agendaPacket && !(await alreadyProcessed(supabase, agendaPacket.url))) {
    const res = await fetch(agendaPacket.url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const { text } = await parser.getText({ first: 15 });
      await parser.destroy();

      const agenda = parseCityCommissionAgenda(text);
      const { data: source, error } = await supabase
        .from("sources")
        .insert({ agency: AGENCY, title: agendaPacket.title, source_type: "public_record", url: agendaPacket.url, published_date: agenda.meetingDate ?? meeting.date })
        .select("id")
        .single();
      if (!error && source) {
        for (const item of agenda.items) {
          await upsertCaseFromAgendaItem(supabase, marketId, item, agenda.meetingDate ?? meeting.date, source.id);
          agendaCases++;
        }
      }
    }
  }

  const minutes = await findMinutesUrl(meeting.date, yearFolders);
  if (minutes && !(await alreadyProcessed(supabase, minutes.url))) {
    const res = await fetch(minutes.url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const { text } = await parser.getText();
      await parser.destroy();

      const parsedMinutes = parseCityCommissionMinutes(text);
      const { data: source, error } = await supabase
        .from("sources")
        .insert({ agency: AGENCY, title: minutes.title, source_type: "public_record", url: minutes.url, published_date: parsedMinutes.meetingDate ?? meeting.date })
        .select("id")
        .single();
      if (!error && source) {
        if (parsedMinutes.commissionersPresent.length > 0) await upsertCommissioners(supabase, marketId, parsedMinutes.commissionersPresent, source.id);
        for (const item of parsedMinutes.items) {
          await recordMinutesDecision(supabase, marketId, item, parsedMinutes.meetingDate ?? meeting.date, source.id);
          votesRecorded++;
        }
      }
    }
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

  console.log(`Discovering City Commission meetings for ${market.name}, ${market.state}...`);
  const meetings = await discoverMeetings();
  console.log(`  found ${meetings.length} meetings in the recent window`);

  const yearFolders = await getYearFolderIds();
  console.log(`  minutes archive covers years: ${[...yearFolders.keys()].sort().join(", ")}`);

  let processed = 0;
  let totalCases = 0;
  let totalVotes = 0;

  for (const meeting of meetings) {
    if (processed >= limit) break;

    console.log(`\n${meeting.date} -- City Commission`);
    try {
      const { agendaCases, votesRecorded } = await processMeeting(supabase, market.id as string, meeting, yearFolders);
      if (agendaCases === 0 && votesRecorded === 0) {
        console.log("  (already processed or nothing entitlement-relevant found)");
        continue; // don't count toward --limit if there was genuinely nothing new to fetch
      }
      console.log(`  ${agendaCases} agenda case(s), ${votesRecorded} vote record(s)`);
      totalCases += agendaCases;
      totalVotes += votesRecorded;
      processed++;
    } catch (err) {
      console.error(`  ! failed: ${(err as Error).message}`);
    }
  }

  console.log(`\nDone. ${processed} meetings newly processed -- ${totalCases} agenda cases touched, ${totalVotes} vote records saved.`);
}

main().catch((error) => {
  console.error("Collection run failed:", error);
  process.exit(1);
});
