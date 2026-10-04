export type Market = {
  id: string;
  slug: string;
  name: string;
  state: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
};

export type Lead = {
  id: string;
  market_id: string;
  address: string;
  zip: string | null;
  owner_name: string;
  owner_mailing_city: string | null;
  owner_mailing_state: string | null;
  is_absentee: boolean;
  years_owned: number | null;
  years_owned_display: string | null;
  assessed_value: number | null;
};

// --- Development Intelligence ---

export type ProjectCategory =
  | "active_development"
  | "planning_entitlement"
  | "zoning"
  | "infrastructure"
  | "land_transaction"
  | "business_announcement";

export type ProjectStatus =
  | "proposed"
  | "planning_review"
  | "filed"
  | "under_review"
  | "approved"
  | "permitted"
  | "under_construction"
  | "completed"
  | "on_hold"
  | "cancelled";

export type SourceType =
  | "agency_document"
  | "agency_gis"
  | "press_release"
  | "news"
  | "public_record"
  | "other";

export type Confidence = "verified" | "reported" | "unconfirmed";

export type Source = {
  id: string;
  agency: string;
  title: string | null;
  source_type: SourceType;
  url: string;
  published_date: string | null;
};

export type Parcel = {
  id: string;
  market_id: string;
  parcel_number: string | null;
  address: string | null;
  acreage: number | null;
  boundary: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  source_id: string | null;
};

export type Project = {
  id: string;
  market_id: string;
  parcel_id: string | null;
  title: string;
  // Legacy -- nullable since Phase 7 Tier 3 (part 3). New rows leave these
  // unset; plan_category/project_type/stage are the real, direct fields
  // every write path sets going forward. Existing rows keep their values.
  category: ProjectCategory | null;
  subcategory: string | null;
  status: ProjectStatus | null;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  project_value: number | null;
  units: number | null;
  acreage: number | null;
  developer: string | null;
  contractor: string | null;
  investor: string | null;
  date_announced: string | null;
  date_updated: string;
  source_id: string;
  confidence: Confidence;
  last_verified_at: string;
  created_at: string;
  // Added in Phase 1 -- see ProjectStage below for why plan_category/stage
  // are coarser than category/status rather than a 1:1 rename.
  plan_category: PlanCategory | null;
  project_type: ProjectType | null;
  stage: ProjectStage | null;
};

// Joined shape returned by the development-map query (project + its source).
export type ProjectWithSource = Project & { source: Source | null };

export const PROJECT_CATEGORY_LABEL: Record<ProjectCategory, string> = {
  active_development: "Active Development",
  planning_entitlement: "Proposed / Planning / Entitlement",
  zoning: "Zoning & Rezoning",
  infrastructure: "Infrastructure / Public Investment",
  land_transaction: "Land / Property Transaction",
  business_announcement: "Business Announcement",
};

// Activity's marker color is driven by construction phase, not category --
// category is still distinguished by marker icon (see markerIcons.ts).
// ACTIVITY_COLOR (Planning's orange) stays exported as the app's general
// "Activity view" accent, used in chrome like the LayerSwitcher tab dot.
export const ACTIVITY_COLOR = "#f97316"; // orange

// A neutral tone for UI chrome that represents a category (not a specific
// project's phase) -- the filter bar and legend show category icons that
// apply across all three phases, so they use this rather than any one
// phase's color.
export const NEUTRAL_ICON_COLOR = "#e2e8f0";

export const PROJECT_CATEGORY_COLOR: Record<ProjectCategory, string> = {
  active_development: NEUTRAL_ICON_COLOR,
  planning_entitlement: NEUTRAL_ICON_COLOR,
  zoning: NEUTRAL_ICON_COLOR,
  infrastructure: NEUTRAL_ICON_COLOR,
  land_transaction: NEUTRAL_ICON_COLOR,
  business_announcement: NEUTRAL_ICON_COLOR,
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  proposed: "Proposed",
  planning_review: "Planning Review",
  filed: "Filed",
  under_review: "Under Review",
  approved: "Approved",
  permitted: "Permitted",
  under_construction: "Under Construction",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

// --- View colors ---
export const OPPORTUNITIES_COLOR = "#22c55e"; // green -- every Opportunity pin on the map uses this one color, regardless of strength.
// Purple -- Catalysts' "watch zone" area outline and marker (Jared,
// 2026-09-25), always visible regardless of which segment is active. Also
// used by the legacy DevelopmentMap.tsx.
export const CATALYSTS_COLOR = "#a855f7";
// Light-theme equivalent for Catalyst badges/callouts on white-background
// cards (BriefingSummary, PlansFeed, PlanDetailPanel) -- CATALYSTS_COLOR
// is tuned for dark map overlays and reads too pale on a white card.
export const CATALYST_LIGHT_ACCENT_COLOR = "#a855f7";

// --- Activity phases ---
// Activity's primary grouping axis: construction phase, derived from
// status (see src/lib/activityPhase.ts) rather than stored directly.
export type ActivityPhase = "planning" | "active" | "completed";

// Strict per-phase color + icon language: yellow/document = planning
// (pre-permit), orange/shovel = active (permit through completion), gray/
// building = completed. A glance at a pin's color tells you the phase
// without opening it -- see resolveProjectPhaseIcon in markerIcons.ts for
// the paired icon.
export const ACTIVITY_PHASE_COLOR: Record<ActivityPhase, string> = {
  planning: "#eab308",
  active: "#f97316",
  completed: "#94a3b8",
};

export const ACTIVITY_PHASE_LABEL: Record<ActivityPhase, string> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
};

// --- Opportunities: Properties ---

export type OpportunityType =
  | "pre_foreclosure"
  | "tax_lien"
  | "tax_delinquent"
  | "absentee_owner"
  | "high_equity_owner"
  | "vacant"
  | "code_violation"
  | "listing"
  | "price_drop"
  | "underutilized_land"
  | "zoning_upside";

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  pre_foreclosure: "Pre-Foreclosure",
  tax_lien: "Tax Lien",
  tax_delinquent: "Tax Delinquent",
  absentee_owner: "Absentee Owner",
  high_equity_owner: "Long-Term / High-Equity Owner",
  vacant: "Vacant",
  code_violation: "Code Violation",
  listing: "Active Listing",
  price_drop: "Price Drop",
  underutilized_land: "Underutilized Land",
  zoning_upside: "Zoning Upside",
};

// Determines which signal's icon a multi-signal property shows on the map
// -- earliest entry wins. Ordered roughly by urgency/actionability: legal
// deadlines (foreclosure, tax) first, then owner/property condition
// signals, then market signals, then long-horizon land-use signals.
export const OPPORTUNITY_SIGNAL_PRIORITY: OpportunityType[] = [
  "pre_foreclosure",
  "tax_lien",
  "tax_delinquent",
  "code_violation",
  "vacant",
  "absentee_owner",
  "high_equity_owner",
  "price_drop",
  "listing",
  "zoning_upside",
  "underutilized_land",
];

export function primarySignal(signals: OpportunityType[]): OpportunityType {
  return OPPORTUNITY_SIGNAL_PRIORITY.find((type) => signals.includes(type)) ?? signals[0];
}

// A property with 2+ independent signals firing at once (e.g.
// pre-foreclosure + favorable zoning) is a materially stronger lead than
// any single signal alone -- the map gives these a distinct glow (see
// bulbMarkerSvgMarkup) rather than requiring the investor to notice the
// overlap themselves.
export function isStackedOpportunity(signals: OpportunityType[]): boolean {
  return signals.length >= 2;
}

