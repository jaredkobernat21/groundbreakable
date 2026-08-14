import { OPPORTUNITIES_COLOR, type OpportunityZoneWithSource } from "@/lib/types";
import { formatRelativeVerified } from "@/lib/format";

const CONFIDENCE_LABEL: Record<OpportunityZoneWithSource["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

export default function OpportunityZoneDetailPanel({
  zone,
  onClose,
}: {
  zone: OpportunityZoneWithSource;
  onClose: () => void;
}) {
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
        style={{
          borderColor: `${OPPORTUNITIES_COLOR}55`,
          color: OPPORTUNITIES_COLOR,
          backgroundColor: `${OPPORTUNITIES_COLOR}1a`,
        }}
      >
        Favorable Zoning Area
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{zone.title}</h2>
      {zone.zoning_district && <div className="mt-1 text-sm text-white/50">{zone.zoning_district}</div>}

      {zone.description && <p className="mt-4 text-sm leading-relaxed text-white/70">{zone.description}</p>}

      {zone.rezoning_notes && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Rezoning Potential</div>
          <p className="text-sm leading-relaxed text-white/70">{zone.rezoning_notes}</p>
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[zone.confidence]}</div>
        {zone.source && (
          <div>
            Source:{" "}
            <a
              href={zone.source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/70 underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              {zone.source.agency}
            </a>
          </div>
        )}
        <div>Last verified {formatRelativeVerified(zone.last_verified_at)}</div>
      </div>
    </div>
  );
}
