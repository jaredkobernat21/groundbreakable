// Potential Data Center Site criteria (Jared's full spec, 2026-10-02).
// This is the third Data Center stage -- POTENTIAL -- for sites/areas with
// strong underlying fundamentals for FUTURE data center development but
// NO known data-center activity (no proposal, pursuit, rumor, permit,
// rezoning, land assembly, or development) at that location.
//
// This is a different question from the "Possible" criteria
// (CATALYST_SIGNAL_BIBLE.md) and the catalyst_type = 'potential_data_center'
// investigation (dataCenterSignal.ts): those are both about detecting
// something already happening, even faintly. Potential is about recognizing
// a location is well-suited BEFORE anything is happening there at all --
// the early-stage site-selector's job, not the signal-detector's job.
//
// STRICT RULE: a location only qualifies as Potential when (1) its
// fundamentals genuinely align per the factors below, AND (2) a real search
// (see NEGATIVE_SEARCH_TERMS) turns up no credible indication a data center
// is already being pursued there. If credible evidence of an actual
// pursuit exists, the finding belongs under Possible or Planned instead --
// never under Potential.

export type PotentialSiteFactorKey =
  | "power_grid"
  | "land_expansion"
  | "fiber_connectivity"
  | "government_incentives"
  | "development_entitlement"
  | "physical_environmental_risk"
  | "water_cooling"
  | "transportation_workforce";

// Weights sum to 100 -- Power + Grid Scalability is deliberately the
// largest single factor, matching the "Priority #1" framing already
// established for the Possible/Potential-Data-Center signal systems.
export const POTENTIAL_SITE_FACTOR_WEIGHT: Record<PotentialSiteFactorKey, number> = {
  power_grid: 30,
  land_expansion: 15,
  fiber_connectivity: 15,
  government_incentives: 10,
  development_entitlement: 10,
  physical_environmental_risk: 10,
  water_cooling: 5,
  transportation_workforce: 5,
};

export const POTENTIAL_SITE_FACTOR_LABEL: Record<PotentialSiteFactorKey, string> = {
  power_grid: "Power + Grid Scalability",
  land_expansion: "Land + Expansion",
  fiber_connectivity: "Fiber + Connectivity",
  government_incentives: "Government + Incentives",
  development_entitlement: "Development + Entitlement Feasibility",
  physical_environmental_risk: "Physical + Environmental Risk",
  water_cooling: "Water + Cooling Feasibility",
  transportation_workforce: "Transportation + Workforce",
};

// What to look for per factor -- the full checklist from Jared's spec,
// kept here (not just in the bible doc) so the admin form/detail panel can
// render it inline as guidance.
export const POTENTIAL_SITE_FACTOR_CHECKLIST: Record<PotentialSiteFactorKey, string[]> = {
  power_grid: [
    "High-voltage transmission infrastructure",
    "Transmission substations",
    "Multiple transmission paths",
    "Proximity to electrical generation",
    "Strong utility infrastructure / utility territory capable of serving major industrial loads",
    "Existing large industrial power users nearby",
    "Planned GENERAL grid improvements not associated with any data center",
    "Retired or retiring industrial/generation sites with valuable electrical infrastructure",
    "Potential for substantial future electrical expansion",
    "Natural-gas infrastructure that could support behind-the-meter generation",
    "Renewable generation, where applicable",
  ],
  land_expansion: [
    "~100+ contiguous developable acres for a major campus (200-500+ acres where available)",
    "Relatively flat terrain",
    "Limited parcel fragmentation; large parcels under one or few owners",
    "Industrial or agricultural land",
    "Room for buildings, substations, generators, cooling, setbacks, and security",
    "Strong road access",
  ],
  fiber_connectivity: [
    "Long-haul fiber routes",
    "Multiple fiber carriers",
    "Redundant network paths",
    "Interstate/rail/utility corridors likely supporting fiber",
    "Nearby network nodes",
    "Connectivity to major metros / latency considerations",
    "Potential ability to extend fiber into the site",
  ],
  government_incentives: [
    "Data-center or sales-tax exemptions",
    "Property-tax abatements / PILOT opportunities",
    "Industrial development incentives, economic-development grants, TIF or similar districts",
    "Utility economic-development programs",
    "Expedited permitting; development-ready industrial areas",
    "Local government attitude toward large industrial/infrastructure investment (recruitment posture, streamlined permitting) -- but a municipality recruiting data centers specifically can itself signal a project may already be underway; investigate before treating it as a clean Potential signal",
    "Negative signals to weigh down: moratoriums, restrictive zoning, major community opposition, prohibitive utility/environmental policy",
  ],
  development_entitlement: [
    "Current zoning and likelihood of industrial/data-center use",
    "Comprehensive/future land-use plans",
    "Annexation feasibility",
    "Permitting environment; setbacks, noise, height restrictions",
    "Neighboring uses; entitlement difficulty; jurisdictional complexity",
  ],
  physical_environmental_risk: [
    "Floodplain, wetlands, wildfire, seismic, hurricane/storm-surge exposure",
    "Extreme weather exposure",
    "Airport runway zones",
    "Hazardous industrial neighbors; major rail safety exposure",
    "Protected lands; difficult terrain; significant environmental constraints",
  ],
  water_cooling: [
    "Municipal water infrastructure; wastewater capacity",
    "Reclaimed-water opportunities; treatment facilities",
    "Cooling climate; water scarcity; likely cooling constraints",
    "Do not automatically reject a site without major water availability -- cooling architectures vary",
  ],
  transportation_workforce: [
    "Interstate/highway access; airport proximity",
    "Construction, electrical, mechanical, and utility contractor availability",
    "Engineering resources; industrial workforce",
    "Access to a nearby metro",
  ],
};

