"use client";

import { useState } from "react";
import {
  ACQUISITION_DEVELOPMENT_STAGE_LABEL,
  ACQUISITION_PROPERTY_TYPE_LABEL,
  ACQUISITION_STRATEGIC_PREFERENCE_LABEL,
  CONTRACTOR_DEVELOPER_TYPE_LABEL,
  CONTRACTOR_PROJECT_TYPE_LABEL,
  type Market,
  type OpportunityProfile,
  type OpportunityProfileType,
} from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-[#1c1c1c]/40";
const sectionTitleClass = "mb-3 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40";

function TriBool({ name, defaultValue }: { name: string; defaultValue: boolean | null | undefined }) {
  return (
    <div className="flex gap-4 text-sm text-[#1c1c1c]/70">
      {(["true", "false", ""] as const).map((v) => (
        <label key={v || "unknown"} className="flex items-center gap-1.5">
          <input
            type="radio"
            name={name}
            value={v}
            defaultChecked={defaultValue === null || defaultValue === undefined ? v === "" : String(defaultValue) === v}
          />
          {v === "true" ? "Required" : v === "false" ? "Not Required" : "Unknown"}
        </label>
      ))}
    </div>
  );
}

export default function OpportunityProfileForm({
  action,
  profile,
  markets,
  defaultProfileType,
}: {
  action: (formData: FormData) => void;
  profile: OpportunityProfile | null;
  markets: Market[];
  defaultProfileType: OpportunityProfileType;
}) {
  const [profileType, setProfileType] = useState<OpportunityProfileType>(profile?.profile_type ?? defaultProfileType);

  return (
    <form action={action} className="grid grid-cols-2 gap-4">
      <input type="hidden" name="profile_name" value={profile?.profile_name ?? "Primary"} />

      <div className="col-span-2">
        <label className={labelClass}>Profile Type</label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="profile_type"
              value="investor_developer"
              checked={profileType === "investor_developer"}
              onChange={() => setProfileType("investor_developer")}
            />
            Investor / Developer
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="profile_type"
              value="contractor"
              checked={profileType === "contractor"}
              onChange={() => setProfileType("contractor")}
            />
            Contractor
          </label>
        </div>
      </div>

      <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2"><h3 className={sectionTitleClass}>Geography</h3></div>
      <div className="col-span-2">
        <label className={labelClass}>Groundbreakable-Tracked Target Markets</label>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#1c1c1c]/10 bg-white p-3">
          {markets.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm text-[#1c1c1c]/70">
              <input type="checkbox" name="target_market_ids" value={m.id} defaultChecked={profile?.target_market_ids.includes(m.id)} />
              {m.name}, {m.state}
            </label>
          ))}
        </div>
      </div>
      <div><label className={labelClass} htmlFor="target_states">Target States (comma-separated)</label><input id="target_states" name="target_states" defaultValue={profile?.target_states.join(", ") ?? ""} className={inputClass} /></div>
      <div><label className={labelClass} htmlFor="target_metros">Target Metros (comma-separated)</label><input id="target_metros" name="target_metros" defaultValue={profile?.target_metros.join(", ") ?? ""} className={inputClass} /></div>
      <div><label className={labelClass} htmlFor="target_cities">Target Cities (comma-separated)</label><input id="target_cities" name="target_cities" defaultValue={profile?.target_cities.join(", ") ?? ""} className={inputClass} /></div>
      <div><label className={labelClass} htmlFor="target_counties">Target Counties (comma-separated)</label><input id="target_counties" name="target_counties" defaultValue={profile?.target_counties.join(", ") ?? ""} className={inputClass} /></div>
      <div><label className={labelClass} htmlFor="max_distance_major_city_mi">Max Distance from Major City (mi)</label><input id="max_distance_major_city_mi" name="max_distance_major_city_mi" type="number" step="any" defaultValue={profile?.max_distance_major_city_mi ?? ""} className={inputClass} /></div>
      <div><label className={labelClass} htmlFor="max_distance_interstate_mi">Max Distance from Interstate (mi)</label><input id="max_distance_interstate_mi" name="max_distance_interstate_mi" type="number" step="any" defaultValue={profile?.max_distance_interstate_mi ?? ""} className={inputClass} /></div>
      <div className="col-span-2"><label className={labelClass} htmlFor="avoided_geographies">Avoided Geographies</label><input id="avoided_geographies" name="avoided_geographies" defaultValue={profile?.avoided_geographies ?? ""} className={inputClass} /></div>

      {profileType === "investor_developer" ? (
        <>
          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Asset Types</h3></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded-lg border border-[#1c1c1c]/10 bg-white p-3">
            {Object.entries(ACQUISITION_PROPERTY_TYPE_LABEL).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-[#1c1c1c]/70">
                <input type="checkbox" name="property_types" value={value} defaultChecked={profile?.property_types.includes(value as never)} />
                {label}
              </label>
            ))}
          </div>

          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Size</h3></div>
          <div><label className={labelClass} htmlFor="min_acres">Min Acres</label><input id="min_acres" name="min_acres" type="number" step="any" defaultValue={profile?.min_acres ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="max_acres">Max Acres</label><input id="max_acres" name="max_acres" type="number" step="any" defaultValue={profile?.max_acres ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="min_units">Min Units</label><input id="min_units" name="min_units" type="number" defaultValue={profile?.min_units ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="max_units">Max Units</label><input id="max_units" name="max_units" type="number" defaultValue={profile?.max_units ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="min_buildable_sqft">Min Buildable Sq Ft</label><input id="min_buildable_sqft" name="min_buildable_sqft" type="number" step="any" defaultValue={profile?.min_buildable_sqft ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Development Stage & Zoning</h3></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded-lg border border-[#1c1c1c]/10 bg-white p-3">
            {Object.entries(ACQUISITION_DEVELOPMENT_STAGE_LABEL).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-[#1c1c1c]/70">
                <input type="checkbox" name="development_stages" value={value} defaultChecked={profile?.development_stages.includes(value as never)} />
                {label}
              </label>
            ))}
          </div>
          <div><label className={labelClass} htmlFor="preferred_zoning">Preferred Zoning (comma-separated)</label><input id="preferred_zoning" name="preferred_zoning" defaultValue={profile?.preferred_zoning.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="acceptable_zoning">Acceptable Zoning (comma-separated)</label><input id="acceptable_zoning" name="acceptable_zoning" defaultValue={profile?.acceptable_zoning.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="rezoning_tolerance">Willingness to Rezone</label><input id="rezoning_tolerance" name="rezoning_tolerance" defaultValue={profile?.rezoning_tolerance ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="density_requirements">Density Requirements</label><input id="density_requirements" name="density_requirements" defaultValue={profile?.density_requirements ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Infrastructure Requirements</h3></div>
          <div><label className={labelClass}>Sewer Availability</label><TriBool name="requires_sewer" defaultValue={profile?.requires_sewer} /></div>
          <div><label className={labelClass}>Water Availability</label><TriBool name="requires_water" defaultValue={profile?.requires_water} /></div>
          <div><label className={labelClass}>Highway Proximity</label><TriBool name="requires_highway_access" defaultValue={profile?.requires_highway_access} /></div>
          <div><label className={labelClass} htmlFor="max_interchange_distance_mi">Max Interchange Distance (mi)</label><input id="max_interchange_distance_mi" name="max_interchange_distance_mi" type="number" step="any" defaultValue={profile?.max_interchange_distance_mi ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Growth Signals You Watch</h3></div>
          <div><label className={labelClass} htmlFor="population_growth_threshold_pct">Population Growth Threshold (%)</label><input id="population_growth_threshold_pct" name="population_growth_threshold_pct" type="number" step="any" defaultValue={profile?.population_growth_threshold_pct ?? ""} className={inputClass} /></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded-lg border border-[#1c1c1c]/10 bg-white p-3">
            {([
              ["watches_job_growth", "Job Growth"],
              ["watches_employer_announcements", "Employer Announcements"],
              ["watches_housing_shortage", "Housing Shortage"],
              ["watches_new_schools", "New Schools"],
              ["watches_road_investment", "Road Investment"],
              ["watches_utility_expansion", "Utility Expansion"],
              ["watches_annexation", "Annexation Activity"],
              ["watches_capital_improvements", "Capital Improvements"],
              ["watches_municipal_incentives", "Municipal Incentives"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-[#1c1c1c]/70">
                <input type="checkbox" name={key} defaultChecked={profile ? profile[key] : false} />
                {label}
              </label>
            ))}
          </div>

          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Financial & Strategy</h3></div>
          <div><label className={labelClass} htmlFor="max_land_price">Target Price Range — Max ($)</label><input id="max_land_price" name="max_land_price" type="number" step="any" defaultValue={profile?.max_land_price ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="target_price_per_acre">Target Price / Acre ($)</label><input id="target_price_per_acre" name="target_price_per_acre" type="number" step="any" defaultValue={profile?.target_price_per_acre ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="entitlement_strategy">Entitlement Tolerance</label><input id="entitlement_strategy" name="entitlement_strategy" defaultValue={profile?.entitlement_strategy ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="development_strategy">Floodplain Tolerance</label><input id="development_strategy" name="development_strategy" defaultValue={profile?.development_strategy ?? ""} className={inputClass} /></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded-lg border border-[#1c1c1c]/10 bg-white p-3">
            {Object.entries(ACQUISITION_STRATEGIC_PREFERENCE_LABEL).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-[#1c1c1c]/70">
                <input type="checkbox" name="strategic_preferences" value={value} defaultChecked={profile?.strategic_preferences.includes(value as never)} />
                {label}
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Trade & Reach</h3></div>
          <div><label className={labelClass} htmlFor="trade">Trade</label><input id="trade" name="trade" defaultValue={profile?.trade ?? ""} placeholder="e.g. concrete, electrical, general contracting" className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="travel_radius_mi">Travel Radius (mi)</label><input id="travel_radius_mi" name="travel_radius_mi" type="number" step="any" defaultValue={profile?.travel_radius_mi ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="licensing_capabilities">Licensing / Service Capabilities (comma-separated)</label><input id="licensing_capabilities" name="licensing_capabilities" defaultValue={profile?.licensing_capabilities.join(", ") ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Preferred Project Types</h3></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded-lg border border-[#1c1c1c]/10 bg-white p-3">
            {Object.entries(CONTRACTOR_PROJECT_TYPE_LABEL).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-[#1c1c1c]/70">
                <input type="checkbox" name="preferred_project_types" value={value} defaultChecked={profile?.preferred_project_types.includes(value as never)} />
                {label}
              </label>
            ))}
          </div>

          <div className="col-span-2 border-b border-[#1c1c1c]/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Project Fit</h3></div>
          <div><label className={labelClass} htmlFor="min_contract_value">Minimum Estimated Contract Value ($)</label><input id="min_contract_value" name="min_contract_value" type="number" step="any" defaultValue={profile?.min_contract_value ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="preferred_lead_time">Preferred Lead Time</label><input id="preferred_lead_time" name="preferred_lead_time" defaultValue={profile?.preferred_lead_time ?? ""} placeholder="e.g. 3-6 months out" className={inputClass} /></div>
          <div className="col-span-2">
            <label className={labelClass}>Developer Type</label>
            <div className="flex gap-4 rounded-lg border border-[#1c1c1c]/10 bg-white p-3 text-sm text-[#1c1c1c]/70">
              {Object.entries(CONTRACTOR_DEVELOPER_TYPE_LABEL).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input type="checkbox" name="developer_type_preference" value={value} defaultChecked={profile?.developer_type_preference.includes(value as never)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="col-span-2 flex gap-6 rounded-lg border border-[#1c1c1c]/10 bg-white p-3 text-sm text-[#1c1c1c]/70">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requires_gc_unidentified" defaultChecked={profile?.requires_gc_unidentified} />
              Prioritize projects where no GC has been identified yet
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requires_subs_unassigned" defaultChecked={profile?.requires_subs_unassigned} />
              Prioritize projects where subs don't appear assigned yet
            </label>
          </div>
        </>
      )}

      <div className="col-span-2"><label className={labelClass} htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows={2} defaultValue={profile?.notes ?? ""} className={inputClass} /></div>

      <div className="col-span-2">
        <button type="submit" className="rounded-full bg-[#1c1c1c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1c1c1c]/85">
          Save Opportunity Profile
        </button>
      </div>
    </form>
  );
}
