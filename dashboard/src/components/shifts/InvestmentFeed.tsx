"use client";

import type { InvestmentWithSource } from "@/lib/types";
import {
  INVESTMENT_STATUS_COLOR,
  INVESTMENT_STATUS_LABEL,
  INVESTMENT_TYPE_COLOR,
  INVESTMENT_TYPE_LABEL,
} from "@/lib/investmentConstants";
import { formatCurrency, formatDate } from "@/lib/format";

// Spec section 11's card shape: name, $, asset type, status badge, unit
// count when residential, one-line "why it matters." Same list-of-cards
// convention as ShiftFeed/ProjectsList.
export default function InvestmentFeed({
  investments,
  selectedInvestmentId,
  onSelectInvestment,
}: {
  investments: InvestmentWithSource[];
  selectedInvestmentId: string | null;
  onSelectInvestment: (id: string) => void;
}) {
  if (investments.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No investments match the current filters.</p>;
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/8">
      {investments.map((inv) => {
        const amount = formatCurrency(inv.total_investment_amount);
        return (
          <li key={inv.id}>
            <button
              type="button"
              onClick={() => onSelectInvestment(inv.id)}
              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${
                inv.id === selectedInvestmentId ? "bg-[#1c1c1c]/[0.05]" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INVESTMENT_TYPE_COLOR[inv.investment_type] }} />
                <span style={{ color: INVESTMENT_TYPE_COLOR[inv.investment_type] }}>{INVESTMENT_TYPE_LABEL[inv.investment_type]}</span>
                {inv.announcement_date && (
                  <>
                    <span className="text-[#1c1c1c]/30">·</span>
                    <span className="text-[#1c1c1c]/40">{formatDate(inv.announcement_date)}</span>
                  </>
                )}
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal"
                  style={{ color: INVESTMENT_STATUS_COLOR[inv.project_status], backgroundColor: `${INVESTMENT_STATUS_COLOR[inv.project_status]}1a` }}
                >
                  {INVESTMENT_STATUS_LABEL[inv.project_status]}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-[#1c1c1c]">{inv.project_name}</span>
                {amount && <span className="text-sm font-semibold text-[#1c1c1c]">{amount}</span>}
              </div>

              <span className="text-xs text-[#1c1c1c]/45">
                {[inv.asset_type?.replace(/_/g, " "), inv.residential_units ? `${inv.residential_units} units` : null, inv.address]
                  .filter(Boolean)
                  .join(" · ")}
              </span>

              {inv.why_it_matters && (
                <p className="mt-1 text-xs text-[#1c1c1c]/60">
                  <span className="font-medium uppercase tracking-wide text-[#1c1c1c]/40">Why it matters — </span>
                  {inv.why_it_matters}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