// White, matching CATALYSTS_COLOR's premium "watch zone" tone -- a stacked
// opportunity is, in the same spirit, a signal worth calling special
// attention to.
export const STACKED_OPPORTUNITY_GLOW_COLOR = "#ffffff";

export type Opportunity = {
  id: string;
  market_id: string;
  lead_id: string | null;
  address: string;
  latitude: number;
  longitude: number;
  // Not a real column (Phase 7, Tier 3 dropped opportunities.signals[]
  // once the `signals` table fully absorbed it) -- every raw fetch of
  // `opportunities` must be passed through attachLiveOpportunitySignals()
  // (src/lib/queries/planIntelligence.ts) before this field is trustworthy.
  signals: OpportunityType[];
  listing_status: string | null;
  owner_name: string | null;
  is_absentee: boolean | null;
  years_owned: number | null;
  estimated_equity: number | null;
  assessed_value: number | null;
  distress_indicators: string[] | null;
  opportunity_score: number | null;
  why_flagged: string;
  date_identified: string | null;
  // Investment potential (shown as asking vs. resale gain when both present).
  asking_price: number | null;
  estimated_resale_value: number | null;
  // Price-drop signal: original_list_price vs. asking_price (read as "current price").
  original_list_price: number | null;
  // Underutilized-land signal.
  lot_size_acres: number | null;
  // Code-violation signal.
  code_violation_count: number | null;
  code_violation_summary: string | null;
  // Vacant signal.
  vacant_since: string | null;
  // Buildability enrichment (shown on the property's own detail panel).
  zoning_district: string | null;
  permitted_uses: string | null;
  rezoning_potential: string | null;
  buildability_notes: string | null;
  source_id: string;
  confidence: Confidence;
  last_verified_at: string;
  created_at: string;
};

export type OpportunityWithSource = Opportunity & { source: Source | null };

// --- Catalysts ---

export type CatalystType =
  | "major_employer"
  | "infrastructure_project"
  | "institutional"
  | "public_facility"
  | "mixed_use_anchor"
  | "data_center"
  // Deliberately distinct from 'data_center' -- an unconfirmed investigation
  // in progress (see lib/catalysts/dataCenterSignal.ts), never conflated
  // with a confirmed project. See CATALYST_SIGNAL_BIBLE.md. UI label calls
  // this "Possible" (Jared's 2026-10-02 3-tier naming) -- the DB value
  // itself is unchanged for backward compatibility; don't be misled by the
  // word "potential" in the column value, it means an ACTIVE signal, not
  // the separate 'prospective_data_center_site' type below.
  | "potential_data_center"
  // Strong underlying fundamentals (power, land, fiber, incentives,
  // entitlement feasibility) with NO known data-center activity -- the
  // genuinely new third tier, UI-labeled "Potential". See
  // lib/catalysts/potentialSiteCriteria.ts for the full scoring rubric.
  | "prospective_data_center_site"
  | "housing_development"
  // Housing's own Potential tier (Jared, 2026-10-03) -- a promising future
  // housing-development opportunity (demand/entitlement/infrastructure/
  // site/economics signals) with NO specific project yet, same
  // relationship to 'housing_development' that 'prospective_data_center_site'
  // has to 'data_center'. See lib/catalysts/housingStage.ts and
  // lib/catalysts/housingPotentialCriteria.ts.
  | "prospective_housing_site"
  | "industrial_logistics"
  | "incentive_district"
  | "annexation_rezoning"
  | "other";

export const CATALYST_TYPE_LABEL: Record<CatalystType, string> = {
  major_employer: "Major Employer",
  infrastructure_project: "Infrastructure Project",
  institutional: "Institutional",
  public_facility: "Public Facility",
  mixed_use_anchor: "Mixed-Use Anchor",
  data_center: "Data Center (confirmed / Planned)",
  potential_data_center: "Possible Data Center (unconfirmed signal)",
  prospective_data_center_site: "Potential Data Center Site (strong fundamentals, no known activity)",
  housing_development: "Housing Development (Planned)",
  prospective_housing_site: "Potential Housing Site (promising opportunity, no project yet)",
  industrial_logistics: "Industrial / Logistics",
  incentive_district: "Incentive / TIF District",
  annexation_rezoning: "Annexation / Rezoning",
  other: "Other",
};

// Granular pre-permit pipeline (Jared's spec, 2026-09-30) -- replaces the
// earlier 6-value status list. The whole point of Catalysts is detecting
// something before permits/announcements, so the vocabulary needs stages
// that exist well before "under_construction" ever applies.
export type CatalystStatus =
  | "rumored"
  | "under_study"
  | "site_selection"
  | "funding_incentives"
  | "land_acquired"
  | "planning_entitlement"
  // Infrastructure brief (2026-10-03) -- the one gap in this pipeline when
  // grouped into Infrastructure's 7-stage lifecycle (see
  // lib/catalysts/infrastructureCriteria.ts infrastructureStatusGroup):
  // engineering, environmental review, surveying, or other detailed
  // preconstruction work underway. Usable by any catalyst type, not just
  // infrastructure_project.
  | "design"
  | "approved"
  | "construction_pending"
  | "under_construction"
  | "operating"
  | "completed"
  | "cancelled";

export const CATALYST_STATUS_LABEL: Record<CatalystStatus, string> = {
  rumored: "Rumored / Early Signal",
  under_study: "Under Study",
  site_selection: "Site Selection",
  funding_incentives: "Funding / Incentives",
  land_acquired: "Land Acquired",
  planning_entitlement: "Planning / Entitlement",
  design: "Design",
  approved: "Approved",
  construction_pending: "Construction Pending",
  under_construction: "Under Construction",
  operating: "Operating",
  completed: "Completed",
  cancelled: "Cancelled",
};

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

export type DataCenterSignalConfidence = "low" | "medium" | "high" | "very_high";

// Mirrors lib/catalysts/potentialSiteCriteria.ts (this file stays
// import-free, same convention as DataCenterSignalCategory/Confidence
// above mirroring dataCenterSignal.ts rather than importing it).
export type PotentialSiteFactorKey =
  | "power_grid"
  | "land_expansion"
  | "fiber_connectivity"
  | "government_incentives"
  | "development_entitlement"
  | "physical_environmental_risk"
  | "water_cooling"
  | "transportation_workforce";

// Evidence confidence (Jared, 2026-10-03; widened 2026-10-03 for the
// Energy/Timeline/Risk/People brief) -- a DIFFERENT axis from a pillar's
// strength label (strong/favorable/etc, "how good is this factor"): this
// is "how sure are we," independent of how strong or weak the underlying
// finding is. Optional on each component -- rows that predate this field
// simply render without a badge. See
// lib/catalysts/potentialSiteCriteria.ts for the full rationale on each
// value.
// "requires_verification" added 2026-10-04 (buyer-intelligence brief) -- the specific "we know
// this is a real open question, not just unresearched" case for high-value Power facts
// (available MW, time-to-power), distinct from the plainer "unknown". "supported" added same day
// (research-quality brief) -- "multiple credible signals support the conclusion, but it is not
// formally confirmed" -- a DIFFERENT shade than "reported" (one named party's public claim) or
// "indicated" (evidence points this way); kept alongside both rather than replacing them, same
// backward-compatible-widening convention this type has followed since "reported"/"estimated"
// were added next to the original "indicated".
export type PotentialEvidenceStatus = "verified" | "supported" | "reported" | "estimated" | "indicated" | "unknown" | "requires_verification";

// Final Developer Assessment (2026-10-04 research-quality brief) -- Groundbreakable's own
// bottom-line recommendation on whether a developer should pursue a Potential site right now.
export type DeveloperAssessment = "strong_pursuit" | "pursue" | "watch" | "weak" | "disqualified";

