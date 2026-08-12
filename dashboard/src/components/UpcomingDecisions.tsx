import { DECISION_STATUS_LABEL, DECISION_TYPE_LABEL, type UpcomingDecisionWithSource } from "@/lib/types";
import { formatDate } from "@/lib/format";

const STATUS_STYLE: Record<UpcomingDecisionWithSource["status"], string> = {
  scheduled: "bg-[#1c1c1c]/5 text-[#1c1c1c]/60",
  decided: "bg-emerald-500/10 text-emerald-700",
  postponed: "bg-amber-500/10 text-amber-700",
  cancelled: "bg-[#1c1c1c]/5 text-[#1c1c1c]/35 line-through",
};

// Things scheduled to happen -- planning commission meetings, rezoning
// votes -- as distinct from News (things that already happened).
export default function UpcomingDecisions({ decisions }: { decisions: UpcomingDecisionWithSource[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/45">Upcoming Decisions</h2>
      {decisions.length === 0 ? (
        <p className="text-sm text-[#1c1c1c]/40">No upcoming decisions scheduled.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decisions.map((decision) => (
            <li key={decision.id} className="rounded-lg border border-[#1c1c1c]/10 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">
                  {DECISION_TYPE_LABEL[decision.decision_type]}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[decision.status]}`}>
                  {DECISION_STATUS_LABEL[decision.status]}
                </span>
              </div>
              <div className="mt-1 font-medium text-[#1c1c1c]">{decision.title}</div>
              <div className="mt-1 text-sm text-[#1c1c1c]/55">{formatDate(decision.decision_date)}</div>
              {decision.outcome && <p className="mt-1 text-sm text-[#1c1c1c]/55">{decision.outcome}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
