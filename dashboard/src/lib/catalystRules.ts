import type { CatalystWithSources, DevelopmentOpportunityWithSources } from "./types";
import type { PlanItem } from "./planItems";
import { planItemLocation } from "./planItems";
import { circlePolygon, haversineDistanceMeters, pointInPolygon } from "./geo";

// A catalyst's "affected area" is its admin-traced boundary when one
// exists, otherwise a circle derived from influence_radius_meters (same
// fallback the map layer draws -- see HeroMap/PlansMap) -- one place for
// both the map and every "is this thing nearby" check to agree on what
// "nearby" means for a given catalyst.
export function isWithinCatalystReach(catalyst: CatalystWithSources, point: { lat: number; lng: number }): boolean {
  if (catalyst.boundary) return pointInPolygon(point, catalyst.boundary);
  return haversineDistanceMeters(catalyst.latitude, catalyst.longitude, point.lat, point.lng) <= catalyst.influence_radius_meters;
}

export function catalystAffectedAreaPolygon(catalyst: CatalystWithSources): GeoJSON.Polygon | GeoJSON.MultiPolygon {
  return catalyst.boundary ?? circlePolygon(catalyst.longitude, catalyst.latitude, catalyst.influence_radius_meters);
}

// Whether a Plan (bare shift or entitlement case) is the one this catalyst
// was elevated from -- the badge shown on Plans feed/map/detail rows.
export function catalystForPlan(catalysts: CatalystWithSources[], plan: PlanItem): CatalystWithSources | null {
  if (plan.kind === "shift") {
    return catalysts.find((c) => c.related_shift_id === plan.id) ?? null;
  }
  return catalysts.find((c) => c.related_entitlement_case_id === plan.id) ?? null;
}

export function nearbyOpportunitiesForCatalyst(
  catalyst: CatalystWithSources,
  opportunities: DevelopmentOpportunityWithSources[]
): DevelopmentOpportunityWithSources[] {
  return opportunities.filter(
    (o) => o.latitude != null && o.longitude != null && isWithinCatalystReach(catalyst, { lat: o.latitude, lng: o.longitude })
  );
}

export function nearbyCatalystForPoint(catalysts: CatalystWithSources[], point: { lat: number; lng: number }): CatalystWithSources | null {
  return catalysts.find((c) => isWithinCatalystReach(c, point)) ?? null;
}

// Every Plan whose location falls inside this catalyst's affected area --
// broader than catalystForPlan's single elevated-from link (a catalyst can
// influence many nearby plans, not just the one it was elevated from).
export function nearbyPlanItemsForCatalyst(catalyst: CatalystWithSources, plans: PlanItem[]): PlanItem[] {
  return plans.filter((plan) => {
    if (catalystForPlan([catalyst], plan)) return true; // the originating Plan itself
    const location = planItemLocation(plan);
    return location != null && isWithinCatalystReach(catalyst, location);
  });
}