// SITE CONTROL (2026-10-04 buyer-intelligence brief) -- a single owner's public-record profile.
// Replaces the old single `people.owner` object (PotentialSitePeople below) for
// 'prospective_data_center_site' rows going forward -- a site can have multiple owners, each
// controlling a different slice of acreage/parcels, which the old singular shape couldn't
// express. Stored in its own `owners` column (an array), not nested in `people`. Every field
// optional/public-record-only -- never scrape or expose private personal information.
export type OwnerInfo = {
  name?: string;
  entity?: string;
  controlled_acreage?: number;
  parcel_count?: number;
  mailing_address?: string;
  registered_agent?: string;
  public_contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  ownership_complexity?: string;
  last_verified?: string;
  source?: string;
  notes?: string;
};

// PEOPLE (Jared's 2026-10-03 brief) -- who actually controls the decisions
// necessary for a site or project to move forward. Mirrors
// lib/catalysts/potentialSiteCriteria.ts's PotentialSitePeople family;
// every field optional, no DB-level shape enforcement (the `people` column
// is plain jsonb). Originally data-center-specific; now shared by
// prospective_housing_site and (2026-10-03 Infrastructure brief)
// infrastructure_project too -- "owner" reads as "project owner/sponsor"
// for infrastructure, "government" as the municipality/county/planning
// department/public works agency, "development" as engineering firm/
// developer/contractor.
export type PotentialSitePeople = {
  owner?: {
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
  utility?: {
    utility?: string;
    economic_development_contact?: string;
    large_load_contact?: string;
    engineer_contact?: string;
    notes?: string;
  };
  government?: {
    municipality?: string;
    county?: string;
    planning_department?: string;
    economic_development_org?: string;
    decision_making_body?: string;
    notes?: string;
  };
  development?: {
    developer?: string;
    broker?: string;
    site_selection_contact?: string;
    epc?: string;
    engineering_firm?: string;
    energy_developer?: string;
    gas_provider?: string;
    // Infrastructure brief (2026-10-03) -- a genuine infrastructure-world
    // role with no existing slot; optional, so this is a pure TS widening
    // with no schema change (jsonb has no fixed shape).
    contractor?: string;
    notes?: string;
  };
};

// READINESS (Jared's brief) -- a different axis from potential_score: how
// much of the site-control/utility/entitlement/environmental picture has
// actually been validated through real work, as opposed to how strong the
// fundamentals look on paper. Never auto-advanced; see
// lib/catalysts/potentialSiteCriteria.ts's computeReadinessStage for the
// null-defaults-to-"discovery" convention.
export type ReadinessStage = "discovery" | "qualified" | "feasibility" | "controlled" | "de_risked";

export type PotentialScoreComponent = {
  key: PotentialSiteFactorKey;
  points: number;
  evidence: string[];
  unknowns: string[];
  status?: PotentialEvidenceStatus;
};

// Potential Area (a broader zone where conditions are aligning) vs.
// Potential Site (a specific parcel/assemblage) -- see migration
// 20261003000000_extend_potential_site_card_fields.sql.
export type PotentialSiteType = "area" | "site";

// Mirrors lib/catalysts/housingPotentialCriteria.ts -- see migration
// 20261003180000_housing_potential_subcategory.sql. Meaningful only for
// catalyst_type 'prospective_housing_site'.
export type HousingType = "large_single_family" | "multifamily" | "build_to_rent" | "townhome_attached" | "infill_redevelopment" | "mixed_residential";
export type EntitlementStatus = "by_right" | "entitlement_required" | "high_entitlement_risk" | "unknown";

// Mirrors lib/catalysts/infrastructureCriteria.ts -- see migration
// 20261003190000_infrastructure_project_intelligence.sql. Meaningful only
// for catalyst_type 'infrastructure_project'.
export type InfrastructureType = "sewer" | "water" | "power" | "natural_gas" | "roads" | "fiber" | "transit" | "airport" | "other";
export type DevelopmentImpactType = "housing" | "data_center" | "industrial" | "commercial" | "mixed_use" | "logistics" | "other";
export type DevelopmentImpactLevel = "high" | "moderate" | "low" | "unknown";

// Mirrors lib/catalysts/potentialSiteCriteria.ts's Approval/Infrastructure
// pillar vocabulary (Jared's 2026-10-02 same-day clarification) -- see that
// file for the full evaluation guidance behind each label.
export type PillarStrength = "strong" | "moderate" | "weak" | "unknown";
export type EntitlementVelocity = "favorable" | "moderate" | "difficult" | "unknown";
export type CityReceptiveness = "high" | "moderate" | "low" | "unknown";
export type CommunityFriction = "low" | "moderate" | "high" | "unknown";
export type ApprovalPillarLabel = "favorable" | "moderate" | "difficult" | "unknown";
export type UtilityTimeline = "favorable" | "moderate" | "long" | "unknown";

export type Catalyst = {
  id: string;
  market_id: string;
  title: string;
  catalyst_type: CatalystType;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  influence_radius_meters: number;
  // Admin-traced exact watch-zone outline, when available -- falls back to
  // a circle derived from influence_radius_meters (circlePolygon in
  // src/lib/geo.ts) when null.
  boundary: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  status: CatalystStatus;
  estimated_value: number | null;
  // Non-dollar scale, e.g. "1,200 housing units" -- estimated_value stays
  // the $-only figure.
  estimated_scale_note: string | null;
  expected_timeline: string | null;
  why_it_matters: string | null;
  development_impact: string | null;
  related_context: string[];
  is_spotlight: boolean;
  date_announced: string | null;
  source_id: string;
  additional_source_ids: string[];
  // Nullable -- a catalyst may be elevated from an existing Plan (either
  // kind) or originate independently (e.g. an employer announcement with
  // no formal case filed yet). See lib/catalystRules.ts.
  related_shift_id: string | null;
  related_entitlement_case_id: string | null;
  confidence: Confidence;
  last_verified_at: string;
  created_at: string;
  // Explainable score (lib/catalysts/score.ts) -- a human-curated final
  // call, computed at admin-entry time as a starting suggestion, same
  // convention as is_spotlight. Null until an admin has scored it.
  catalyst_score: number | null;
  reason_for_catalyst_classification: string | null;
  // Potential-data-center investigation fields -- meaningful only when
  // catalyst_type === 'potential_data_center'; empty/null otherwise.
  signal_categories: DataCenterSignalCategory[];
  signal_confidence: DataCenterSignalConfidence | null;
  // Quantified power/load figure (MW) from a utility/RTO/regulator source,
  // when publicly stated -- drives the MW-threshold confidence tiers.
  power_load_mw: number | null;
  // Potential Data Center Site fields (lib/catalysts/potentialSiteCriteria.ts)
  // -- meaningful only when catalyst_type === 'prospective_data_center_site';
  // empty/null otherwise. A separate scoring system from catalyst_score.
  potential_score: number | null;
  potential_score_components: PotentialScoreComponent[] | null;
  opportunity_area: string | null;
  power_notes: string | null;
  fiber_notes: string | null;
  land_notes: string | null;
  incentives_notes: string | null;
  development_environment_notes: string | null;
  risk_notes: string | null;
  unknowns_to_verify: string[];
  why_still_potential: string | null;
  // Approval/Infrastructure pillar fields (2026-10-02 clarification) --
  // meaningful only when catalyst_type === 'prospective_data_center_site'.
  power_pillar_label: PillarStrength | null;
  site_pillar_label: PillarStrength | null;
  approval_pillar_label: ApprovalPillarLabel | null;
  entitlement_velocity: EntitlementVelocity | null;
  entitlement_velocity_notes: string | null;
  city_receptiveness: CityReceptiveness | null;
  city_receptiveness_notes: string | null;
  community_friction: CommunityFriction | null;
  community_friction_notes: string | null;
  utility_timeline: UtilityTimeline | null;
  utility_timeline_notes: string | null;
  // 2026-10-03 enhancement -- water_cooling was already a scored factor but
  // had no notes column; natural_gas/behind-the-meter was never its own
  // factor at all. Originally data-center-specific; as of the Housing
  // Potential brief (2026-10-03) also reused directly by
  // 'prospective_housing_site' for its Water and other-infrastructure
  // (electric/gas/fiber/stormwater) notes rather than adding near-duplicate
  // columns -- meaningful for any Potential-tier catalyst type, null
  // otherwise.
  water_notes: string | null;
  natural_gas_notes: string | null;
  // Nullable, no default -- existing rows were backfilled to 'site' only
  // where they're already parcel-specific; a future row created without
  // this in mind simply has no type badge rather than a wrong guess.
  // Meaningful only for 'prospective_data_center_site' (Housing's parallel
  // concept, housing_type below, has its own simpler enum).
  potential_site_type: PotentialSiteType | null;
  // Energy/Timeline/Risk/People brief (2026-10-03) -- see migration
  // 20261003160000_potential_site_energy_timeline_risk_people.sql. Already
  // generic/catalyst-agnostic concepts -- reused as-is by the Housing
  // Potential brief (2026-10-03, see housing fields below) for
  // 'prospective_housing_site' rows too, no new columns needed for these.
  // Meaningful for any Potential-tier catalyst type; null/empty on every
  // existing row until a researcher actually populates them (never
  // backfilled with guesses).
  people: PotentialSitePeople | null;
  readiness_stage: ReadinessStage | null;
  readiness_notes: string | null;
  next_steps: string[];
  why_this_site: string | null;
  // Housing Potential brief (2026-10-03) -- see migration
  // 20261003180000_housing_potential_subcategory.sql. Meaningful only for
  // 'prospective_housing_site'; null on every 'housing_development' (Planned)
  // row, which keeps its pre-existing meaning unchanged.
  housing_type: HousingType | null;
  demand_notes: string | null;
  entitlement_status: EntitlementStatus | null;
  entitlement_notes: string | null;
  sewer_notes: string | null;
  road_notes: string | null;
  site_notes: string | null;
  // Always prose, never a bare numeric range -- must carry its own stated
  // assumptions and be clearly preliminary (e.g. "Estimated 180-230
  // single-family lots based on ~110 usable acres...").
  estimated_yield: string | null;
  // Labeled "Preliminary Economics" in the UI -- land basis per lot/unit,
  // nearby comps/rents. Not a pro forma or ROI figure. The headline $ ask
  // and scale reuse the generic estimated_value/estimated_scale_note
  // columns above rather than new ones.
  economics_notes: string | null;
  // "What changed to make this land developable" -- e.g. a funded sewer
  // extension, an annexation, a comp-plan amendment. The one concept with
  // no Data-Center-era equivalent.
  opportunity_catalyst: string | null;
  // Infrastructure brief (2026-10-03) -- see migration
  // 20261003190000_infrastructure_project_intelligence.sql. Meaningful
  // only for 'infrastructure_project'; null/empty on every other type.
  infrastructure_type: InfrastructureType | null;
  infrastructure_subtype: string | null;
  // Distinct from the pre-existing `development_impact` free-text column
  // above (used generically by every catalyst type's admin form) -- this
  // is the structured, multiple-allowed classification of what KIND of
  // development this infrastructure project could unlock.
  development_impact_types: DevelopmentImpactType[];
  development_impact_level: DevelopmentImpactLevel | null;
  // Human-written Impact Area narrative; confidence (VERIFIED/ESTIMATED/
  // INFERRED) conveyed in-sentence, same convention as every other notes
  // field this session. The actual map geometry reuses `boundary`/
  // `influence_radius_meters` above, already rendered on the national map.
  impact_area_notes: string | null;
  // OPPORTUNITIES CREATED -- IDs of downstream Potential catalyst rows
  // this infrastructure project helped create, resolved live against
  // whatever catalyst rows are already loaded (never denormalized).
  // Empty on every row until a future curated research pass links one --
  // Groundbreakable does not automatically generate or link Potential
  // sites.
  related_catalyst_ids: string[];
  opportunities_created_notes: string | null;
  // ============================================================
  // Buyer-intelligence brief (2026-10-04, see migration
  // 20261004000000_potential_data_center_buyer_intelligence.sql) -- granular,
  // quantified siblings of the existing prose notes columns above
  // (power_notes/land_notes/natural_gas_notes/fiber_notes/water_notes stay
  // as-is). Meaningful only for catalyst_type === 'prospective_data_center_site';
  // null on every other type. Never inferred from a related field (e.g.
  // transmission proximity never implies available_capacity_status) --
  // each is its own researched fact or stays null/"requires_verification".
  // ============================================================
  serving_utility: string | null;
  transmission_voltage_kv: number | null;
  transmission_distance_miles: number | null;
  substation_distance_miles: number | null;
  potential_load_mw_low: number | null;
  potential_load_mw_high: number | null;
  available_capacity_status: PotentialEvidenceStatus | null;
  interconnection_notes: string | null;
  total_acreage: number | null;
  available_acreage_status: string | null;
  contiguous_acreage: number | null;
  parcel_count: number | null;
  floodplain_status: string | null;
  floodplain_constrained: boolean | null;
  zoning_status: string | null;
  gas_pipeline_distance_miles: number | null;
  gas_pipeline_operator: string | null;
  gas_pipeline_diameter_in: string | null;
  btm_potential_status: string | null;
  air_permitting_notes: string | null;
  // SITE CONTROL -- replaces people.owner (singular) going forward; people.owner is still read
  // as a fallback for rows that predate this column (see ownersOrLegacyOwner() in
  // lib/catalysts/potentialSiteCriteria.ts).
  owners: OwnerInfo[] | null;
  primary_advantage: string | null;
  primary_risk: string | null;
  // Final Developer Assessment (2026-10-04 research-quality brief) -- a bottom-line go/no-go
  // recommendation, distinct from potential_score (how the site looks) and readiness_stage (how
  // much has been validated). See migration 20261004030000_potential_site_developer_assessment.sql.
  developer_assessment: DeveloperAssessment | null;
  developer_takeaway: string | null;
};

export type CatalystWithSource = Catalyst & { source: Source | null };

// Stage/signal history (docs/DATA_INTELLIGENCE_PIPELINE.md §11) -- gives a
// catalyst's "date first detected" (earliest row here, or the catalyst's
// own created_at if none) and "latest update" (most recent row) real
// history instead of a single overwritten status column.
export type CatalystEvent = {
  id: string;
  catalyst_id: string;
  event_type: "stage_change" | "signal_added" | "source_added" | "note";
  from_status: CatalystStatus | null;
  to_status: CatalystStatus | null;
  note: string | null;
  source_id: string | null;
  occurred_on: string;
  created_at: string;
};

// The live Plans/Opportunities dashboard's shape -- also resolves
// additional_source_ids into full Source rows (same "fetch sources
// separately, attach here" convention as
// getDevelopmentOpportunities/source_ids). Kept distinct from
// CatalystWithSource rather than widening it, since the admin page and the
// legacy /preview/topeka map layer only ever select `source:sources(*)`
// and never populate this.
export type CatalystWithSources = CatalystWithSource & { additionalSources: Source[] };

// --- Opportunity Zones ---
// Area-based favorable-zoning opportunities -- a second geometry type
// alongside the point-based `Opportunity` above. Same source-citation
// discipline, admin-traced boundary (like a Catalyst), not an imported GIS
// layer.
//
// No longer a real table (Phase 7, Tier 3 dropped opportunity_zones once
// zoning_land_use fully absorbed it) -- this is now purely the shape
// zoningLandUseAsOpportunityZone() (src/lib/queries/planIntelligence.ts)
// reshapes zoning_land_use rows into, so DevelopmentMap and
// OpportunityZoneDetailPanel didn't need to change field names.

export type OpportunityZone = {
  id: string;
  market_id: string;
  title: string;
  description: string | null;
  zoning_district: string | null;
  rezoning_notes: string | null;
  boundary: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  source_id: string;
  confidence: Confidence;
  last_verified_at: string;
  created_at: string;
};

export type OpportunityZoneWithSource = OpportunityZone & { source: Source | null };

// --- Upcoming Decisions ---
// Genuinely distinct from project_events (which logs what already
// happened) -- this is what's scheduled: planning commission meetings,
// rezoning votes, agendas.

export type DecisionType =
  | "planning_commission"
  | "rezoning_vote"
  | "city_council"
  | "zoning_board"
  | "public_hearing"
  | "other";

export const DECISION_TYPE_LABEL: Record<DecisionType, string> = {
  planning_commission: "Planning Commission",
  rezoning_vote: "Rezoning Vote",
  city_council: "City Council",
  zoning_board: "Zoning Board",
  public_hearing: "Public Hearing",
  other: "Other",
};

export type DecisionStatus = "scheduled" | "decided" | "postponed" | "cancelled";

export const DECISION_STATUS_LABEL: Record<DecisionStatus, string> = {
  scheduled: "Scheduled",
  decided: "Decided",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

export type UpcomingDecision = {
  id: string;
  market_id: string;
  project_id: string | null;
  title: string;
  decision_type: DecisionType;
  description: string | null;
  decision_date: string;
  status: DecisionStatus;
  outcome: string | null;
  source_id: string | null;
  created_at: string;
};

export type UpcomingDecisionWithSource = UpcomingDecision & { source: Source | null };

// --- Plans / Potential (Phase 2 data-access layer) ---
// New types for the columns/tables added in the Aug 17 2026 schema
// migration. Not wired into any page yet -- these exist so the new
// read layer (src/lib/queries/planIntelligence.ts) can be built and
// verified against real data before any component switches over to it.
// See the architecture review for the full rationale.

export type PlanCategory = "development" | "land_use" | "infrastructure" | "public_investment";

export const PLAN_CATEGORY_LABEL: Record<PlanCategory, string> = {
  development: "Development",
  land_use: "Land Use",
  infrastructure: "Infrastructure",
  public_investment: "Public Investment",
};

export type ProjectType =
  | "residential"
  | "multifamily"
  | "commercial"
  | "retail"
  | "industrial"
  | "mixed_use"
  | "public"
  | "infrastructure"
  | "other";

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  residential: "Residential",
  multifamily: "Multifamily",
  commercial: "Commercial",
  retail: "Retail",
  industrial: "Industrial",
  mixed_use: "Mixed Use",
  public: "Public",
  infrastructure: "Infrastructure",
  other: "Other",
};

// The simplified rollup stage (§4 of the architecture review) -- separate
// from the detailed ProjectStatus enum above, which project_events keeps
// as the fine-grained history. Includes on_hold/cancelled (added Phase 7,
// Tier 3) so stage can fully replace status as the "current state" field
// -- resolveActivityPhase excludes both from every phase view, same as
// it always excluded status on_hold/cancelled.
export type ProjectStage =
  | "proposed"
  | "review_planning"
  | "approved"
  | "permitting"
  | "construction"
  | "complete"
  | "on_hold"
  | "cancelled";

export const PROJECT_STAGE_LABEL: Record<ProjectStage, string> = {
  proposed: "Proposed",
  review_planning: "Review / Planning",
  approved: "Approved",
  permitting: "Permitting",
  construction: "Construction",
  complete: "Complete",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export type Company = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  created_at: string;
};

export type PartyRole = "developer" | "builder_gc" | "owner" | "architect_engineer" | "applicant" | "investor";

export const PARTY_ROLE_LABEL: Record<PartyRole, string> = {
  developer: "Developer",
  builder_gc: "Builder / GC",
  owner: "Owner",
  architect_engineer: "Architect / Engineer",
  applicant: "Applicant",
  investor: "Investor",
};

export type ProjectParty = {
  id: string;
  project_id: string;
  company_id: string;
  role: PartyRole;
  created_at: string;
};

export type ProjectPartyWithCompany = ProjectParty & { company: Company };

// Generalizes ProjectUpdate: any meaningful event, not just a status
// change. event_type is deliberately open vocabulary (same precedent as
// projects.subcategory) rather than a rigid enum.
export type ProjectEvent = {
  id: string;
  project_id: string;
  event_type: string;
  status: ProjectStatus | null;
  note: string | null;
  amount: number | null;
  funding_source: string | null;
  occurred_on: string;
  source_id: string | null;
  confidence: Confidence;
  source_quality: "primary_government" | "official_company" | "secondary" | null;
  verification_status: "automated" | "human_reviewed" | "verified";
  is_interpretation: boolean;
  interpretation_basis: string | null;
  created_at: string;
};

export type ProjectEventWithSource = ProjectEvent & { source: Source | null };

// Joined shape for a Timeline-style feed.
export type ProjectEventWithProject = ProjectEvent & {
  project: Pick<Project, "id" | "title" | "market_id" | "plan_category" | "project_type" | "stage">;
};

// Replaces opportunities.signals[] -- one row per detection instead of
// one array per property, so a signal disappearing can be recorded
// (resolved_date) instead of silently rewriting the array.
export type Signal = {
  id: string;
  market_id: string;
  parcel_id: string | null;
  opportunity_id: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  signal_type: OpportunityType;
  detected_date: string | null;
  resolved_date: string | null;
  source_id: string | null;
  confidence: Confidence;
  created_at: string;
};

export type SignalWithSource = Signal & { source: Source | null };

// Generalizes opportunity_zones with a layer_type discriminator --
// current zoning, future land use, and overlays are the same shape.
export type ZoningLandUseLayerType = "current_zoning" | "future_land_use" | "overlay";

export type ZoningLandUse = {
  id: string;
  market_id: string;
  layer_type: ZoningLandUseLayerType;
  title: string;
  description: string | null;
  district_code: string | null;
  permitted_uses: string | null;
  regulatory_notes: string | null;
  geom: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  // Buildability fields (added 2026-09-04) -- populated only on
  // layer_type='current_zoning' rows curated for the dashboard's
  // Buildability tab. See getBuildabilityZones/BuildabilityDetailPanel.
  generally_allowed: string | null;
  may_require_approval: string | null;
  min_lot_size: string | null;
  height_limit: string | null;
  lot_coverage: string | null;
  parking_requirements: string | null;
  setbacks: string | null;
  code_considerations: string | null;
  buildability_summary: string | null;
  source_id: string;
  confidence: Confidence;
  last_verified_at: string;
  created_at: string;
};

export type ZoningLandUseWithSource = ZoningLandUse & { source: Source | null };

// --- Potential: Growth Areas & Potential Sites (Phase 5 map layer) ---
// The other half of the two-pillar model -- Plans is "what's coming"
// (projects/project_events), Potential is "what's next." Both concepts
// have real tables since Phase 1 but no UI until now, and deliberately
// no seeded Topeka content: unlike Plans, there's no source document a
// Growth Area or Potential Site is transcribed from -- they're
// Groundbreakable's own synthesis across evidence, which means a human
// has to actually make the call. See the admin curation pages.

// A single accent for the whole Potential pillar (growth areas AND
// potential sites) -- distinct from every Plans-side color (Activity's
// phase colors, Opportunities' green, Catalysts' white) so "which pillar
// am I looking at" reads at a glance regardless of zoom level.
export const POTENTIAL_COLOR = "#818cf8"; // indigo

export type GrowthAreaMomentum = "emerging" | "accelerating" | "established";

export const GROWTH_AREA_MOMENTUM_LABEL: Record<GrowthAreaMomentum, string> = {
  emerging: "Emerging",
  accelerating: "Accelerating",
  established: "Established",
};

export type GrowthArea = {
  id: string;
  market_id: string;
  name: string;
  momentum_state: GrowthAreaMomentum;
  narrative: string | null; // the "why we're watching" bullets, editorial -- no source_id on this table on purpose, see the Phase 1 migration comment
  geom: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  created_at: string;
  updated_at: string;
};

export type PotentialSiteTier = "watch" | "high";

export const POTENTIAL_SITE_TIER_LABEL: Record<PotentialSiteTier, string> = {
  watch: "Watch",
  high: "High Potential",
};

export type PotentialSite = {
  id: string;
  market_id: string;
  growth_area_id: string | null;
  title: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  tier: PotentialSiteTier;
  development_context: string | null; // the "why this site" narrative
  status: "active" | "archived";
  source_id: string | null;
  confidence: Confidence;
  created_at: string;
  updated_at: string;
};

export type PotentialSiteWithSource = PotentialSite & { source: Source | null };

// --- Shifts ---
// The unified source of truth for the market-shift dashboard -- replaces
// the Plans/Opportunities/Potential pillar model at the primary route.
// See supabase/migrations/20260904000000_roq_shift_schema.sql and
// 20260904120000_recategorize_shift_categories.sql (the six-category
// PLANS/BUILDING/INFRASTRUCTURE/BUSINESS/PROPERTY/DISTRESS taxonomy).

export type ShiftCategory =
  | "plans"
  | "building"
  | "infrastructure"
  | "business"
  | "property"
  | "distress";

export type ShiftImpact = "low" | "medium" | "high";

export type ShiftAudience = "agent" | "broker" | "investor" | "contractor" | "developer" | "lender";

export type Shift = {
  id: string;
  market_id: string;
  category: ShiftCategory;
  // Free text subtype (e.g. "tax_lien", "rezoning", "permit_issued") --
  // not enum-constrained, see the migration comment.
  shift_type: string;
  event: string;
  description: string | null;
  event_date: string;
  stage: string | null;
  impact: ShiftImpact;
  audience: ShiftAudience[];
  address: string | null;
  parcel_id: string | null;
  lat: number | null;
  lng: number | null;
  source_id: string | null;
  raw_data: Record<string, unknown> | null;
  detected_at: string;
  created_at: string;
};

export type ShiftWithSource = Shift & { source: Source | null };

// --- Project People (evidence-based developer/contractor directory) ---
// Distinct from the old Phase 1 companies/project_parties tables -- see
// the project_people_schema migration comment for why. related_record_id
// points at either `projects.id` or `shifts.id` depending on
// related_record_type; there's no polymorphic FK, so the app resolves it
// (same idea as growth_areas' momentum breakdown resolving contained
// shifts/projects by point-in-polygon rather than a join table).

export type ProjectPersonRole = "developer" | "contractor";

export const PROJECT_PERSON_ROLE_LABEL: Record<ProjectPersonRole, string> = {
  developer: "Developer",
  contractor: "Contractor",
};

export type ProjectPersonConfidence = "confirmed" | "likely";

export const PROJECT_PERSON_CONFIDENCE_LABEL: Record<ProjectPersonConfidence, string> = {
  confirmed: "Confirmed",
  likely: "Likely",
};

export type ProjectPersonRecordType = "project" | "shift";

export type ProjectPerson = {
  id: string;
  market_id: string;
  person_name: string | null;
  company_name: string | null;
  role: ProjectPersonRole;
  related_record_type: ProjectPersonRecordType;
  related_record_id: string;
  related_label: string;
  source_id: string | null;
  event_date: string | null;
  confidence: ProjectPersonConfidence;
  evidence_note: string | null;
  created_at: string;
};

export type ProjectPersonWithSource = ProjectPerson & { source: Source | null };

// --- Development Opportunities ---
// Properties with multiple overlapping development/redevelopment
// signals -- distinct from the old Phase 1 `opportunities`/`signals`
// pair, which is entangled with the internal leads CRM (lead_id -> leads)
// and predates the momentum/buildability/permit concepts this feature
// scores against. See development_opportunities_schema migration.
// Momentum and Buildability are deliberately not columns -- they're
// computed at read time from (latitude, longitude) against
// growth_areas/zoning_land_use polygons (see opportunityConstants.ts).

export type OpportunityStrength = "high" | "medium" | "low";

// "Early" (not "Low") per the Development Intelligence spec's HIGH/
// MEDIUM/EARLY strength vocabulary -- same underlying 'low' value, just a
// display label, so no data/schema change.
export const OPPORTUNITY_STRENGTH_LABEL: Record<OpportunityStrength, string> = {
  high: "High",
  medium: "Medium",
  low: "Early",
};

export type OpportunityCategory = "distress" | "zoning" | "early_project";

export const OPPORTUNITY_CATEGORY_LABEL: Record<OpportunityCategory, string> = {
  distress: "Distress",
  zoning: "Zoning",
  early_project: "Early Projects",
};

// "Who this is for" -- orthogonal to category ("why it's an opportunity").
// See the opportunity_group_classification migration for how existing
// rows map onto this, and lib/opportunityRules.ts for how Builder/
// Contractor opportunities also get computed live from the projects
// pipeline (not just these hand-authored rows).
export type OpportunityGroup = "development" | "builder" | "contractor";

export const OPPORTUNITY_GROUP_LABEL: Record<OpportunityGroup, string> = {
  development: "Development Opportunities",
  builder: "Builder Opportunities",
  contractor: "Contractor Opportunities",
};

export type DevelopmentOpportunity = {
  id: string;
  market_id: string;
  address: string;
  // Nullable -- some rezoning-stage opportunities are only ever
  // described by intersection in sourced reporting, never geocoded to a
  // precise point (same reason `shifts.lat/lng` is nullable). No pin
  // beats a fabricated one.
  latitude: number | null;
  longitude: number | null;
  opportunity_type: string;
  strength: OpportunityStrength;
  category: OpportunityCategory;
  opportunity_group: OpportunityGroup;
  status: string | null;
  related_developer: string | null;
  related_contractor: string | null;
  signals: string[];
  reasons: string[];
  source_ids: string[];
  date_identified: string;
  created_at: string;
};

export type DevelopmentOpportunityWithSources = DevelopmentOpportunity & { sources: Source[] };

// --- Market Overview ---
// City-level growth/economic indicators -- a different kind of data
// than everything else in this schema (parcel-level events); this
// answers "is this market growing, slowing, or changing?" at the market
// level. See market_overview_schema migration.

export type MarketIndicatorTrend = "up" | "down" | "flat";

export type MarketIndicator = {
  id: string;
  market_id: string;
  metric_key: string;
  label: string;
  unit: string;
  current_value: number;
  current_value_date: string;
  prior_value: number | null;
  prior_value_date: string | null;
  change_absolute: number | null;
  change_percent: number | null;
  trend: MarketIndicatorTrend | null;
  notes: string | null;
  source_id: string | null;
  confidence: Confidence;
  created_at: string;
};

export type MarketIndicatorWithSource = MarketIndicator & { source: Source | null };

export type MarketOverview = {
  id: string;
  market_id: string;
  summary: string;
  major_employers: string[];
  major_employers_note: string | null;
  recent_employer_changes: string[];
  new_business_activity: string | null;
  source_ids: string[];
  created_at: string;
  updated_at: string;
};

export type MarketOverviewWithSources = MarketOverview & { sources: Source[] };

// --- Development Friction ---
// See supabase/migrations/20260914000000_development_friction_schema.sql --
// answers "how long is this taking" / "what's the risk" for a market, a
// question neither market_overviews (macro narrative) nor shifts/projects
// (individual parcel-level events) was built to hold.

export type FrictionKind = "timeline" | "risk" | "context";

export type DevelopmentFrictionSignal = {
  id: string;
  market_id: string;
  kind: FrictionKind;
  severity: ShiftImpact | null;
  title: string;
  summary: string;
  metric_value: number | null;
  metric_unit: string | null;
  related_project_id: string | null;
  related_shift_id: string | null;
  observed_date: string;
  source_id: string | null;
  confidence: Confidence;
  created_at: string;
};

export type DevelopmentFrictionSignalWithSource = DevelopmentFrictionSignal & { source: Source | null };

// --- Investment ---
// See supabase/migrations/20260905000000_investment_schema.sql -- tracks
// capital that materially affects development/construction/land value/
// infrastructure/buildability, NOT routine business/property activity
// (that's what the old business/property shift categories were for).

export type InvestmentType =
  | "private_development"
  | "public_capital"
  | "infrastructure_enabling"
  | "incentivized_development"
  | "institutional_corporate";

export type InvestmentProjectStatus =
  | "early_signal"
  | "proposed"
  | "under_review"
  | "approved"
  | "funded"
  | "permitted"
  | "under_construction"
  | "complete"
  | "delayed"
  | "cancelled";

export type InvestmentConfidenceLevel = "high" | "medium" | "low";

export type InvestmentDevelopmentImpact = "very_high" | "high" | "medium" | "low";

export type InvestmentImpactTag =
  | "unlocks_land"
  | "adds_housing"
  | "adds_commercial"
  | "adds_employment"
  | "improves_transportation"
  | "expands_utilities"
  | "raises_momentum"
  | "supports_redevelopment"
  | "improves_public_realm"
  | "adds_institutional_demand";

export type InvestmentGeographicScope =
  | "parcel"
  | "development_site"
  | "corridor"
  | "neighborhood"
  | "growth_area"
  | "citywide";

export type Investment = {
  id: string;
  market_id: string;
  project_name: string;
  project_description: string | null;
  investment_type: InvestmentType;
  asset_type: string | null;
  total_investment_amount: number | null;
  public_investment_amount: number | null;
  private_investment_amount: number | null;
  incentive_amount: number | null;
  funding_source: string | null;
  developer_or_investor: string | null;
  public_agency: string | null;
  address: string | null;
  parcel_id: string | null;
  lat: number | null;
  lng: number | null;
  acreage: number | null;
  square_feet: number | null;
  residential_units: number | null;
  jobs_created: number | null;
  project_status: InvestmentProjectStatus;
  previous_status: InvestmentProjectStatus | null;
  announcement_date: string | null;
  approval_date: string | null;
  funding_date: string | null;
  expected_start_date: string | null;
  expected_completion_date: string | null;
  source_id: string;
  confidence_level: InvestmentConfidenceLevel;
  last_verified_date: string;
  development_impact: InvestmentDevelopmentImpact;
  primary_impact: InvestmentImpactTag[];
  geographic_scope: InvestmentGeographicScope | null;
  geographic_note: string | null;
  why_it_matters: string | null;
  notes: string | null;
  first_seen_date: string;
  last_seen_date: string;
  created_at: string;
};

// --- Entitlement Intelligence ---
// See supabase/migrations/20260916170000_entitlement_intelligence_schema.sql
// -- case-level tracking of the entitlement process (rezonings, plats,
// SUPs, annexations, ...): what was requested, what staff/Planning
// Commission/City Commission did with it, what changed between request
// and approval, and how long it took. Distinct from development_friction_
// signals (hand-authored, market-wide, not case-level) and from shifts/
// projects (individual events with no case-number/vote/outcome-delta
// structure).

export type EntitlementApprovalPath = "by_right" | "administrative" | "discretionary" | "rezoning" | "other";
export type EntitlementDecisionBody = "staff" | "planning_commission" | "city_commission" | "board_of_zoning_appeals" | "county_commission";
export type EntitlementCaseStatus = "pending" | "approved" | "approved_with_conditions" | "denied" | "withdrawn" | "deferred" | "remanded";
export type EntitlementVoteChoice = "yes" | "no" | "abstain" | "recuse" | "absent";

export const ENTITLEMENT_APPROVAL_PATH_LABEL: Record<EntitlementApprovalPath, string> = {
  by_right: "By Right",
  administrative: "Administrative",
  discretionary: "Discretionary",
  rezoning: "Rezoning",
  other: "Other",
};

export const ENTITLEMENT_DECISION_BODY_LABEL: Record<EntitlementDecisionBody, string> = {
  staff: "Staff",
  planning_commission: "Planning Commission",
  city_commission: "City Commission",
  board_of_zoning_appeals: "Board of Zoning Appeals",
  county_commission: "County Commission",
};

export const ENTITLEMENT_CASE_STATUS_LABEL: Record<EntitlementCaseStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  denied: "Denied",
  withdrawn: "Withdrawn",
  deferred: "Deferred",
  remanded: "Remanded",
};

