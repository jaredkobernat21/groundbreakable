import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveAsEvent, approveAsNewProject, rejectIntakeRecord } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";

type Extraction = {
  title: string;
  project_type: string | null;
  event_type: string;
  address: string | null;
  applicant: string | null;
  acreage: number | null;
  zoning_from: string | null;
  zoning_to: string | null;
  summary: string;
} | null;

type RawPayload = {
  item_url?: string;
  heading?: string;
  status?: string;
  description?: string;
  case_number?: string;
  extraction?: Extraction;
};

type QueueItem = {
  id: string;
  reason: string;
  candidate_matches: { project_id: string; confidence: number; reason: string }[] | null;
  created_at: string;
  intake_record: {
    id: string;
    market_id: string;
    raw_payload: RawPayload;
    extracted_title: string | null;
    extracted_event_type: string | null;
    extracted_address: string | null;
    match_confidence: number | null;
    candidate_project_id: string | null;
    source: { id: string; agency: string; url: string } | null;
    candidate_project: { id: string; title: string; case_number: string | null; address: string | null } | null;
  };
};

// The human-in-the-loop step the collection script (Phase 6,
// scripts/collectTopekaPlanningCommission.ts) hands every discovered
// item off to -- nothing that script finds becomes a confirmed,
// investor-visible fact without landing here first and getting an
// explicit decision.
export default async function ReviewQueuePage() {
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

  const { data: queueItems } = await supabase
    .from("intake_review_queue")
    .select(
      "*, intake_record:intake_records(*, source:sources(id, agency, url), candidate_project:projects(id, title, case_number, address))"
    )
    .eq("resolved", false)
    .order("created_at", { ascending: true })
    .returns<QueueItem[]>();

  const items = queueItems ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Review Queue — Admin</h1>
        <p className="text-sm text-white/40">
          Everything the collection pipeline discovers lands here before it becomes a confirmed project or
          event. Confirm the match, create a new project, or reject the item.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">
          Nothing pending review. Run <code className="text-white/60">npm run collect:topeka-planning</code> from{" "}
          <code className="text-white/60">dashboard/</code> to discover new items.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const record = item.intake_record;
            const payload = record.raw_payload ?? {};
            const extraction = payload.extraction ?? null;
            const candidate = record.candidate_project;

            return (
              <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/40">{payload.case_number ?? "No case number"}</div>
                    <div className="text-lg font-medium text-white">{record.extracted_title}</div>
                    {record.extracted_address && <div className="text-sm text-white/50">{record.extracted_address}</div>}
                  </div>
                  {record.source && (
                    <a
                      href={record.source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-white/40 underline decoration-white/20 underline-offset-2 hover:text-white"
                    >
                      View source ↗
                    </a>
                  )}
                </div>

                {extraction && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-white/70 sm:grid-cols-4">
                    {extraction.applicant && (
                      <div>
                        <dt className="text-[11px] uppercase text-white/35">Applicant</dt>
                        <dd>{extraction.applicant}</dd>
                      </div>
                    )}
                    {extraction.acreage != null && (
                      <div>
                        <dt className="text-[11px] uppercase text-white/35">Acreage</dt>
                        <dd>{extraction.acreage} ac</dd>
                      </div>
                    )}
                    {extraction.zoning_from && extraction.zoning_to && (
                      <div>
                        <dt className="text-[11px] uppercase text-white/35">Zoning</dt>
                        <dd>
                          {extraction.zoning_from} → {extraction.zoning_to}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[11px] uppercase text-white/35">Event type</dt>
                      <dd>{record.extracted_event_type}</dd>
                    </div>
                  </dl>
                )}

                {extraction?.summary && <p className="mt-3 text-sm leading-relaxed text-white/70">{extraction.summary}</p>}

                <div className="mt-4 rounded border border-white/10 bg-black/20 p-3 text-sm text-white/60">
                  <span className="text-white/40">{item.reason}</span>
                  {candidate && (
                    <div className="mt-1 text-white">
                      Candidate: <span className="font-medium">{candidate.title}</span>{" "}
                      {candidate.case_number && <span className="text-white/40">({candidate.case_number})</span>}
                      {record.match_confidence != null && (
                        <span className="text-white/40"> · confidence {(record.match_confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-white/10 pt-4">
                  {candidate && (
                    <form action={approveAsEvent}>
                      <input type="hidden" name="review_queue_id" value={item.id} />
                      <input type="hidden" name="intake_record_id" value={record.id} />
                      <input type="hidden" name="project_id" value={candidate.id} />
                      <button
                        type="submit"
                        className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
                      >
                        Confirm match → log event on {candidate.title}
                      </button>
                    </form>
                  )}

                  <form action={approveAsNewProject} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="review_queue_id" value={item.id} />
                    <input type="hidden" name="intake_record_id" value={record.id} />
                    <div>
                      <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/40">Latitude</label>
                      <input name="latitude" type="number" step="any" required className={`${inputClass} w-28`} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/40">Longitude</label>
                      <input name="longitude" type="number" step="any" required className={`${inputClass} w-28`} />
                    </div>
                    <button
                      type="submit"
                      className="rounded border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
                    >
                      This is a new project
                    </button>
                  </form>

                  <form action={rejectIntakeRecord}>
                    <input type="hidden" name="review_queue_id" value={item.id} />
                    <input type="hidden" name="intake_record_id" value={record.id} />
                    <button type="submit" className="rounded px-4 py-2 text-sm text-white/40 transition hover:text-white/70">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
