"use client";

import type { CatalystWithSources } from "@/lib/types";
import { CATALYST_STATUS_LABEL, CATALYST_TYPE_LABEL } from "@/lib/types";
import { formatCurrency, formatRelativeVerified } from "@/lib/format";
import { catalystColorHex, CATALYST_COLOR_GROUP_LABEL, catalystColorGroup } from "@/lib/catalystTypeColors";

const CONFIDENCE_LABEL: Record<CatalystWithSources["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

// National map redesign (Jared, 2026-09-30) -- new, purpose-built panel
// matching Jared's example card exactly (title/type/stage/investment/why-it-
// matters/status/timeline/impact-area/sources/last-verified/Follow/View
// Source). Deliberately not an edit of components/catalysts/
// CatalystDetailPanel.tsx, which stays serving the old orphaned tabbed view
// and is tightly coupled to nearby-Plans/Opportunities props that don't
// apply here. Same premium dark-glass convention as that panel, trimmed.
export default function CatalystIntelligencePanel({
  catalyst,
  isFollowing,
  onToggleFollow,
  onClose,
}: {
  catalyst: CatalystWithSources;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onClose: () => void;
}) {
  const color = catalystColorHex(catalyst);
  const sources = [catalyst.source, ...catalyst.additionalSources].filter((s): s is NonNullable<typeof s> => s != null);

  return (
    <div className="absolute right-3 top-3 bottom-3 z-30 w-[380px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-xl">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color, backgroundColor: `${color}1a` }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {CATALYST_COLOR_GROUP_LABEL[catalystColorGroup(catalyst)]}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{catalyst.title}</h2>
      <div className="mt-1 text-sm text-white/50">
        {CATALYST_TYPE_LABEL[catalyst.catalyst_type]} · {CATALYST_STATUS_LABEL[catalyst.status]}
      </div>
      {catalyst.address && <div className="mt-1 text-sm text-white/40">{catalyst.address}</div>}

      {catalyst.estimated_value != null && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Investment</p>
          <p className="text-sm font-medium text-white">{formatCurrency(catalyst.estimated_value)}</p>
        </div>
      )}

      {catalyst.why_it_matters && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Why It Matters</p>
          <p className="text-sm leading-relaxed text-white/70">{catalyst.why_it_matters}</p>
        </div>
      )}

      {catalyst.expected_timeline && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Timeline</p>
          <p className="text-sm font-medium text-white">{catalyst.expected_timeline}</p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <span className="h-1.5 w-1.5 rounded-full border border-dashed" style={{ borderColor: color }} />
        Impact area shown on map
      </div>

      {sources.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Sources</p>
          <a
            href={sources[0].url}
            target="_blank"
            rel="noreferrer noopener"
            className="block rounded border border-white/10 px-3 py-2 text-center text-xs font-medium text-white/80 transition hover:border-white/30 hover:text-white"
          >
            View Source ↗
          </a>
          {sources.slice(1).map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer noopener" className="block text-xs text-white/45 hover:text-white/80">
              {source.agency}
              {source.title ? ` — ${source.title}` : ""} ↗
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onToggleFollow}
        className={`mt-4 w-full rounded px-3 py-2 text-sm font-medium transition ${
          isFollowing ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-black hover:bg-white/90"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[catalyst.confidence]}</div>
        {/* created_at/last_verified_at are timestamptz, not the plain `date`
            columns formatDate() expects (it appends "T00:00:00" to the raw
            value) -- format directly instead. */}
        <div>First detected {new Date(catalyst.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
        <div>Last verified {formatRelativeVerified(catalyst.last_verified_at)}</div>
      </div>
    </div>
  );
}