export const ENTITLEMENT_CASE_STATUS_COLOR: Record<EntitlementCaseStatus, string> = {
  pending: "#94a3b8", // slate
  approved: "#22c55e", // green
  approved_with_conditions: "#22c55e", // green
  denied: "#ef4444", // red
  withdrawn: "#94a3b8", // slate
  deferred: "#f59e0b", // amber
  remanded: "#f59e0b", // amber
};

export type EntitlementApprovalType = {
  id: string;
  market_id: string;
  key: string;
  label: string;
  approval_path: EntitlementApprovalPath;
  approving_authority: EntitlementDecisionBody;
  recommending_authority: EntitlementDecisionBody | null;
  requires_public_hearing: boolean;
  requires_neighborhood_meeting: boolean;
  notice_requirements: string | null;
  required_documents: string[];
  typical_sequence: string | null;
  published_timeline_days: number | null;
  appeal_path: string | null;
  description: string | null;
  source_id: string | null;
  confidence: Confidence;
  last_verified_at: string | null;
  created_at: string;
};

export type EntitlementApprovalTypeWithSource = EntitlementApprovalType & { source: Source | null };

export type EntitlementCase = {
  id: string;
  market_id: string;
  project_id: string | null;

  case_number: string | null;
  summary: string | null;
  address: string | null;
  parcel_id: string | null;
  acreage: number | null;
  latitude: number | null;
  longitude: number | null;
  planning_area: string | null;
  council_district: string | null;
  surrounding_land_uses: string | null;

  approval_type_id: string | null;
  existing_zoning: string | null;
  requested_zoning: string | null;
  land_use_designation: string | null;
  proposed_use: string | null;
  proposed_units: number | null;
  proposed_density: number | null;
  proposed_height: number | null;
  proposed_commercial_sqft: number | null;
  subdivision_layout_summary: string | null;

  staff_recommendation: string | null;
  staff_concerns: string[];
  required_revisions: string | null;

  application_date: string | null;
  first_staff_review_date: string | null;
  planning_commission_hearing_date: string | null;
  city_commission_hearing_date: string | null;
  final_decision_date: string | null;
  ordinance_number: string | null;
  ordinance_adopted_date: string | null;

  status: EntitlementCaseStatus;
  final_units: number | null;
  final_density: number | null;
  final_height: number | null;
  final_commercial_sqft: number | null;
  days_to_decision: number | null;

  source_id: string | null;
  confidence: Confidence;
  last_verified_at: string | null;
  created_at: string;
};