// Card-level pillar organization (Jared's clarification, 2026-10-02, same
// day as the type's creation): the map stays simple (Potential/Possible/
// Planned only, no new top-level categories) -- Approval and Infrastructure
// depth live INSIDE every Potential site's profile as 2 of 4 scannable
// pillars, not as new map layers. The 8 factors above are still the
// underlying weighted scoring detail ("supporting details" a pillar
// expands into); this map groups them for display purposes only, no
// change to POTENTIAL_SITE_FACTOR_WEIGHT.
export type PotentialSitePillar = "power" | "site" | "approval" | "infrastructure";

export const POTENTIAL_SITE_PILLAR_LABEL: Record<PotentialSitePillar, string> = {
  power: "Power",
  site: "Site",
  approval: "Approval",
  infrastructure: "Infrastructure",
};

// Which of the 8 underlying factors each pillar's "expand for details"
// view shows. transportation_workforce sits under Site (its own checklist
// already includes "strong road access") rather than Infrastructure --
// Infrastructure here is specifically delivery/timeline feasibility
// (utility interconnection process, large-load timelines), not site-level
// road/transit access.
export const POTENTIAL_SITE_PILLAR_FACTORS: Record<PotentialSitePillar, PotentialSiteFactorKey[]> = {
  power: ["power_grid"],
  site: ["land_expansion", "fiber_connectivity", "water_cooling", "physical_environmental_risk", "transportation_workforce"],
  approval: ["government_incentives", "development_entitlement"],
  infrastructure: [],
};

// Power/Site pillar rollups -- a holistic word a researcher assigns from
// the underlying evidence, same "don't use unless the research justifies
// it" discipline as every other label here.
export type PillarStrength = "strong" | "moderate" | "weak" | "unknown";
export const PILLAR_STRENGTH_LABEL: Record<PillarStrength, string> = {
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
  unknown: "Unknown",
};

// Approval pillar -- "now a major factor" per Jared's clarification.
// Researched against comparable major industrial/infrastructure/
// manufacturing/warehouse/energy projects in the same jurisdiction, never
// predicted without evidence.
export type EntitlementVelocity = "favorable" | "moderate" | "difficult" | "unknown";
export const ENTITLEMENT_VELOCITY_LABEL: Record<EntitlementVelocity, string> = {
  favorable: "Favorable",
  moderate: "Moderate",
  difficult: "Difficult",
  unknown: "Unknown",
};

export type CityReceptiveness = "high" | "moderate" | "low" | "unknown";
export const CITY_RECEPTIVENESS_LABEL: Record<CityReceptiveness, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
  unknown: "Unknown",
};

// Never predict community reaction without evidence -- 'unknown' is the
// honest default, not an assumption of support or opposition either way.
export type CommunityFriction = "low" | "moderate" | "high" | "unknown";
export const COMMUNITY_FRICTION_LABEL: Record<CommunityFriction, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  unknown: "Unknown",
};

