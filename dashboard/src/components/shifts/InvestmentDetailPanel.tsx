import type { InvestmentWithSource } from "@/lib/types";
import {
  INVESTMENT_CONFIDENCE_LABEL,
  INVESTMENT_GEOGRAPHIC_SCOPE_LABEL,
  INVESTMENT_IMPACT_TAG_LABEL,
  INVESTMENT_STATUS_COLOR,
  INVESTMENT_STATUS_LABEL,
  INVESTMENT_TYPE_COLOR,
  INVESTMENT_TYPE_LABEL,
  investmentIconSvgMarkup,
} from "@/lib/investmentConstants";
import { formatCurrency, formatDate } from "@/lib/format";

// Spec section 10's click-through: name, $, type, status, timeline, then
// "WHY IT MATTERS", then developer/agency/amount/status/timeline/source.
// Same right-anchored overlay convention as ShiftDetailPanel.
export default function InvestmentDetailPanel({ investment, onClose }: { investment: InvestmentWithSource; onClose: () => void }) {
  const color = INVESTMENT_TYPE_COLOR[investment.investment_type];
  const amount = formatCurrency(investment.total_investment_amount);

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[360px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color }}
      >
        <span dangerouslySetInnerHTML={{ __html: investmentIconSvgMarkup(investment.investment_type, { size: 12, stroke: color }) }} />
        {INVESTMENT_TYPE_LABEL[investment.investment_type]}
        {investment.asset_type && <span className="text-white/40">· {investment.asset_type.replace(/_/g, " ")}</span>}
      </div>

      <h2 className="mb-1 text-base font-semibold leading-snug text-white">{investment.project_name}</h2>
      {amount && <p className="mb-1 text-lg font-semibold text-white">{amount}</p>}
      {investment.address && <p className="mb-4 text-sm text-white/50">{investment.address}</p>}

      <span
        className="mb-4 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{ color: INVESTMENT_STATUS_COLOR[investment.project_status], backgroundColor: `${INVESTMENT_STATUS_COLOR[investment.project_status]}1a` }}
      >
        {INVESTMENT_STATUS_LABEL[investment.project_status]}
      </span>

      {investment.why_it_matters && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Why it matters</p>
          <p className="text-sm text-white/80">{investment.why_it_matters}</p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Developer / Agency</dt>
          <dd className="text-white">{investment.developer_or_investor ?? investment.public_agency ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Confidence</dt>
          <dd className="text-white">{INVESTMENT_CONFIDENCE_LABEL[investment.confidence_level]}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Announced</dt>
          <dd className="text-white">{formatDate(investment.announcement_date) ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Expected Start</dt>
          <dd className="text-white">{formatDate(investment.expected_start_date) ?? "—"}</dd>
        </div>
        {investment.residential_units != null && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Units</dt>
            <dd className="text-white">{investment.residential_units}</dd>
          </div>
        )}
        {investment.acreage != null && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Acreage</dt>
            <dd className="text-white">{investment.acreage}</dd>
          </div>
        )}
        {investment.geographic_scope && (
          <div className="col-span-2">
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Geographic Impact</dt>
            <dd className="text-white">
              {INVESTMENT_GEOGRAPHIC_SCOPE_LABEL[investment.geographic_scope]}
              {investment.geographic_note ? ` — ${investment.geographic_note}` : ""}
            </dd>
          </div>
        )}
        {investment.primary_impact.length > 0 && (
          <div className="col-span-2">
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Impact</dt>
            <dd className="text-white">{investment.primary_impact.map((tag) => INVESTMENT_IMPACT_TAG_LABEL[tag]).join(", ")}</dd>
          </div>
        )}
      </dl>

      {investment.source && (
        <a
          href={investment.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block border-t border-white/10 pt-4 text-xs text-white/45 hover:text-white/80"
        >
          Source: {investment.source.agency}
          {investment.source.title ? ` — ${investment.source.title}` : ""} ↗
        </a>
      )}
    </div>
  );
}
