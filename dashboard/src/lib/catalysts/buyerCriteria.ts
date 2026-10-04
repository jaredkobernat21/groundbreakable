import type { CatalystWithSources } from "@/lib/types";
import { ownersOrLegacyOwner } from "./potentialSiteCriteria";

// Buyer Criteria (Jared's 2026-10-04 brief, direct data-center developer/site-buyer feedback):
// real site-selection filtering for Potential Data Center sites -- "Show me the best sites that
// fit this buyer's deal profile." Meaningful only against prospective_data_center_site rows;
// every field is optional/off by default (no filter applied) same convention as
// FiltersPanel.tsx's housingTypes/infrastructureTypes Sets.
export type BuyerCriteria = {
  minMw: number | null;
  maxTimeToPowerYears: number | null;
  minContiguousAcres: number | null;
  maxGasDistanceMiles: number | null;
  maxSubstationDistanceMiles: number | null;
  minTransmissionVoltageKv: number | null;
  maxOwners: number | null;
  industrialZoningRequired: boolean;
  excludeFloodplain: boolean;
  minDataConfidence: number | null;
  minPotentialScore: number | null;
};

export function defaultBuyerCriteria(): BuyerCriteria {
  return {
    minMw: null,
    maxTimeToPowerYears: null,
    minContiguousAcres: null,
    maxGasDistanceMiles: null,
    maxSubstationDistanceMiles: null,
    minTransmissionVoltageKv: null,
    maxOwners: null,
    industrialZoningRequired: false,
    excludeFloodplain: false,
    minDataConfidence: null,
    minPotentialScore: null,
  };
}

export function buyerCriteriaActive(criteria: BuyerCriteria): boolean {
  return (
    criteria.minMw != null ||
    criteria.maxTimeToPowerYears != null ||
    criteria.minContiguousAcres != null ||
    criteria.maxGasDistanceMiles != null ||
    criteria.maxSubstationDistanceMiles != null ||
    criteria.minTransmissionVoltageKv != null ||
    criteria.maxOwners != null ||
    criteria.industrialZoningRequired ||
    criteria.excludeFloodplain ||
    criteria.minDataConfidence != null ||
    criteria.minPotentialScore != null
  );
}

// Rough representative years per utility_timeline bucket, for comparing against a buyer's
// "power within N years" threshold -- matches UTILITY_TIMELINE_BUCKET_CAPTION's own general
// legend (favorable <3y, moderate 3-5y, long 5y+). Never a fabricated site-specific date.
const TIMELINE_REPRESENTATIVE_YEARS: Record<string, number> = { favorable: 2, moderate: 4, long: 7 };

type MatchStatus = "match" | "caution" | "unknown";
type MatchLine = { status: MatchStatus; text: string };

function matchMw(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.minMw == null) return null;
  const mw = catalyst.potential_load_mw_high ?? catalyst.potential_load_mw_low;
  if (mw == null) return { status: "unknown", text: `Potential load unverified (need ${criteria.minMw}+ MW)` };
  return mw >= criteria.minMw
    ? { status: "match", text: `${mw}+ MW potential load` }
    : { status: "caution", text: `${mw} MW potential load — below the ${criteria.minMw}+ MW target` };
}

function matchTimeToPower(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.maxTimeToPowerYears == null) return null;
  const years = catalyst.utility_timeline ? TIMELINE_REPRESENTATIVE_YEARS[catalyst.utility_timeline] : undefined;
  if (years == null) return { status: "unknown", text: `Time to power unverified (need within ${criteria.maxTimeToPowerYears}y)` };
  return years <= criteria.maxTimeToPowerYears
    ? { status: "match", text: "Time to power within target" }
    : { status: "caution", text: `Time to power likely exceeds ${criteria.maxTimeToPowerYears}y target` };
}

function matchAcreage(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.minContiguousAcres == null) return null;
  const acres = catalyst.contiguous_acreage ?? catalyst.total_acreage;
  if (acres == null) return { status: "unknown", text: `Contiguous acreage unverified (need ${criteria.minContiguousAcres}+)` };
  return acres >= criteria.minContiguousAcres
    ? { status: "match", text: `${acres} contiguous acres` }
    : { status: "caution", text: `${acres} acres — below the ${criteria.minContiguousAcres}+ target` };
}

function matchGasDistance(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.maxGasDistanceMiles == null) return null;
  if (catalyst.gas_pipeline_distance_miles == null) return { status: "unknown", text: "Gas pipeline distance unverified" };
  return catalyst.gas_pipeline_distance_miles <= criteria.maxGasDistanceMiles
    ? { status: "match", text: `Gas ${catalyst.gas_pipeline_distance_miles} mi` }
    : { status: "caution", text: `Gas ${catalyst.gas_pipeline_distance_miles} mi — beyond the ${criteria.maxGasDistanceMiles} mi target` };
}

function matchSubstationDistance(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.maxSubstationDistanceMiles == null) return null;
  if (catalyst.substation_distance_miles == null) return { status: "unknown", text: "Substation distance unverified" };
  return catalyst.substation_distance_miles <= criteria.maxSubstationDistanceMiles
    ? { status: "match", text: `Substation ${catalyst.substation_distance_miles} mi` }
    : { status: "caution", text: `Substation ${catalyst.substation_distance_miles} mi — beyond the ${criteria.maxSubstationDistanceMiles} mi target` };
}

