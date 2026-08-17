import { GROWTH_AREA_MOMENTUM_LABEL, POTENTIAL_COLOR, type GrowthArea, type PotentialSiteWithSource } from "@/lib/types";

// A Growth Area's panel is the narrative, not a stat block -- per the
// architecture review's §10 example ("Momentum: HIGH ↑ / Why we're
// watching: ..."), the evidence is more important than a score. No
// momentum score is computed here (none is stored -- momentum_state is
// the qualitative tier, deliberately not a number).
export default function GrowthAreaDetailPanel({
  growthArea,
  potentialSitesInArea,
  onSelectPotentialSite,
  onClose,
}: {
  growthArea: GrowthArea;
  potentialSitesInArea: PotentialSiteWithSource[];
  onSelectPotentialSite: (id: string) => void;
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
        Growth Area · Momentum {GROWTH_AREA_MOMENTUM_LABEL[growthArea.momentum_state]}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{growthArea.name}</h2>

      {growthArea.narrative ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Why We're Watching</div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">{growthArea.narrative}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-white/40">No narrative on file yet.</p>
      )}

      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-white/35">
          Potential Sites in This Area ({potentialSitesInArea.length})
        </div>
        {potentialSitesInArea.length === 0 ? (
          <p className="text-sm text-white/40">No Potential Sites identified in this area yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {potentialSitesInArea.map((site) => (
              <li key={site.id}>
                <button
                  type="button"
                  onClick={() => onSelectPotentialSite(site.id)}
                  className="flex w-full items-center gap-2 text-left text-sm text-white/70 hover:text-white"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: POTENTIAL_COLOR }}
                  />
                  <span className="truncate">{site.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