// Approval's card-level rollup is its OWN field (not a mechanical
// combination of the three above) -- a site can be High receptiveness and
// High friction at once, and only a researcher synthesizing both can
// assign one honest overall word.
export type ApprovalPillarLabel = "favorable" | "moderate" | "difficult" | "unknown";
export const APPROVAL_PILLAR_LABEL: Record<ApprovalPillarLabel, string> = {
  favorable: "Favorable",
  moderate: "Moderate",
  difficult: "Difficult",
  unknown: "Unknown",
};

// Infrastructure pillar -- delivery/timeline feasibility specifically
// (utility interconnection process, published large-load timelines,
// historical delivery timelines, transmission/substation requirements,
// water/sewer/road/fiber extension, nearby infrastructure projects).
// Utility Timeline IS this pillar's card-level headline label -- no
// separate infrastructure_pillar_label column exists (see migration
// 20261002080000's comment for why).
export type UtilityTimeline = "favorable" | "moderate" | "long" | "unknown";
export const UTILITY_TIMELINE_LABEL: Record<UtilityTimeline, string> = {
  favorable: "Favorable",
  moderate: "Moderate",
  long: "Long",
  unknown: "Unknown",
};

// Evidence confidence (Jared, 2026-10-03; widened 2026-10-03 for the
// Energy/Timeline/Risk/People brief) -- a different axis from a pillar's
// strength label: "how sure are we," independent of "how good is this
// factor." Optional -- rows that predate this field render without a badge
// rather than a misleading default. "indicated" is kept (not renamed) for
// backward compatibility with the 2 existing rows that already use it --
// "reported" and "estimated" are new, finer-grained siblings a researcher
// can choose going forward (reported = a named party's public claim,
// estimated = Groundbreakable's own inference from known facts, indicated =
// the original, slightly vaguer "evidence points this way"). No DB
// constraint change needed -- potential_score_components is unstructured
// jsonb, so this is a TypeScript-only widening.
export type PotentialEvidenceStatus = "verified" | "reported" | "estimated" | "indicated" | "unknown";

export const POTENTIAL_EVIDENCE_STATUS_LABEL: Record<PotentialEvidenceStatus, string> = {
  verified: "Verified",
  reported: "Reported",
  estimated: "Estimated",
  indicated: "Indicated",
  unknown: "Unknown",
};

// Mirrors CatalystScoreComponent's shape (lib/catalysts/score.ts) for
// consistency, but this is a SEPARATE scoring system with its own rubric --
// never conflate potential_score with catalyst_score.
export type PotentialScoreComponent = {
  key: PotentialSiteFactorKey;
  points: number; // 0..weight, human-assigned per documented evidence
  evidence: string[]; // what was actually found, with real sources
  unknowns: string[]; // what still needs confirmation for this factor
  status?: PotentialEvidenceStatus; // optional per-factor evidence confidence
};

// Potential Area (a broader zone where conditions are aligning) vs.
// Potential Site (a specific parcel/assemblage). Nullable on the row --
// only set it when genuinely known either way.
export type PotentialSiteType = "area" | "site";
export const POTENTIAL_SITE_TYPE_LABEL: Record<PotentialSiteType, string> = {
  area: "Potential Area",
  site: "Potential Site",
};

// Sums a candidate's component scores into the 0-100 Potential Score.
// Deliberately simple (a sum, not a formula) -- the rubric's weights ARE
// the formula; this just totals what a researcher assigned per factor
// against the documented evidence. Clamps each component to its own max so
// a data-entry mistake can't silently inflate the total past 100.
export function sumPotentialScore(components: PotentialScoreComponent[]): number {
  return Math.round(
    components.reduce((sum, c) => {
      const max = POTENTIAL_SITE_FACTOR_WEIGHT[c.key];
      return sum + Math.max(0, Math.min(c.points, max));
    }, 0)
  );
}

