// Nashville Metro Council zoning-ordinance titles are highly formulaic
// (Metro Legal drafts them from a template), which makes them a genuinely
// reliable regex-extraction source -- unlike raw meeting-minutes text,
// there's no risk of pulling in an unrelated agenda item, since each
// Legistar Matter is already one bill about one case. Still following the
// same discipline as lawrencePlanningCommissionParser.ts: extract only
// what a pattern cleanly matches, leave the rest null rather than guess.
//
// Real examples this was built against (2026-09):
//   "...by changing from RS15 and SP to SP zoning for properties located
//   at 4107 and 4186 Dodson Chapel Road and Dodson Chapel Road
//   (unnumbered), at the southwest corner of Old Hickory Boulevard and
//   Dodson Chapel Road (15.30 acres), to permit accessory uses to mineral
//   extraction, all of which is described herein (Proposal No.
//   2026SP-033-001)."
//   "...by cancelling a Planned Unit Development Overlay District for
//   propert[y]..." -- a second template with no "from X to Y" clause;
//   zoning/address/acreage extraction intentionally returns null for
//   these rather than mis-parsing them.

export type ParsedZoningBillTitle = {
  proposalNumber: string | null; // Metro Planning's own case number, e.g. "2026SP-033-001" -- distinct from the Council bill number (BL2026-####)
  existingZoning: string | null;
  requestedZoning: string | null;
  address: string | null;
  acreage: number | null;
  useDescription: string | null;
};

export function parseZoningBillTitle(title: string): ParsedZoningBillTitle {
  const proposalMatch = /\(Proposal No\.\s*([^)]+)\)\.?\s*$/i.exec(title);
  const acreageMatch = /\(([\d,.]+)\s*acres?\)/i.exec(title);
  const zoningMatch = /\bfrom\s+([A-Za-z0-9.\-]+(?:\s+and\s+[A-Za-z0-9.\-]+)?)\s+to\s+([A-Za-z0-9.\-]+)\s+zoning\b/i.exec(title);
  const addressMatch = /located at\s+([^()]+?)\s*\(/i.exec(title);
  const useMatch = /,\s*to permit\s+([^,]+(?:,\s*[^,]+)*?),\s*all of which/i.exec(title);

  return {
    proposalNumber: proposalMatch ? proposalMatch[1].trim() : null,
    existingZoning: zoningMatch ? zoningMatch[1].trim() : null,
    requestedZoning: zoningMatch ? zoningMatch[2].trim() : null,
    address: addressMatch ? addressMatch[1].trim().replace(/,\s*$/, "") : null,
    acreage: acreageMatch ? Number(acreageMatch[1].replace(/,/g, "")) : null,
    useDescription: useMatch ? useMatch[1].trim() : null,
  };
}
