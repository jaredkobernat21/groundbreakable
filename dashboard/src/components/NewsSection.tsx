import { OPPORTUNITY_TYPE_LABEL, PROJECT_STATUS_LABEL, type OpportunityWithSource, type ProjectUpdateWithProject } from "@/lib/types";
import { formatRelativeVerified } from "@/lib/format";

// Headlines a member can scan in a few seconds to see what changed since
// their last visit -- no need to re-inspect the whole map. Sourced
// entirely from data that's already curated elsewhere (project_updates is
// an append-only log of admin status changes; opportunities are already
// timestamped), so News populates automatically as admins do their normal
// work rather than requiring a separate content-entry step.
export default function NewsSection({
  recentActivity,
  newOpportunities,
}: {
  recentActivity: ProjectUpdateWithProject[];
  newOpportunities: OpportunityWithSource[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/45">News</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[#1c1c1c]/40">No activity updates yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((update) => (
                <li key={update.id} className="border-b border-[#1c1c1c]/8 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs text-[#1c1c1c]/40">{formatRelativeVerified(update.created_at)}</div>
                  <div className="font-medium text-[#1c1c1c]">
                    {PROJECT_STATUS_LABEL[update.status]}: {update.project?.title ?? "Untitled project"}
                  </div>
                  {update.note && <p className="text-sm text-[#1c1c1c]/55">{update.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">New Opportunities</h3>
          {newOpportunities.length === 0 ? (
            <p className="text-sm text-[#1c1c1c]/40">No new opportunities yet.</p>
          ) : (
            <ul className="space-y-3">
              {newOpportunities.map((opp) => (
                <li key={opp.id} className="border-b border-[#1c1c1c]/8 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs text-[#1c1c1c]/40">{formatRelativeVerified(opp.created_at)}</div>
                  <div className="font-medium text-[#1c1c1c]">
                    {OPPORTUNITY_TYPE_LABEL[opp.opportunity_type]}: {opp.address}
                  </div>
                  <p className="text-sm text-[#1c1c1c]/55">{opp.why_flagged}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
