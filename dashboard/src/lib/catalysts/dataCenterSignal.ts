// Potential-data-center signal correlation (Jared's spec, 2026-09-30;
// power-priority clarification, 2026-09-30). Core principle: a single
// signal should never be enough -- and specifically, power alone, however
// large the MW figure, is never sufficient on its own ("Do not classify a
// project as a likely data center solely because of power. Use
// combinations."). This function only ever tiers *combinations* of
// independent evidence -- never claims a data center is confirmed, only
// that a signal pattern is "consistent with" one.
//
// Power is Priority #1 ("Detect Large Power Demand Before the Project Is
// Named") -- when a quantified MW figure is available, it drives the tier
// via explicit thresholds; when it isn't (most cases -- a precise public MW
// figure is rare), the function falls back to counting independent
// evidence categories, same as before this clarification.

export type DataCenterSignalCategory =
  | "power"
  | "land_assembly"
  | "vague_terminology"
  | "government_incentives"
  | "fiber"
  | "water"
  | "natural_gas"
  | "rezoning"
  | "engineering_consultant"
  | "infrastructure_anomaly"
  | "known_developer_entity"
  | "transportation_access";

export const DATA_CENTER_SIGNAL_LABEL: Record<DataCenterSignalCategory, string> = {
  power: "Power / electrical (new substation, transmission upgrade, large-load request)",
  land_assembly: "Land assembly (large contiguous acreage, adjacent-parcel purchases)",
  vague_terminology: "Vague project terminology (\"technology campus\", \"mission critical\", code-named project)",
  government_incentives: "Government incentives (tax abatement, PILOT, confidential prospect)",
  fiber: "Fiber / telecom (new long-haul routes, multiple carriers, dark fiber)",
  water: "Water / sewer capacity (large service request, main extension to undeveloped land, treatment/pump-station expansion)",
  natural_gas: "Natural gas / on-site generation (pipeline capacity, turbines, microgrid)",
  rezoning: "Rezoning / entitlement (ag-to-industrial, unidentified end user)",
  engineering_consultant: "Engineering / consultant activity (surveying, geotechnical, transmission studies)",
  infrastructure_anomaly: "Infrastructure anomaly (investment disproportionate to known local demand)",
  known_developer_entity: "Known data-center developer / entity connection (LLC tracing, registered agent)",
  // Added for the "Possible" existing-infrastructure-capacity criteria
  // (Jared, 2026-10-02): reasonable access to major roads/highways and
  // construction infrastructure -- a site-readiness factor, not itself
  // evidence of an active project.
  transportation_access: "Transportation / access (major road or highway access, new interchange, rail spur, construction-ready site access)",
};

// Power-signal investigation thresholds (not proof of anything on their
// own -- thresholds for how hard to investigate what's explaining the load).
export const POWER_LOAD_THRESHOLDS_MW = {
  investigate: 20,
  strongIndustrial: 50,
  veryStrongDataCenter: 100,
  extremelyHighPriority: 300,
} as const;

const HIGHEST_WEIGHT: DataCenterSignalCategory[] = ["power", "known_developer_entity"];
const HIGH_WEIGHT: DataCenterSignalCategory[] = ["land_assembly", "fiber", "government_incentives", "vague_terminology", "infrastructure_anomaly"];

export type DataCenterSignalConfidence = "low" | "medium" | "high" | "very_high";

// Category-combination fallback, used whenever no MW figure is on file --
// unchanged from the original spec's stated logic.
function confidenceFromCategories(unique: DataCenterSignalCategory[]): DataCenterSignalConfidence | null {
  if (unique.length < 2) return null;

  const hasPower = unique.includes("power");
  const hasLand = unique.includes("land_assembly");
  const hasFiber = unique.includes("fiber");
  const hasIncentiveOrEntity = unique.includes("government_incentives") || unique.includes("known_developer_entity");
  const hasStrong = unique.some((c) => HIGHEST_WEIGHT.includes(c) || HIGH_WEIGHT.includes(c));

  if (hasPower && hasLand && hasFiber && hasIncentiveOrEntity) return "very_high";
  if (unique.length >= 4 && hasPower && (hasLand || unique.includes("infrastructure_anomaly") || unique.includes("government_incentives"))) {
    return "high";
  }
  if (unique.length >= 3 && hasStrong) return "medium";
  return "low";
}

// Jared's exact tiering logic:
//   Very High: power + land + fiber + incentives/entitlement + developer/
//              entity evidence all converge around the same site.
//   High:      4+ independent categories including a major power signal,
//              plus land/infrastructure/government evidence.
//   Medium:    3+ independent categories, including at least one strong signal.
//   Low:       2 signals.
//   (0-1 signals: no confidence assignable -- never trigger off one signal.)
//
// MW-threshold refinement (2026-09-30): when a quantified power_load_mw is
// on file, it can elevate the tier faster than category-count alone would --
// but ALWAYS still requires at least one corroborating category beyond
// `power` itself. Anchored to Jared's own worked examples:
//   Medium:    ~150 MW+ with a power detail (e.g. a named substation) plus
//              at least one other category.
//   High:      ~300 MW+ plus land assembly (or another strong category) and
//              a second corroborating category.
//   Very High: ~500 MW+ plus land assembly, fiber, and an incentive/entity
//              signal all present.
export function computeDataCenterSignalConfidence(
  categories: DataCenterSignalCategory[],
  powerLoadMw?: number | null
): DataCenterSignalConfidence | null {
  const unique = Array.from(new Set(categories));
  const hasPower = unique.includes("power");
  const otherCategories = unique.filter((c) => c !== "power");

  if (powerLoadMw != null && hasPower && otherCategories.length >= 1) {
    const hasLand = unique.includes("land_assembly");
    const hasFiber = unique.includes("fiber");
    const hasIncentiveOrEntity = unique.includes("government_incentives") || unique.includes("known_developer_entity");

    if (powerLoadMw >= 500 && hasLand && hasFiber && hasIncentiveOrEntity) return "very_high";
    if (powerLoadMw >= POWER_LOAD_THRESHOLDS_MW.extremelyHighPriority && otherCategories.length >= 2) return "high";
    if (powerLoadMw >= 150 && otherCategories.length >= 1) return "medium";
  }

  return confidenceFromCategories(unique);
}
