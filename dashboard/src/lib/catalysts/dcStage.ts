import type { Catalyst, DataCenterSignalConfidence } from "@/lib/types";
import { filterWithinRadius } from "@/lib/geo";

// Data Center Refocus (Jared, 2026-10-01): the dashboard's primary product
// is now a 3-stage data-center early-warning model -- Possible / Predicted /
// Planned -- derived entirely from columns that already exist on `catalysts`
// (catalyst_type, signal_categories, signal_confidence). No migration, no
// new column: see the plan this session worked from for the full rationale.
// This file is the single source of truth for "is this catalyst DC-relevant,
// and at what stage" -- every map/filter/panel component imports from here
// instead of re-deriving the logic.
export type DcStage = "possible" | "predicted" | "planned";

// Planned = catalyst_type already confirmed 'data_center'. Predicted =
// catalyst_type 'potential_data_center' -- multiple converging signals, per
// lib/catalysts/dataCenterSignal.ts's own 2+-category requirement for ever
// assigning a signal_confidence at all. Possible = any other catalyst with
// at least one tagged signal_category -- a single early, isolated signal
// (a substation expansion, a fiber build, a water-capacity project) that
// hasn't converged into a dedicated data-center investigation yet.
export function computeDcStage(catalyst: Pick<Catalyst, "catalyst_type" | "signal_categories">): DcStage | null {
  if (catalyst.catalyst_type === "data_center") return "planned";
  if (catalyst.catalyst_type === "potential_data_center") return "predicted";
  if (catalyst.signal_categories.length >= 1) return "possible";
  return null;
}

export const DC_STAGE_LABEL: Record<DcStage, string> = {
  possible: "Possible",
  predicted: "Predicted",
  planned: "Planned",
};

// The exact UI-goal sentences from Jared's brief -- each stage must
// immediately communicate this, not a vaguer paraphrase.
export const DC_STAGE_HEADLINE: Record<DcStage, string> = {
  possible: "This area is becoming capable of supporting a data center.",
  predicted: "Evidence suggests a data center may be forming here.",
  planned: "A data center is now publicly confirmed or formally planned.",
};

// Planned reuses the existing confirmed-data-center plum
// (catalystTypeColors.ts's CATALYST_COLOR_GROUP_HEX.data_center) so a
// catalyst's color never jumps when it graduates from Predicted to Planned
// in an admin's hands. Possible/Predicted sit on a warm amber ramp, deliberately
// distinct from the cooler secondary-layer palette (emerald/gold/slate/gray)
// so the two systems never visually collide.
export const DC_STAGE_COLOR_HEX: Record<DcStage, string> = {
  possible: "#9c7a44", // dim bronze -- quiet, early signal
  predicted: "#d9923f", // brighter amber -- converging evidence
  planned: "#8b6bb0", // existing confirmed-data-center plum
};

// Collapses the underlying 4-value signal_confidence to the brief's
// requested Low/Medium/High display -- "very_high" reads as "High" here;
// the raw value stays available wherever the finer tier matters.
export function dcConfidenceLabel(confidence: DataCenterSignalConfidence | null): "Low" | "Medium" | "High" | null {
  if (confidence == null) return null;
  if (confidence === "very_high") return "High";
  if (confidence === "high") return "High";
  if (confidence === "medium") return "Medium";
  return "Low";
}

export function dcSignalCount(catalyst: Pick<Catalyst, "signal_categories">): number {
  return catalyst.signal_categories.length;
}

// "Why Groundbreakable is watching" -- supporting (dcStage === null)
// catalysts within watch radius of a Possible/Predicted/Planned catalyst,
// per the brief's worked example. Same 2-mile radius
// lib/catalysts/clusters.ts uses for compound-catalyst clustering, applied
// directly via the shared lib/geo.ts radius filter rather than that file's
// multi-catalyst transitive-grouping logic, which solves a different
// problem (grouping catalysts with each other, not "what's near this one").
export const DC_WATCH_RADIUS_METERS = 3218; // ~2 miles

export function nearbySupportingCatalysts<T extends Pick<Catalyst, "id" | "latitude" | "longitude" | "catalyst_type" | "signal_categories">>(
  catalyst: Pick<Catalyst, "id" | "latitude" | "longitude">,
  allCatalysts: T[]
): T[] {
  const candidates = allCatalysts.filter((c) => c.id !== catalyst.id && computeDcStage(c) === null);
  return filterWithinRadius({ lat: catalyst.latitude, lng: catalyst.longitude }, DC_WATCH_RADIUS_METERS, candidates, (c) => ({
    lat: c.latitude,
    lng: c.longitude,
  }));
}
