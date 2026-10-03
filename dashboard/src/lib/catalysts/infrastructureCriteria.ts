// Infrastructure project criteria (Jared's brief, 2026-10-03). Mirrors
// lib/catalysts/housingPotentialCriteria.ts's role, but Infrastructure is
// not a Potential/Planned tier -- it's the upstream "what is changing"
// layer (INFRASTRUCTURE CHANGE -> DEVELOPMENT IMPACT -> POTENTIAL
// OPPORTUNITIES). See migration
// 20261003190000_infrastructure_project_intelligence.sql for the schema side.

export type InfrastructureType = "sewer" | "water" | "power" | "natural_gas" | "roads" | "fiber" | "transit" | "airport" | "other";

export const INFRASTRUCTURE_TYPE_LABEL: Record<InfrastructureType, string> = {
  sewer: "Sewer",
  water: "Water",
  power: "Power",
  natural_gas: "Natural Gas",
  roads: "Roads",
  fiber: "Fiber",
  transit: "Transit",
  airport: "Airport",
  other: "Other",
};

export type DevelopmentImpactType = "housing" | "data_center" | "industrial" | "commercial" | "mixed_use" | "logistics" | "other";

export const DEVELOPMENT_IMPACT_TYPE_LABEL: Record<DevelopmentImpactType, string> = {
  housing: "Housing",
  data_center: "Data Center",
  industrial: "Industrial",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
  logistics: "Logistics",
  other: "Other",
};

// Never a simplistic arbitrary score -- evidence-based (newly serviced
// acreage, existing zoning, future land-use plans, capacity increase,
// access improvement, adjacent undeveloped land, removal of a known
// development constraint). 'unknown' is the honest default when evidence
// is insufficient, same discipline as every other confidence-style enum
// this session.
export type DevelopmentImpactLevel = "high" | "moderate" | "low" | "unknown";

export const DEVELOPMENT_IMPACT_LEVEL_LABEL: Record<DevelopmentImpactLevel, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
  unknown: "Unknown",
};

// Infrastructure lifecycle (NOT Potential/Planned -- a project delivery
// pipeline). Implemented as an app-only grouping of the existing, shared
// `status` column (lib/types.ts CatalystStatus) -- mirrors
// catalystTypeColors.ts's existing CATALYST_STAGE_GROUP, which performs
// the identical kind of lossy regroup for the Data Center Planned-stage
// filter. This is a best-effort mapping of a field that predates
// infrastructure-specific nuance -- e.g. a project whose funding and
// design are both already secured but whose raw `status` still sits at
// 'planning_entitlement' will group as "Proposed," not "Funded" or
// "Design," until a future research pass re-scores its raw status
// directly. Not a data problem to silently paper over; flagged here and
// in the migration's own comment instead.
export type InfrastructureStatusGroup = "conceptual" | "proposed" | "funded" | "design" | "permitted_bid" | "under_construction" | "complete";

export const INFRASTRUCTURE_STATUS_GROUP_LABEL: Record<InfrastructureStatusGroup, string> = {
  conceptual: "Conceptual",
  proposed: "Proposed",
  funded: "Funded",
  design: "Design",
  permitted_bid: "Permitted / Bid",
  under_construction: "Under Construction",
  complete: "Complete",
};

const STATUS_GROUP_MAP: Partial<Record<string, InfrastructureStatusGroup>> = {
  rumored: "conceptual",
  under_study: "conceptual",
  site_selection: "proposed",
  planning_entitlement: "proposed",
  funding_incentives: "funded",
  land_acquired: "funded",
  design: "design",
  approved: "permitted_bid",
  construction_pending: "permitted_bid",
  under_construction: "under_construction",
  operating: "complete",
  completed: "complete",
  // cancelled intentionally omitted -- same convention as
  // CATALYST_STAGE_GROUP, excluded from the default lifecycle view.
};

export function infrastructureStatusGroup(status: string): InfrastructureStatusGroup | null {
  return STATUS_GROUP_MAP[status] ?? null;
}
