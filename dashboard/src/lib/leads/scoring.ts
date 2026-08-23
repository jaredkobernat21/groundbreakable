// The Groundbreakable Score: a transparent 0-100 prospect-prioritization
// score, not a predictive model. Every point is traceable to a reason shown
// directly beneath the score -- the explanation matters more than the
// number. Recompute (via recalculateLeadScore in [id]/actions.ts) whenever
// property, lead, or intelligence data changes.

import type { GblLead, GblProperty, GblPropertyIntelligence, ScoreReason } from "./types";

const MONTHS = 1000 * 60 * 60 * 24 * 30.44;

function monthsSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return null;
  return (Date.now() - then) / MONTHS;
}

export function computeGroundbreakableScore(
  property: GblProperty,
  lead: Pick<GblLead, "owner_type">,
  intelligence: GblPropertyIntelligence | null
): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = [];
  const add = (label: string, points: number) =>
    reasons.push({ label, points, direction: points >= 0 ? "positive" : "negative" });

  if (property.property_type === "vacant_residential" || property.property_type === "residential_acreage") {
    add("Vacant residential or residential acreage", 20);
  }

  const ownershipMonths = monthsSince(property.sale_date);
  if (ownershipMonths !== null && ownershipMonths <= 12) {
    add("Purchased within the last 12 months", 20);
  }

  if (lead.owner_type === "individual" || lead.owner_type === "couple") {
    add("Buyer is an individual or couple", 15);
  }

  if (property.existing_structure === false) {
    add("No residential structure currently present", 15);
  }

  const zoning = (property.zoning ?? "").toLowerCase();
  const plausibleZoning =
    zoning.includes("res") || property.property_type === "vacant_residential" || property.property_type === "residential_acreage";
  if (plausibleZoning) {
    add("Residential zoning / construction appears plausible", 10);
  }

  if (intelligence && intelligence.permit_found === false) {
    add("No new-home building permit detected", 10);
  }

  if (property.acreage !== null && property.acreage >= 0.5 && property.acreage <= 10) {
    add("Lot size consistent with custom-home construction", 5);
  }

  // "Surrounding area has recent residential construction" (+5) requires a
  // real data source (nearby permits/parcels) this system doesn't have yet
  // -- intentionally not awarded until that connector exists, rather than
  // guessed.

  if (lead.owner_type === "llc") {
    add("Buyer appears to be a developer / builder / institutional purchaser", -25);
  }

  if (property.property_type === "agricultural") {
    add("Property appears agricultural / investment-only", -20);
  }

  if (intelligence?.permit_status && /construction|under construction|framing|foundation/i.test(intelligence.permit_status)) {
    add("New residence already under construction", -20);
  }

  if (zoning && (zoning.includes("ag") || zoning.includes("non-residential") || zoning.includes("commercial")) && !plausibleZoning) {
    add("Highly restrictive / non-residential zoning", -15);
  }

  const raw = reasons.reduce((sum, r) => sum + r.points, 0);
  const score = Math.max(0, Math.min(100, raw));

  return { score, reasons };
}

export function scoreTier(score: number): { label: string; tone: "high" | "medium" | "low" } {
  if (score >= 75) return { label: "HIGH INTENT", tone: "high" };
  if (score >= 50) return { label: "WORTH REVIEWING", tone: "medium" };
  return { label: "LOW PRIORITY", tone: "low" };
}