export type EntitlementCaseWithSource = EntitlementCase & { source: Source | null };

export type EntitlementCaseEvent = {
  id: string;
  case_id: string;
  event_type: string;
  decision_body: EntitlementDecisionBody | null;
  event_date: string;
  motion_text: string | null;
  outcome: string | null;
  vote_yes: number | null;
  vote_no: number | null;
  vote_abstain: number | null;
  conditions_summary: string | null;
  note: string | null;
  source_id: string | null;
  confidence: Confidence;
  created_at: string;
};

export type EntitlementCommissioner = {
  id: string;
  market_id: string;
  full_name: string;
  decision_body: EntitlementDecisionBody;
  appointing_jurisdiction: string | null;
  term_start: string | null;
  term_end: string | null;
  role: string | null;
  source_id: string | null;
  confidence: Confidence;
  created_at: string;
};

export type EntitlementCaseVote = {
  id: string;
  case_event_id: string;
  commissioner_id: string;
  vote: EntitlementVoteChoice;
  comments: string | null;
  source_id: string | null;
  created_at: string;
};

export type EntitlementChangeDimension =
  | "units" | "density" | "height" | "setbacks" | "buffers" | "road_connections" | "access"
  | "open_space" | "parking" | "architecture" | "land_use_mix" | "infrastructure_obligation" | "other";

