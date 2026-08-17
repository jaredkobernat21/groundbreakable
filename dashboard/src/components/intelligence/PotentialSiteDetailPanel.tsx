import { POTENTIAL_COLOR, POTENTIAL_SITE_TIER_LABEL, type GrowthArea, type PotentialSiteWithSource } from "@/lib/types";
import { formatRelativeVerified } from "@/lib/format";

const CONFIDENCE_LABEL: Record<PotentialSiteWithSource["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

// Deliberately narrower than the full §12 mockup (buildability/site/
// acquisition/constraints checklist) -- that checklist reads off linked
// zoning_land_use/signals/site_constraints evidence, and there's none to
// join against yet for any real Potential Site. What's here (tier,
// growth area link, the curator's own development_context narrative,
// source) is everything a Potential Site actually carries today; the
// full evidence checklist is a real next step once sites have linked
// evidence to show, not before.
export default function PotentialSiteDetailPanel({
  site,
  growthArea,
  onClose,
}: {
  site: PotentialSiteWithSource;
  growthArea: GrowthArea | null;
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
        style={{ borderColor: `${POTENTIAL_COLOR}55`, color: POTENTIAL_COLOR, backgroundColor: `${POTENTIAL_COLOR}1a` }}
      >
        Potential Site · {POTENTIAL_SITE_TIER_LABEL[site.tier]}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{site.title}</h2>
      {site.address && <div className="mt-1 text-sm text-white/50">{site.address}</div>}
      {growthArea && <div className="mt-1 text-sm text-white/40">In {growthArea.name}</div>}

      {site.development_context ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Why This Site</div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">{site.development_context}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-white/40">No development context on file yet.</p>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[site.confidence]}</div>
        {site.source && (
          <div>
            Source:{" "}
            <a
              href={site.source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/70 underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              {site.source.agency}
            </a>
          </div>
        )}
        <div>Added {formatRelativeVerified(site.created_at)}</div>
      </div>
    </div>
  );
}
