import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Market, ZoningLandUseWithSource } from "@/lib/types";
import { zoningLandUseAsOpportunityZone } from "@/lib/queries/planIntelligence";
import { createOpportunityZone } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

export default async function AdminOpportunityZonesPage() {
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

  const [{ data: markets }, { data: zoningLandUse }] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    supabase
      .from("zoning_land_use")
      .select("*, source:sources(*)")
      .eq("layer_type", "current_zoning")
      .order("last_verified_at", { ascending: false })
      .returns<ZoningLandUseWithSource[]>(),
  ]);
  const zones = zoningLandUseAsOpportunityZone(zoningLandUse ?? []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Opportunity Zones — Admin</h1>
        <p className="text-sm text-white/40">
          Trace areas with favorable zoning for development — a green-outlined parcel/area on the
          Opportunities map, distinct from individual property signals. Nothing appears on the map
          without a source agency and URL.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add an Opportunity Zone</h2>
        <form action={createOpportunityZone} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="market_id">Market</label>
            <select id="market_id" name="market_id" required className={inputClass}>
              {(markets ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}, {m.state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="title">Title</label>
            <input id="title" name="title" required className={inputClass} placeholder="e.g. North Topeka Riverfront Overlay" />
          </div>

          <div>
            <label className={labelClass} htmlFor="zoning_district">Zoning District (optional)</label>
            <input id="zoning_district" name="zoning_district" className={inputClass} placeholder="e.g. C-2 Commercial" />
          </div>
          <div>
            <label className={labelClass} htmlFor="confidence">Confidence</label>
            <select id="confidence" name="confidence" defaultValue="reported" className={inputClass}>
              <option value="verified">Verified against primary source</option>
              <option value="reported">Reported by named source</option>
              <option value="unconfirmed">Unconfirmed / preliminary</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="description">Description (optional)</label>
            <textarea id="description" name="description" rows={2} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="rezoning_notes">Rezoning Potential / Notes (optional)</label>
            <textarea id="rezoning_notes" name="rezoning_notes" rows={2} className={inputClass} />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="boundary">Boundary (GeoJSON Polygon)</label>
            <textarea
              id="boundary"
              name="boundary"
              rows={3}
              required
              className={`${inputClass} font-mono text-xs`}
              placeholder='{"type":"Polygon","coordinates":[[[lng,lat],[lng,lat],...]]}'
            />
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Source</h3>
          </div>

          <div>
            <label className={labelClass} htmlFor="source_agency">Source Agency</label>
            <input id="source_agency" name="source_agency" required className={inputClass} placeholder="e.g. City of Topeka Planning Department" />
          </div>
          <div>
            <label className={labelClass} htmlFor="source_type">Source Type</label>
            <select id="source_type" name="source_type" className={inputClass}>
              <option value="agency_document">Agency Document</option>
              <option value="agency_gis">Agency GIS / Parcel Record</option>
              <option value="press_release">Press Release</option>
              <option value="news">News Article</option>
              <option value="public_record">Public Record</option>
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
              Add Opportunity Zone
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">
          All Opportunity Zones ({zones.length})
        </h2>
        <div className="space-y-3">
          {zones.map((zone) => (
            <div key={zone.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-white/40">{zone.zoning_district ?? "No district on file"}</div>
              <div className="font-medium text-white">{zone.title}</div>
              {zone.description && <div className="text-sm text-white/50">{zone.description}</div>}
              {zone.source && (
                <a
                  href={zone.source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-white/40 underline decoration-white/20 underline-offset-2 hover:text-white"
                >
                  {zone.source.agency}
                </a>
              )}
            </div>
          ))}
          {zones.length === 0 && (
            <p className="text-sm text-white/40">No opportunity zones entered yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
