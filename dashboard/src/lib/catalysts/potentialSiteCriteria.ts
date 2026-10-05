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
// "requires_verification" added 2026-10-04 (buyer-intelligence brief) -- the specific "we know
// this is a real open question" case for high-value Power facts (available MW, time-to-power),
// distinct from the plainer "unknown" (nothing researched at all). "supported" added same day
// (research-quality brief): "multiple credible signals support the conclusion, but it is not
// formally confirmed." "partially_resolved" and "unknown_after_public_record_search" added same
// day (deep public-record research update): "partially_resolved" is for a field where the
// escalation hierarchy found SOME of the answer but not all of it (e.g. a named substation found,
// but not its voltage); "unknown_after_public_record_search" is deliberately distinct from the
// bare "unknown" -- it asserts the full escalation hierarchy was actually run, not skipped, and a
// field should earn this value rather than defaulting to it. All four additions are kept
// alongside the original values rather than replacing any of them, same backward-compatible-
// widening convention this type has followed from the start.
export type PotentialEvidenceStatus =
  | "verified"
  | "supported"
  | "partially_resolved"
  | "reported"
  | "estimated"
  | "indicated"
  | "unknown"
  | "unknown_after_public_record_search"
  | "requires_verification";

// Label for requires_verification renamed 2026-10-04 (research-quality brief) to the brief's own
// exact vocabulary, "Requires Direct Confirmation" -- same underlying DB value, display text only.
export const POTENTIAL_EVIDENCE_STATUS_LABEL: Record<PotentialEvidenceStatus, string> = {
  verified: "Verified",
  supported: "Supported",
  partially_resolved: "Partially Resolved",
  reported: "Reported",
  estimated: "Estimated",
  indicated: "Indicated",
  unknown: "Unknown",
  unknown_after_public_record_search: "Unknown After Public-Record Search",
  requires_verification: "Requires Direct Confirmation",
};

// Final Developer Assessment (2026-10-04 research-quality brief) -- a bottom-line go/no-go
// recommendation, distinct from potential_score (how the site looks) and readiness_stage (how
// much has been validated through real work). Never auto-derived -- a researcher's own synthesis
// across Power/Land/Site Control/Entitlement/BTM Energy/Fiber/Water/Physical Constraints.
// "discovered"/"screen" added 2026-10-04 (Bonner Springs refinement brief): a site can score well
// and still not be power-qualified -- "screen" names that honestly instead of forcing "pursue."
export type DeveloperAssessment = "discovered" | "screen" | "strong_pursuit" | "pursue" | "watch" | "weak" | "disqualified";

export const DEVELOPER_ASSESSMENT_LABEL: Record<DeveloperAssessment, string> = {
  discovered: "Discovered",
  screen: "Screen",
  strong_pursuit: "Strong Pursuit",
  pursue: "Pursue",
  watch: "Watch",
  weak: "Weak",
  disqualified: "Disqualified",
};

export const DEVELOPER_ASSESSMENT_DESCRIPTION: Record<DeveloperAssessment, string> = {
  discovered: "Identified; no diligence performed yet.",
  screen: "Strong non-power fundamentals justify a utility and site-control screen before advancing further.",
  strong_pursuit: "Worth immediate developer diligence.",
  pursue: "Strong enough to advance.",
  watch: "Interesting, but one or more major unknowns remain.",
  weak: "Fundamentals do not currently justify deeper diligence.",
  disqualified: "A major constraint makes the site unsuitable for the target profile.",
};

export const DEVELOPER_ASSESSMENT_COLOR_HEX: Record<DeveloperAssessment, string> = {
  discovered: "#6b7280",
  screen: "#5b8fb0",
  strong_pursuit: "#34d399",
  pursue: "#5a9e4a",
  watch: "#d9923f",
  weak: "#9a8c6b",
  disqualified: "#c0564a",
};

// POWER QUALIFICATION (2026-10-04 Bonner Springs refinement brief) -- power treated as a GATE,
// not just another weighted score factor. Never auto-derived from potential_score.
export type PowerQualification = "unqualified" | "infrastructure_indicated" | "utility_path_indicated" | "capacity_indicated" | "capacity_confirmed";

export const POWER_QUALIFICATION_LABEL: Record<PowerQualification, string> = {
  unqualified: "Unqualified",
  infrastructure_indicated: "Infrastructure Indicated",
  utility_path_indicated: "Utility Path Indicated",
  capacity_indicated: "Capacity Indicated",
  capacity_confirmed: "Capacity Confirmed",
};

