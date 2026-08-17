// Collection pipeline v1 (Phase 6 of the architecture review) for one
// source type: the City of Topeka Planning Commission's public agenda
// archive (topekaspeaks.org). Deliberately a standalone script, not a
// Next.js route -- "keep collection logic separate from presentation
// logic" (architecture review, implementation instruction #12). Run it
// with `npm run collect:topeka-planning` from dashboard/.
//
// Pipeline: discover -> extract -> normalize -> match -> store.
// "Verify" is intentionally NOT automated in v1: every discovered item
// lands in intake_records (an audit trail of everything seen) and,
// unless it's an item this script has already processed, a linked
// intake_review_queue row -- nothing here writes to projects/
// project_events directly. A human approves a match (or a new project)
// through the review queue admin page before anything becomes a
// confirmed, investor-visible fact. That's a deliberately conservative
// choice for a v1 pipeline writing real production data end to end for
// the first time -- see the review queue page for the human-in-the-loop
// step this hands off to.
//
// What this can and can't extract: topekaspeaks.org's archive listing
// gives a rich, often-complete legal description (applicant, acreage,
// address, zoning from/to) for already-decided cases, but only a thin
// one-liner (case number + applicant name) for cases still pending on a
// future agenda -- the full detail for those lives in a linked PDF staff
// report this script does not fetch. Never fabricated: whatever isn't in
// the fetched text stays null, both here and in the extraction prompt.

import * as cheerio from "cheerio";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

type MatchCandidate = { id: string; title: string; case_number: string | null; address: string | null; similarity: number };

const ARCHIVE_URL = "https://topekaspeaks.org/?archives=true&body=planning-commission";
const ITEM_BASE_URL = "https://topekaspeaks.org";
const MARKET_SLUG = "topeka-ks";
const AGENCY = "City of Topeka Planning Commission";

// Only a case actually up for Planning Commission action carries one of
// these prefixes (Z = rezoning, CU = conditional use, A = annexation,
// PUD = planned unit development, P = plat, CPA = comprehensive plan
// amendment) -- "Agenda," "Minutes," "Discussion Item," and similar
// housekeeping entries never match this and are correctly skipped.
const CASE_NUMBER_PATTERN = /^([A-Z]{1,4}\d{2}[-/]\d{1,3})\b/;

// Deterministic prefix -> event_type. Preferred over asking Claude to
// classify this from scratch: the case-number convention is a hard,
// known fact, not something to infer, so this always wins over whatever
// the model returns for the same field.
const EVENT_TYPE_BY_PREFIX: Record<string, string> = {
  Z: "rezoning_submitted",
  CU: "conditional_use_submitted",
  A: "annexation_submitted",
  PUD: "pud_amendment_submitted",
  P: "plat_submitted",
  CPA: "comprehensive_plan_amendment_submitted",
};

type ArchiveItem = {
  itemUrl: string;
  heading: string;
  status: string;
  description: string;
  caseNumber: string;
  meetingDate: string | null; // ISO date, when parseable from the heading
};

type Extraction = {
  title: string;
  project_type: string | null;
  event_type: string;
  address: string | null;
  applicant: string | null;
  acreage: number | null;
  zoning_from: string | null;
  zoning_to: string | null;
  summary: string;
};

const PROJECT_TYPES = ["residential", "multifamily", "commercial", "retail", "industrial", "mixed_use", "public", "infrastructure", "other"];

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run collect:topeka-planning\` from dashboard/ so .env.local loads.`);
  return value;
}

