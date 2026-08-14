import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATALYST_STATUS_LABEL, CATALYST_TYPE_LABEL, type CatalystWithSource, type Market } from "@/lib/types";
import { clearCatalystSpotlight, createCatalyst, setCatalystSpotlight } from "./actions";

export const dynamic = "force-dynamic";

const TYPES = Object.entries(CATALYST_TYPE_LABEL) as [string, string][];
const STATUSES = Object.entries(CATALYST_STATUS_LABEL) as [string, string][];

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

export default async function AdminCatalystsPage() {
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

  const [{ data: markets }, { data: catalysts }] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    supabase
      .from("catalysts")
      .select("*, source:sources(*)")
      .order("last_verified_at", { ascending: false })
      .returns<CatalystWithSource[]>(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Catalysts — Admin</h1>
        <p className="text-sm text-white/40">
          Add major projects or decisions that could materially influence nearby development.
          Nothing appears on the map without a source agency and URL.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add a Catalyst</h2>
        <form action={createCatalyst} className="grid grid-cols-2 gap-4">
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
            <input id="title" name="title" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="catalyst_type">Catalyst Type</label>
            <select id="catalyst_type" name="catalyst_type" required className={inputClass}>
              {TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="planned" className={inputClass}>
              {STATUSES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="address">Address / Location (optional)</label>
            <input id="address" name="address" className={inputClass} />
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
            <label className={labelClass} htmlFor="influence_radius_meters">Watch Zone Radius (meters)</label>
            <input
              id="influence_radius_meters"
              name="influence_radius_meters"
              type="number"
              step="any"
              defaultValue={800}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">Used to draw a circle unless a traced boundary is given below.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="estimated_value">Estimated Value ($, optional)</label>
            <input id="estimated_value" name="estimated_value" type="number" step="any" className={inputClass} />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="boundary">Watch Zone Boundary (GeoJSON Polygon, optional)</label>
            <textarea
              id="boundary"
              name="boundary"
              rows={3}
              className={`${inputClass} font-mono text-xs`}
              placeholder='{"type":"Polygon","coordinates":[[[lng,lat],[lng,lat],...]]}'
            />
            <p className="mt-1 text-xs text-white/30">
              Leave blank to draw the watch zone as a circle from the radius above instead.
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="date_announced">Date Announced (optional)</label>
            <input id="date_announced" name="date_announced" type="date" className={inputClass} />
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
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Source</h3>
          </div>

          <div>
            <label className={labelClass} htmlFor="source_agency">Source Agency</label>
            <input id="source_agency" name="source_agency" required className={inputClass} placeholder="e.g. GO Topeka" />
          </div>
          <div>
            <label className={labelClass} htmlFor="source_type">Source Type</label>
            <select id="source_type" name="source_type" className={inputClass}>
              <option value="press_release">Press Release</option>
              <option value="agency_document">Agency Document</option>
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
              className="rounded bg-purple-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-purple-400"
            >
              Add Catalyst
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">
          All Catalysts ({(catalysts ?? []).length})
        </h2>
        <div className="space-y-3">
          {(catalysts ?? []).map((catalyst) => (
            <div key={catalyst.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                    {CATALYST_TYPE_LABEL[catalyst.catalyst_type]}
                    {catalyst.is_spotlight && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300">Spotlight</span>
                    )}
                  </div>
                  <div className="font-medium text-white">{catalyst.title}</div>
                  <div className="text-sm text-white/50">
                    {CATALYST_STATUS_LABEL[catalyst.status]} · {catalyst.address ?? "no address on file"}
                  </div>
                  {catalyst.source && (
                    <a
                      href={catalyst.source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-white/40 underline decoration-white/20 underline-offset-2 hover:text-white"
                    >
                      {catalyst.source.agency}
                    </a>
                  )}
                </div>

                {catalyst.is_spotlight ? (
                  <form action={clearCatalystSpotlight} className="shrink-0">
                    <input type="hidden" name="catalyst_id" value={catalyst.id} />
                    <button
                      type="submit"
                      className="rounded border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      Remove Spotlight
                    </button>
                  </form>
                ) : (
                  <form action={setCatalystSpotlight} className="shrink-0">
                    <input type="hidden" name="catalyst_id" value={catalyst.id} />
                    <input type="hidden" name="market_id" value={catalyst.market_id} />
                    <button
                      type="submit"
                      className="rounded border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10"
                    >
                      Set as Spotlight
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
          {(catalysts ?? []).length === 0 && (
            <p className="text-sm text-white/40">No catalysts entered yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