export const POWER_QUALIFICATION_DESCRIPTION: Record<PowerQualification, string> = {
  unqualified: "Large-load path not established.",
  infrastructure_indicated: "Relevant power infrastructure exists nearby.",
  utility_path_indicated: "Public utility plans/tariffs/upgrades support a plausible large-load pathway.",
  capacity_indicated: "Credible evidence suggests a meaningful large-load opportunity.",
  capacity_confirmed: "Utility-specific capacity has been directly confirmed.",
};

export type SubstationType = "distribution" | "transmission" | "unknown";

export const SUBSTATION_TYPE_LABEL: Record<SubstationType, string> = {
  distribution: "Distribution",
  transmission: "Transmission",
  unknown: "Unknown",
};

export type ExpansionRequirement = "minor" | "significant" | "major" | "unknown";

export const EXPANSION_REQUIREMENT_LABEL: Record<ExpansionRequirement, string> = {
  minor: "Minor",
  significant: "Significant",
  major: "Major",
  unknown: "Unknown",
};

// WATER CAPACITY STATUS (2026-10-04 Bonner Springs refinement brief) -- the structured fact
// developer-facing narrative (water_notes, developer_takeaway) must never claim more than.
export type WaterCapacityStatus = "infrastructure_verified" | "capacity_verified" | "capacity_indicated" | "requires_confirmation";

export const WATER_CAPACITY_STATUS_LABEL: Record<WaterCapacityStatus, string> = {
  infrastructure_verified: "Infrastructure Verified",
  capacity_verified: "Capacity Verified",
  capacity_indicated: "Capacity Indicated",
  requires_confirmation: "Requires Utility Confirmation",
};

// DEVELOPMENT GATES (2026-10-04 Bonner Springs refinement brief) -- a decision screen, not a
// replacement for the detailed category sections underneath it.
export type DevelopmentGateStatus = "green" | "yellow" | "red" | "gray";

export const DEVELOPMENT_GATE_STATUS_LABEL: Record<DevelopmentGateStatus, string> = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  gray: "Gray",
};

export const DEVELOPMENT_GATE_STATUS_COLOR_HEX: Record<DevelopmentGateStatus, string> = {
  green: "#5a9e4a",
  yellow: "#d9923f",
  red: "#c0564a",
  gray: "#6b7280",
};

export type DevelopmentGateKey = "power" | "land" | "site_control" | "entitlement" | "btm_gas" | "fiber" | "water" | "environmental";

export const DEVELOPMENT_GATE_KEY_LABEL: Record<DevelopmentGateKey, string> = {
  power: "Power",
  land: "Land",
  site_control: "Site Control",
  entitlement: "Entitlement",
  btm_gas: "BTM Gas",
  fiber: "Fiber",
  water: "Water",
  environmental: "Environmental",
};

export const DEVELOPMENT_GATE_ORDER: DevelopmentGateKey[] = ["power", "land", "site_control", "entitlement", "btm_gas", "fiber", "water", "environmental"];

export type DevelopmentGates = Partial<Record<DevelopmentGateKey, DevelopmentGateStatus>>;

export type LocationAccess = {
  kc_metro_position?: string;
  interstate_name?: string;
  interstate_distance_miles?: number;
  k7_distance_miles?: number;
  airport_distance_miles?: number;
  airport_drive_minutes?: number;
  rail?: string;
  industrial_context?: string;
  residential_buffer_miles?: number;
};

