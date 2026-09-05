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
export const OPPORTUNITIES_COLOR = "#22c55e"; // green
// Catalysts render as a white "watch zone" area outline (not a point pin),
// always visible regardless of which segment is active -- see
// DevelopmentMap.tsx.
export const CATALYSTS_COLOR = "#ffffff";

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
  | "other";

export const CATALYST_TYPE_LABEL: Record<CatalystType, string> = {
  major_employer: "Major Employer",
  infrastructure_project: "Infrastructure Project",
  institutional: "Institutional",
  public_facility: "Public Facility",
  mixed_use_anchor: "Mixed-Use Anchor",
  other: "Other",
};

export type CatalystStatus = "planned" | "under_construction" | "operating" | "completed";

export const CATALYST_STATUS_LABEL: Record<CatalystStatus, string> = {
  planned: "Planned",
  under_construction: "Under Construction",
  operating: "Operating",
  completed: "Completed",
};

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
  is_spotlight: boolean;
  date_announced: string | null;
  source_id: string;
  confidence: Confidence;
  last_verified_at: string;
  created_at: string;
};

export type CatalystWithSource = Catalyst & { source: Source | null };

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

export type InvestmentWithSource = Investment & { source: Source | null };