export type EntitlementCaseChange = {
  id: string;
  case_id: string;
  dimension: EntitlementChangeDimension;
  requested_value: string | null;
  approved_value: string | null;
  change_summary: string | null;
  source_id: string | null;
  created_at: string;
};

export type EntitlementCaseCondition = {
  id: string;
  case_id: string;
  imposed_by: EntitlementDecisionBody | null;
  condition_text: string;
  category: "infrastructure" | "design" | "traffic" | "buffer" | "stormwater" | "other" | null;
  source_id: string | null;
  created_at: string;
};

export type EntitlementPublicCommentCategory =
  | "traffic" | "density" | "height" | "compatibility" | "parking" | "drainage"
  | "schools" | "environmental" | "property_values" | "access" | "infrastructure" | "other";

export type EntitlementPublicComment = {
  id: string;
  case_id: string;
  meeting_event_id: string | null;
  category: EntitlementPublicCommentCategory;
  commenter_description: string | null;
  statement_summary: string;
  source_id: string | null;
  created_at: string;
};

export type EntitlementCaseParty = {
  id: string;
  case_id: string;
  role: "applicant" | "developer" | "landowner" | "engineer" | "planner" | "attorney" | "other";
  person_name: string | null;
  company_name: string | null;
  source_id: string | null;
  created_at: string;
};

