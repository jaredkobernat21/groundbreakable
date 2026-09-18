import type { SupabaseClient } from "@supabase/supabase-js";
import { haversineDistanceMeters } from "@/lib/geo";
import { getEntitlementCases } from "@/lib/queries/entitlementCases";
import type { EntitlementCase } from "@/lib/types";

// Find Entitlement Precedent (spec §7): rank existing entitlement_cases by
// similarity to a proposed site/scenario -- geographic proximity, zoning,
// proposed use, acreage, unit count, planning area -- NEVER by whether the
// precedent was approved or denied. A denial that's otherwise the closest
// match still ranks above a distant approval; the caller decides what the
// precedent implies.

export type EntitlementPrecedentCriteria = {
  latitude?: number | null;
  longitude?: number | null;
  existingZoning?: string | null;
  requestedZoning?: string | null;
  proposedUse?: string | null;
  acreage?: number | null;
  proposedUnits?: number | null;
  planningArea?: string | null;
};

export type EntitlementPrecedentMatch = {
  case: EntitlementCase;
  similarity: number; // 0-1, transparent weighted average -- a GROUNDBREAKABLE INFERENCE, not a fact
  matchedOn: string[]; // human-readable factors that drove the score, for display
};

type Dimension = { weight: number; score: number; label: string };

function closeness(a: number, b: number): number {
  const diff = Math.abs(a - b);
  const scale = Math.max(a, b, 1);
  return Math.max(0, 1 - diff / scale);
}

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) shared++;
  });
  return shared / Math.max(wordsA.size, wordsB.size);
}

function scoreCandidate(criteria: EntitlementPrecedentCriteria, candidate: EntitlementCase): Dimension[] {
  const dims: Dimension[] = [];

  if (criteria.latitude != null && criteria.longitude != null && candidate.latitude != null && candidate.longitude != null) {
    const distanceMiles =
      haversineDistanceMeters(criteria.latitude, criteria.longitude, candidate.latitude, candidate.longitude) / 1609.34;
    dims.push({ weight: 0.25, score: Math.max(0, 1 - distanceMiles / 10), label: `${distanceMiles.toFixed(1)} mi away` });
  }

  if (criteria.existingZoning && candidate.existing_zoning) {
    const match = criteria.existingZoning.toLowerCase() === candidate.existing_zoning.toLowerCase();
    dims.push({ weight: 0.15, score: match ? 1 : 0, label: "same existing zoning" });
  }

  if (criteria.requestedZoning && candidate.requested_zoning) {
    const match = criteria.requestedZoning.toLowerCase() === candidate.requested_zoning.toLowerCase();
    dims.push({
      weight: 0.15,
      score: match ? 1 : wordOverlap(criteria.requestedZoning, candidate.requested_zoning),
      label: match ? "same requested zoning" : "similar requested zoning",
    });
  }

  if (criteria.proposedUse && candidate.proposed_use) {
    dims.push({ weight: 0.15, score: wordOverlap(criteria.proposedUse, candidate.proposed_use), label: "similar proposed use" });
  }

  if (criteria.acreage != null && candidate.acreage != null) {
    dims.push({
      weight: 0.15,
      score: closeness(criteria.acreage, candidate.acreage),
      label: `comparable acreage (${candidate.acreage} ac)`,
    });
  }

  if (criteria.proposedUnits != null && candidate.proposed_units != null) {
    dims.push({
      weight: 0.1,
      score: closeness(criteria.proposedUnits, candidate.proposed_units),
      label: `comparable unit count (${candidate.proposed_units})`,
    });
  }

  if (criteria.planningArea && candidate.planning_area) {
    const match = criteria.planningArea.toLowerCase() === candidate.planning_area.toLowerCase();
    dims.push({ weight: 0.1, score: match ? 1 : 0, label: "same planning area" });
  }

  return dims;
}

export async function findEntitlementPrecedent(
  supabase: SupabaseClient,
  marketId: string,
  criteria: EntitlementPrecedentCriteria,
  options: { excludeCaseId?: string; limit?: number } = {}
): Promise<EntitlementPrecedentMatch[]> {
  const candidates = await getEntitlementCases(supabase, marketId);
  const limit = options.limit ?? 5;

  return candidates
    .filter((c) => c.id !== options.excludeCaseId)
    .map((c) => {
      const dims = scoreCandidate(criteria, c);
      const totalWeight = dims.reduce((sum, d) => sum + d.weight, 0);
      const similarity = totalWeight > 0 ? dims.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight : 0;
      const matchedOn = dims.filter((d) => d.score > 0.5).map((d) => d.label);
      return { case: c, similarity, matchedOn, dimensionCount: dims.length };
    })
    // A case with zero comparable dimensions isn't ranked by similarity at
    // all -- excluding it is more honest than assigning a fabricated 0.
    .filter((m) => m.dimensionCount > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(({ case: c, similarity, matchedOn }) => ({ case: c, similarity, matchedOn }));
}
