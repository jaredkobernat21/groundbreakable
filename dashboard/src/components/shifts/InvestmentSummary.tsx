import type { InvestmentWithSource } from "@/lib/types";
import { investmentSummary } from "@/lib/investmentConstants";
import { formatCurrency } from "@/lib/format";

// Spec section 9's top summary card: committed $, active count, major
// infrastructure count, incentivized count -- plus section 12's momentum
// read-out folded into the same card rather than a second one, since both
// are "how is capital moving in this market right now" at a glance.
export default function InvestmentSummary({ investments }: { investments: InvestmentWithSource[] }) {
  if (investments.length === 0) {
    return null;
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
    </div>
  );
}
