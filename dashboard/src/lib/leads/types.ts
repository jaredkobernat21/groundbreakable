// Domain types for Groundbreakable Leads (the /leads section). Separate
// from src/lib/types.ts, which belongs to the investor/development-
// intelligence product and its own (differently-shaped) `leads` table.

export type City = "Spring Hill" | "Gardner" | "Olathe" | "Unincorporated Johnson County" | "Other";

export type PropertyType =
  | "vacant_residential"
  | "residential_acreage"
  | "agricultural_potential_residential"
  | "agricultural"
  | "other";

export type OwnerType = "individual" | "couple" | "trust" | "llc" | "unknown";

export type PipelineStatus =
  | "discovered"
  | "qualified"
  | "ready_to_contact"
  | "contacted"
  | "interested"
  | "build_plan"
  | "customer"
  | "not_a_fit"
  | "do_not_contact";

export type Confidence = "verified" | "likely" | "unknown" | "needs_confirmation";

export type ContactType = "phone" | "email" | "mailing_address";
export type PhoneType = "mobile" | "landline" | "unknown";

export type InteractionType =
  | "called"
  | "texted"
  | "emailed"
  | "no_answer"
  | "interested"
  | "not_interested"
  | "wrong_number"
  | "do_not_contact"
  | "note";

export type ResearchCategory = "zoning" | "utility" | "permit" | "site" | "other";

export interface GblProperty {
  id: string;
  parcel_id: string | null;
  address: string;
  city: City;
  county: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  acreage: number | null;
  zoning: string | null;
  property_type: PropertyType | null;
  land_classification: string | null;
  existing_structure: boolean | null;
  sale_date: string | null;
  sale_price: number | null;
  assessed_value: number | null;
  jurisdiction: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreReason {
  label: string;
  points: number;
  direction: "positive" | "negative";
}

export interface GblLead {
  id: string;
  property_id: string;
  owner_name: string;
  owner_type: OwnerType;
  score: number;
  score_reasons: ScoreReason[];
  pipeline_status: PipelineStatus;
  dnc_status: boolean;
  dnc_checked_at: string | null;
  dnc_notes: string | null;
  last_contacted_at: string | null;
  next_follow_up: string | null;
  note: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export type GblLeadWithProperty = GblLead & { property: GblProperty };

export interface GblPropertyIntelligence {
  id: string;
  property_id: string;
  water_type: "municipal" | "rural_water" | "well_likely" | "unknown" | null;
  water_provider: string | null;
  water_confidence: Confidence;
  sewer_type: "public_sewer" | "septic_likely" | "unknown" | null;
  sewer_confidence: Confidence;
  electric_provider: string | null;
  electric_confidence: Confidence;
  gas_type: "utility" | "propane_likely" | "unknown" | null;
  gas_confidence: Confidence;
  road_frontage: string | null;
  road_access_type: "public" | "private" | "unknown" | null;
  road_notes: string | null;
  road_confidence: Confidence;
  topography: string | null;
  flood_zone: string | null;
  drainage_notes: string | null;
  environmental_flags: string | null;
  easements: string | null;
  site_confidence: Confidence;
  permit_found: boolean | null;
  permit_date: string | null;
  permit_status: string | null;
  permit_jurisdiction: string | null;
  permit_notes: string | null;
  permit_confidence: Confidence;
  updated_at: string;
}

export interface GblContact {
  id: string;
  lead_id: string;
  type: ContactType;
  value: string;
  phone_type: PhoneType | null;
  source: string | null;
  confidence: Confidence;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface GblInteraction {
  id: string;
  lead_id: string;
  interaction_type: InteractionType;
  notes: string | null;
  outcome: string | null;
  author: string | null;
  created_at: string;
}

export interface GblResearch {
  id: string;
  property_id: string;
  category: ResearchCategory;
  finding: string;
  source_url: string | null;
  verification_status: Confidence;
  author: string | null;
  created_at: string;
}

export interface GblBuildProject {
  id: string;
  lead_id: string;
  property_id: string;
  timeline: string | null;
  desired_sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: string | null;
  basement: string | null;
  style: string | null;
  budget: string | null;
  goals: string | null;
  uncertainties: string | null;
  architect_status: string | null;
  builder_status: string | null;
  lender_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const CITY_OPTIONS: City[] = ["Spring Hill", "Gardner", "Olathe", "Unincorporated Johnson County", "Other"];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  vacant_residential: "Vacant residential land",
  residential_acreage: "Residential acreage",
  agricultural_potential_residential: "Agricultural (potential residential)",
  agricultural: "Agricultural",
  other: "Other",
};

export const OWNER_TYPE_LABEL: Record<OwnerType, string> = {
  individual: "Individual",
  couple: "Couple",
  trust: "Trust",
  llc: "LLC / Company",
  unknown: "Unknown",
};

export const PIPELINE_STATUS_LABEL: Record<PipelineStatus, string> = {
  discovered: "Discovered",
  qualified: "Qualified",
  ready_to_contact: "Ready to Contact",
  contacted: "Contacted",
  interested: "Interested",
  build_plan: "Build Plan",
  customer: "Customer",
  not_a_fit: "Not a Fit",
  do_not_contact: "Do Not Contact",
};

export const PIPELINE_STAGES: PipelineStatus[] = [
  "discovered",
  "qualified",
  "ready_to_contact",
  "contacted",
  "interested",
  "build_plan",
  "customer",
];

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  verified: "Verified",
  likely: "Likely",
  unknown: "Unknown",
  needs_confirmation: "Needs confirmation",
};

export const INTERACTION_TYPE_LABEL: Record<InteractionType, string> = {
  called: "Called",
  texted: "Texted",
  emailed: "Emailed",
  no_answer: "No Answer",
  interested: "Interested",
  not_interested: "Not Interested",
  wrong_number: "Wrong Number",
  do_not_contact: "Do Not Contact",
  note: "Note",
};