// The search-combination checklist from Jared's spec -- run combinations of
// (city, county, utility, parcel/site, landowner, nearby industrial park,
// economic-development org, relevant companies) with these terms BEFORE
// classifying anything as Potential. If any combination turns up credible
// evidence of an actual pursuit, the finding is Possible or Planned, not
// Potential.
export const POTENTIAL_SITE_NEGATIVE_SEARCH_TERMS = [
  "data center",
  "datacenter",
  "hyperscale",
  "AI campus",
  "compute campus",
  "cloud campus",
  "server farm",
  "digital infrastructure",
  "data center rezoning",
  "data center permit",
  "data center utility request",
  "data center land acquisition",
] as const;

// ============================================================
// Energy / Timeline / Risk / People (Jared's 2026-10-03 product brief) --
// regroups the existing pillars/factors above into a clearer 4-category
// product framing, plus three genuinely new concepts (Readiness, Next
// Steps, Why This Site) that had no home in the original schema. See
// migration 20261003160000_potential_site_energy_timeline_risk_people.sql
// for the schema side of this. Nothing above this line changes meaning --
// POTENTIAL_SITE_PILLAR_FACTORS/power_pillar_label/site_pillar_label/
// approval_pillar_label keep their original roles as the underlying
// rollup columns; the constants below are a presentation-layer regroup on
// top of them, not a replacement.
// ============================================================

export type IntelligenceCategory = "energy" | "timeline" | "risk" | "people";

export const INTELLIGENCE_CATEGORY_LABEL: Record<IntelligenceCategory, string> = {
  energy: "Energy",
  timeline: "Timeline",
  risk: "Risk",
  people: "People",
};

// Which of the 8 underlying scored factors each category's "expand for
// details" view shows. Timeline and People have no scored factor of their
// own: Timeline is driven directly by utility_timeline/entitlement_velocity
// (categorical judgments, not point-scored), and People is driven by the
// new `people` jsonb column, not a weighted factor.
export const POTENTIAL_SITE_CATEGORY_FACTORS: Record<IntelligenceCategory, PotentialSiteFactorKey[]> = {
  energy: ["power_grid", "water_cooling", "fiber_connectivity"],
  timeline: [],
  risk: ["land_expansion", "physical_environmental_risk", "development_entitlement", "government_incentives", "transportation_workforce"],
  people: [],
};

// "Simple visual status" for Time to Power (Jared's brief) -- reuses the
// existing utility_timeline categorical judgment rather than adding a new
// data point. The year ranges in UTILITY_TIMELINE_BUCKET_CAPTION describe
// what each bucket conventionally means in general -- shown once as a
// caption/legend, never rendered as a specific forecast for an individual
// site. Never fabricate an actual date from this.
export const UTILITY_TIMELINE_BUCKET_LABEL: Record<UtilityTimeline, string> = {
  favorable: "Fast Path",
  moderate: "Moderate",
  long: "Long",
  unknown: "Unknown",
};

export const UTILITY_TIMELINE_BUCKET_CAPTION = "Fast Path = typically under 3 years · Moderate = typically 3–5 years · Long = typically 5+ years";

// PEOPLE (Jared's brief): who actually controls the decisions necessary for
// a site to move forward. Every field optional -- a researcher fills in
// only what was actually, publicly found. No DB-level shape enforcement
// (see migration) -- this type is the app-side contract for the `people`
// jsonb column. Deliberately not a contact directory: only the parties
// that materially affect whether the project can happen.
export type PotentialSiteOwnerInfo = {
  name?: string;
  entity?: string;
  contact?: string;
  ownership_since?: string;
  outreach_status?: string;
  interest_status?: string;
  asking_price?: string;
  site_control_status?: string;
  mineral_rights?: string;
  notes?: string;
};

export type PotentialSiteUtilityContactInfo = {
  utility?: string;
  economic_development_contact?: string;
  large_load_contact?: string;
  engineer_contact?: string;
  notes?: string;
};

export type PotentialSiteGovernmentContactInfo = {
  municipality?: string;
  county?: string;
  planning_department?: string;
  economic_development_org?: string;
  decision_making_body?: string;
  notes?: string;
};

export type PotentialSiteDevelopmentContactInfo = {
  developer?: string;
  broker?: string;
  site_selection_contact?: string;
  epc?: string;
  engineering_firm?: string;
  energy_developer?: string;
  gas_provider?: string;
  notes?: string;
};

export type PotentialSitePeople = {
  owner?: PotentialSiteOwnerInfo;
  utility?: PotentialSiteUtilityContactInfo;
  government?: PotentialSiteGovernmentContactInfo;
  development?: PotentialSiteDevelopmentContactInfo;
};

