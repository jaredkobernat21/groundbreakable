// Pure text -> structured-data parsing for a Lawrence-Douglas County Planning
// Commission packet PDF. Deliberately regex-based, not an LLM call: every
// packet follows one consistent template (verified against packets from
// Dec 2025 and Feb 2026) -- an AGENDA section with a fixed
// "Consider ..., CASE-NUMBER, ... located at ADDRESS[, from ZONE to ZONE]...
// Submitted by X on behalf of Y, property owner of record" sentence shape,
// followed by the PRIOR meeting's MINUTES with a fixed
// "ACTION: ... / Motion: N / Second: N / RESULT: ... / Ayes: ... / Absent: ..."
// shape per item, roll-call votes included. No fact here is inferred by a
// model -- everything is either matched verbatim or left null.

export type AgendaItem = {
  itemNumber: string | null;
  caseNumber: string | null;
  deferred: boolean;
  requestType: "rezone" | "final_plat" | "preliminary_plat" | "minor_subdivision" | "text_amendment" | "variance" | "annexation" | "other";
  acreage: number | null;
  address: string | null;
  existingZoning: string | null;
  requestedZoning: string | null;
  submittedBy: string | null;
  onBehalfOf: string | null;
  agendaItemReportId: string | null;
  rawText: string;
};

export type VoteTally = {
  ayes: string[];
  nays: string[];
  abstained: string[];
  absent: string[];
  recused: string[];
  resultText: string | null;
  unanimous: boolean;
};

export type MinutesItem = {
  caseNumber: string | null;
  actionText: string | null;
  motionBy: string | null;
  secondBy: string | null;
  votes: VoteTally | null;
  rawText: string;
};

export type Commissioner = {
  fullName: string;
  role: "chair" | "vice_chair" | "member";
  appointingJurisdiction: "city" | "county" | null;
};

export type ParsedPacket = {
  meetingBodyLabel: string; // e.g. "Planning Commission"
  agendaMeetingDate: string | null; // ISO date of THIS packet's own meeting (the agenda)
  minutesMeetingDate: string | null; // ISO date of the EMBEDDED prior meeting (the minutes/votes)
  agendaItems: AgendaItem[];
  commissionersPresent: Commissioner[];
  minutesItems: MinutesItem[];
};

const CASE_NUMBER_RE = /\b([A-Z]{1,5}-\d{2}-\d{3,5})\b/;

// Deterministic keyword -> request type, same precedent as the Topeka
// collector's EVENT_TYPE_BY_PREFIX: a fixed vocabulary wins over guessing.
function classifyRequestType(text: string): AgendaItem["requestType"] {
  const t = text.toLowerCase();
  if (t.includes("annex")) return "annexation";
  if (t.includes("rezone") || t.includes("zoning map amendment")) return "rezone";
  if (t.includes("final plat")) return "final_plat";
  if (t.includes("preliminary plat")) return "preliminary_plat";
  if (t.includes("minor subdivision") || t.includes("replat") || t.includes("lot line")) return "minor_subdivision";
  if (t.includes("text amendment")) return "text_amendment";
  if (t.includes("variance")) return "variance";
  return "other";
}

function parseMonthName(m: string): string {
  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
    july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  };
  return months[m.toLowerCase()] ?? "01";
}

function toIsoDate(monthName: string, day: string, year: string): string {
  return `${year}-${parseMonthName(monthName)}-${day.padStart(2, "0")}`;
}

// --- Section extraction ---------------------------------------------------

function extractBetween(text: string, startMarkers: RegExp[], endMarkers: RegExp[]): string | null {
  let startIdx = -1;
  for (const marker of startMarkers) {
    const m = marker.exec(text);
    if (m) {
      startIdx = m.index + m[0].length;
      break;
    }
  }
  if (startIdx === -1) return null;

  let endIdx = text.length;
  for (const marker of endMarkers) {
    marker.lastIndex = 0;
    const m = marker.exec(text.slice(startIdx));
    if (m) {
      endIdx = Math.min(endIdx, startIdx + m.index);
    }
  }
  return text.slice(startIdx, endIdx).trim();
}

