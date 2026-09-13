import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PARTNER_REQUEST_STATUS_LABEL,
  PARTNER_REQUEST_STATUS_ORDER,
  PARTNER_REQUEST_TYPE_LABEL,
  type InvestorProfile,
  type PartnerRequest,
  type PartnerRequestStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_BADGE = "rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70";

export default async function AdminPartnerRequestsPage() {
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

  const [{ data: requestsData }, { data: accountsData }] = await Promise.all([
    supabase.from("partner_requests").select("*").order("created_at", { ascending: false }).returns<PartnerRequest[]>(),
    supabase.from("investor_profiles").select("*").returns<InvestorProfile[]>(),
  ]);
  const requests = requestsData ?? [];
  const accountById = new Map((accountsData ?? []).map((a) => [a.id, a]));

  const openStatuses: PartnerRequestStatus[] = PARTNER_REQUEST_STATUS_ORDER.filter((s) => s !== "closed" && s !== "not_interested");
  const open = requests.filter((r) => openStatuses.includes(r.status));
  const closed = requests.filter((r) => !openStatuses.includes(r.status));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Partner Desk — Operator View</h1>
        <p className="text-sm text-white/40">
          Research and outreach-assistance requests from Partner-tier accounts. Manual fulfillment is expected for
          the MVP — this is also how Groundbreakable learns what should eventually get automated.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/60">Open ({open.length})</h2>
        <div className="space-y-2">
          {open.map((r) => {
            const account = accountById.get(r.investor_profile_id);
            return (
              <Link
                key={r.id}
                href={`/dashboard/admin/partner-requests/${r.id}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-white/30"
              >
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/40">
                    {PARTNER_REQUEST_TYPE_LABEL[r.request_type]} · {account?.full_name ?? "Unknown account"}
                    {r.priority === "high" && <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-red-300">High Priority</span>}
                  </div>
                  <div className="font-medium text-white">{r.subject_label || r.question.slice(0, 80)}</div>
                  <div className="text-sm text-white/50">{r.question}</div>
                </div>
                <span className={STATUS_BADGE}>{PARTNER_REQUEST_STATUS_LABEL[r.status]}</span>
              </Link>
            );
          })}
          {open.length === 0 && <p className="text-sm text-white/40">Nothing open.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/60">Closed / Resolved ({closed.length})</h2>
        <div className="space-y-2">
          {closed.map((r) => {
            const account = accountById.get(r.investor_profile_id);
            return (
              <Link
                key={r.id}
                href={`/dashboard/admin/partner-requests/${r.id}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 opacity-70 transition hover:opacity-100"
              >
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/40">
                    {PARTNER_REQUEST_TYPE_LABEL[r.request_type]} · {account?.full_name ?? "Unknown account"}
                  </div>
                  <div className="font-medium text-white">{r.subject_label || r.question.slice(0, 80)}</div>
                </div>
                <span className={STATUS_BADGE}>{PARTNER_REQUEST_STATUS_LABEL[r.status]}</span>
              </Link>
            );
          })}
          {closed.length === 0 && <p className="text-sm text-white/40">Nothing closed yet.</p>}
        </div>
      </section>
    </div>
  );
}
