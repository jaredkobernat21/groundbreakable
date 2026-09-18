import type { EntitlementCaseStatus, EntitlementCaseWithSource } from "@/lib/types";
import EntitlementCaseCard from "./EntitlementCaseCard";

const STATUS_GROUPS: { label: string; statuses: EntitlementCaseStatus[] }[] = [
  { label: "Active / Pending Decision", statuses: ["pending", "deferred", "remanded"] },
  { label: "Approved", statuses: ["approved", "approved_with_conditions"] },
  { label: "Denied or Withdrawn", statuses: ["denied", "withdrawn"] },
];

// Same grouped-card layout as DevelopmentFrictionSection, grouped by
// status instead of friction kind -- what a developer scanning this
// market wants first is which cases are still live vs. already decided.
export default function EntitlementCasesSection({ cases, marketSlug }: { cases: EntitlementCaseWithSource[]; marketSlug: string }) {
  if (cases.length === 0) {
    return (
      <p className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-sm text-[#1c1c1c]/40">
        No entitlement cases on file for this market yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {STATUS_GROUPS.map((group) => {
        const groupCases = cases.filter((c) => group.statuses.includes(c.status));
        if (groupCases.length === 0) return null;

        return (
          <div key={group.label}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">{group.label}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {groupCases.map((entitlementCase) => (
                <EntitlementCaseCard key={entitlementCase.id} entitlementCase={entitlementCase} marketSlug={marketSlug} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