// Splits a section's raw text into per-item chunks. Anchored on the word
// "Consider" rather than the leading "<number>." marker: every real agenda
// and minutes item sentence starts with "Consider ..." (verified across
// every sample packet), whereas the numeral marker itself is not reliable
// -- some packets carry a leading "*" flag column whose interaction with a
// page break can print an item's number on the wrong side of the break
// (its own sentence starting on the prior page, unnumbered). Splitting on
// content rather than on that layout artifact recovers those items too.
function splitNumberedItems(sectionText: string): { itemNumber: string | null; body: string }[] {
  const items: { itemNumber: string | null; body: string }[] = [];
  const re = /(?:^|[.\n])\s*\*?\s*(?:(\d{1,2})\.\s*)?(?=Consider\b)/g;
  const matches = [...sectionText.matchAll(re)].filter((m) => m.index !== undefined);
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : sectionText.length;
    const body = sectionText.slice(start, end).trim();
    if (body.length > 0) items.push({ itemNumber: matches[i][1] ?? null, body });
  }
  return items;
}

// Collapses PDF line-wrap artifacts (single newlines mid-sentence) into
// spaces while preserving genuine paragraph breaks (blank lines), so regex
// patterns that span what was originally 2-4 wrapped lines still match.
function unwrap(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();
}

// Strips the page-break furniture pdf-parse leaves inline between pages
// (footer/header lines repeated on every page) so it doesn't get glued onto
// whichever field happens to be mid-capture when a page boundary falls
// inside an agenda item or vote block.
function stripPageFurniture(text: string): string {
  return text
    .replace(/Page \d+ of \d+/gi, " ")
    .replace(/--\s*\d+\s*of\s*\d+\s*--/g, " ")
    .replace(/^Draft$/gim, " ")
    // Requires the trailing "- Month Day Year" so this only strips the
    // repeating per-page footer, never the document's own masthead line
    // ("Planning Commission" alone, immediately followed by "Meeting").
    .replace(/^Planning Commission\s*-\s*[A-Za-z]+ \d{1,2},? \d{4}$/gim, " ")
    .replace(/^[A-Za-z]+ \d{1,2}, \d{4}$/gim, " ");
}

// --- Agenda item parsing ---------------------------------------------------

export function parseAgendaItem(itemNumber: string | null, rawBody: string): AgendaItem {
  const deferred = /\*\*DEFERRED\*\*/.test(rawBody);
  // Strips an item-number marker that a page break stranded mid-sentence
  // (see splitNumberedItems) -- by the time it reaches here it's always
  // furniture, never content, since real boundaries were already split on.
  const cleaned = rawBody.replace(/\*\*DEFERRED\*\*/, "").replace(/\*\s*\d{1,2}\.\s*/g, " ");
  const body = unwrap(cleaned);

  const caseMatch = CASE_NUMBER_RE.exec(body);
  const caseNumber = caseMatch ? caseMatch[1] : null;

  const acreageMatch = /approximately\s+([\d,.]+)\s+acres?/i.exec(body);
  const acreage = acreageMatch ? Number(acreageMatch[1].replace(/,/g, "")) : null;

  // Bounded by known next-phrase anchors rather than the next period --
  // addresses routinely contain their own periods ("6200 W. 6th Street").
  // Two phrasings observed for the same fact: "located at X" and "currently
  // addressed X" (the latter used when a property is split across items).
  const ADDRESS_END = /(?:,?\s+from\s+[A-Z0-9]|,\s+to\s+(?:reduce|increase)|\.\s*Submitted by|\.\s*Agenda Item Report|,?\s*and the associated|\.\s*$)/;
  const addressMatch =
    new RegExp(`located at\\s+([\\s\\S]+?)${ADDRESS_END.source}`, "i").exec(body) ??
    new RegExp(`currently addressed\\s+([\\s\\S]+?)${ADDRESS_END.source}`, "i").exec(body);
  const address = addressMatch ? addressMatch[1].trim().replace(/,$/, "") : null;

  // Non-greedy up to the next "District" rather than a fixed token shape --
  // city zoning codes are single tokens ("R-3"), but county-zoned parcels
  // (annexation candidates) use multi-word codes ("Douglas County AG-1"),
  // and either side can itself list two districts joined by "and".
  const zoningMatch = /from\s+([\s\S]+?)\s+District(?:s)?\s+to\s+([\s\S]+?)\s+District\b/i.exec(body);
  const existingZoning = zoningMatch ? zoningMatch[1].trim() : null;
  const requestedZoning = zoningMatch ? zoningMatch[2].trim() : null;

  // Single lazy [\s\S]+? per capture, each bounded by one fixed anchor --
  // not the earlier nested (?:,...)*? shape, which backtracks
  // catastrophically on some inputs (see parseVoteBlock's history).
  const partyMatch = /Submitted by\s+([\s\S]+?),?\s+on behalf of\s+([\s\S]+?),\s+property owners?\s+of record/i.exec(body);
  const submittedBy = partyMatch ? partyMatch[1].trim() : (/Submitted by\s+([^.]+)\./i.exec(body)?.[1]?.trim() ?? null);
  const onBehalfOf = partyMatch ? partyMatch[2].trim() : null;

  const reportMatch = /Agenda Item Report\s+([\d-]+)\s*-\s*Pdf/i.exec(rawBody);
  const agendaItemReportId = reportMatch ? reportMatch[1] : null;

  return {
    itemNumber,
    caseNumber,
    deferred,
    requestType: classifyRequestType(body),
    acreage,
    address,
    existingZoning,
    requestedZoning,
    submittedBy,
    onBehalfOf,
    agendaItemReportId,
    rawText: body,
  };
}

