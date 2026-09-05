import type { ZoningLandUseWithSource } from "@/lib/types";

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#1c1c1c]/40">{label}</dt>
      <dd className="text-xs leading-relaxed text-[#1c1c1c]/80">{value}</dd>
    </div>
  );
}

// Shown for the selected zone in the Buildability tab -- either as a
// floating panel over the map (matching ShiftDetailPanel's convention) or
// inline in a list; ShiftDashboardView decides the layout, this just
// renders the fields Jared asked for: generally allowed, may require
// approval, dimensional standards, code considerations, and a summary.
export default function BuildabilityDetailPanel({ zone, onClose }: { zone: ZoningLandUseWithSource; onClose?: () => void }) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#1c1c1c]">{zone.title}</h3>
          {zone.description && <p className="mt-1 text-xs leading-relaxed text-[#1c1c1c]/60">{zone.description}</p>}
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-[#1c1c1c]/40 hover:text-[#1c1c1c]">
            ✕
          </button>
        )}
      </div>

      {zone.buildability_summary && (
        <p className="rounded-lg bg-[#1c1c1c]/5 p-2.5 text-xs leading-relaxed text-[#1c1c1c]/80">{zone.buildability_summary}</p>
      )}

      <dl className="space-y-2.5">
        <Row label="Generally allowed" value={zone.generally_allowed} />
        <Row label="May require approval" value={zone.may_require_approval} />
        <Row label="Minimum lot size" value={zone.min_lot_size} />
        <Row label="Height limit" value={zone.height_limit} />
        <Row label="Lot coverage" value={zone.lot_coverage} />
        <Row label="Parking requirements" value={zone.parking_requirements} />
        <Row label="Setbacks" value={zone.setbacks} />
        <Row label="Code considerations" value={zone.code_considerations} />
      </dl>

      <div className="flex items-center justify-between gap-2 border-t border-[#1c1c1c]/10 pt-2.5 text-[10px] text-[#1c1c1c]/40">
        <span>
          {zone.confidence === "verified" ? "Verified" : "Reported"} — confirm current rules with the city before relying on this
        </span>
        {zone.source && (
          <a href={zone.source.url} target="_blank" rel="noreferrer" className="shrink-0 underline decoration-[#1c1c1c]/30 underline-offset-2 hover:decoration-[#1c1c1c]">
            Source
          </a>
        )}
      </div>
    </div>
  );
}