// Target Load Profile (2026-10-04 Bonner Springs refinement brief) -- the DEMAND side (what a
// buyer needs) vs. potential_load_mw_low/high (the SUPPLY side -- what's been confirmed
// deliverable). Comparing the two is what prevents a small verified MW figure from reading as
// sufficient for a hyperscale target. Default applies whenever a row's own target_load_mw_* is
// null -- a Potential site is presumed evaluated against a large-scale load unless a researcher
// has recorded a specific smaller target.
export const DEFAULT_TARGET_LOAD_MW_LOW = 50;
export const DEFAULT_TARGET_LOAD_MW_LABEL = "50–100+ MW";

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
// Deep public-record research standard (Jared, 2026-10-04 "deep public-record research update,"
// calibrated against what a proper Bonner Springs pass should have found: a Johnson County parcel
// record for 4101 Powell Ave LLC at taxbill.jocogov.org, a named/addressed Evergy substation
// (Whippoorwill, 120 S. 110th St, approved under city Ordinance 2605/SUP-03-25) surfaced via a
// legal-notice PDF, and city planning-agenda/comprehensive-plan documents carrying parcel/zoning/
// floodplain detail). CORE RULE: "Requires Direct Confirmation" is the END of the public research
// process, not a shortcut around it -- a researcher (human or agent) must exhaust the escalation
// levels below for a field before declaring it unknown. Applies to every Potential-tier research
// pass, not just Bonner Springs -- that was the calibration example, not a one-off.
//
// ESCALATION HIERARCHY -- work through these in order per field before giving up on it:
//   LEVEL 1 -- General web: exact site + infrastructure terms, several phrasings.
//   LEVEL 2 -- Official government: city, county, assessor, GIS, planning, zoning, ordinances,
//              agendas, legal notices, comprehensive plans.
//   LEVEL 3 -- Utility/infrastructure: electric utility, gas pipeline operator, fiber provider,
//              water/wastewater utility, RTO/ISO.
//   LEVEL 4 -- Regulatory: state utility commission, FERC, PHMSA, EPA, FEMA.
//   LEVEL 5 -- Derived research: cross-reference parcel locations, legal descriptions, streets,
//              plats, and infrastructure maps against each other.
//
// PARCEL RESEARCH WORKFLOW (before marking Site Control/ownership unresolved): identify streets/
// addresses/plat names inside the opportunity boundary -> search the county assessor/GIS by
// address, parcel ID, owner, legal description, AND plat/subdivision name (not just a park-level
// name search) -> collect parcel ID/address/legal description/acreage/owner/mailing address/
// property type/assessed value per parcel -> group by ownership entity -> roll up total
// acreage/contiguous acreage/largest owner/total owners/total parcels. "Ownership unresolved"
// is only a valid conclusion after this workflow was actually run, not after one failed
// park-level search.
//
// SUBSTATION/POWER WORKFLOW (before marking power infrastructure unavailable): confirm likely
// serving utility -> search named substations in the city/corridor -> search planning/zoning
// records for new substations, expansions, transmission projects, easements -> search utility
// capital-project pages, tariff filings, RTO/ISO documents, state commission filings, legal
// notices/ordinances, comprehensive plans, economic-development pages. For each substation found,
// collect name/utility/address/approval date/source/approximate distance/project type
// (distribution vs. transmission vs. unknown) -- never infer voltage from the word "substation"
// alone, and never infer MW headroom merely because a substation exists nearby.
//
// PUBLICLY CONFIRMABLE (push research further before calling these unknown): parcel ownership,
// parcel IDs, mailing address, legal description, approximate acreage, zoning, floodplain,
// service-territory evidence, named substations + addresses, utility ownership, transmission
// projects, planned substations, utility tariffs, large-load rate structures, public
// infrastructure projects, gas pipeline operator/proximity, fiber carrier presence, municipal
// water/wastewater providers.
//
// OFTEN GENUINELY NOT PUBLIC (fine to land on Requires Direct Confirmation for these): actual
// available substation headroom, exact MW available to the subject parcel, a binding
// energization date, final interconnection cost, firm gas deliverability, fiber last-mile
// engineering availability, guaranteed water capacity, landowner willingness to sell. Do not mix
// these two categories -- the first group deserves real research effort, the second doesn't need
// to be re-attempted every pass.
//
// STATUS VOCABULARY for this standard: VERIFIED / SUPPORTED / PARTIALLY RESOLVED / ESTIMATED /
// UNKNOWN AFTER PUBLIC-RECORD SEARCH / REQUIRES DIRECT CONFIRMATION -- "unknown after public-
// record search" is deliberately distinct from a bare "unknown": it asserts the escalation
// hierarchy was actually run, not skipped.
// ============================================================

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

// Buyer-intelligence brief (2026-10-04): regroups the prior Energy/Timeline/Risk/People framing
// into the 5 categories a professional data-center buyer actually asks about, per direct
// developer/site-buyer feedback. Timeline's content folds into Power (Time to Power already sat
// right next to Power/Energy in the highlight row); Risk splits into Land and Entitlement; People
// becomes its own non-category section (SITE CONTROL, rendered separately in the panel, same as
// before). Nothing here changes POTENTIAL_SITE_FACTOR_WEIGHT or sumPotentialScore -- this is
// still a presentation-layer regroup of the same 8 scored factors, not a rescoring.
export type IntelligenceCategory = "power" | "land" | "btm_energy" | "connectivity_water" | "entitlement";

