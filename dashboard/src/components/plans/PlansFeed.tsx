"use client";

import { ENTITLEMENT_CASE_STATUS_COLOR, ENTITLEMENT_CASE_STATUS_LABEL } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, SHIFT_CATEGORY_ICON_PATHS, SHIFT_CATEGORY_LABEL, SHIFT_IMPACT_COLOR, SHIFT_IMPACT_LABEL } from "@/lib/shiftConstants";
import { planItemDate, planItemKey, planItemTitle, type PlanItem } from "@/lib/planItems";
import { formatDate } from "@/lib/format";
import Icon from "../shifts/Icon";

// A merged shift + entitlement_cases feed -- one chronological list, each
// row tagged with which kind of Plan it is (see lib/planItems). Same
// scannable-row anatomy as ShiftFeed, extended with an Entitlement Case
// row variant instead of a second, separately-scrolling section.
export default function PlansFeed({
  plans,
  selectedPlanKey,
  onSelectPlan,
}: {
  plans: PlanItem[];
  selectedPlanKey: string | null;
  onSelectPlan: (key: string) => void;
}) {
  if (plans.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No plans match the current filters.</p>;
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/8">
      {plans.map((plan) => {
        const key = planItemKey(plan);
        const selected = key === selectedPlanKey;

        if (plan.kind === "shift") {
          const shift = plan.shift;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelectPlan(key)}
                className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${selected ? "bg-[#1c1c1c]/[0.05]" : ""}`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${SHIFT_CATEGORY_COLOR[shift.category]}1a`, color: SHIFT_CATEGORY_COLOR[shift.category] }}
                >
                  <Icon paths={SHIFT_CATEGORY_ICON_PATHS[shift.category]} className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                    <span style={{ color: SHIFT_CATEGORY_COLOR[shift.category] }}>{SHIFT_CATEGORY_LABEL[shift.category]}</span>
                    <span className="text-[#1c1c1c]/30">·</span>
                    <span className="text-[#1c1c1c]/40">{formatDate(planItemDate(plan))}</span>
                    <span
                      className="ml-auto rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal"
                      style={{ color: SHIFT_IMPACT_COLOR[shift.impact], backgroundColor: `${SHIFT_IMPACT_COLOR[shift.impact]}1a` }}
                    >
                      {SHIFT_IMPACT_LABEL[shift.impact]} impact
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#1c1c1c]">{shift.event}</span>
                  {(shift.stage || shift.address) && (
                    <span className="text-xs text-[#1c1c1c]/45">{[shift.stage, shift.address].filter(Boolean).join(" · ")}</span>
                  )}
                </div>
              </button>
            </li>
          );
        }

        const entitlementCase = plan.case;
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onSelectPlan(key)}
              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${selected ? "bg-[#1c1c1c]/[0.05]" : ""}`}
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <span className="rounded-full bg-[#818cf8]/15 px-2 py-0.5 text-[#818cf8]">Entitlement Case</span>
                <span className="text-[#1c1c1c]/30">·</span>
                <span className="text-[#1c1c1c]/40">{formatDate(planItemDate(plan))}</span>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal text-white"
                  style={{ backgroundColor: ENTITLEMENT_CASE_STATUS_COLOR[entitlementCase.status] }}
                >
                  {ENTITLEMENT_CASE_STATUS_LABEL[entitlementCase.status]}
                </span>
              </div>
              <span className="text-sm font-medium text-[#1c1c1c]">{planItemTitle(plan)}</span>
              {entitlementCase.proposed_use && <span className="text-xs text-[#1c1c1c]/45">{entitlementCase.proposed_use}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
