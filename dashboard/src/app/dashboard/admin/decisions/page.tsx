import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DECISION_STATUS_LABEL,
  DECISION_TYPE_LABEL,
  type Market,
  type ProjectWithSource,
  type UpcomingDecisionWithSource,
} from "@/lib/types";
import { createDecision, updateDecisionStatus } from "./actions";

export const dynamic = "force-dynamic";

const TYPES = Object.entries(DECISION_TYPE_LABEL) as [string, string][];
const STATUSES = Object.entries(DECISION_STATUS_LABEL) as [string, string][];

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

export default async function AdminDecisionsPage() {
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

  const [{ data: markets }, { data: projects }, { data: decisions }] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    supabase.from("projects").select("*, source:sources(*)").order("title").returns<ProjectWithSource[]>(),
    supabase
      .from("upcoming_decisions")
      .select("*, source:sources(*)")
      .order("decision_date", { ascending: true })
      .returns<UpcomingDecisionWithSource[]>(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Upcoming Decisions — Admin</h1>
        <p className="text-sm text-white/40">
          Scheduled planning commission meetings, rezoning votes, and other decisions members
          should know about before they happen.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add a Decision</h2>
        <form action={createDecision} className="grid grid-cols-2 gap-4">
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
            <input
              id="title"
              name="title"
              required
              className={inputClass}
              placeholder="e.g. Rezoning vote: 4200 SW Topeka Blvd (R-1 to C-2)"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="decision_type">Decision Type</label>
            <select id="decision_type" name="decision_type" required className={inputClass}>
              {TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="decision_date">Date</label>
            <input id="decision_date" name="decision_date" type="date" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="scheduled" className={inputClass}>
              {STATUSES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="project_id">Related Pipeline Project (optional)</label>
            <select id="project_id" name="project_id" defaultValue="" className={inputClass}>
              <option value="">None</option>
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="description">Description (optional)</label>
            <textarea id="description" name="description" rows={3} className={inputClass} />
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
              Source (optional)
            </h3>
          </div>

          <div>
            <label className={labelClass} htmlFor="source_agency">Source Agency</label>
            <input id="source_agency" name="source_agency" className={inputClass} placeholder="e.g. Topeka Planning Commission" />
          </div>
          <div>
            <label className={labelClass} htmlFor="source_type">Source Type</label>
            <select id="source_type" name="source_type" className={inputClass}>
              <option value="agency_document">Agency Document</option>
              <option value="press_release">Press Release</option>
              <option value="news">News Article</option>
              <option value="public_record">Public Record</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="source_title">Document / Agenda Title (optional)</label>
            <input id="source_title" name="source_title" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="source_published_date">Source Published Date (optional)</label>
            <input id="source_published_date" name="source_published_date" type="date" className={inputClass} />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="source_url">Source URL</label>
            <input id="source_url" name="source_url" type="url" className={inputClass} placeholder="https://…" />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400"
            >
              Add Decision
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">
          All Decisions ({(decisions ?? []).length})
        </h2>
        <div className="space-y-3">
          {(decisions ?? []).map((decision) => (
            <div key={decision.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/40">
                    {DECISION_TYPE_LABEL[decision.decision_type]} · {decision.decision_date}
                  </div>
                  <div className="font-medium text-white">{decision.title}</div>
                  <div className="text-sm text-white/50">
                    {DECISION_STATUS_LABEL[decision.status]}
                    {decision.outcome ? ` — ${decision.outcome}` : ""}
                  </div>
                  {decision.source && (
                    <a
                      href={decision.source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-white/40 underline decoration-white/20 underline-offset-2 hover:text-white"
                    >
                      {decision.source.agency}
                    </a>
                  )}
                </div>

                <form action={updateDecisionStatus} className="flex shrink-0 items-end gap-2">
                  <input type="hidden" name="decision_id" value={decision.id} />
                  <div>
                    <label className={labelClass}>Status</label>
                    <select name="status" defaultValue={decision.status} className={`${inputClass} py-1.5`}>
                      {STATUSES.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Outcome</label>
                    <input name="outcome" className={`${inputClass} w-40 py-1.5`} placeholder="e.g. Approved 5-2" />
                  </div>
                  <button
                    type="submit"
                    className="rounded border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          ))}
          {(decisions ?? []).length === 0 && (
            <p className="text-sm text-white/40">No decisions entered yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
