import type { InvestmentWithSource } from "@/lib/types";
import {
  INVESTMENT_MARKET_CATEGORY_LABEL,
  INVESTMENT_STATUS_COLOR,
  INVESTMENT_STATUS_LABEL,
  INVESTMENT_TYPE_LABEL,
  investmentSummary,
  type InvestmentMarketCategory,
} from "@/lib/investmentConstants";
import { formatCurrency, formatDate } from "@/lib/format";

// Spec section 9's top summary card: committed $, active count, major
// infrastructure count, incentivized count -- plus section 12's momentum
// read-out folded into the same card rather than a second one, since both
// are "how is capital moving in this market right now" at a glance.
//
// The Market tab's Infrastructure/Budget/Utilities/Incentive subcategories
// (Jared, 2026-09-29) are real sub-tabs on ShiftDashboardView, not chips on
// this card -- `investments` arrives here already filtered to the selected
// subcategory (or the full list under "Overview"), and `category` is just
// which one, for the empty-state copy.
export default function InvestmentSummary({
  investments,
  category,
}: {
  investments: InvestmentWithSource[];
  category: InvestmentMarketCategory | null;
}) {
  if (investments.length === 0) {
    return category ? (
      <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-sm text-[#1c1c1c]/40">
        No {INVESTMENT_MARKET_CATEGORY_LABEL[category].toLowerCase()} investments on file for this market yet.
      </div>
    ) : null;
  }

  const summary = investmentSummary(investments);
  const total = formatCurrency(summary.committedTotal);

  const levelLabel = { high: "High Investment Momentum", medium: "Medium Investment Momentum", low: "Low Investment Momentum" }[
    summary.level
  ];

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">{levelLabel}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1c1c1c]">
        {total ?? "$0"} <span className="text-sm font-normal text-[#1c1c1c]/50">committed / active investment</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#1c1c1c]/60">
        <span>{summary.activeCount} active investments</span>
        <span>{summary.infrastructureCount} major infrastructure projects</span>
        <span>{summary.incentivizedCount} incentivized projects</span>
      </div>
      {summary.isPartial && (
        <p className="mt-2 text-xs text-[#1c1c1c]/40">
          Coverage is partial — some active investments don't have a disclosed dollar amount yet, so this total is a floor, not a complete figure.
        </p>
      )}

      <ul className="mt-3 divide-y divide-[#1c1c1c]/8 border-t border-[#1c1c1c]/8 pt-3">
        {investments.map((investment) => (
          <li key={investment.id} className="flex items-start justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1c1c1c]">{investment.project_name}</p>
              <p className="mt-0.5 text-xs text-[#1c1c1c]/45">
                {[INVESTMENT_TYPE_LABEL[investment.investment_type], investment.asset_type, formatDate(investment.announcement_date)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {investment.total_investment_amount != null && (
                <span className="text-sm font-medium text-[#1c1c1c]">{formatCurrency(investment.total_investment_amount)}</span>
              )}
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
                style={{ backgroundColor: INVESTMENT_STATUS_COLOR[investment.project_status] }}
              >
                {INVESTMENT_STATUS_LABEL[investment.project_status]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