async function fetchArchivePage(): Promise<ArchiveItem[]> {
  const res = await fetch(ARCHIVE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GroundbreakableCollector/1.0)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${ARCHIVE_URL}: ${res.status} ${res.statusText}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const items: ArchiveItem[] = [];
  // Every agenda-item card is an <a href="/items/N"> whose first inner
  // div is the heading ("{Month Day, Year} Planning Commission ... {case
  // or item name}") and whose second inner div is the description --
  // rich prose for decided cases, a short applicant name for pending
  // ones, or empty for pure housekeeping items (Agenda, Minutes).
  $('a[href^="/items/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const heading = $(el).find("div.font-semibold").first().text().trim();
    const status = $(el).find("span").first().text().replace(/\s+/g, " ").trim();
    const description = $(el).find("div.font-normal").first().text().trim();
    if (!heading) return;

    const caseSource = description || heading;
    const caseMatch = caseSource.match(CASE_NUMBER_PATTERN);
    if (!caseMatch) return; // not an actual case -- Agenda/Minutes/Discussion/etc.

    const dateMatch = heading.match(/^([A-Za-z]+ \d{1,2}, \d{4})/);
    const meetingDate = dateMatch ? new Date(dateMatch[1]).toISOString().slice(0, 10) : null;

    items.push({
      itemUrl: `${ITEM_BASE_URL}${href}`,
      heading,
      status,
      description,
      caseNumber: caseMatch[1],
      meetingDate,
    });
  });

  // Dedupe by item URL -- the archive page's markup repeats each card in
  // more than one place (e.g. a mobile-width variant).
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.itemUrl) ? false : (seen.add(item.itemUrl), true)));
}

