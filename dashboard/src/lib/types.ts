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
// Light-theme equivalent for Catalyst badges/callouts on white-background
// cards (BriefingSummary, PlansFeed, PlanDetailPanel) -- CATALYSTS_COLOR
// is tuned for dark map overlays and disappears on a white card.
export const CATALYST_LIGHT_ACCENT_COLOR = "#f59e0b";

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
  | "housing_development"
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
  data_center: "Data Center",
  housing_development: "Housing Development",
  industrial_logistics: "Industrial / Logistics",
  incentive_district: "Incentive / TIF District",
  annexation_rezoning: "Annexation / Rezoning",
  other: "Other",
};

export type CatalystStatus = "proposed" | "planned" | "under_construction" | "operating" | "completed" | "cancelled";

export const CATALYST_STATUS_LABEL: Record<CatalystStatus, string> = {
  proposed: "Proposed",
  planned: "Planned",
  under_construction: "Under Construction",
  operating: "Operating",
  completed: "Completed",
  cancelled: "Cancelled",
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
};

export type CatalystWithSource = Catalyst & { source: Source | null };

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
