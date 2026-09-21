// Domain types for SLADE (Jared's internal operating agent). Separate from
// src/lib/types.ts (the investor/development-intelligence product) and
// src/lib/leads/types.ts (Groundbreakable Leads) -- same separation
// already established between those two. See SLADE/DATA_MODEL.md at the
// repo root for the full schema this mirrors.

export type RelationshipType =
  | "developer"
  | "investor"
  | "broker"
  | "planner"
  | "city_contact"
  | "contractor"
  | "friend_network"
  | "other";

export type RelationshipStatus =
  | "unknown"
  | "prospect"
  | "warm_lead"
  | "active_prospect"
  | "customer"
  | "partner"
  | "friend_network"
  | "inactive"
  | "do_not_contact";

export type LeadStatus =
  | "never_contacted"
  | "attempted"
  | "no_response"
  | "responded"
  | "interested"
  | "not_interested"
  | "follow_up"
  | "active_conversation";

export type OrganizationType =
  | "developer"
  | "investor"
  | "brokerage"
  | "contractor"
  | "planning_firm"
  | "partner"
  | "municipality"
  | "other";

export interface SladeOrganization {
  id: string;
  name: string;
  type: OrganizationType | null;
  website: string | null;
  primary_market_id: string | null;
  relationship_status: RelationshipStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SladeContact {
  id: string;
  organization_id: string | null;
  investor_profile_id: string | null;
  first_name: string;
  last_name: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  linkedin_url: string | null;
  relationship_type: RelationshipType | null;
  relationship_status: RelationshipStatus;
  lead_status: LeadStatus;
  notes: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SladeContactWithOrganization = SladeContact & { organization: SladeOrganization | null };

export type InteractionType =
  | "call"
  | "text"
  | "email"
  | "linkedin"
  | "meeting"
  | "report_sent"
  | "property_sent"
  | "follow_up"
  | "other";

export type InteractionDirection = "outbound" | "inbound";

export interface SladeInteraction {
  id: string;
  contact_id: string;
  organization_id: string | null;
  interaction_type: InteractionType;
  direction: InteractionDirection | null;
  occurred_at: string;
  outcome: string | null;
  summary: string | null;
  next_action: string | null;
  source: string;
  created_at: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface SladeTask {
  id: string;
  contact_id: string | null;
  opportunity_id: string | null;
  project_id: string | null;
  task_type: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  completed_at: string | null;
}

export interface SladeChangeLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  note: string | null;
  changed_at: string;
}

export interface SladeBuyBox {
  id: string;
  contact_id: string;
  organization_id: string | null;
  name: string;
  active: boolean;
  target_markets: string[];
  target_market_ids: string[];
  asset_types: string[];
  min_acres: number | null;
  max_acres: number | null;
  min_price: number | null;
  max_price: number | null;
  preferred_deal_types: string[];
  preferred_distress_signals: string[];
  zoning_preferences: string[];
  entitlement_preferences: string | null;
  excluded_uses: string[];
  requires_sewer: boolean | null;
  requires_water: boolean | null;
  requires_highway_access: boolean | null;
  requires_rail_access: boolean | null;
  notes: string | null;
  source: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ListingStatus = "on_market" | "off_market" | "unknown";
export type SiteStatus = "identified" | "researching" | "verified" | "archived";

export interface SladeSite {
  id: string;
  external_id: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  parcel_id: string | null;
  market_id: string | null;
  latitude: number | null;
  longitude: number | null;
  acreage: number | null;
  owner_name: string | null;
  current_use: string | null;
  listing_status: ListingStatus | null;
  listing_price: number | null;
  listing_agent: string | null;
  listing_broker: string | null;
  status: SiteStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type SiteFactType =
  | "zoning"
  | "future_land_use"
  | "acreage"
  | "owner"
  | "sewer"
  | "water"
  | "floodplain"
  | "wetlands"
  | "permitted_uses"
  | "overlays"
  | "utilities"
  | "road_access"
  | "entitlement_history"
  | "other";

export type VerificationStatus = "verified" | "inferred" | "needs_verification" | "conflicting" | "stale";

export interface SladeSiteFact {
  id: string;
  site_id: string;
  fact_type: SiteFactType;
  value: string | null;
  verification_status: VerificationStatus;
  source_id: string | null;
  source_url: string | null;
  source_type: string | null;
  source_date: string | null;
  checked_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OpportunityStatus =
  | "discovered"
  | "screening"
  | "researching"
  | "verification_required"
  | "qualified"
  | "ready_to_deliver"
  | "delivered"
  | "rejected"
  | "paused"
  | "archived";

export interface SladeOpportunity {
  id: string;
  site_id: string;
  contact_id: string | null;
  organization_id: string | null;
  buy_box_id: string | null;
  market_id: string | null;
  opportunity_status: OpportunityStatus;
  match_score: number | null;
  thesis: string | null;
  possible_uses: string[];
  major_upside: string | null;
  major_risks: string | null;
  unknowns: string | null;
  next_steps: string | null;
  verification_identity_ok: boolean;
  verification_ownership_ok: boolean;
  verification_listing_ok: boolean;
  verification_conflict_ok: boolean;
  verification_planning_ok: boolean;
  verification_infrastructure_ok: boolean;
  verification_client_fit_ok: boolean;
  verification_prior_history_ok: boolean;
  verification_sources_ok: boolean;
  verification_notes: string | null;
  verification_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OpportunityFeedbackType =
  | "interested"
  | "not_interested"
  | "need_more_info"
  | "rejected_price"
  | "rejected_location"
  | "rejected_other"
  | "positive_signal"
  | "other";

export interface SladeOpportunityFeedback {
  id: string;
  opportunity_id: string;
  contact_id: string | null;
  feedback_type: OpportunityFeedbackType | null;
  feedback: string | null;
  resulting_action: string | null;
  occurred_at: string;
  created_at: string;
}

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export interface SladeProject {
  id: string;
  name: string;
  contact_id: string | null;
  organization_id: string | null;
  market_id: string | null;
  objective: string | null;
  status: ProjectStatus;
  summary: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportType = "opportunity_report" | "market_brief" | "buy_box_summary" | "other";
export type ReportStatus = "draft" | "internal_review" | "ready" | "delivered" | "archived";

export interface ReportSection {
  content: string;
  source_ids: string[];
}

// Matches SLADE/templates/opportunity_report_template.md's section list.
export type ReportSectionKey =
  | "executive_thesis"
  | "property_snapshot"
  | "why_it_matters"
  | "development_potential"
  | "planning_zoning"
  | "infrastructure"
  | "entitlement_path"
  | "market_context"
  | "risks"
  | "unknowns"
  | "next_steps"
  | "sources";

export interface SladeReport {
  id: string;
  opportunity_id: string | null;
  site_id: string | null;
  contact_id: string | null;
  report_type: ReportType;
  version: number;
  status: ReportStatus;
  sections: Partial<Record<ReportSectionKey, ReportSection>>;
  file_reference: string | null;
  generated_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export const RELATIONSHIP_STATUS_LABEL: Record<RelationshipStatus, string> = {
  unknown: "Unknown",
  prospect: "Prospect",
  warm_lead: "Warm Lead",
  active_prospect: "Active Prospect",
  customer: "Customer",
  partner: "Partner",
  friend_network: "Friend / Network",
  inactive: "Inactive",
  do_not_contact: "Do Not Contact",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  never_contacted: "Never Contacted",
  attempted: "Attempted",
  no_response: "No Response",
  responded: "Responded",
  interested: "Interested",
  not_interested: "Not Interested",
  follow_up: "Follow Up",
  active_conversation: "Active Conversation",
};

export const OPPORTUNITY_STATUS_LABEL: Record<OpportunityStatus, string> = {
  discovered: "Discovered",
  screening: "Screening",
  researching: "Researching",
  verification_required: "Verification Required",
  qualified: "Qualified",
  ready_to_deliver: "Ready to Deliver",
  delivered: "Delivered",
  rejected: "Rejected",
  paused: "Paused",
  archived: "Archived",
};

export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  inferred: "Inferred",
  needs_verification: "Needs Verification",
  conflicting: "Conflicting",
  stale: "Stale",
};