function matchTransmissionVoltage(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.minTransmissionVoltageKv == null) return null;
  if (catalyst.transmission_voltage_kv == null) return { status: "unknown", text: "Transmission voltage unverified" };
  return catalyst.transmission_voltage_kv >= criteria.minTransmissionVoltageKv
    ? { status: "match", text: `${catalyst.transmission_voltage_kv} kV transmission nearby` }
    : { status: "caution", text: `${catalyst.transmission_voltage_kv} kV — below the ${criteria.minTransmissionVoltageKv} kV target` };
}

function matchOwners(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.maxOwners == null) return null;
  const count = ownersOrLegacyOwner(catalyst).length;
  if (count === 0) return { status: "unknown", text: "Ownership unverified" };
  return count <= criteria.maxOwners
    ? { status: "match", text: `${count} owner${count === 1 ? "" : "s"}` }
    : { status: "caution", text: `${count} owners — above the ${criteria.maxOwners} max` };
}

function matchZoning(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (!criteria.industrialZoningRequired) return null;
  if (!catalyst.zoning_status) return { status: "unknown", text: "Zoning unverified" };
  return catalyst.zoning_status.toLowerCase().includes("industrial")
    ? { status: "match", text: "Industrial zoning" }
    : { status: "caution", text: `Zoning: ${catalyst.zoning_status}` };
}

function matchFloodplain(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (!criteria.excludeFloodplain) return null;
  if (catalyst.floodplain_constrained == null) return { status: "unknown", text: "Floodplain status unverified" };
  return catalyst.floodplain_constrained ? { status: "caution", text: "Floodplain-constrained" } : { status: "match", text: "Outside floodplain" };
}

function matchDataConfidence(dataConfidence: number | null, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.minDataConfidence == null) return null;
  if (dataConfidence == null) return { status: "unknown", text: "Data Confidence unavailable" };
  return dataConfidence >= criteria.minDataConfidence
    ? { status: "match", text: `${dataConfidence}% Data Confidence` }
    : { status: "caution", text: `${dataConfidence}% Data Confidence — below the ${criteria.minDataConfidence}% target` };
}

function matchPotentialScore(catalyst: CatalystWithSources, criteria: BuyerCriteria): MatchLine | null {
  if (criteria.minPotentialScore == null) return null;
  if (catalyst.potential_score == null) return { status: "unknown", text: "Potential Score unavailable" };
  return catalyst.potential_score >= criteria.minPotentialScore
    ? { status: "match", text: `Potential Score ${catalyst.potential_score}` }
    : { status: "caution", text: `Potential Score ${catalyst.potential_score} — below the ${criteria.minPotentialScore} target` };
}

// Only used to HARD-EXCLUDE a site from the map/list -- unknown never excludes (the same
// "unknown ≠ bad" principle computeDataConfidence applies to scoring applies here to filtering:
// an unresearched fact should lower confidence/ranking, never silently remove a real candidate).
// A site is excluded only when a criterion is active AND the known fact actively fails it.
export function matchesBuyerCriteria(catalyst: CatalystWithSources, criteria: BuyerCriteria, dataConfidence: number | null): boolean {
  const lines = [
    matchMw(catalyst, criteria),
    matchTimeToPower(catalyst, criteria),
    matchAcreage(catalyst, criteria),
    matchGasDistance(catalyst, criteria),
    matchSubstationDistance(catalyst, criteria),
    matchTransmissionVoltage(catalyst, criteria),
    matchOwners(catalyst, criteria),
    matchZoning(catalyst, criteria),
    matchFloodplain(catalyst, criteria),
    matchDataConfidence(dataConfidence, criteria),
    matchPotentialScore(catalyst, criteria),
  ].filter((l): l is MatchLine => l != null);

  return !lines.some((l) => l.status === "caution");
}

// "Why it matched" -- a ✓/△/✕ breakdown of every ACTIVE criterion, plus a 0-100 match percentage
// (match=1pt, caution=0.5pt, unknown=0pt, out of however many criteria are active). Rendered only
// in the results-list context, per Section 14's worked example -- never inside the detail panel.
export function explainBuyerCriteriaMatch(
  catalyst: CatalystWithSources,
  criteria: BuyerCriteria,
  dataConfidence: number | null
): { matchPercent: number; lines: MatchLine[] } {
  const lines = [
    matchMw(catalyst, criteria),
    matchTimeToPower(catalyst, criteria),
    matchAcreage(catalyst, criteria),
    matchGasDistance(catalyst, criteria),
    matchSubstationDistance(catalyst, criteria),
    matchTransmissionVoltage(catalyst, criteria),
    matchOwners(catalyst, criteria),
    matchZoning(catalyst, criteria),
    matchFloodplain(catalyst, criteria),
    matchDataConfidence(dataConfidence, criteria),
    matchPotentialScore(catalyst, criteria),
  ].filter((l): l is MatchLine => l != null);

  if (lines.length === 0) return { matchPercent: 100, lines: [] };
  const points = lines.reduce((sum, l) => sum + (l.status === "match" ? 1 : l.status === "caution" ? 0.5 : 0), 0);
  return { matchPercent: Math.round((points / lines.length) * 100), lines };
}