// READINESS (Jared's brief) -- a DIFFERENT axis from potential_score:
// potential_score describes how strong the underlying fundamentals look on
// paper; Readiness describes how much of the site-control/utility/
// entitlement/environmental picture has actually been validated through
// real conversations and work. Stages must depend on actual supporting
// evidence and are never auto-advanced.
export type ReadinessStage = "discovery" | "qualified" | "feasibility" | "controlled" | "de_risked";

export const READINESS_STAGE_LABEL: Record<ReadinessStage, string> = {
  discovery: "Discovery",
  qualified: "Qualified",
  feasibility: "Feasibility",
  controlled: "Controlled",
  de_risked: "De-Risked",
};

export const READINESS_STAGE_DESCRIPTION: Record<ReadinessStage, string> = {
  discovery: "Groundbreakable has identified an interesting convergence of infrastructure, land, location, or market signals.",
  qualified: "Desktop diligence supports further investigation.",
  feasibility: "Owner, utility, city, environmental, or development conversations or studies have begun.",
  controlled: "A developer or investor has some form of site control -- an option, LOI, or contract.",
  de_risked: "Major power, land, entitlement, environmental, and timeline questions have been materially validated.",
};

// Null on a row means exactly what Discovery means: Groundbreakable has
// surfaced the site but no owner/utility/entitlement work has started yet
// -- true of every Potential row researched so far this session. This
// default is the honest floor, not an assumption of progress -- never
// write 'discovery' (or any other stage) onto a row without it being the
// genuinely evidenced state.
export function computeReadinessStage(catalyst: { readiness_stage: ReadinessStage | null }): ReadinessStage {
  return catalyst.readiness_stage ?? "discovery";
}

// NEXT STEPS (Jared's brief): "intelligent and site-specific rather than
// generic boilerplate." When a researcher hasn't written explicit
// next_steps, this derives a reasonable, capped list from what the row's
// own research already flagged as unverified (unknowns_to_verify) plus the
// most material missing-People gaps -- a presentation transform of
// already-logged, already-verified facts, never new research or invention.
export function computeNextSteps(catalyst: {
  next_steps: string[];
  unknowns_to_verify: string[];
  people: PotentialSitePeople | null;
}): string[] {
  if (catalyst.next_steps.length > 0) return catalyst.next_steps;

  const steps: string[] = [];
  if (!catalyst.people?.owner) steps.push("Identify the property owner and gauge sale/option willingness.");
  if (!catalyst.people?.utility) steps.push("Open a dialogue with the serving utility's large-load/economic-development team.");
  steps.push(...catalyst.unknowns_to_verify);
  return steps.slice(0, 5);
}

// WHY THIS SITE (Jared's brief): a tight 2-4 sentence summary, distinct
// from why_it_matters (the existing field the panel already shows, labeled
// "Why This Is Surfacing"). Existing rows predate why_this_site -- rather
// than leaving the panel blank or re-running research to backfill every
// row, this synthesizes a short, honest line purely from fields already
// verified and on file, then falls back to why_it_matters, then to null
// (the panel itself falls back further to a generic disclosure). Never
// invents a fact that isn't already stored on the row.
export function computeWhySiteSummary(catalyst: {
  why_this_site: string | null;
  why_it_matters: string | null;
  opportunity_area: string | null;
  power_pillar_label: PillarStrength | null;
  utility_timeline: UtilityTimeline | null;
}): string | null {
  if (catalyst.why_this_site) return catalyst.why_this_site;

  const parts: string[] = [];
  if (catalyst.opportunity_area) parts.push(catalyst.opportunity_area);
  if (catalyst.power_pillar_label && catalyst.power_pillar_label !== "unknown") {
    parts.push(`Power fundamentals are assessed as ${PILLAR_STRENGTH_LABEL[catalyst.power_pillar_label].toLowerCase()}`);
  }
  if (catalyst.utility_timeline && catalyst.utility_timeline !== "unknown") {
    parts.push(`time to power is assessed as ${UTILITY_TIMELINE_BUCKET_LABEL[catalyst.utility_timeline].toLowerCase()}`);
  }
  if (parts.length > 0) return `${parts.join(". ")}.`;

  return catalyst.why_it_matters;
}