export type EntitlementRealityScoreSnapshot = {
  id: string;
  market_id: string;
  subject_type: "parcel" | "project" | "scenario";
  subject_ref: string;
  score: number;
  confidence: "low" | "medium" | "high";
  component_breakdown: Record<string, unknown>;
  missing_information: string[];
  generated_at: string;
};

// A fully assembled case for display: the case row plus everything that
// hangs off it, matching the spec's "request -> staff -> public response
// -> PC -> CC -> changes -> result -> timeline" shape end to end.
// votes nest under their event (entitlement_case_votes.case_event_id ->
// entitlement_case_events -- there is no direct FK from entitlement_cases
// to entitlement_case_votes for PostgREST to embed at the top level).
export type EntitlementCaseEventWithVotes = EntitlementCaseEvent & {
  votes: (EntitlementCaseVote & { commissioner: EntitlementCommissioner | null })[];
};

export type EntitlementCaseDetail = EntitlementCase & {
  source: Source | null;
  approval_type: EntitlementApprovalType | null;
  events: EntitlementCaseEventWithVotes[];
  changes: EntitlementCaseChange[];
  conditions: EntitlementCaseCondition[];
  public_comments: EntitlementPublicComment[];
  parties: EntitlementCaseParty[];
};

export type InvestmentWithSource = Investment & { source: Source | null };

