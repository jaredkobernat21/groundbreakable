"use client";

import { useState } from "react";
import {
  DECISION_TYPE_LABEL,
  OPPORTUNITY_TYPE_LABEL,
  PROJECT_STATUS_LABEL,
  type OpportunityWithSource,
  type ProjectUpdateWithProject,
  type UpcomingDecisionWithSource,
} from "@/lib/types";
import { formatDate, formatRelativeVerified } from "@/lib/format";

function activityHeadline(update: ProjectUpdateWithProject) {
  return `${PROJECT_STATUS_LABEL[update.status]}: ${update.project?.title ?? "Untitled project"}`;
}

function opportunityHeadline(opp: OpportunityWithSource) {
  return `${OPPORTUNITY_TYPE_LABEL[opp.opportunity_type]}: ${opp.address}`;
}

// A member should be able to see what changed since their last visit in a
// few seconds, not by re-inspecting the whole map -- so News opens
// collapsed to a couple of highlights (one from each of the three feeds
// that has anything new) and expands on demand into the full breakdown.
export default function NewsSection({
  recentActivity,
  newOpportunities,
  decisions,
}: {
  recentActivity: ProjectUpdateWithProject[];
  newOpportunities: OpportunityWithSource[];
  decisions: UpcomingDecisionWithSource[];
}) {
  const [expanded, setExpanded] = useState(false);

  const highlights = [
    recentActivity[0] && {
      key: `activity-${recentActivity[0].id}`,
      kicker: "Recent Activity",
      title: activityHeadline(recentActivity[0]),
      meta: formatRelativeVerified(recentActivity[0].created_at),
    },
    newOpportunities[0] && {
      key: `opportunity-${newOpportunities[0].id}`,
      kicker: "New Opportunity",
      title: opportunityHeadline(newOpportunities[0]),
      meta: formatRelativeVerified(newOpportunities[0].created_at),
    },
    decisions[0] && {
      key: `decision-${decisions[0].id}`,
      kicker: "Upcoming Decision",
      title: decisions[0].title,
      meta: formatDate(decisions[0].decision_date),
    },
  ].filter((h): h is { key: string; kicker: string; title: string; meta: string | null } => Boolean(h));

  const hasMore = recentActivity.length > 0 || newOpportunities.length > 0 || decisions.length > 0;

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/45">News</h2>

      {highlights.length === 0 ? (
        <p className="text-sm text-[#1c1c1c]/40">No news yet.</p>
      ) : (
        <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h.key} className="border-b border-[#1c1c1c]/8 pb-3 last:border-0 last:pb-0">
                <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">
                  {h.kicker}
                  {h.meta && <span className="normal-case text-[#1c1c1c]/30"> · {h.meta}</span>}
                </div>
                <div className="font-medium text-[#1c1c1c]">{h.title}</div>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-[#1c1c1c]/55 hover:text-[#1c1c1c]"
            >
              {expanded ? "Show less" : "More news"}
              <span aria-hidden>{expanded ? "↑" : "→"}</span>
            </button>
          )}
        </div>
      )}

      {expanded && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-[#1c1c1c]/40">No activity updates yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((update) => (
                  <li key={update.id} className="border-b border-[#1c1c1c]/8 pb-3 last:border-0 last:pb-0">
                    <div className="text-xs text-[#1c1c1c]/40">{formatRelativeVerified(update.created_at)}</div>
                    <div className="font-medium text-[#1c1c1c]">{activityHeadline(update)}</div>
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
                    <div className="font-medium text-[#1c1c1c]">{opportunityHeadline(opp)}</div>
                    <p className="text-sm text-[#1c1c1c]/55">{opp.why_flagged}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Upcoming Decisions</h3>
            {decisions.length === 0 ? (
              <p className="text-sm text-[#1c1c1c]/40">No upcoming decisions scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {decisions.map((decision) => (
                  <li key={decision.id} className="border-b border-[#1c1c1c]/8 pb-3 last:border-0 last:pb-0">
                    <div className="text-xs text-[#1c1c1c]/40">
                      {DECISION_TYPE_LABEL[decision.decision_type]} · {formatDate(decision.decision_date)}
                    </div>
                    <div className="font-medium text-[#1c1c1c]">{decision.title}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
