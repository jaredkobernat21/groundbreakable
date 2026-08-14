import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type Market,
  type ProjectStatus,
  type ProjectWithSource,
} from "@/lib/types";
import { createSignal, logStatusUpdate } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORIES = Object.entries(PROJECT_CATEGORY_LABEL) as [string, string][];
const STATUSES = Object.entries(PROJECT_STATUS_LABEL) as [ProjectStatus, string][];
const SOURCE_TYPES = [
  ["agency_document", "Agency Document"],
  ["agency_gis", "Agency GIS / Parcel Record"],
  ["press_release", "Press Release"],
  ["news", "News Article"],
  ["public_record", "Public Record"],
  ["other", "Other"],
];

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

export default async function AdminIntelligencePage() {
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

  const [{ data: markets }, { data: projects }] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    supabase
      .from("projects")
      .select("*, source:sources(*)")
      .order("date_updated", { ascending: false })
      .returns<ProjectWithSource[]>(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Development Intelligence — Admin</h1>
        <p className="text-sm text-white/40">
          Add signals researched from real, citable sources. Nothing appears on the map without a
          source agency and URL.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add a Signal</h2>
        <form action={createSignal} className="grid grid-cols-2 gap-4">
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
            <label className={labelClass} htmlFor="category">Category</label>
            <select id="category" name="category" required className={inputClass}>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="subcategory">Subcategory (optional)</label>
            <input id="subcategory" name="subcategory" className={inputClass} placeholder="e.g. multifamily, rezoning R-1 to C-2" />
          </div>

          <div>
            <label className={labelClass} htmlFor="status">Status</label>
            <select id="status" name="status" required className={inputClass}>
              {STATUSES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
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
            <label className={labelClass} htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="address">Address / Location</label>
            <input id="address" name="address" className={inputClass} placeholder="Exactly as the source states it" />
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
            <label className={labelClass} htmlFor="project_value">Project Value ($, optional)</label>
            <input id="project_value" name="project_value" type="number" step="any" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="units">Units (optional)</label>
            <input id="units" name="units" type="number" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="acreage">Acreage (optional)</label>
            <input id="acreage" name="acreage" type="number" step="any" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="developer">Developer (optional)</label>
            <input id="developer" name="developer" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="investor">Investor (optional)</label>
            <input id="investor" name="investor" className={inputClass} placeholder="Capital partner / owner, if distinct from developer" />
          </div>
          <div>
            <label className={labelClass} htmlFor="contractor">Contractor / Builder (optional)</label>
            <input id="contractor" name="contractor" className={inputClass} placeholder="Leave blank if not yet hired" />
          </div>

          <div>
            <label className={labelClass} htmlFor="date_announced">Date Announced (optional)</label>
            <input id="date_announced" name="date_announced" type="date" className={inputClass} />
          </div>
          <div />

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
              {SOURCE_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
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
              className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400"
            >
              Add Signal
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">
          All Signals ({(projects ?? []).length})
        </h2>
        <div className="space-y-3">
          {(projects ?? []).map((project) => (
            <div key={project.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/40">
                    {PROJECT_CATEGORY_LABEL[project.category]}
                  </div>
                  <div className="font-medium text-white">{project.title}</div>
                  <div className="text-sm text-white/50">
                    {PROJECT_STATUS_LABEL[project.status]} · {project.address ?? "no address on file"}
                  </div>
                  {(project.developer || project.contractor || project.investor) && (
                    <div className="text-xs text-white/35">
                      {[
                        project.developer && `Developer: ${project.developer}`,
                        project.investor && `Investor: ${project.investor}`,
                        project.contractor && `Contractor: ${project.contractor}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                  {project.source && (
                    <a
                      href={project.source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-white/40 underline decoration-white/20 underline-offset-2 hover:text-white"
                    >
                      {project.source.agency}
                    </a>
                  )}
                </div>

                <form action={logStatusUpdate} className="flex shrink-0 items-end gap-2">
                  <input type="hidden" name="project_id" value={project.id} />
                  <div>
                    <label className={labelClass}>New Status</label>
                    <select name="status" defaultValue={project.status} className={`${inputClass} py-1.5`}>
                      {STATUSES.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input name="occurred_on" type="date" className={`${inputClass} py-1.5`} />
                  </div>
                  <div>
                    <label className={labelClass}>Note</label>
                    <input name="note" className={`${inputClass} w-40 py-1.5`} placeholder="optional" />
                  </div>
                  <button
                    type="submit"
                    className="rounded border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    Log Update
                  </button>
                </form>
              </div>
            </div>
          ))}
          {(projects ?? []).length === 0 && (
            <p className="text-sm text-white/40">No signals entered yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
