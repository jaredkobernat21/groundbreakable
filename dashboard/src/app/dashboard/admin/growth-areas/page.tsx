import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GrowthArea, Market } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL } from "@/lib/types";
import { createGrowthArea } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

// No source-citation section here, unlike every other admin form --
// growth_areas has no source_id column on purpose (see the Phase 1
// migration). A Growth Area is Groundbreakable's own synthesis across
// evidence (zoning, public investment, private momentum, land), not a
// single sourced fact -- the narrative field is where that reasoning
// goes, editorially, the way §10 describes it.
export default async function AdminGrowthAreasPage() {
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

  const [{ data: markets }, { data: areas }] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    supabase.from("growth_areas").select("*").order("name").returns<GrowthArea[]>(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Growth Areas — Admin</h1>
        <p className="text-sm text-white/40">
          Trace a region where city direction, public investment, private momentum, and land are converging.
          The narrative is the product here -- explain why the area matters, the way the map's detail panel
          will show it.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add a Growth Area</h2>
        <form action={createGrowthArea} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="market_id">Market</label>
            <select id="market_id" name="market_id" required className={inputClass}>
              {(markets ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}, {m.state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="name">Name</label>
            <input id="name" name="name" required className={inputClass} placeholder="e.g. Northwest Growth Area" />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="momentum_state">Momentum</label>
            <select id="momentum_state" name="momentum_state" defaultValue="emerging" className={inputClass}>
              <option value="emerging">Emerging</option>
              <option value="accelerating">Accelerating</option>
              <option value="established">Established</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="narrative">Why We're Watching (narrative)</label>
            <textarea
              id="narrative"
              name="narrative"
              rows={4}
              className={inputClass}
              placeholder={"Future land-use plan supports expansion\nSewer extension funded\n2 recent rezonings\n..."}
            />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="boundary">Boundary (GeoJSON Polygon or MultiPolygon)</label>
            <textarea
              id="boundary"
              name="boundary"
              rows={3}
              required
              className={`${inputClass} font-mono text-xs`}
              placeholder='{"type":"Polygon","coordinates":[[[lng,lat],[lng,lat],...]]}'
            />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
            >
              Add Growth Area
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">
          All Growth Areas ({(areas ?? []).length})
        </h2>
        <div className="space-y-3">
          {(areas ?? []).map((area) => (
            <div key={area.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-white/40">
                Momentum: {GROWTH_AREA_MOMENTUM_LABEL[area.momentum_state]}
              </div>
              <div className="font-medium text-white">{area.name}</div>
              {area.narrative && <div className="whitespace-pre-line text-sm text-white/50">{area.narrative}</div>}
            </div>
          ))}
          {(areas ?? []).length === 0 && <p className="text-sm text-white/40">No Growth Areas entered yet.</p>}
        </div>
      </section>
    </div>
  );
}