// --- Minutes / vote parsing -------------------------------------------------

// The same document routinely refers to the same person by different
// titles in different places -- the PRESENT roster says "Board Member
// (City Appointee) Carpenter" while that same meeting's own vote lines say
// "Planning Commissioner Carpenter" for the identical person (verified
// side by side in a real April 2023 packet). Stripping every observed
// title variant down to the bare surname is what lets both mentions
// resolve to one entitlement_commissioners row instead of near-duplicates.
// Applied repeatedly since a page-break can stack a stray "Planning
// Commission" header fragment onto an already-titled name.
// Superset covering both bodies' title vocabularies -- City Commission
// uses "Mayor"/"Vice Mayor"/"City Commissioner" where Planning Commission
// uses "Chair"/"Vice-Chair"/"Planning Commissioner"/"Board Member". The
// two vocabularies never collide, so one shared cleaner is safe for both.
function cleanCommissionerName(raw: string): string {
  let name = raw;
  const TITLE_RE = /^\s*(?:Planning Commission(?:er)?|City Commissioner|Board Member|Vice[\s-]*Mayor|Mayor|Chair|Vice-?\s*Chair|Commissioner)\b\.?\s*/i;
  // A page break can strand the fragment on either side of the real name
  // depending on where the line happened to wrap -- "Planning Commission
  // Planning Commissioner Ashworth" (leading) and "Duvvur Planning
  // Commission" (trailing) were both observed for the same kind of
  // artifact in real packets.
  const TRAILING_FRAGMENT_RE = /\s+(?:Planning Commission(?:er)?|City Commission)\s*$/i;
  let prev: string;
  do {
    prev = name;
    name = name
      .replace(TITLE_RE, "")
      .replace(/^\(?(?:City|County)\s+Appointee\)?\s*/i, "")
      .replace(TRAILING_FRAGMENT_RE, "");
  } while (name !== prev);
  return name.replace(/^[():\s]+|[():,\s]+$/g, "").trim();
}

// A real commissioner name is short and has no sentence punctuation -- a
// defense against parseVoteBlock's continuation scan occasionally running
// past its intended boundary and absorbing a fragment of unrelated agenda
// text (a colon-terminated field label, a run-on sentence, an ordinance
// number) as if it were one more name in the list.
// Words that show up in the run-on prose immediately following a name list
// when no structural marker separates them (e.g. "Absent: Sellers\nThe
// Commission recessed...") -- a real surname never contains any of these,
// so their presence is a reliable signal the continuation scan ran past
// its actual boundary.
const NON_NAME_WORD_RE = /\b(?:The|Commission|Commissioners?|Meeting|returned|recessed|adjourned|reconvened|took|will|until|minutes?)\b/i;

