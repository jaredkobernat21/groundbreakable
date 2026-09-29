import type { EntitlementCaseDetail, EntitlementCaseEventWithVotes, EntitlementCaseParty, ShiftWithSource } from "./types";
import { ENTITLEMENT_CASE_STATUS_LABEL, ENTITLEMENT_DECISION_BODY_LABEL } from "./types";
import { formatDate } from "./format";

// Deterministic "turn structured/raw fields into development intelligence"
// helpers for the Plans feed/detail view (Jared, 2026-09-29). Built against
// a live audit of the production entitlement_cases table: proposed_units,
// staff_recommendation, and application_date are 0% populated across all
// 149 rows; existing_zoning/acreage/address/approval_type are 27-48%
// populated; ~27% of rows have a `summary` containing a multi-thousand-
// character raw city-commission-meeting agenda transcript with the actual
// case buried one sentence deep, while entitlement_case_events (118 rows)
// is comparatively clean structured data. Every function here only ever
// returns real field values or a plainly-labeled fallback -- nothing is
// invented.

export function humanizeSnakeCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Case type -------------------------------------------------------

// Case-number prefixes observed in the live data (with real counts as of
// this audit) -- used only when the case has no linked approval_type,
// which is true for more than half of all rows.
const CASE_PREFIX_LABEL: Record<string, string> = {
  Z: "Rezoning",
  PLAT: "Plat",
  SUP: "Special Use Permit",
  CUP: "Conditional Use Permit",
  MS: "Minor Subdivision",
  TA: "Text Amendment",
  UP: "Use Permit",
  PP: "Preliminary Plat",
  AMDT: "Amendment",
  PDP: "Planned Development Plan",
  A: "Annexation",
  CPA: "Comprehensive Plan Amendment",
  DP: "Development Plan",
  HRC: "Historic Resources Case",
  PF: "Final Plat",
  SP: "Site Plan",
};

export function deriveCaseTypeLabel(caseDetail: Pick<EntitlementCaseDetail, "case_number" | "approval_type">): string {
  if (caseDetail.approval_type?.label) return caseDetail.approval_type.label;
  const prefix = caseDetail.case_number?.match(/^[A-Za-z]+/)?.[0]?.toUpperCase();
  if (prefix && CASE_PREFIX_LABEL[prefix]) return CASE_PREFIX_LABEL[prefix];
  return "Entitlement Case";
}

// --- Location fallback hierarchy --------------------------------------

export function partyName(parties: EntitlementCaseParty[], roles: EntitlementCaseParty["role"][]): string | null {
  for (const role of roles) {
    const party = parties.find((p) => p.role === role);
    if (party) return party.company_name ?? party.person_name ?? null;
  }
  return null;
}

// address -> parcel -> planning-area/council-district -> applicant/owner
// name -> "Location not identified". Never fabricates a street address --
// "Address not on file" is deliberately not used here (per Jared: that
// phrase should only appear when it's specifically meaningful source
// data, not as a generic empty-location fallback).
export function deriveLocationLabel(input: {
  address?: string | null;
  parcelId?: string | null;
  planningArea?: string | null;
  councilDistrict?: string | null;
  fallbackName?: string | null;
}): string {
  if (input.address) return input.address;
  if (input.parcelId) return `Parcel ${input.parcelId}`;
  if (input.planningArea) return `${input.planningArea} planning area`;
  if (input.councilDistrict) return `Council District ${input.councilDistrict}`;
  if (input.fallbackName) return input.fallbackName;
  return "Location not identified";
}

export function deriveEntitlementLocationLabel(caseDetail: EntitlementCaseDetail, parties: EntitlementCaseParty[]): string {
  return deriveLocationLabel({
    address: caseDetail.address,
    parcelId: caseDetail.parcel_id,
    planningArea: caseDetail.planning_area,
    councilDistrict: caseDetail.council_district,
    fallbackName: partyName(parties, ["applicant", "landowner", "developer"]),
  });
}

