"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

function triBool(formData: FormData, key: string): boolean | null {
  const value = str(formData, key);
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function csvArray(formData: FormData, key: string): string[] {
  const raw = str(formData, key);
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function checkboxArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string" && v.length > 0);
}

// Onboarding (spec section 1) + ongoing settings -- both are the same
// action, since the middleware onboarding gate just redirects here until
// professional_role is set. Tier is self-selectable for now: no billing
// is wired up yet (spec: "do not build complex billing yet"), so this
// is a plain preference toggle, not a paywall.
export async function updateRoleAndTier(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");

  const professionalRole = str(formData, "professional_role");
  const subscriptionTier = str(formData, "subscription_tier");
  if (!professionalRole) throw new Error("Choose a role to continue.");

  const { error } = await supabase
    .from("investor_profiles")
    .update({ professional_role: professionalRole, subscription_tier: subscriptionTier ?? "access" })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard", "layout");
}

// Self-service Opportunity Profile (spec section 2): the account owner
// writes their own row directly -- investor_profile_id is taken from the
// authenticated session server-side, never trusted from the form, so a
// client can only ever create/edit their own profile regardless of what
// a tampered request claims.
export async function upsertOpportunityProfile(existingProfileId: string | null, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");

  const payload = {
    investor_profile_id: user.id,
    profile_name: str(formData, "profile_name") ?? "Primary",
    is_active: true,
    profile_type: str(formData, "profile_type") ?? "investor_developer",

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
    watches_job_growth: formData.get("watches_job_growth") === "on",
    watches_employer_announcements: formData.get("watches_employer_announcements") === "on",
    watches_housing_shortage: formData.get("watches_housing_shortage") === "on",
    watches_new_schools: formData.get("watches_new_schools") === "on",
    watches_road_investment: formData.get("watches_road_investment") === "on",
    watches_utility_expansion: formData.get("watches_utility_expansion") === "on",
    watches_annexation: formData.get("watches_annexation") === "on",
    watches_capital_improvements: formData.get("watches_capital_improvements") === "on",
    watches_municipal_incentives: formData.get("watches_municipal_incentives") === "on",
    max_land_price: num(formData, "max_land_price"),
    target_price_per_acre: num(formData, "target_price_per_acre"),
    target_price_per_unit: num(formData, "target_price_per_unit"),
    target_irr_pct: num(formData, "target_irr_pct"),
    hold_period_years: num(formData, "hold_period_years"),
    entitlement_strategy: str(formData, "entitlement_strategy"),
    development_strategy: str(formData, "development_strategy"),
    strategic_preferences: checkboxArray(formData, "strategic_preferences"),

    trade: str(formData, "trade"),
    travel_radius_mi: num(formData, "travel_radius_mi"),
    preferred_project_types: checkboxArray(formData, "preferred_project_types"),
    min_contract_value: num(formData, "min_contract_value"),
    preferred_lead_time: str(formData, "preferred_lead_time"),
    developer_type_preference: checkboxArray(formData, "developer_type_preference"),
    requires_gc_unidentified: formData.get("requires_gc_unidentified") === "on",
    requires_subs_unassigned: formData.get("requires_subs_unassigned") === "on",
    licensing_capabilities: csvArray(formData, "licensing_capabilities"),

    notes: str(formData, "notes"),
    updated_at: new Date().toISOString(),
  };

  const { error } = existingProfileId
    ? await supabase.from("opportunity_profiles").update(payload).eq("id", existingProfileId).eq("investor_profile_id", user.id)
    : await supabase.from("opportunity_profiles").insert(payload);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/opportunities");
}
