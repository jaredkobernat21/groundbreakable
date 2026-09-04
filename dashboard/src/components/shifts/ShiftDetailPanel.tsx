import type { ShiftWithSource } from "@/lib/types";
import {
  SHIFT_AUDIENCE_LABEL,
  SHIFT_CATEGORY_COLOR,
  SHIFT_CATEGORY_LABEL,
  SHIFT_IMPACT_COLOR,
  SHIFT_IMPACT_LABEL,
  shiftIconSvgMarkup,
} from "@/lib/shiftConstants";
import { formatDate } from "@/lib/format";

// The five dimensions -- Event, Date, Stage, Impact, Audience -- plus
// address/source. Same absolute-overlay convention as ProjectDetailPanel/
// OpportunityDetailPanel etc: right-anchored panel over the map.
export default function ShiftDetailPanel({ shift, onClose }: { shift: ShiftWithSource; onClose: () => void }) {
  const color = SHIFT_CATEGORY_COLOR[shift.category];

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[340px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 text-white/40 hover:text-white"
      >
        ✕
      </button>

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color }}
      >
        <span dangerouslySetInnerHTML={{ __html: shiftIconSvgMarkup(shift.category, { size: 12, stroke: color }) }} />
        {SHIFT_CATEGORY_LABEL[shift.category]}
        {shift.shift_type && <span className="text-white/40">· {shift.shift_type.replace(/_/g, " ")}</span>}
      </div>

      <h2 className="mb-1 text-base font-semibold leading-snug text-white">{shift.event}</h2>
      {shift.address && <p className="mb-4 text-sm text-white/50">{shift.address}</p>}
      {shift.description && <p className="mb-4 text-sm text-white/70">{shift.description}</p>}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Date</dt>
          <dd className="text-white">{formatDate(shift.event_date) ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Stage</dt>
          <dd className="text-white">{shift.stage ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Impact</dt>
          <dd style={{ color: SHIFT_IMPACT_COLOR[shift.impact] }}>{SHIFT_IMPACT_LABEL[shift.impact]}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Audience</dt>
          <dd className="text-white">
            {shift.audience.length > 0 ? shift.audience.map((a) => SHIFT_AUDIENCE_LABEL[a]).join(", ") : "—"}
          </dd>
        </div>
      </dl>

      {shift.source && (
        <a
          href={shift.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block border-t border-white/10 pt-4 text-xs text-white/45 hover:text-white/80"
        >
          Source: {shift.source.agency}
          {shift.source.title ? ` — ${shift.source.title}` : ""} ↗
        </a>
      )}
    </div>
  );
}