export const INTELLIGENCE_CATEGORY_LABEL: Record<IntelligenceCategory, string> = {
  power: "Power",
  land: "Land",
  btm_energy: "BTM Energy",
  connectivity_water: "Connectivity + Water",
  entitlement: "Entitlement",
};

// Which of the 8 underlying scored factors each category's "expand for details" view shows.
// btm_energy has no scored factor of its own (behind-the-meter gas was always evidence *within*
// power_grid's checklist, never its own weighted factor) -- it's driven entirely by the new
// gas_pipeline_*/btm_potential_status columns instead, same "empty array, column-driven" pattern
// Timeline/People used before this regroup.
export const POTENTIAL_SITE_CATEGORY_FACTORS: Record<IntelligenceCategory, PotentialSiteFactorKey[]> = {
  power: ["power_grid"],
  land: ["land_expansion", "physical_environmental_risk", "transportation_workforce"],
  btm_energy: [],
  connectivity_water: ["fiber_connectivity", "water_cooling"],
  entitlement: ["development_entitlement", "government_incentives"],
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
// Collapsed from the original 5-stage set (discovery/qualified/feasibility/
// controlled/de_risked) to this 4-stage set on 2026-10-05 per Jared's Data
// Center Potential master spec (docs/POTENTIAL_DATA_CENTER_RESEARCH_SPEC.md
// section 27/A19) -- "qualified" moves from position 2 to position 3 in the
// real progression (it's now "most major PUBLIC diligence supports
// advancement," downstream of the new "screened" stage, not upstream of
// feasibility conversations). No live row ever used anything but the
// null/discovery default, so this was a safe rename+reorder -- see migration
// 20261005000000_readiness_stage_four_stage_collapse.sql for the DB
// check-constraint update.
export type ReadinessStage = "discovery" | "screened" | "qualified" | "advanced_diligence";

export const READINESS_STAGE_LABEL: Record<ReadinessStage, string> = {
  discovery: "Discovery",
  screened: "Screened",
  qualified: "Qualified",
  advanced_diligence: "Advanced Diligence",
};

export const READINESS_STAGE_DESCRIPTION: Record<ReadinessStage, string> = {
  discovery: "Groundbreakable has identified a credible convergence of infrastructure, land, location, or market signals.",
  screened: "Core public-record diligence has been completed.",
  qualified: "Most major public diligence supports advancement.",
  advanced_diligence: "Direct utility, owner, or engineering diligence is underway.",
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

// ============================================================
// Buyer intelligence (Jared's 2026-10-04 brief, direct feedback from a data center developer/
// site buyer) -- granular Power/Land/BTM-Energy/Site-Control facts, a Data Confidence concept
// distinct from Potential Score, and multi-owner Site Control. See migration
// 20261004000000_potential_data_center_buyer_intelligence.sql for the schema side.
// ============================================================

// Mirrors lib/types.ts's OwnerInfo (this file stays import-free, same convention as every other
// mirrored type above). Replaces the old single `people.owner` object for
// 'prospective_data_center_site' rows going forward -- a site can have multiple owners, each
// controlling a different slice of acreage/parcels. Every field optional, public-record-only.
export type OwnerInfo = {
  name?: string;
  entity?: string;
  controlled_acreage?: number;
  parcel_count?: number;
  mailing_address?: string;
  registered_agent?: string;
  public_contact?: { phone?: string; email?: string; website?: string };
  ownership_complexity?: string;
  last_verified?: string;
  source?: string;
  notes?: string;
};

// Site Control reads `owners` (new, array) when present, falling back to the legacy single
// `people.owner` object (wrapped as a 1-element array) for rows that predate this column --
// never silently dropping a researcher's existing work.
export function ownersOrLegacyOwner(catalyst: {
  owners: OwnerInfo[] | null;
  people: { owner?: OwnerInfo } | null;
}): OwnerInfo[] {
  if (catalyst.owners && catalyst.owners.length > 0) return catalyst.owners;
  if (catalyst.people?.owner) return [catalyst.people.owner];
  return [];
}

// Site-level ownership rollup ("Owners: 2", "Ownership Complexity: Low") for the LAND section --
// a plain count/sum over `owners`, never re-deriving complexity from scratch when a researcher
// already assigned one per owner.
export function siteOwnershipSummary(catalyst: { owners: OwnerInfo[] | null; people: { owner?: OwnerInfo } | null }): {
  ownerCount: number;
  totalParcels: number | null;
  complexityLabel: string;
} {
  const owners = ownersOrLegacyOwner(catalyst);
  if (owners.length === 0) return { ownerCount: 0, totalParcels: null, complexityLabel: "Research Pending" };

  const parcelCounts = owners.map((o) => o.parcel_count).filter((n): n is number => n != null);
  const totalParcels = parcelCounts.length > 0 ? parcelCounts.reduce((a, b) => a + b, 0) : null;
  const complexityLabel = owners.length === 1 ? "Low" : owners.length <= 3 ? "Moderate" : "High";
  return { ownerCount: owners.length, totalParcels, complexityLabel };
}

// DATA CONFIDENCE (Jared's brief): "how much of the important underlying information has
// actually been verified" -- a DIFFERENT axis from potential_score (how suitable the site
// appears). Unknown information reduces Data Confidence, never the Potential Score itself.
// Purely derived, never stored -- recomputed on every render from whichever of the high-value
// buyer-facing facts are actually populated. Weighted toward Power (the buyer brief's
// highest-priority question) without pretending to replicate the full 8-factor rubric -- this is
// a coverage/verification measure, not a second suitability score.
const DATA_CONFIDENCE_CHECKS: {
  weight: number;
  isKnown: (c: {
    available_capacity_status: PotentialEvidenceStatus | null;
    utility_timeline: UtilityTimeline | null;
    contiguous_acreage: number | null;
    total_acreage: number | null;
    owners: OwnerInfo[] | null;
    people: { owner?: OwnerInfo } | null;
    gas_pipeline_distance_miles: number | null;
    fiber_notes: string | null;
  }) => boolean;
}[] = [
  { weight: 25, isKnown: (c) => c.available_capacity_status != null && c.available_capacity_status !== "unknown" },
  { weight: 20, isKnown: (c) => c.utility_timeline != null && c.utility_timeline !== "unknown" },
  { weight: 20, isKnown: (c) => c.contiguous_acreage != null || c.total_acreage != null },
  { weight: 15, isKnown: (c) => ownersOrLegacyOwner(c).length > 0 },
  { weight: 10, isKnown: (c) => c.gas_pipeline_distance_miles != null },
  { weight: 10, isKnown: (c) => Boolean(c.fiber_notes) },
];

// Presentation update (Jared, 2026-10-04): developer-facing UI shows current conclusions only,
// never research-process commentary -- the full pass-by-pass history stays in the migration
// files' git history, not in the live panel. See migration
// 20261004100000_potential_site_presentation_fields.sql for ownership_coverage's schema.
export type OwnershipCoverage = "full" | "partial" | "research_pending";

export const OWNERSHIP_COVERAGE_LABEL: Record<OwnershipCoverage, string> = {
  full: "Full",
  partial: "Partial",
  research_pending: "Research Pending",
};

// "Data Center Restrictions" (ENTITLEMENT section) -- a clean one-line derivation from the
// existing community_friction categorical judgment, never from the verbose *_notes prose (which
// stays internal). low/unknown read as "None Identified" (the honest default -- absence of found
// opposition, not a guarantee none exists); moderate/high read as a short flag, not an essay.
export function dataCenterRestrictionsLabel(communityFriction: CommunityFriction | null): string {
  if (communityFriction === "moderate") return "Local Opposition Documented";
  if (communityFriction === "high") return "Significant Opposition Documented";
  return "None Identified";
}

export function computeDataConfidence(catalyst: {
  available_capacity_status: PotentialEvidenceStatus | null;
  utility_timeline: UtilityTimeline | null;
  contiguous_acreage: number | null;
  total_acreage: number | null;
  owners: OwnerInfo[] | null;
  people: { owner?: OwnerInfo } | null;
  gas_pipeline_distance_miles: number | null;
  fiber_notes: string | null;
}): number {
  return Math.round(DATA_CONFIDENCE_CHECKS.reduce((sum, check) => sum + (check.isKnown(catalyst) ? check.weight : 0), 0));
}
