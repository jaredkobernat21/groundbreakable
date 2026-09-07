"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

// Nullable boolean -- a three-way checkbox pattern (Required / Not
// Required / Unknown) is more honest for acquisition criteria than a
// plain checkbox: "unchecked" should mean "we don't know," not "no."
function triBool(formData: FormData, key: string): boolean | null {
  const value = str(formData, key);
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function csvArray(formData: FormData, key: string): string[] {
  const raw = str(formData, key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function checkboxArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string" && v.length > 0);
}

export async function createPrivateClient(formData: FormData) {
  const supabase = createClient();

  const fullName = str(formData, "full_name");
  if (!fullName) throw new Error("Full name is required.");

  const { data, error } = await supabase
    .from("private_clients")
    .insert({
      full_name: fullName,
      company: str(formData, "company"),
      title: str(formData, "title"),
      location: str(formData, "location"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      linkedin_url: str(formData, "linkedin_url"),
      website: str(formData, "website"),
      status: str(formData, "status") ?? "prospect",
      markets_active: csvArray(formData, "markets_active"),
      estimated_project_scale: str(formData, "estimated_project_scale"),
      deployable_capital_estimate: str(formData, "deployable_capital_estimate"),
      notes: str(formData, "notes"),
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create private client.");

  revalidatePath("/dashboard/admin/private-clients");
  redirect(`/dashboard/admin/private-clients/${data.id}`);
}

export async function updatePrivateClient(clientId: string, formData: FormData) {
  const supabase = createClient();

  const fullName = str(formData, "full_name");
  if (!fullName) throw new Error("Full name is required.");

  const { error } = await supabase
    .from("private_clients")
    .update({
      full_name: fullName,
      company: str(formData, "company"),
      title: str(formData, "title"),
      location: str(formData, "location"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      linkedin_url: str(formData, "linkedin_url"),
      website: str(formData, "website"),
      source_links: csvArray(formData, "source_links"),
      status: str(formData, "status") ?? "prospect",
      company_size: str(formData, "company_size"),
      markets_active: csvArray(formData, "markets_active"),
      estimated_project_scale: str(formData, "estimated_project_scale"),
      development_type: csvArray(formData, "development_type"),
      land_heavy: triBool(formData, "land_heavy"),
      entitlement_heavy: triBool(formData, "entitlement_heavy"),
      expansion_behavior: str(formData, "expansion_behavior"),
      likely_acquisition_criteria: str(formData, "likely_acquisition_criteria"),
      deployable_capital_estimate: str(formData, "deployable_capital_estimate"),
      publicly_stated_preferences: str(formData, "publicly_stated_preferences"),
      current_projects: str(formData, "current_projects"),
      relevant_municipal_filings: str(formData, "relevant_municipal_filings"),
      known_partners: str(formData, "known_partners"),
      notes: str(formData, "notes"),
      score_wealth: num(formData, "score_wealth"),
      score_activity: num(formData, "score_activity"),
      score_intel_value: num(formData, "score_intel_value"),
      score_accessibility: num(formData, "score_accessibility"),
      score_reasoning: str(formData, "score_reasoning"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/admin/private-clients/${clientId}`);
  revalidatePath("/dashboard/admin/private-clients");
  revalidatePath(`/dashboard/private/${clientId}`);
}

// One active acquisition profile per client for MVP -- upserts the
// existing active row if present, otherwise inserts a new "Primary"
// profile. Multiple named profiles (spec section 4's "configurable
// Acquisition Profile," plural in principle) can be added as a real
// multi-profile UI later; the schema already supports it.
export async function upsertAcquisitionProfile(clientId: string, existingProfileId: string | null, formData: FormData) {
  const supabase = createClient();

  const payload = {
    private_client_id: clientId,
    profile_name: str(formData, "profile_name") ?? "Primary",
    is_active: true,

    target_states: csvArray(formData, "target_states"),
    target_metros: csvArray(formData, "target_metros"),
    target_cities: csvArray(formData, "target_cities"),
    target_counties: csvArray(formData, "target_counties"),
    target_market_ids: checkboxArray(formData, "target_market_ids"),
    avoided_geographies: str(formData, "avoided_geographies"),
    max_distance_major_city_mi: num(formData, "max_distance_major_city_mi"),
    max_distance_interstate_mi: num(formData, "max_distance_interstate_mi"),

    property_types: checkboxArray(formData, "property_types"),
    min_acres: num(formData, "min_acres"),
    max_acres: num(formData, "max_acres"),
    min_units: num(formData, "min_units"),
    max_units: num(formData, "max_units"),
    min_buildable_sqft: num(formData, "min_buildable_sqft"),

    development_stages: checkboxArray(formData, "development_stages"),
    preferred_zoning: csvArray(formData, "preferred_zoning"),
    acceptable_zoning: csvArray(formData, "acceptable_zoning"),
    rezoning_tolerance: str(formData, "rezoning_tolerance"),
    density_requirements: str(formData, "density_requirements"),
    future_land_use_preference: str(formData, "future_land_use_preference"),

    requires_sewer: triBool(formData, "requires_sewer"),
    requires_water: triBool(formData, "requires_water"),
    requires_electric_capacity: triBool(formData, "requires_electric_capacity"),
    requires_road_access: triBool(formData, "requires_road_access"),
    requires_highway_access: triBool(formData, "requires_highway_access"),
    max_interchange_distance_mi: num(formData, "max_interchange_distance_mi"),
    requires_rail_access: triBool(formData, "requires_rail_access"),
    requires_fiber_access: triBool(formData, "requires_fiber_access"),

    population_growth_threshold_pct: num(formData, "population_growth_threshold_pct"),
    watches_job_growth: bool(formData, "watches_job_growth"),
    watches_employer_announcements: bool(formData, "watches_employer_announcements"),
    watches_housing_shortage: bool(formData, "watches_housing_shortage"),
    watches_new_schools: bool(formData, "watches_new_schools"),
    watches_road_investment: bool(formData, "watches_road_investment"),
    watches_utility_expansion: bool(formData, "watches_utility_expansion"),
    watches_annexation: bool(formData, "watches_annexation"),
    watches_capital_improvements: bool(formData, "watches_capital_improvements"),
    watches_municipal_incentives: bool(formData, "watches_municipal_incentives"),

    max_land_price: num(formData, "max_land_price"),
    target_price_per_acre: num(formData, "target_price_per_acre"),
    target_price_per_unit: num(formData, "target_price_per_unit"),
    target_irr_pct: num(formData, "target_irr_pct"),
    hold_period_years: num(formData, "hold_period_years"),
    entitlement_strategy: str(formData, "entitlement_strategy"),
    development_strategy: str(formData, "development_strategy"),
    strategic_preferences: checkboxArray(formData, "strategic_preferences"),

    notes: str(formData, "profile_notes"),
    updated_at: new Date().toISOString(),
  };

  const { error } = existingProfileId
    ? await supabase.from("acquisition_profiles").update(payload).eq("id", existingProfileId)
    : await supabase.from("acquisition_profiles").insert(payload);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/admin/private-clients/${clientId}`);
  revalidatePath(`/dashboard/private/${clientId}`);
}