async function extractWithClaude(anthropic: Anthropic, item: ArchiveItem): Promise<Extraction | null> {
  const prompt =
    `Extract structured data from this Topeka Planning Commission agenda item. Use ONLY what is explicitly ` +
    `stated below -- never infer or guess a fact that isn't in the text. Respond with ONLY a JSON object, no ` +
    `markdown, no commentary, matching exactly this shape:\n` +
    `{"title": string, "project_type": ${JSON.stringify(PROJECT_TYPES)} or null, ` +
    `"event_type": "rezoning_submitted"|"conditional_use_submitted"|"annexation_submitted"|"pud_amendment_submitted"|"plat_submitted"|"comprehensive_plan_amendment_submitted"|"planning_commission_scheduled", ` +
    `"address": string or null, "applicant": string or null, "acreage": number or null, ` +
    `"zoning_from": string or null, "zoning_to": string or null, "summary": string (1-2 plain sentences)}\n\n` +
    `Case number: ${item.caseNumber}\nMeeting: ${item.heading}\nStatus: ${item.status}\nText: ${item.description || "(no further detail available on the agenda listing)"}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, ""));
    // Deterministic case-number prefix always wins over the model's guess.
    const prefix = item.caseNumber.match(/^[A-Z]+/)?.[0];
    if (prefix && EVENT_TYPE_BY_PREFIX[prefix]) parsed.event_type = EVENT_TYPE_BY_PREFIX[prefix];
    return parsed as Extraction;
  } catch {
    console.warn(`  ! Claude extraction returned non-JSON for ${item.caseNumber}, storing raw text only`);
    return null;
  }
}

async function matchProject(
  supabase: SupabaseClient,
  marketId: string,
  item: ArchiveItem,
  extraction: Extraction | null
): Promise<{ candidateProjectId: string | null; matchConfidence: number | null; matchReason: string }> {
  // Exact case-number match first -- the most reliable signal available,
  // and the reason Phase 6 added projects.case_number in the first place.
  const { data: exact } = await supabase
    .from("projects")
    .select("id")
    .eq("market_id", marketId)
    .eq("case_number", item.caseNumber)
    .limit(1)
    .returns<{ id: string }[]>();
  if (exact && exact.length > 0) {
    return { candidateProjectId: exact[0].id, matchConfidence: 1, matchReason: `exact case_number match (${item.caseNumber})` };
  }

  // Fallback: trigram similarity over title, via the Phase 6 RPC.
  const queryText = `${item.caseNumber} ${extraction?.title ?? item.description ?? item.heading}`;
  const { data: fuzzy } = await supabase
    .rpc("match_projects_by_text", { p_market_id: marketId, p_query: queryText, p_limit: 1 })
    .returns<MatchCandidate[]>();
  const top = Array.isArray(fuzzy) ? fuzzy[0] : null;
  if (top && top.similarity > 0.15) {
    return { candidateProjectId: top.id, matchConfidence: top.similarity, matchReason: `trigram similarity ${top.similarity.toFixed(2)} vs "${top.title}"` };
  }

  return { candidateProjectId: null, matchConfidence: null, matchReason: "no candidate match found -- likely a new case" };
}

async function alreadyProcessed(supabase: SupabaseClient, itemUrl: string): Promise<boolean> {
  const { data } = await supabase.from("intake_records").select("id").eq("raw_payload->>item_url", itemUrl).limit(1);
  return !!(data && data.length > 0);
}

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 10;

  const supabaseUrl = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const anthropicKey = envOrThrow("ANTHROPIC_API_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  const { data: market, error: marketError } = await supabase.from("markets").select("id, name, state").eq("slug", MARKET_SLUG).single();
  if (marketError || !market) throw new Error(`Market "${MARKET_SLUG}" not found: ${marketError?.message}`);

  console.log(`Discovering Planning Commission items for ${market.name}, ${market.state}...`);
  const allItems = await fetchArchivePage();
  console.log(`  found ${allItems.length} case items on the archive listing`);

  let processed = 0;
  let skipped = 0;
  let queued = 0;
  let matched = 0;

  for (const item of allItems) {
    if (processed >= limit) break;
    if (await alreadyProcessed(supabase, item.itemUrl)) {
      skipped++;
      continue;
    }

    console.log(`\n${item.caseNumber} -- ${item.heading}`);
    const extraction = await extractWithClaude(anthropic, item);
    const { candidateProjectId, matchConfidence, matchReason } = await matchProject(supabase, market.id as string, item, extraction);
    console.log(`  match: ${matchReason}`);

    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .insert({
        agency: AGENCY,
        title: item.heading,
        source_type: "public_record",
        url: item.itemUrl,
        published_date: item.meetingDate,
      })
      .select("id")
      .single();
    if (sourceError || !source) {
      console.error(`  ! failed to save source: ${sourceError?.message}`);
      continue;
    }

    const { data: intakeRecord, error: intakeError } = await supabase
      .from("intake_records")
      .insert({
        market_id: market.id,
        raw_payload: { item_url: item.itemUrl, heading: item.heading, status: item.status, description: item.description, case_number: item.caseNumber, extraction },
        extracted_title: extraction?.title ?? item.description ?? item.heading,
        extracted_plan_category: "land_use", // deterministic: every Planning Commission case is a land-use action by definition
        extracted_project_type: extraction?.project_type ?? null,
        extracted_event_type: extraction?.event_type ?? "planning_commission_scheduled",
        extracted_address: extraction?.address ?? null,
        candidate_project_id: candidateProjectId,
        match_confidence: matchConfidence,
        source_id: source.id,
        status: "pending",
      })
      .select("id")
      .single();
    if (intakeError || !intakeRecord) {
      console.error(`  ! failed to save intake record: ${intakeError?.message}`);
      continue;
    }

    const { error: queueError } = await supabase.from("intake_review_queue").insert({
      intake_record_id: intakeRecord.id,
      reason: candidateProjectId
        ? `Candidate match found (${matchReason}) -- confirm before it's linked to this project.`
        : `No matching project found -- confirm whether this is a new project.`,
      candidate_matches: candidateProjectId ? [{ project_id: candidateProjectId, confidence: matchConfidence, reason: matchReason }] : [],
    });
    if (queueError) {
      console.error(`  ! failed to queue for review: ${queueError.message}`);
      continue;
    }

    processed++;
    queued++;
    if (candidateProjectId) matched++;
  }

  console.log(
    `\nDone. ${allItems.length} items on the archive listing, ${skipped} already processed, ${queued} newly queued for review (${matched} with a candidate match, ${queued - matched} with none).`
  );
  console.log("Nothing has been written to projects/project_events -- review each item at /dashboard/admin/review-queue.");
}

main().catch((error) => {
  console.error("Collection run failed:", error);
  process.exit(1);
});