// --- Best-available date ----------------------------------------------

function mostRecentEvent(events: EntitlementCaseEventWithVotes[]): EntitlementCaseEventWithVotes | null {
  if (events.length === 0) return null;
  return [...events].sort((a, b) => b.event_date.localeCompare(a.event_date))[0];
}

// application_date is 0% populated in the live data -- always fall
// through to the next-best real date rather than showing nothing.
export function deriveBestDate(caseDetail: EntitlementCaseDetail): string | null {
  return (
    caseDetail.application_date ??
    mostRecentEvent(caseDetail.events)?.event_date ??
    caseDetail.planning_commission_hearing_date ??
    caseDetail.city_commission_hearing_date ??
    caseDetail.final_decision_date ??
    null
  );
}

// --- What happened -------------------------------------------------------

// A `summary` longer than this is, in the live data, reliably a raw
// multi-item meeting agenda dump rather than a real one-case description
// (27% of rows; average summary length overall is ~1,900 chars, and every
// sampled case above this threshold turned out to be a dump covering
// unrelated agenda items).
const RAW_DUMP_THRESHOLD = 500;

// Best-effort: find the case number inside a raw summary dump and return a
// trimmed window around it, snapped to sentence boundaries where possible.
// Returns null (never a guess) when the case number doesn't appear in the
// text at all.
export function extractRelevantExcerpt(summary: string, caseNumber: string): string | null {
  const idx = summary.indexOf(caseNumber);
  if (idx === -1) return null;

  const start = Math.max(0, idx - 250);
  const end = Math.min(summary.length, idx + caseNumber.length + 250);
  let excerpt = summary.slice(start, end).trim();

  if (start > 0) {
    const firstBreak = excerpt.search(/[.!?]\s/);
    if (firstBreak > 0 && firstBreak < excerpt.length - 40) excerpt = excerpt.slice(firstBreak + 2);
  }
  if (end < summary.length) {
    const trimmed = excerpt.replace(/[^.!?]*$/, "").trim();
    if (trimmed) excerpt = trimmed;
  }
  return excerpt || null;
}

export function deriveWhatHappened(caseDetail: EntitlementCaseDetail): string {
  const typeLabel = deriveCaseTypeLabel(caseDetail).toLowerCase();
  const statusLabel = ENTITLEMENT_CASE_STATUS_LABEL[caseDetail.status];

  // 1. A short summary is already a real, usable sentence -- use it as-is.
  if (caseDetail.summary && caseDetail.summary.length <= RAW_DUMP_THRESHOLD) {
    return caseDetail.summary;
  }

  // 2. Deterministic template from structured fields, when enough exist.
  const zoningChange =
    caseDetail.existing_zoning && caseDetail.requested_zoning && caseDetail.existing_zoning !== caseDetail.requested_zoning;
  if (zoningChange) {
    const acreagePart = caseDetail.acreage != null ? `approximately ${caseDetail.acreage} acres` : "a portion of this site";
    const usePart = caseDetail.proposed_use ? ` for potential ${caseDetail.proposed_use.toLowerCase()}` : "";
    return `Request to rezone ${acreagePart} from ${caseDetail.existing_zoning} to ${caseDetail.requested_zoning}${usePart}.`;
  }
  if (typeLabel.includes("plat") && caseDetail.acreage != null) {
    return `${deriveCaseTypeLabel(caseDetail)} proposing development on approximately ${caseDetail.acreage} acres.`;
  }
  if (caseDetail.proposed_use) {
    return `${deriveCaseTypeLabel(caseDetail)} for a proposed ${caseDetail.proposed_use.toLowerCase()}.`;
  }

  // 3. Fall back to the most recent structured hearing event -- real
  // structured data (decision_body/outcome/date), not raw text.
  const event = mostRecentEvent(caseDetail.events);
  if (event) {
    const bodyLabel = event.decision_body ? ENTITLEMENT_DECISION_BODY_LABEL[event.decision_body] : "A review body";
    const outcomeText = event.outcome ? humanizeSnakeCase(event.outcome).toLowerCase() : statusLabel.toLowerCase();
    return `${bodyLabel} ${outcomeText} this case on ${formatDate(event.event_date)}.`;
  }

  // 4. Last resort: try to pull a real excerpt out of the raw dump before
  // giving up entirely.
  if (caseDetail.summary && caseDetail.case_number) {
    const excerpt = extractRelevantExcerpt(caseDetail.summary, caseDetail.case_number);
    if (excerpt) return excerpt;
  }

  return `${statusLabel} -- see the original source for full detail.`;
}

