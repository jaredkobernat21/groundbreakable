"use client";

import { useState } from "react";
import type { CatalystWithSources, ProjectPersonWithSource, ShiftWithSource } from "@/lib/types";
import { CATALYSTS_COLOR, CATALYST_TYPE_LABEL, PROJECT_PERSON_ROLE_LABEL } from "@/lib/types";
import {
  SHIFT_CATEGORY_COLOR,
  SHIFT_CATEGORY_LABEL,
  SHIFT_IMPACT_COLOR,
  SHIFT_IMPACT_LABEL,
  shiftIconSvgMarkup,
} from "@/lib/shiftConstants";
import { deriveLocationLabel, deriveShiftWhatHappened, deriveShiftWhyItMatters } from "@/lib/planNarrative";
import { formatDate } from "@/lib/format";

// Same What Happened / Why It Matters / Key Details structure as
// PlanDetailPanel's entitlement-case card (Jared, 2026-09-29) -- shifts
// are the other half of "Plans" and deserve the same intelligence framing,
// even though their underlying data (shift.description) is already clean
// prose rather than a raw agenda dump. Same right-anchored overlay
// convention as every other detail panel.
export default function ShiftDetailPanel({
  shift,
  people,
  catalyst,
  onClose,
}: {
  shift: ShiftWithSource;
  people?: ProjectPersonWithSource[];
  catalyst?: CatalystWithSources | null;
  onClose: () => void;
}) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const color = SHIFT_CATEGORY_COLOR[shift.category];
  const linkedPeople = (people ?? []).filter((p) => p.related_record_type === "shift" && p.related_record_id === shift.id);
  const location = deriveLocationLabel({ address: shift.address });
  const whatHappened = deriveShiftWhatHappened(shift);
  const whyItMatters = deriveShiftWhyItMatters(shift);
  const isTruncated = Boolean(shift.description) && shift.description !== whatHappened;

  const keyDetails = [
    { label: "Date", value: formatDate(shift.event_date) },
    shift.shift_type && { label: "Case Type", value: shift.shift_type.replace(/_/g, " ") },
    shift.stage && { label: "Stage", value: shift.stage },
    { label: "Impact", value: SHIFT_IMPACT_LABEL[shift.impact] },
    { label: "Location", value: location },
  ].filter((x): x is { label: string; value: string } => Boolean(x && x.value));

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

      {catalyst && (
        <div
          className="mb-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ borderColor: `${CATALYSTS_COLOR}55`, color: CATALYSTS_COLOR, backgroundColor: `${CATALYSTS_COLOR}1a` }}
        >
          ⚡ Catalyst · {CATALYST_TYPE_LABEL[catalyst.catalyst_type]}
        </div>
      )}

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color }}
      >
        <span dangerouslySetInnerHTML={{ __html: shiftIconSvgMarkup(shift.category, { size: 12, stroke: color }) }} />
        {SHIFT_CATEGORY_LABEL[shift.category]}
        {shift.shift_type && <span className="text-white/40">· {shift.shift_type.replace(/_/g, " ")}</span>}
      </div>

      <h2 className="mb-0.5 text-base font-semibold leading-snug text-white">{shift.event}</h2>
      <p className="mb-4 text-sm text-white/50">{location}</p>

      <div className="mb-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/35">What Happened</p>
        <p className="text-sm leading-relaxed text-white/80">{whatHappened}</p>
        {isTruncated && (
          <button
            type="button"
            onClick={() => setShowFullDescription((v) => !v)}
            className="mt-1 text-[11px] font-medium text-white/35 hover:text-white/60"
          >
            {showFullDescription ? "Show less ▲" : "Show full description ▼"}
          </button>
        )}
        {isTruncated && showFullDescription && <p className="mt-2 text-sm leading-relaxed text-white/60">{shift.description}</p>}
      </div>

      <div className="mb-4 border-t border-white/10 pt-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/35">Why It Matters</p>
        <p className="text-sm leading-relaxed text-white/70">{whyItMatters}</p>
      </div>

      {keyDetails.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 text-sm">
          {keyDetails.map((detail) => (
            <div key={detail.label}>
              <dt className="text-[11px] uppercase tracking-wide text-white/35">{detail.label}</dt>
              <dd className="mt-0.5 font-medium text-white">{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {linkedPeople.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/35">Developers &amp; Contractors</p>
          <div className="flex flex-wrap gap-1.5">
            {linkedPeople.map((person) => (
              <span key={person.id} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                {PROJECT_PERSON_ROLE_LABEL[person.role]}: {person.person_name ?? person.company_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {shift.source && (
        <a
          href={shift.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block border-t border-white/10 pt-4 text-xs text-white/45 hover:text-white/80"
        >
          View original record — {shift.source.agency}
          {shift.source.title ? ` · ${shift.source.title}` : ""} ↗
        </a>
      )}
    </div>
  );
}