// --- Development Friction (case-level) --------------------------------------
// A different, complementary concept to DevelopmentFrictionSignal above:
// that's a handful of hand-researched MARKET-WIDE qualitative patterns
// ("PC-to-CC votes run ~29 days"); this is one row per real project that
// hit meaningful opposition, delay, denial, withdrawal, or abandonment,
// following an Original Plan -> Friction -> Response -> Outcome -> Insight
// framework. Queried across every market at once (see
// src/lib/queries/developmentFrictionCases.ts), unlike everything else in
// this file which is fetched one market at a time.
export type FrictionType =
  | "community_opposition"
  | "planning_commission"
  | "city_council"
  | "county_council"
  | "moratorium"
  | "regulatory_change"
  | "lawsuit_appeal"
  | "infrastructure_concern"
  | "other";

export type FrictionCaseOutcome = "resolved" | "modified" | "delayed" | "withdrawn" | "denied" | "abandoned" | "pending";

export const FRICTION_TYPE_LABEL: Record<FrictionType, string> = {
  community_opposition: "Community Opposition",
  planning_commission: "Planning Commission",
  city_council: "City Council",
  county_council: "County Council",
  moratorium: "Moratorium",
  regulatory_change: "Regulatory Change",
  lawsuit_appeal: "Lawsuit / Appeal",
  infrastructure_concern: "Infrastructure Concern",
  other: "Other",
};

export const FRICTION_CASE_OUTCOME_LABEL: Record<FrictionCaseOutcome, string> = {
  resolved: "Resolved",
  modified: "Modified",
  delayed: "Delayed",
  withdrawn: "Withdrawn",
  denied: "Denied",
  abandoned: "Abandoned",
  pending: "Pending",
};

export const FRICTION_CASE_OUTCOME_COLOR: Record<FrictionCaseOutcome, string> = {
  resolved: "#22c55e", // green
  modified: "#f59e0b", // amber
  delayed: "#f59e0b", // amber
  withdrawn: "#94a3b8", // slate
  denied: "#ef4444", // red
  abandoned: "#ef4444", // red
  pending: "#94a3b8", // slate
};

export type DevelopmentFrictionCase = {
  id: string;
  market_id: string;

  project_name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  developer_name: string | null;
  project_type: ProjectType | null;

  original_plan_summary: string;

  friction_type: FrictionType;
  concerns: string[];
  decision_makers: string[];

  response_summary: string | null;

  outcome: FrictionCaseOutcome;
  final_plan_summary: string | null;

  impact_units_lost: number | null;
  impact_density_reduction: string | null;
  impact_added_conditions: string[];
  impact_time_delay: string | null;
  impact_added_cost_usd: number | null;
  impact_project_failed: boolean;

  severity: ShiftImpact | null;

  ai_insight: string | null;
  ai_insight_generated_at: string | null;

  related_project_id: string | null;
  related_entitlement_case_id: string | null;

  source_id: string | null;
  confidence: Confidence;
  created_at: string;
};

export type DevelopmentFrictionTimelineEvent = {
  id: string;
  friction_case_id: string;
  event_date: string;
  description: string;
  source_id: string | null;
  confidence: Confidence;
  created_at: string;
};

export type DevelopmentFrictionCaseWithSource = DevelopmentFrictionCase & {
  source: Source | null;
  market: Pick<Market, "id" | "name" | "slug" | "state">;
  timeline_events: DevelopmentFrictionTimelineEvent[];
};
