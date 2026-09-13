import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile, tierAtLeast } from "@/lib/tiers";
import {
  PARTNER_REQUEST_STATUS_LABEL,
  PARTNER_REQUEST_TYPE_LABEL,
  type PartnerRequest,
} from "@/lib/types";
import { submitPartnerRequest } from "./actions";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";
const inputClass =
  "w-full rounded-lg border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-[#1c1c1c]/40";

const RESEARCH_PROMPTS = [
  "Research this property.",
  "Figure out what is happening with this project.",
  "Tell me everything important about this corridor.",
  "Find out whether utilities can realistically support this site.",
  "Research the ownership structure.",
  "Find the developer behind this LLC.",
  "Check planning history.",
  "Find relevant city meeting discussions.",
  "Determine what development constraints exist.",
  "Compare this opportunity with another site.",
];

const STATUS_COLOR: Record<PartnerRequest["status"], string> = {
  submitted: "bg-[#1c1c1c]/15 text-[#1c1c1c]/70",
  reviewing: "bg-blue-100 text-blue-700",
  researching: "bg-blue-100 text-blue-700",
  ready: "bg-emerald-100 text-emerald-700",
  outreach_requested: "bg-amber-100 text-amber-700",
  contacted: "bg-amber-100 text-amber-700",
  interested: "bg-emerald-100 text-emerald-700",
  not_interested: "bg-red-100 text-red-700",
  introduction_made: "bg-emerald-600 text-white",
  closed: "bg-[#1c1c1c]/15 text-[#1c1c1c]/50",
};

export default async function PartnerDeskPage({
  searchParams,
}: {
  searchParams: { subject_type?: string; subject_id?: string; subject_label?: string };
}) {
  const supabase = createClient();
  const account = await getCurrentInvestorProfile(supabase);
  if (!account) redirect("/login");

  if (!tierAtLeast(account.subscription_tier, "partner")) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Partner Desk</h1>
        <div className={cardClass}>
          <p className="text-sm text-[#1c1c1c]/70">
            Partner Desk — personal research and initial-outreach assistance from the Groundbreakable team — is part
            of the <span className="font-medium text-[#1c1c1c]">Partner</span> plan.
          </p>
          <a href="/dashboard/profile" className="mt-4 inline-block rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]/85">
            Upgrade to Partner
          </a>
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from("partner_requests")
    .select("*")
    .eq("investor_profile_id", account.id)
    .order("created_at", { ascending: false })
    .returns<PartnerRequest[]>();
  const requests = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Partner Desk</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#1c1c1c]/60">
          Ask Groundbreakable to dig into something, or gauge whether a project/property contact is open to talking.
          We research, qualify interest, and make the introduction — you handle the actual conversation, pricing,
          and diligence from there.
        </p>
      </div>

      <section className={cardClass}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">New Request</h2>
        <form action={submitPartnerRequest} className="space-y-4">
          <div>
            <label className={labelClass}>Request Type</label>
            <div className="flex gap-4 text-sm text-[#1c1c1c]/70">
              <label className="flex items-center gap-2">
                <input type="radio" name="request_type" value="research" defaultChecked />
                Deeper Research
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="request_type" value="outreach" />
                Initial Outreach Assistance
              </label>
            </div>
          </div>

          {searchParams.subject_label && (
            <div className="rounded-lg border border-[#1c1c1c]/10 bg-[#1c1c1c]/[0.03] px-3 py-2 text-sm text-[#1c1c1c]/70">
              About: <span className="font-medium text-[#1c1c1c]">{searchParams.subject_label}</span>
            </div>
          )}
          <input type="hidden" name="subject_type" value={searchParams.subject_type ?? "custom"} />
          <input type="hidden" name="subject_id" value={searchParams.subject_id ?? ""} />
          <input type="hidden" name="subject_label" value={searchParams.subject_label ?? ""} />

          <div>
            <label className={labelClass} htmlFor="question">What do you want to know?</label>
            <textarea id="question" name="question" rows={3} required className={inputClass} placeholder="e.g. Research the ownership structure of this parcel." />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RESEARCH_PROMPTS.map((p) => (
                <span key={p} className="rounded-full bg-[#1c1c1c]/5 px-2.5 py-1 text-xs text-[#1c1c1c]/50">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#1c1c1c]/40">
            Outreach assistance is scoped to determining whether there's enough interest for a direct conversation
            — we don't negotiate price, negotiate contracts, represent either party, or make investment decisions
            for you.
          </p>

          <button type="submit" className="rounded-full bg-[#1c1c1c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1c1c1c]/85">
            Submit Request
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Your Requests</h2>
        {requests.map((r) => (
          <div key={r.id} className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">
                  {PARTNER_REQUEST_TYPE_LABEL[r.request_type]}
                  {r.subject_label ? ` — ${r.subject_label}` : ""}
                </div>
                <p className="mt-1 text-sm text-[#1c1c1c]/80">{r.question}</p>
              </div>
              <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                {PARTNER_REQUEST_STATUS_LABEL[r.status]}
              </span>
            </div>

            {r.findings_summary && (
              <div className="mt-3 rounded-lg border border-[#1c1c1c]/10 bg-[#1c1c1c]/[0.02] p-3 text-sm text-[#1c1c1c]/80">
                <div className="mb-1 text-xs uppercase tracking-wide text-[#1c1c1c]/40">Research Brief</div>
                <p>{r.findings_summary}</p>
                {r.risks && <p className="mt-1 text-[#1c1c1c]/60">Risks: {r.risks}</p>}
                {r.suggested_next_steps && <p className="mt-1 text-[#1c1c1c]/60">Next steps: {r.suggested_next_steps}</p>}
              </div>
            )}
            {r.response_notes && (
              <div className="mt-3 rounded-lg border border-[#1c1c1c]/10 bg-[#1c1c1c]/[0.02] p-3 text-sm text-[#1c1c1c]/80">
                <div className="mb-1 text-xs uppercase tracking-wide text-[#1c1c1c]/40">Response</div>
                <p>{r.response_notes}</p>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && <p className="text-sm text-[#1c1c1c]/40">No requests submitted yet.</p>}
      </section>
    </div>
  );
}