function looksLikeName(name: string): boolean {
  if (name.length === 0 || name.length > 40) return false;
  if (/[.:;]/.test(name)) return false;
  if (/\d/.test(name)) return false;
  const words = name.split(/\s+/);
  if (words.length > 3) return false;
  if (NON_NAME_WORD_RE.test(name)) return false;
  if (!words.every((w) => /^[A-Z][a-zA-Z'-]*$/.test(w))) return false;
  return true;
}

function parseNameList(list: string): string[] {
  return list
    .replace(/\band\s+/g, ",")
    .split(",")
    .map((s) => cleanCommissionerName(s))
    .filter(Boolean)
    .filter(looksLikeName);
}

const VOTE_LABELS = ["Ayes", "Nays", "Noes", "Abstained", "Absent", "Recused"] as const;
const VOTE_LABEL_RE = /^\s*(Ayes|Nays|Noes|Abstained|Absent|Recused)\s*:\s*(.*)$/i;
const SECTION_HEADER_RE = /^[A-Z][A-Z &/-]{6,}$/; // e.g. "COMMITTEE REPORTS" -- an all-caps line with no lowercase

// Line-by-line scan rather than a single regex with nested quantifiers --
// a regex shaped like (?:\n(?!STOP)[^\n]+)* backtracks catastrophically
// when STOP never matches within a large block (observed hanging for
// minutes >60s on a packet whose section boundaries didn't land where
// expected). A manual scan is both immune to that and O(n) regardless.
export function parseVoteBlock(text: string): VoteTally | null {
  const lines = text.split("\n");
  let resultLines: string[] | null = null;
  const labelLines: Partial<Record<(typeof VOTE_LABELS)[number], string[]>> = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const resultStart = /^\s*RESULT\s*:\s*(.*)$/i.exec(line);
    const labelStart = VOTE_LABEL_RE.exec(line);

    if (resultStart || labelStart) {
      const collected: string[] = [(resultStart ?? labelStart)![resultStart ? 1 : 2]];
      i++;
      // Continuation lines belong to this field until the next
      // RESULT:/vote-label, a new numbered or lettered item, an all-caps
      // header, a blank line, or another field of the same
      // ACTION/Motion/Second shape belonging to a different item --
      // otherwise a name list runs on into whatever unrelated agenda text
      // follows it (see the City Commission commissioner-list corruption
      // this was fixed after: consent-agenda sub-items like "D.8
      // QUASI-JUDICIAL ITEMS:" or the next item's own "Motion:"/"ACTION:"
      // line aren't numbered or all-caps, so without these checks they get
      // swallowed as if they were more names).
      while (
        i < lines.length &&
        lines[i].trim().length > 0 &&
        !/^\s*RESULT\s*:/i.test(lines[i]) &&
        !VOTE_LABEL_RE.test(lines[i]) &&
        !/^\s*(?:ACTION|Motion|Second)\s*:/i.test(lines[i]) &&
        !/^\s*\d{1,2}\.\s/.test(lines[i]) &&
        !/^\s*[a-z]\)\s/.test(lines[i]) &&
        !/^\s*[A-Z]\.\d/.test(lines[i]) &&
        !SECTION_HEADER_RE.test(lines[i].trim())
      ) {
        collected.push(lines[i]);
        i++;
      }
      const value = unwrap(collected.join("\n"));
      if (resultStart) resultLines = [value];
      else labelLines[labelStart![1] as (typeof VOTE_LABELS)[number]] = parseNameList(value);
      continue;
    }
    i++;
  }

  const resultText = resultLines ? resultLines[0] : null;
  if (!resultText) return null;

  return {
    ayes: labelLines.Ayes ?? [],
    nays: [...(labelLines.Nays ?? []), ...(labelLines.Noes ?? [])],
    abstained: labelLines.Abstained ?? [],
    absent: labelLines.Absent ?? [],
    recused: labelLines.Recused ?? [],
    resultText,
    unanimous: /unanimously/i.test(resultText),
  };
}

export function parseMinutesItem(rawBody: string): MinutesItem {
  const caseMatch = CASE_NUMBER_RE.exec(rawBody);
  const actionMatch = /ACTION:\s*([\s\S]+?)(?=\n\s*Motion:)/i.exec(rawBody);
  const motionMatch = /Motion:\s*([^\n]+)/i.exec(rawBody);
  const secondMatch = /Second:\s*([^\n]+)/i.exec(rawBody);

  return {
    caseNumber: caseMatch ? caseMatch[1] : null,
    actionText: actionMatch ? unwrap(actionMatch[1]) : null,
    motionBy: motionMatch ? cleanCommissionerName(motionMatch[1]) : null,
    secondBy: secondMatch ? cleanCommissionerName(secondMatch[1]) : null,
    votes: parseVoteBlock(rawBody),
    rawText: unwrap(rawBody),
  };
}

// --- Commissioner roster parsing --------------------------------------------

export function parsePresentRoster(presentLine: string): Commissioner[] {
  const tokens = unwrap(presentLine)
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return tokens.map((token) => {
    let role: Commissioner["role"] = "member";
    let jurisdiction: Commissioner["appointingJurisdiction"] = null;
    let rest = token;

    // Mayor / Vice Mayor are City Commission's equivalent of Chair /
    // Vice-Chair -- the Commission elects one of its own members to each
    // role, functionally the same presiding-officer relationship.
    if (/^Vice-?\s*(?:Chair|Mayor)/i.test(rest)) {
      role = "vice_chair";
      rest = rest.replace(/^Vice-?\s*(?:Chair|Mayor)\s*/i, "");
    } else if (/^(?:Chair|Mayor)/i.test(rest)) {
      role = "chair";
      rest = rest.replace(/^(?:Chair|Mayor)\s*/i, "");
    }

    const jurMatch = /\(?\b(City|County)\s+Appointee\)?/i.exec(rest);
    if (jurMatch) {
      jurisdiction = jurMatch[1].toLowerCase() as "city" | "county";
      rest = rest.replace(/\(?\b(City|County)\s+Appointee\)?/i, "").trim();
    }

    // cleanCommissionerName as a final pass, not just a trim -- some
    // packets prefix roster entries with "Board Member" instead of a role
    // word this function already recognized, which would otherwise be
    // left glued onto the name (see this function's header comment).
    const fullName = cleanCommissionerName(rest);
    return { fullName, role, appointingJurisdiction: jurisdiction };
  }).filter((c) => c.fullName.length > 0);
}

// --- Top-level packet parser -------------------------------------------------

export function parsePlanningCommissionPacket(rawText: string): ParsedPacket {
  const text = stripPageFurniture(rawText);

  // The packet's own table of contents references the embedded minutes as
  // "... - Minutes - Pdf", which also contains the word "Minutes" -- so the
  // minutes document proper must be located by its full, distinctive
  // document header, not just the word "MINUTES" on its own, or every
  // extraction below silently scopes to the wrong (agenda's own) section.
  const minutesHeaderMatch = /City of Lawrence\s*\n?\s*MINUTES\s*\n?\s*Planning Commission Meeting/i.exec(text);

  const agendaFullText = minutesHeaderMatch ? text.slice(0, minutesHeaderMatch.index) : text;
  const minutesFullText = minutesHeaderMatch ? text.slice(minutesHeaderMatch.index) : "";

  const agendaDateMatch = /Planning Commission\s*\n?\s*Meeting\s*\n?\s*(?:\w+day,\s*)?([A-Za-z]+)\s+(\d{1,2}),?\s*\n?\s*(\d{4})/i.exec(agendaFullText);
  const agendaMeetingDate = agendaDateMatch ? toIsoDate(agendaDateMatch[1], agendaDateMatch[2], agendaDateMatch[3]) : null;

  const agendaSection = extractBetween(
    agendaFullText,
    [/REGULAR AGENDA\s*-\s*PUBLIC\s*&\s*NON-PUBLIC HEARING ITEMS/i],
    [/\n\s*F\.\s*MISCELLANEOUS/i, /\n\s*G\.\s*ADJOURNMENT/i]
  );
  const agendaItems = agendaSection
    ? splitNumberedItems(agendaSection)
        .map(({ itemNumber, body }) => parseAgendaItem(itemNumber, body))
        .filter((item) => item.caseNumber !== null)
    : [];

  const minutesDateMatch = /MINUTES\s*\n?\s*Planning Commission Meeting\s*\n?\s*(?:\w+day,\s*)?([A-Za-z]+)\s+(\d{1,2}),?\s*\n?\s*(\d{4})/i.exec(minutesFullText);
  const minutesMeetingDate = minutesDateMatch ? toIsoDate(minutesDateMatch[1], minutesDateMatch[2], minutesDateMatch[3]) : null;

  const presentMatch = /(?:^|\n)PRESENT:\s*([\s\S]+?)\n\s*STAFF/i.exec(minutesFullText);
  const commissionersPresent = presentMatch ? parsePresentRoster(presentMatch[1]) : [];

  const minutesHearingSection = extractBetween(
    minutesFullText,
    [/REGULAR AGENDA\s*-\s*PUBLIC\s*&\s*NON-PUBLIC HEARING ITEMS/i],
    [/\n\s*MISCELLANEOUS NEW OR OLD BUSINESS/i, /\n\s*ADJOURNMENT/i]
  );
  const minutesItems = minutesHearingSection
    ? splitNumberedItems(minutesHearingSection)
        .map(({ body }) => parseMinutesItem(body))
        .filter((item) => item.caseNumber !== null || item.votes !== null)
    : [];

  return {
    meetingBodyLabel: "Planning Commission",
    agendaMeetingDate,
    minutesMeetingDate,
    agendaItems,
    commissionersPresent,
    minutesItems,
  };
}

// --- City Commission ---------------------------------------------------
//
// A structurally different publishing pattern from Planning Commission,
// but the same underlying template once you're inside a section: City
// Commission's own minutes are a standalone document per meeting (found
// via a separate year-indexed archive, not embedded in the next agenda),
// covering the WHOLE meeting -- consent agenda, ordinances/resolutions,
// and regular agenda items -- each still shaped as "Consider ... /
// ACTION: ... / Motion: N / Second: N / RESULT: ... / Ayes: ...". Verified
// against a real Jan 2023 minutes document. All the low-level building
// blocks above (splitNumberedItems, parseMinutesItem, parseVoteBlock,
// cleanCommissionerName) are body-agnostic and reused as-is; only the
// document-level framing below is City-Commission-specific.

export type CityCommissionAgendaItem = AgendaItem; // same shape; requestType frequently 'other' for CC (budgets, bids, licenses), which is expected, not a parsing gap

export type ParsedCityCommissionAgenda = {
  meetingDate: string | null;
  items: CityCommissionAgendaItem[];
};

export type ParsedCityCommissionMinutes = {
  meetingDate: string | null;
  commissionersPresent: Commissioner[];
  items: MinutesItem[];
};

// This body's own agenda packet (proposed items for an upcoming meeting).
// Scoped to "G. REGULAR AGENDA ITEMS" -- the section genuinely substantive
// land-use/ordinance actions land in -- rather than the consent agenda's
// claims/bids/licenses, which are out of scope for entitlement tracking
// and use a different (lettered) sub-item scheme this parser doesn't
// target.
export function parseCityCommissionAgenda(rawText: string): ParsedCityCommissionAgenda {
  const text = stripPageFurniture(rawText);

  const dateMatch = /City Commission\s*\n?\s*Meeting\s*\n?\s*(?:\w+day,\s*)?([A-Za-z]+)\s+(\d{1,2}),?\s*\n?\s*(\d{4})/i.exec(text);
  const meetingDate = dateMatch ? toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]) : null;

  // The section's own lettering shifts meeting to meeting (how many earlier
  // sections -- consent items, proclamations, etc. -- precede it varies),
  // so match on the label text itself rather than a fixed letter.
  const section = extractBetween(
    text,
    [/[A-Z]\.\s*REGULAR AGENDA ITEMS/i],
    [/\n\s*[A-Z]\.\s*COMMISSION ITEMS/i, /\n\s*[A-Z]\.\s*CITY MANAGER.S REPORT/i, /\n\s*[A-Z]\.\s*COMMISSION CALENDAR/i, /\n\s*[A-Z]\.\s*OPEN PUBLIC COMMENT/i]
  );
  const items = section
    ? splitNumberedItems(section)
        .map(({ itemNumber, body }) => parseAgendaItem(itemNumber, body))
        .filter((item) => item.caseNumber !== null)
    : [];

  return { meetingDate, items };
}

// This body's own minutes document (a real vote record for a past
// meeting, fetched from the separate year-indexed minutes archive --
// see collectLawrenceCityCommission.ts's discovery step). Every
// "Consider ..." item anywhere in the document is a candidate, not just
// one section, since real ordinance/resolution actions can land in the
// consent agenda as easily as the regular agenda.
export function parseCityCommissionMinutes(rawText: string): ParsedCityCommissionMinutes {
  const text = stripPageFurniture(rawText);

  const dateMatch = /MINUTES\s*\n?\s*City Commission Meeting\s*\n?\s*(?:\w+day,\s*)?([A-Za-z]+)\s+(\d{1,2}),?\s*\n?\s*(\d{4})/i.exec(text);
  const meetingDate = dateMatch ? toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]) : null;

  const presentMatch = /(?:^|\n)PRESENT:\s*([\s\S]+?)\n\s*ABSENT\s*:/i.exec(text);
  const commissionersPresent = presentMatch ? parsePresentRoster(presentMatch[1]) : [];

  const items = splitNumberedItems(text)
    .map(({ body }) => parseMinutesItem(body))
    .filter((item) => item.caseNumber !== null && item.votes !== null);

  return { meetingDate, commissionersPresent, items };
}