// --- Why it matters --------------------------------------------------

export function deriveWhyItMatters(caseDetail: EntitlementCaseDetail): string {
  const zoningChange =
    caseDetail.existing_zoning && caseDetail.requested_zoning && caseDetail.existing_zoning !== caseDetail.requested_zoning;
  const typeLabel = deriveCaseTypeLabel(caseDetail).toLowerCase();

  switch (caseDetail.status) {
    case "denied":
      return "This denial is a form of entitlement friction -- the proposal did not advance as submitted.";
    case "withdrawn":
      return "This case was withdrawn before a decision -- the proposal did not advance as submitted.";
    case "deferred":
    case "remanded":
      return "A decision on this case has been delayed -- still an early-stage signal worth tracking.";
    case "pending":
      return zoningChange
        ? `This may indicate a property is progressing toward a zoning change to ${caseDetail.requested_zoning}.`
        : "A public hearing is required before this proposal can advance -- an early entitlement signal.";
    case "approved":
    case "approved_with_conditions":
    default:
      if (zoningChange) {
        return "This approval advances the property toward its requested zoning -- it reduces one entitlement step but does not confirm construction.";
      }
      if (typeLabel.includes("plat")) {
        return "This approval could signal the site is moving toward subdivision or site preparation.";
      }
      if (typeLabel.includes("annexation")) {
        return "This annexation could bring the property under city jurisdiction, a common precursor to further entitlement activity.";
      }
      return "This approval advances a public entitlement step for the property, though it does not confirm construction.";
  }
}

// --- Shift-backed Plans (no formal entitlement case) --------------------

function truncateToSentences(text: string, maxSentences: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (!sentences || sentences.length <= maxSentences) return text.trim();
  return sentences.slice(0, maxSentences).join(" ").trim();
}

// shift.description is already clean, human-written prose in the live
// data (not a raw dump like entitlement_cases.summary can be) -- this just
// caps it defensively so a future unusually-long row can't dominate the
// panel, same "don't dump raw text" spirit as the entitlement-case path.
export function deriveShiftWhatHappened(shift: ShiftWithSource): string {
  if (shift.description) return truncateToSentences(shift.description, 3);
  return shift.event;
}

const SHIFT_WHY_KEYWORDS: [RegExp, string][] = [
  [/rezon/i, "This may indicate a property is progressing toward a zoning change."],
  [/plat|subdivision/i, "This may indicate a property is progressing toward subdivision or platting."],
  [/annex/i, "This could bring the property under city jurisdiction, a common precursor to further entitlement activity."],
  [/site.?plan/i, "This proposal could advance the site toward vertical development."],
  [/infrastructure|sewer|water|road|utility/i, "Infrastructure investment nearby can unlock or accelerate adjacent development."],
  [/grant|incentive|tif/i, "Public funding here could accelerate nearby development activity."],
];

export function deriveShiftWhyItMatters(shift: ShiftWithSource): string {
  const haystack = `${shift.shift_type} ${shift.event} ${shift.description ?? ""}`;
  for (const [pattern, text] of SHIFT_WHY_KEYWORDS) {
    if (pattern.test(haystack)) return text;
  }
  return "This is an early development signal worth monitoring for nearby impact.";
}
