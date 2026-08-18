import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OPPORTUNITY_TYPE_LABEL, type Market, type OpportunityWithSource } from "@/lib/types";
import { getAllActiveSignals, hydrateOpportunitySignals } from "@/lib/queries/planIntelligence";
import { createOpportunity } from "./actions";

export const dynamic = "force-dynamic";

const TYPES = Object.entries(OPPORTUNITY_TYPE_LABEL) as [string, string][];

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

export default async function AdminOpportunitiesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [{ data: markets }, { data: opportunities }, { data: activeSignals }] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    supabase
      .from("opportunities")
      .select("*, source:sources(*)")
      .order("last_verified_at", { ascending: false })
      .returns<OpportunityWithSource[]>(),
    getAllActiveSignals(supabase),
  ]);

  const hydratedOpportunities = hydrateOpportunitySignals(opportunities ?? [], activeSignals ?? []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Opportunities — Admin</h1>
        <p className="text-sm text-white/40">
          Add distressed/actionable property signals researched from real, citable sources.
          Nothing appears on the map without a source agency, URL, and a stated reason it was flagged.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add an Opportunity</h2>
        <form action={createOpportunity} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="market_id">Market</label>
            <select id="market_id" name="market_id" required className={inputClass}>
              {(markets ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}, {m.state}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Signals (select all that apply)</label>
            <div className="grid grid-cols-3 gap-2 rounded border border-white/10 bg-black/30 p-3">
              {TYPES.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" name="signals" value={value} className="h-4 w-4" />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-white/35">
              Properties with 2+ signals get a highlighted marker on the map.
            </p>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="address">Property Address</label>
            <input id="address" name="address" required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" type="number" step="any" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" type="number" step="any" required className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="listing_status">Listing Status (optional)</label>
            <input id="listing_status" name="listing_status" className={inputClass} placeholder="e.g. Active, Not Listed" />
          </div>

          <div>
            <label className={labelClass} htmlFor="owner_name">Owner Name (optional)</label>
            <input id="owner_name" name="owner_name" className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input id="is_absentee" name="is_absentee" type="checkbox" className="h-4 w-4" />
            <label htmlFor="is_absentee" className="text-sm text-white/70">Absentee owner</label>
          </div>

          <div>
            <label className={labelClass} htmlFor="years_owned">Years Owned (optional)</label>
            <input id="years_owned" name="years_owned" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="opportunity_score">Opportunity Score 0-100 (optional)</label>
            <input id="opportunity_score" name="opportunity_score" type="number" min={0} max={100} className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="estimated_equity">Estimated Equity ($, optional)</label>
            <input id="estimated_equity" name="estimated_equity" type="number" step="any" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="assessed_value">Assessed Value ($, optional)</label>
            <input id="assessed_value" name="assessed_value" type="number" step="any" className={inputClass} />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="distress_indicators">Distress Indicators (optional, comma-separated)</label>
            <input id="distress_indicators" name="distress_indicators" className={inputClass} placeholder="tax delinquent, vacant, code violation" />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="why_flagged">Why Groundbreakable Flagged It</label>
            <textarea id="why_flagged" name="why_flagged" rows={3} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="date_identified">Date Identified (optional)</label>
            <input id="date_identified" name="date_identified" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="confidence">Confidence</label>
            <select id="confidence" name="confidence" defaultValue="reported" className={inputClass}>
              <option value="verified">Verified against primary source</option>
              <option value="reported">Reported by named source</option>
              <option value="unconfirmed">Unconfirmed / preliminary</option>
            </select>
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
              Investment Potential (optional)
            </h3>
          </div>

          <div>
            <label className={labelClass} htmlFor="asking_price">Asking Price ($)</label>
            <input id="asking_price" name="asking_price" type="number" step="any" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="estimated_resale_value">Estimated Resale Value ($)</label>
            <input id="estimated_resale_value" name="estimated_resale_value" type="number" step="any" className={inputClass} />
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
              Signal Details (optional — fill in whichever apply)
            </h3>
          </div>

          <div>
            <label className={labelClass} htmlFor="original_list_price">Original List Price ($) — for Price Drop</label>
            <input id="original_list_price" name="original_list_price" type="number" step="any" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="lot_size_acres">Lot Size (acres) — for Underutilized Land</label>
            <input id="lot_size_acres" name="lot_size_acres" type="number" step="any" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="code_violation_count">Code Violation Count</label>
            <input id="code_violation_count" name="code_violation_count" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="vacant_since">Vacant Since</label>
            <input id="vacant_since" name="vacant_since" type="date" className={inputClass} />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="code_violation_summary">Code Violation Summary</label>
            <textarea id="code_violation_summary" name="code_violation_summary" rows={2} className={inputClass} />
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
              Buildability (optional)
            </h3>
          </div>

          <div>
            <label className={labelClass} htmlFor="zoning_district">Zoning District</label>
            <input id="zoning_district" name="zoning_district" className={inputClass} placeholder="e.g. R-1, C-2" />
          </div>
          <div>
            <label className={labelClass} htmlFor="rezoning_potential">Rezoning Potential</label>
            <input id="rezoning_potential" name="rezoning_potential" className={inputClass} placeholder="e.g. Favorable for multifamily" />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="permitted_uses">Potentially Buildable Uses</label>
            <textarea id="permitted_uses" name="permitted_uses" rows={2} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="buildability_notes">Notes (fire code, permits, constraints, etc.)</label>
            <textarea id="buildability_notes" name="buildability_notes" rows={2} className={inputClass} />
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Source</h3>
          </div>

          <div>
            <label className={labelClass} htmlFor="source_agency">Source Agency</label>
            <input id="source_agency" name="source_agency" required className={inputClass} placeholder="e.g. Shawnee County Assessor" />
          </div>
          <div>
            <label className={labelClass} htmlFor="source_type">Source Type</label>
            <select id="source_type" name="source_type" className={inputClass}>
              <option value="public_record">Public Record</option>
              <option value="agency_document">Agency Document</option>
              <option value="agency_gis">Agency GIS / Parcel Record</option>
              <option value="news">News Article</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="source_title">Document / Article Title (optional)</label>
            <input id="source_title" name="source_title" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="source_published_date">Source Published Date (optional)</label>
            <input id="source_published_date" name="source_published_date" type="date" className={inputClass} />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="source_url">Source URL</label>
            <input id="source_url" name="source_url" type="url" required className={inputClass} placeholder="https://…" />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
            >
              Add Opportunity
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">
          All Opportunities ({hydratedOpportunities.length})
        </h2>
        <div className="space-y-3">
          {hydratedOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-white/40">
                {opportunity.signals.map((s) => OPPORTUNITY_TYPE_LABEL[s]).join(" + ")}
              </div>
              <div className="font-medium text-white">{opportunity.address}</div>
              <div className="text-sm text-white/50">{opportunity.why_flagged}</div>
              {opportunity.source && (
                <a
                  href={opportunity.source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-white/40 underline decoration-white/20 underline-offset-2 hover:text-white"
                >
                  {opportunity.source.agency}
                </a>
              )}
            </div>
          ))}
          {hydratedOpportunities.length === 0 && (
            <p className="text-sm text-white/40">No opportunities entered yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
