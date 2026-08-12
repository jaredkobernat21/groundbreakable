import {
  CATALYSTS_COLOR,
  CATALYST_STATUS_LABEL,
  CATALYST_TYPE_LABEL,
  type CatalystWithSource,
  type OpportunityWithSource,
  type ProjectWithSource,
} from "@/lib/types";
import { formatCurrency, formatDate, formatRelativeVerified } from "@/lib/format";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";
import { haversineDistanceMeters } from "@/lib/geo";

const CONFIDENCE_LABEL: Record<CatalystWithSource["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

export default function CatalystDetailPanel({
  catalyst,
  nearbyProjects,
  nearbyOpportunities,
  onClose,
}: {
  catalyst: CatalystWithSource;
  nearbyProjects: ProjectWithSource[];
  nearbyOpportunities: OpportunityWithSource[];
  onClose: () => void;
}) {
  const nearby = [
    ...nearbyProjects.map((p) => ({ id: p.id, title: p.title, kind: "Activity" })),
    ...nearbyOpportunities.map((o) => ({ id: o.id, title: o.address, kind: "Opportunity" })),
  ];

  return (
    <div className="absolute right-3 top-3 bottom-3 w-[340px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl">
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
        style={{ borderColor: `${CATALYSTS_COLOR}55`, color: CATALYSTS_COLOR, backgroundColor: `${CATALYSTS_COLOR}1a` }}
      >
        <span
          className="flex h-3 w-3 items-center justify-center"
          dangerouslySetInnerHTML={{ __html: catalystMarkerSvgMarkup({ size: 12, fill: CATALYSTS_COLOR }) }}
        />
        {CATALYST_TYPE_LABEL[catalyst.catalyst_type]}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{catalyst.title}</h2>
      <div className="mt-1 text-sm text-white/50">{CATALYST_STATUS_LABEL[catalyst.status]}</div>
      {catalyst.address && <div className="mt-1 text-sm text-white/40">{catalyst.address}</div>}

      {catalyst.description && (
        <p className="mt-4 text-sm leading-relaxed text-white/70">{catalyst.description}</p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        {catalyst.estimated_value != null && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Estimated Value</dt>
            <dd className="mt-0.5 text-sm font-medium text-white">{formatCurrency(catalyst.estimated_value)}</dd>
          </div>
        )}
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Influence Radius</dt>
          <dd className="mt-0.5 text-sm font-medium text-white">
            {(catalyst.influence_radius_meters / 1609.34).toFixed(1)} mi
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-white/35">
          Nearby Signals ({nearby.length})
        </div>
        {nearby.length === 0 ? (
          <p className="text-sm text-white/40">No Pipeline or Opportunity signals within the influence radius.</p>
        ) : (
          <ul className="space-y-1.5">
            {nearby.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-white/70">
                <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/40">
                  {item.kind}
                </span>
                <span className="truncate">{item.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {catalyst.date_announced && (
        <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/60">
          Announced {formatDate(catalyst.date_announced)}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[catalyst.confidence]}</div>
        {catalyst.source && (
          <div>
            Source:{" "}
            <a
              href={catalyst.source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/70 underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              {catalyst.source.agency}
            </a>
          </div>
        )}
        <div>Last verified {formatRelativeVerified(catalyst.last_verified_at)}</div>
      </div>
    </div>
  );
}

export function findNearbySignals(
  catalyst: CatalystWithSource,
  projects: ProjectWithSource[],
  opportunities: OpportunityWithSource[]
) {
  const within = (lat: number, lng: number) =>
    haversineDistanceMeters(catalyst.latitude, catalyst.longitude, lat, lng) <= catalyst.influence_radius_meters;

  return {
    nearbyProjects: projects.filter((p) => within(p.latitude, p.longitude)),
    nearbyOpportunities: opportunities.filter((o) => within(o.latitude, o.longitude)),
  };
}
