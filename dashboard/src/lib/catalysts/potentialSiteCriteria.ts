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

// Mirrors CatalystScoreComponent's shape (lib/catalysts/score.ts) for
// consistency, but this is a SEPARATE scoring system with its own rubric --
// never conflate potential_score with catalyst_score.
export type PotentialScoreComponent = {
  key: PotentialSiteFactorKey;
  points: number; // 0..weight, human-assigned per documented evidence
  evidence: string[]; // what was actually found, with real sources
  unknowns: string[]; // what still needs confirmation for this factor
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
