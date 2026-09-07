import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPrivateClient, getActiveAcquisitionProfile } from "@/lib/queries/privateClients";
import { computePrivateClientScore, PRIVATE_CLIENT_SCORE_TIER_LABEL } from "@/lib/privateClientScoring";
import {
  ACQUISITION_DEVELOPMENT_STAGE_LABEL,
  ACQUISITION_PROPERTY_TYPE_LABEL,
  ACQUISITION_STRATEGIC_PREFERENCE_LABEL,
  PRIVATE_CLIENT_STATUS_LABEL,
  type Market,
} from "@/lib/types";
import { updatePrivateClient, upsertAcquisitionProfile } from "../actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";
const sectionTitleClass = "mb-3 text-xs font-medium uppercase tracking-wide text-white/40";
const triClass = "flex gap-3 text-sm text-white/70";

function TriBool({ name, defaultValue }: { name: string; defaultValue: boolean | null | undefined }) {
  return (
    <div className={triClass}>
      {(["true", "false", ""] as const).map((v) => (
        <label key={v || "unknown"} className="flex items-center gap-1">
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

export default async function PrivateClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: role } = user
    ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (role?.role !== "admin") {
    redirect("/dashboard");
  }

  const client = await getPrivateClient(supabase, params.id);
  if (!client) notFound();

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const trackedMarkets = markets ?? [];

  const activeProfile = getActiveAcquisitionProfile(client);
  const score = computePrivateClientScore(client, activeProfile, trackedMarkets);

  const updateClientAction = updatePrivateClient.bind(null, client.id);
  const upsertProfileAction = upsertAcquisitionProfile.bind(null, client.id, activeProfile?.id ?? null);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/admin/private-clients" className="text-xs text-white/40 hover:text-white">
            ← All Private Clients
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-white">{client.full_name}</h1>
          <p className="text-sm text-white/40">
            {[client.title, client.company].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/private/${client.id}`}
            className="rounded border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-white/30"
          >
            View Private Brief →
          </Link>
        </div>
      </div>

      {/* Groundbreakable Private Client Score */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>Groundbreakable Private Client Score</h2>
          <div className="text-right">
            <div className="text-3xl font-semibold text-white">{score.total}<span className="text-base text-white/30">/100</span></div>
            <div className="text-xs text-white/50">{PRIVATE_CLIENT_SCORE_TIER_LABEL[score.tier]}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-3 text-center text-xs text-white/50">
          <div><div className="text-lg font-medium text-white">{score.wealth}/25</div>Wealth / Capacity</div>
          <div><div className="text-lg font-medium text-white">{score.activity}/25</div>Development Activity</div>
          <div><div className="text-lg font-medium text-white">{score.intelValue}/25</div>Intel Value</div>
          <div><div className="text-lg font-medium text-white">{score.accessibility}/15</div>Accessibility</div>
          <div><div className="text-lg font-medium text-white">{score.geoFit}/10</div>Geographic Fit</div>
        </div>
        <p className="mt-3 text-xs text-white/35">
          Geographic Fit is computed automatically from the active acquisition profile's target markets. The other
          four require your research judgment — enter them in the form below.
        </p>
      </section>

      {/* Client profile edit */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className={sectionTitleClass}>Private Client Profile</h2>
        <form action={updateClientAction} className="grid grid-cols-2 gap-4">
          <div><label className={labelClass} htmlFor="full_name">Full Name</label><input id="full_name" name="full_name" defaultValue={client.full_name} required className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="title">Title</label><input id="title" name="title" defaultValue={client.title ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="company">Company</label><input id="company" name="company" defaultValue={client.company ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="location">Location</label><input id="location" name="location" defaultValue={client.location ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={client.email ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="phone">Phone / Cell</label><input id="phone" name="phone" defaultValue={client.phone ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="linkedin_url">LinkedIn</label><input id="linkedin_url" name="linkedin_url" type="url" defaultValue={client.linkedin_url ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="website">Website</label><input id="website" name="website" type="url" defaultValue={client.website ?? ""} className={inputClass} /></div>
          <div>
            <label className={labelClass} htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={client.status} className={inputClass}>
              {Object.entries(PRIVATE_CLIENT_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div><label className={labelClass} htmlFor="company_size">Company Size</label><input id="company_size" name="company_size" defaultValue={client.company_size ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="source_links">Source Links (comma-separated)</label><input id="source_links" name="source_links" defaultValue={client.source_links.join(", ")} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="markets_active">Markets Active In (comma-separated)</label><input id="markets_active" name="markets_active" defaultValue={client.markets_active.join(", ")} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="estimated_project_scale">Estimated Project Scale</label><input id="estimated_project_scale" name="estimated_project_scale" defaultValue={client.estimated_project_scale ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="deployable_capital_estimate">Deployable Capital Indicator</label><input id="deployable_capital_estimate" name="deployable_capital_estimate" defaultValue={client.deployable_capital_estimate ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="development_type">Development Type (comma-separated)</label><input id="development_type" name="development_type" defaultValue={client.development_type.join(", ")} className={inputClass} placeholder="multifamily, industrial, mixed-use" /></div>
          <div>
            <label className={labelClass}>Land-Heavy Strategy?</label>
            <TriBool name="land_heavy" defaultValue={client.land_heavy} />
          </div>
          <div>
            <label className={labelClass}>Entitlement-Heavy Strategy?</label>
            <TriBool name="entitlement_heavy" defaultValue={client.entitlement_heavy} />
          </div>
          <div className="col-span-2"><label className={labelClass} htmlFor="expansion_behavior">Expansion Behavior</label><textarea id="expansion_behavior" name="expansion_behavior" rows={2} defaultValue={client.expansion_behavior ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="likely_acquisition_criteria">Likely Acquisition Criteria (observed, pre-configured-profile)</label><textarea id="likely_acquisition_criteria" name="likely_acquisition_criteria" rows={2} defaultValue={client.likely_acquisition_criteria ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="publicly_stated_preferences">Publicly Stated Acquisition Preferences</label><textarea id="publicly_stated_preferences" name="publicly_stated_preferences" rows={2} defaultValue={client.publicly_stated_preferences ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="current_projects">Current Projects</label><textarea id="current_projects" name="current_projects" rows={2} defaultValue={client.current_projects ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="relevant_municipal_filings">Relevant Municipal Filings</label><textarea id="relevant_municipal_filings" name="relevant_municipal_filings" rows={2} defaultValue={client.relevant_municipal_filings ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="known_partners">Known Partners / Brokers / Builders</label><textarea id="known_partners" name="known_partners" rows={2} defaultValue={client.known_partners ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="notes">Internal Notes</label><textarea id="notes" name="notes" rows={2} defaultValue={client.notes ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className={sectionTitleClass}>Score Components (0-100 total)</h3>
          </div>
          <div><label className={labelClass} htmlFor="score_wealth">Wealth / Project Capacity (0-25)</label><input id="score_wealth" name="score_wealth" type="number" min={0} max={25} defaultValue={client.score_wealth ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="score_activity">Current Development Activity (0-25)</label><input id="score_activity" name="score_activity" type="number" min={0} max={25} defaultValue={client.score_activity ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="score_intel_value">Early Intelligence Value (0-25)</label><input id="score_intel_value" name="score_intel_value" type="number" min={0} max={25} defaultValue={client.score_intel_value ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="score_accessibility">Accessibility (0-15)</label><input id="score_accessibility" name="score_accessibility" type="number" min={0} max={15} defaultValue={client.score_accessibility ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="score_reasoning">Score Reasoning</label><textarea id="score_reasoning" name="score_reasoning" rows={2} defaultValue={client.score_reasoning ?? ""} className={inputClass} /></div>

          <div className="col-span-2">
            <button type="submit" className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
              Save Client Profile
            </button>
          </div>
        </form>
      </section>

      {/* Acquisition Profile */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className={sectionTitleClass}>Acquisition Profile{activeProfile ? "" : " (none yet — this will create one)"}</h2>
        <form action={upsertProfileAction} className="grid grid-cols-2 gap-4">
          <input type="hidden" name="profile_name" value={activeProfile?.profile_name ?? "Primary"} />

          <div className="col-span-2 border-b border-white/10 pb-2"><h3 className={sectionTitleClass}>Geography</h3></div>
          <div className="col-span-2">
            <label className={labelClass}>Groundbreakable-Tracked Target Markets</label>
            <div className="grid grid-cols-3 gap-2 rounded border border-white/10 bg-black/30 p-3">
              {trackedMarkets.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" name="target_market_ids" value={m.id} defaultChecked={activeProfile?.target_market_ids.includes(m.id)} />
                  {m.name}, {m.state}
                </label>
              ))}
            </div>
          </div>
          <div><label className={labelClass} htmlFor="target_states">Target States (comma-separated)</label><input id="target_states" name="target_states" defaultValue={activeProfile?.target_states.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="target_metros">Target Metros (comma-separated)</label><input id="target_metros" name="target_metros" defaultValue={activeProfile?.target_metros.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="target_cities">Target Cities (comma-separated)</label><input id="target_cities" name="target_cities" defaultValue={activeProfile?.target_cities.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="target_counties">Target Counties (comma-separated)</label><input id="target_counties" name="target_counties" defaultValue={activeProfile?.target_counties.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="max_distance_major_city_mi">Max Distance from Major City (mi)</label><input id="max_distance_major_city_mi" name="max_distance_major_city_mi" type="number" step="any" defaultValue={activeProfile?.max_distance_major_city_mi ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="max_distance_interstate_mi">Max Distance from Interstate (mi)</label><input id="max_distance_interstate_mi" name="max_distance_interstate_mi" type="number" step="any" defaultValue={activeProfile?.max_distance_interstate_mi ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="avoided_geographies">Avoided Geographies</label><input id="avoided_geographies" name="avoided_geographies" defaultValue={activeProfile?.avoided_geographies ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Property Type</h3></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded border border-white/10 bg-black/30 p-3">
            {Object.entries(ACQUISITION_PROPERTY_TYPE_LABEL).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="property_types" value={value} defaultChecked={activeProfile?.property_types.includes(value as never)} />
                {label}
              </label>
            ))}
          </div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Size</h3></div>
          <div><label className={labelClass} htmlFor="min_acres">Min Acres</label><input id="min_acres" name="min_acres" type="number" step="any" defaultValue={activeProfile?.min_acres ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="max_acres">Max Acres</label><input id="max_acres" name="max_acres" type="number" step="any" defaultValue={activeProfile?.max_acres ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="min_units">Min Units</label><input id="min_units" name="min_units" type="number" defaultValue={activeProfile?.min_units ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="max_units">Max Units</label><input id="max_units" name="max_units" type="number" defaultValue={activeProfile?.max_units ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="min_buildable_sqft">Min Buildable Sq Ft</label><input id="min_buildable_sqft" name="min_buildable_sqft" type="number" step="any" defaultValue={activeProfile?.min_buildable_sqft ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Development Stage</h3></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded border border-white/10 bg-black/30 p-3">
            {Object.entries(ACQUISITION_DEVELOPMENT_STAGE_LABEL).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="development_stages" value={value} defaultChecked={activeProfile?.development_stages.includes(value as never)} />
                {label}
              </label>
            ))}
          </div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Zoning</h3></div>
          <div><label className={labelClass} htmlFor="preferred_zoning">Preferred Zoning (comma-separated)</label><input id="preferred_zoning" name="preferred_zoning" defaultValue={activeProfile?.preferred_zoning.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="acceptable_zoning">Acceptable Zoning (comma-separated)</label><input id="acceptable_zoning" name="acceptable_zoning" defaultValue={activeProfile?.acceptable_zoning.join(", ") ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="rezoning_tolerance">Rezoning Tolerance</label><input id="rezoning_tolerance" name="rezoning_tolerance" defaultValue={activeProfile?.rezoning_tolerance ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="density_requirements">Density Requirements</label><input id="density_requirements" name="density_requirements" defaultValue={activeProfile?.density_requirements ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="future_land_use_preference">Future Land Use Preference</label><input id="future_land_use_preference" name="future_land_use_preference" defaultValue={activeProfile?.future_land_use_preference ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Infrastructure</h3></div>
          <div><label className={labelClass}>Sewer Required</label><TriBool name="requires_sewer" defaultValue={activeProfile?.requires_sewer} /></div>
          <div><label className={labelClass}>Water Required</label><TriBool name="requires_water" defaultValue={activeProfile?.requires_water} /></div>
          <div><label className={labelClass}>Electric Capacity Required</label><TriBool name="requires_electric_capacity" defaultValue={activeProfile?.requires_electric_capacity} /></div>
          <div><label className={labelClass}>Road Access Required</label><TriBool name="requires_road_access" defaultValue={activeProfile?.requires_road_access} /></div>
          <div><label className={labelClass}>Highway Access Required</label><TriBool name="requires_highway_access" defaultValue={activeProfile?.requires_highway_access} /></div>
          <div><label className={labelClass} htmlFor="max_interchange_distance_mi">Max Interchange Distance (mi)</label><input id="max_interchange_distance_mi" name="max_interchange_distance_mi" type="number" step="any" defaultValue={activeProfile?.max_interchange_distance_mi ?? ""} className={inputClass} /></div>
          <div><label className={labelClass}>Rail Access Required</label><TriBool name="requires_rail_access" defaultValue={activeProfile?.requires_rail_access} /></div>
          <div><label className={labelClass}>Fiber Access Required</label><TriBool name="requires_fiber_access" defaultValue={activeProfile?.requires_fiber_access} /></div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Growth Signals This Client Watches</h3></div>
          <div><label className={labelClass} htmlFor="population_growth_threshold_pct">Population Growth Threshold (%)</label><input id="population_growth_threshold_pct" name="population_growth_threshold_pct" type="number" step="any" defaultValue={activeProfile?.population_growth_threshold_pct ?? ""} className={inputClass} /></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded border border-white/10 bg-black/30 p-3">
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
              <label key={key} className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name={key} defaultChecked={activeProfile ? activeProfile[key] : false} />
                {label}
              </label>
            ))}
          </div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Financial</h3></div>
          <div><label className={labelClass} htmlFor="max_land_price">Max Land Price ($)</label><input id="max_land_price" name="max_land_price" type="number" step="any" defaultValue={activeProfile?.max_land_price ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="target_price_per_acre">Target Price / Acre ($)</label><input id="target_price_per_acre" name="target_price_per_acre" type="number" step="any" defaultValue={activeProfile?.target_price_per_acre ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="target_price_per_unit">Target Price / Unit ($)</label><input id="target_price_per_unit" name="target_price_per_unit" type="number" step="any" defaultValue={activeProfile?.target_price_per_unit ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="target_irr_pct">Target IRR (%)</label><input id="target_irr_pct" name="target_irr_pct" type="number" step="any" defaultValue={activeProfile?.target_irr_pct ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="hold_period_years">Hold Period (years)</label><input id="hold_period_years" name="hold_period_years" type="number" step="any" defaultValue={activeProfile?.hold_period_years ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="entitlement_strategy">Entitlement Strategy</label><input id="entitlement_strategy" name="entitlement_strategy" defaultValue={activeProfile?.entitlement_strategy ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="development_strategy">Development Strategy</label><input id="development_strategy" name="development_strategy" defaultValue={activeProfile?.development_strategy ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-b border-white/10 pb-2 pt-4"><h3 className={sectionTitleClass}>Strategic Preferences</h3></div>
          <div className="col-span-2 grid grid-cols-3 gap-2 rounded border border-white/10 bg-black/30 p-3">
            {Object.entries(ACQUISITION_STRATEGIC_PREFERENCE_LABEL).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="strategic_preferences" value={value} defaultChecked={activeProfile?.strategic_preferences.includes(value as never)} />
                {label}
              </label>
            ))}
          </div>

          <div className="col-span-2"><label className={labelClass} htmlFor="profile_notes">Profile Notes</label><textarea id="profile_notes" name="profile_notes" rows={2} defaultValue={activeProfile?.notes ?? ""} className={inputClass} /></div>

          <div className="col-span-2">
            <button type="submit" className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
              Save Acquisition Profile
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
