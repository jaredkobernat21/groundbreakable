import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOpportunityProfiles, getActiveOpportunityProfile } from "@/lib/queries/opportunityProfiles";
import {
  PARTNER_REQUEST_STATUS_LABEL,
  PARTNER_REQUEST_STATUS_ORDER,
  PARTNER_REQUEST_TYPE_LABEL,
  PROFESSIONAL_ROLE_LABEL,
  type InvestorProfile,
  type PartnerRequest,
} from "@/lib/types";
import { updatePartnerRequest } from "../actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";
const sectionTitleClass = "mb-3 text-xs font-medium uppercase tracking-wide text-white/40";

export default async function AdminPartnerRequestDetailPage({ params }: { params: { id: string } }) {
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

  const { data: requests } = await supabase.from("partner_requests").select("*").eq("id", params.id).returns<PartnerRequest[]>();
  const request = requests?.[0];
  if (!request) notFound();

  const { data: accounts } = await supabase.from("investor_profiles").select("*").eq("id", request.investor_profile_id).returns<InvestorProfile[]>();
  const account = accounts?.[0];
  const profiles = await getOpportunityProfiles(supabase, request.investor_profile_id);
  const activeProfile = getActiveOpportunityProfile(profiles);

  const updateAction = updatePartnerRequest.bind(null, request.id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/admin/partner-requests" className="text-xs text-white/40 hover:text-white">
          ← All Requests
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          {PARTNER_REQUEST_TYPE_LABEL[request.request_type]}: {request.subject_label || "Custom Request"}
        </h1>
        <p className="text-sm text-white/40">{request.question}</p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className={sectionTitleClass}>Client Context</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">Account</div>
            {account?.full_name ?? "Unknown"} — {account?.professional_role ? PROFESSIONAL_ROLE_LABEL[account.professional_role] : "no role set"}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">Opportunity Profile</div>
            {activeProfile ? (
              activeProfile.profile_type === "contractor" ? (
                <>Contractor — {activeProfile.trade ?? "trade not set"}, {activeProfile.travel_radius_mi ?? "?"} mi radius</>
              ) : (
                <>
                  Investor/Developer — {[...activeProfile.target_states, ...activeProfile.target_cities].join(", ") || "no geography set"},{" "}
                  {activeProfile.property_types.join(", ") || "no asset types set"}
                </>
              )
            ) : (
              "No Opportunity Profile configured"
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className={sectionTitleClass}>Workflow</h2>
        <form action={updateAction} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={request.status} className={inputClass}>
              {PARTNER_REQUEST_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{PARTNER_REQUEST_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="priority">Priority</label>
            <select id="priority" name="priority" defaultValue={request.priority} className={inputClass}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="assigned_to">Assigned To</label>
            <input id="assigned_to" name="assigned_to" defaultValue={request.assigned_to ?? ""} className={inputClass} />
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className={sectionTitleClass}>Research Brief</h3>
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="findings_summary">What We Found / Why It Matters</label>
            <textarea id="findings_summary" name="findings_summary" rows={3} defaultValue={request.findings_summary ?? ""} className={inputClass} />
          </div>
          <div><label className={labelClass} htmlFor="ownership_notes">Ownership / Entities</label><textarea id="ownership_notes" name="ownership_notes" rows={2} defaultValue={request.ownership_notes ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="planning_history">Planning History</label><textarea id="planning_history" name="planning_history" rows={2} defaultValue={request.planning_history ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="infrastructure_notes">Infrastructure</label><textarea id="infrastructure_notes" name="infrastructure_notes" rows={2} defaultValue={request.infrastructure_notes ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="zoning_notes">Zoning</label><textarea id="zoning_notes" name="zoning_notes" rows={2} defaultValue={request.zoning_notes ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="risks">Risks</label><textarea id="risks" name="risks" rows={2} defaultValue={request.risks ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="suggested_next_steps">Suggested Next Steps</label><textarea id="suggested_next_steps" name="suggested_next_steps" rows={2} defaultValue={request.suggested_next_steps ?? ""} className={inputClass} /></div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="source_links">Source Links (comma-separated)</label>
            <input id="source_links" name="source_links" defaultValue={request.source_links.join(", ")} className={inputClass} />
          </div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <h3 className={sectionTitleClass}>Outreach (research → qualification → initial interest → introduction only — no negotiating price/contracts, no representing either party)</h3>
          </div>
          <div><label className={labelClass} htmlFor="contact_name">Contact Name</label><input id="contact_name" name="contact_name" defaultValue={request.contact_name ?? ""} className={inputClass} /></div>
          <div><label className={labelClass} htmlFor="contact_method">Contact Method</label><input id="contact_method" name="contact_method" defaultValue={request.contact_method ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="contact_notes">Contact Notes</label><textarea id="contact_notes" name="contact_notes" rows={2} defaultValue={request.contact_notes ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="outreach_message">Outreach Message Sent</label><textarea id="outreach_message" name="outreach_message" rows={2} defaultValue={request.outreach_message ?? ""} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass} htmlFor="response_notes">Response (shown to client)</label><textarea id="response_notes" name="response_notes" rows={2} defaultValue={request.response_notes ?? ""} className={inputClass} /></div>

          <div className="col-span-2 border-t border-white/10 pt-4">
            <label className={labelClass} htmlFor="internal_notes">Internal Notes (not shown to client)</label>
            <textarea id="internal_notes" name="internal_notes" rows={2} defaultValue={request.internal_notes ?? ""} className={inputClass} />
          </div>

          <div className="col-span-2">
            <button type="submit" className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
