// Parser for Metro Nashville Planning Commission "Action Agenda" PDFs
// (nashville.gov/departments/planning/boards/planning-commission/meeting-documents).
// Built against real agendas (2026-09) -- reverse-engineered the same way
// lawrencePlanningCommissionParser.ts was, but this source is meaningfully
// cleaner: every real case lives in the "I: ITEMS TO BE CONSIDERED"
// section as its own numbered block (case number, council district,
// applicant/owner, from/to zoning, address, acreage, and a real
// "MPC Action: <outcome>. (<yes>-<no>)" vote line), with no risk of
// pulling in unrelated agenda items the way Lawrence's raw meeting-minutes
// text could -- one block is always exactly one case.
//
// Not every block matches every field -- items 1/2 in the same September
// 24, 2026 agenda this was tested against are community-plan amendments
// with no "from X to Y" zoning clause at all, and "requested by ... and
// owner" (single combined party) vs. "applicant; ..., owner(s)" (split
// parties) both appear as real variants. Whatever a pattern doesn't
// cleanly match returns null -- never guessed.

export type ParsedActionItem = {
  itemNumber: number;
  caseNumber: string;
  relatedBillNumber: string | null; // the Council BL#, when the item text states one -- correlates to collectNashvilleCouncilZoning.ts's case_number
  councilDistrict: string | null;
  existingZoning: string | null;
  requestedZoning: string | null;
  address: string | null;
  acreage: number | null;
  useDescription: string | null;
  applicant: string | null;
  owner: string | null;
  actionText: string | null; // raw "MPC Action: ..." text, e.g. "Approve with conditions and disapprove without all conditions"
  voteYes: number | null;
  voteNo: number | null;
  rawText: string; // the full item block, for traceability/debugging -- never stored verbatim as `summary`
};

const ITEM_HEADER_RE = /^(\d+)\.\s+(\S+)\s*$/gm;
const BL_NUMBER_RE = /^(BL\d{4}-\d+)\s*$/m;
const DISTRICT_RE = /Council District:\s*([^\n]+)/;
const ACTION_RE = /MPC Action:\s*([\s\S]*?)\.?\s*\((\d+)\s*-\s*(\d+)\)/;
const ZONING_RE = /\bfrom\s+([A-Za-z0-9.\-]+(?:\s+and\s+[A-Za-z0-9.\-]+)?)\s+to\s+([A-Za-z0-9.\-]+)(?:\s+zoning)?\b/i;
const ACREAGE_RE = /\(([\d,.]+)\s*acres?\)/i;
const USE_RE = /,\s*to permit\s+([^,]+(?:,\s*[^,]+)*?),\s*requested by/i;
// "requested by" occasionally wraps mid-phrase in the source PDF
// ("requested\nby") -- \s+ between the two words handles that.
const PARTIES_SPLIT_RE = /requested\s+by\s+([\s\S]+?),\s*applicant;\s*([\s\S]+?),\s*owners?\.?/i;
const PARTIES_COMBINED_RE = /requested\s+by\s+([\s\S]+?),\s*applicant and owner\.?/i;

function cleanWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

// Strips the "-- N of M --" page-break markers and lone page-number lines
// pdf-parse leaves in the extracted text, which otherwise land mid-sentence
// inside whatever field happened to span a page boundary.
export function stripPageArtifacts(text: string): string {
  return text.replace(/^-- \d+ of \d+ --\s*$/gm, "").replace(/^\d+\s*$/gm, "");
}

export function extractItemsSection(text: string): string | null {
  const start = text.indexOf("ITEMS TO BE CONSIDERED");
  if (start === -1) return null;
  const end = text.indexOf("OTHER BUSINESS", start);
  return text.slice(start, end === -1 ? text.length : end);
}

export function parseActionAgenda(rawText: string): ParsedActionItem[] {
  const text = stripPageArtifacts(rawText);
  const section = extractItemsSection(text);
  if (!section) return [];

  const headers = [...section.matchAll(ITEM_HEADER_RE)];
  const items: ParsedActionItem[] = [];

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index!;
    const end = i + 1 < headers.length ? headers[i + 1].index! : section.length;
    const block = section.slice(start, end);

    const itemNumber = Number(headers[i][1]);
    const caseNumber = headers[i][2];
    const blMatch = BL_NUMBER_RE.exec(block);
    const districtMatch = DISTRICT_RE.exec(block);
    const actionMatch = ACTION_RE.exec(block);
    const zoningMatch = ZONING_RE.exec(block);
    const acreageMatch = ACREAGE_RE.exec(block);
    const useMatch = USE_RE.exec(block);
    const splitParties = PARTIES_SPLIT_RE.exec(block);
    const combinedParties = PARTIES_COMBINED_RE.exec(block);

    items.push({
      itemNumber,
      caseNumber,
      relatedBillNumber: blMatch ? blMatch[1] : null,
      councilDistrict: districtMatch ? cleanWhitespace(districtMatch[1]) : null,
      existingZoning: zoningMatch ? cleanWhitespace(zoningMatch[1]) : null,
      requestedZoning: zoningMatch ? cleanWhitespace(zoningMatch[2]) : null,
      address: null, // filled in by a second pass below -- depends on knowing where the zoning/use clause ends
      acreage: acreageMatch ? Number(acreageMatch[1].replace(/,/g, "")) : null,
      useDescription: useMatch ? cleanWhitespace(useMatch[1]) : null,
      applicant: splitParties ? cleanWhitespace(splitParties[1]) : combinedParties ? cleanWhitespace(combinedParties[1]) : null,
      owner: splitParties ? cleanWhitespace(splitParties[2]) : combinedParties ? cleanWhitespace(combinedParties[1]) : null,
      actionText: actionMatch ? cleanWhitespace(actionMatch[1]) : null,
      voteYes: actionMatch ? Number(actionMatch[2]) : null,
      voteNo: actionMatch ? Number(actionMatch[3]) : null,
      rawText: block,
    });

    // Address: everything between "located at" and the acreage parenthetical
    // -- done as a second lookup (not folded into the object literal above)
    // since it reads more clearly as its own statement.
    const addressMatch = /located at\s+([^()]+?)\s*\(/i.exec(block);
    if (addressMatch) items[items.length - 1].address = cleanWhitespace(addressMatch[1]).replace(/,\s*$/, "");
  }

  return items;
}

// "Disapproval of staff's recommendation and approval of the item" is a
// real, observed outcome that means the Commission approved DESPITE staff
// recommending denial -- a naive "starts with Disapprov" check would get
// this backwards, so "approval of the item" is checked before any denial
// pattern.
export function mapActionToStatus(actionText: string | null): "approved" | "denied" | "deferred" | "withdrawn" | "pending" {
  if (!actionText) return "pending";
  const lower = actionText.toLowerCase();
  if (lower.includes("defer")) return "deferred";
  if (lower.includes("withdraw")) return "withdrawn";
  if (lower.includes("approval of the item") || lower.startsWith("approve")) return "approved";
  if (lower.startsWith("disapprov") || lower.startsWith("deny") || lower.startsWith("denial")) return "denied";
  return "pending";
}
