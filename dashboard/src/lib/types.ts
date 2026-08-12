export type Market = {
  id: string;
  slug: string;
  name: string;
  state: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
};

export type Submarket = {
  id: string;
  market_id: string;
  name: string;
  momentum: "high" | "emerging" | "stable" | "watch";
  median_price: number | null;
  cash_on_cash_pct: number | null;
  summary: string | null;
  sort_order: number;
};

export type MarketEvent = {
  id: string;
  market_id: string;
  type: "development" | "permit" | "infrastructure" | "risk";
  title: string;
  description: string | null;
  status: string | null;
  lat: number | null;
  lng: number | null;
  source_url: string | null;
  event_date: string | null;
};

export type MarketMetrics = {
  id: string;
  market_id: string;
  period: string;
  population_growth_pct: number | null;
  median_income: number | null;
  job_growth_pct: number | null;
  permit_activity_index: number | null;
  price_momentum_index: number | null;
  days_on_market: number | null;
  inventory_index: number | null;
};

export type Competitor = {
  id: string;
  market_id: string;
  entity_name: string;
  property_address: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  strategy_notes: string | null;
  source_url: string | null;
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

export type Property = {
  id: string;
  investor_id: string;
  market_id: string | null;
  status: "owned" | "target" | "watchlist";
  address: string;
  price: number | null;
  notes: string | null;
  tags: string[];
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
  category: ProjectCategory;
  subcategory: string | null;
  status: ProjectStatus;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  project_value: number | null;
  units: number | null;
  acreage: number | null;
  developer: string | null;
  date_announced: string | null;
  date_updated: string;
  source_id: string;
  confidence: Confidence;
  last_verified_at: string;
  created_at: string;
};

export type ProjectUpdate = {
  id: string;
  project_id: string;
  status: ProjectStatus;
  note: string | null;
  source_id: string | null;
  occurred_on: string;
  created_at: string;
};

// Joined shape used by the Home dashboard's "Recent Activity" news feed --
// project_updates is already an append-only log of admin-made changes, so
// no separate "news" table is needed for this.
export type ProjectUpdateWithProject = ProjectUpdate & {
  project: Pick<Project, "id" | "title" | "category" | "market_id"> | null;
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
export const CATALYSTS_COLOR = "#eab308"; // premium gold -- catalyst overlay within Activity

// --- Activity phases ---
// Activity's primary grouping axis: construction phase, derived from
// status (see src/lib/activityPhase.ts) rather than stored directly.
export type ActivityPhase = "planning" | "active" | "completed";

// Planning (pre-permit, actionable) is emphasized in orange; Active and
// Completed are deliberately de-emphasized once a project has a permit in
// hand, on a fading scale from near-white (still underway) to dim gray
// (already finished, most historical).
export const ACTIVITY_PHASE_COLOR: Record<ActivityPhase, string> = {
  planning: "#f97316",
  active: "#e2e8f0",
  completed: "#94a3b8",
};

export const ACTIVITY_PHASE_LABEL: Record<ActivityPhase, string> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
};

// --- Opportunities: Properties ---

export type OpportunityType = "tax_lien" | "pre_foreclosure" | "absentee_owner" | "high_equity_owner" | "listing";

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  tax_lien: "Tax Lien",
  pre_foreclosure: "Pre-Foreclosure",
  absentee_owner: "Absentee Owner",
  high_equity_owner: "High-Equity Owner",
  listing: "Listing",
};

export type Opportunity = {
  id: string;
  market_id: string;
  lead_id: string | null;
  address: string;
  latitude: number;
  longitude: number;
  opportunity_type: OpportunityType;
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

// --- Upcoming Decisions ---
// Genuinely distinct from project_updates (which logs what already
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
