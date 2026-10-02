import type { Catalyst, DataCenterSignalConfidence } from "@/lib/types";
import { filterWithinRadius } from "@/lib/geo";

// Data Center Refocus (Jared, 2026-10-01; collapsed to 2 stages 2026-10-02;
// expanded to 3 stages 2026-10-02 same day): the dashboard's primary
// product is a data-center early-warning model -- Potential / Possible /
// Planned -- derived entirely from columns that already exist on
// `catalysts` (catalyst_type, signal_categories, signal_confidence). This
// file is the single source of truth for "is this catalyst DC-relevant,
// and at what stage" -- every map/filter/panel component imports from here
// instead of re-deriving the logic.
//
// NAMING NOTE: "Possible" below is NOT the same thing the DB column value
// `potential_data_center` might suggest at a glance -- that catalyst_type
// is the ACTIVE, forming-signal investigation (land assembly, a substation
// being built now, an LLC land purchase), which is exactly what "Possible"
// means in Jared's 2026-10-02 3-tier spec. The genuinely new "Potential"
// stage (strong fundamentals, ZERO known activity) is a different
// catalyst_type entirely: 'prospective_data_center_site'. Don't rename the
// DB value to match the UI label -- see the migration comment
// (20261002070000_add_potential_data_center_site_catalyst_type.sql) for why.
export type DcStage = "potential" | "possible" | "planned";

// Planned = catalyst_type already confirmed 'data_center'. Potential =
// catalyst_type 'prospective_data_center_site' (strong fundamentals, no
// known activity -- see lib/catalysts/potentialSiteCriteria.ts). Possible =
// everything else that's DC-relevant at all: a `potential_data_center`
// investigation (multiple converging signals, per lib/catalysts/
// dataCenterSignal.ts's own 2+-category requirement for ever assigning a
// signal_confidence) and a catalyst of any other type with at least one
// tagged signal_category (a single early, isolated signal -- a substation
// expansion, a fiber build, a water-capacity project) are both "Possible";
// the former carries a confidence tier, the latter doesn't, but neither is
// publicly confirmed, so both live under the same stage.
export function computeDcStage(catalyst: Pick<Catalyst, "catalyst_type" | "signal_categories">): DcStage | null {
  if (catalyst.catalyst_type === "data_center") return "planned";
  if (catalyst.catalyst_type === "prospective_data_center_site") return "potential";
  if (catalyst.catalyst_type === "potential_data_center") return "possible";
  if (catalyst.signal_categories.length >= 1) return "possible";
  return null;
}

export const DC_STAGE_LABEL: Record<DcStage, string> = {
  potential: "Potential",
  possible: "Possible",
  planned: "Planned",
};

// The exact UI-goal sentences from Jared's brief -- each stage must
// immediately communicate this, not a vaguer paraphrase.
export const DC_STAGE_HEADLINE: Record<DcStage, string> = {
  potential: "This location has strong underlying fundamentals for a future data center, but no known data-center activity has been detected here yet.",
  possible: "This area is becoming capable of supporting a data center.",
  planned: "A data center is now publicly confirmed or formally planned.",
};

// Planned reuses the existing confirmed-data-center plum
// (catalystTypeColors.ts's CATALYST_COLOR_GROUP_HEX.data_center) so a
// catalyst's color never jumps when it graduates from Possible to Planned
// in an admin's hands. Possible sits on a warm amber. Potential is green,
// per Jared's explicit instruction -- deliberately the most "exploratory"-
// feeling of the three and visually distinct from both.
export const DC_STAGE_COLOR_HEX: Record<DcStage, string> = {
  potential: "#5a9e4a", // green -- strong fundamentals, no known activity
  possible: "#d9923f", // amber -- early/converging signal
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
// catalysts within watch radius of a Possible/Planned catalyst, per the
// brief's worked example. Same 2-mile radius
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
