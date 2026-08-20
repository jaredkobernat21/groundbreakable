import { useState } from "react";
import {
  ACTIVITY_PHASE_COLOR,
  GROWTH_AREA_MOMENTUM_LABEL,
  OPPORTUNITIES_COLOR,
  OPPORTUNITY_TYPE_LABEL,
  POTENTIAL_COLOR,
  POTENTIAL_SITE_TIER_LABEL,
  PROJECT_STAGE_LABEL,
  type GrowthArea,
  type OpportunityWithSource,
  type OpportunityZoneWithSource,
  type PotentialSiteWithSource,
  type ProjectWithSource,
} from "@/lib/types";
import { resolveActivityPhase } from "@/lib/activityPhase";

type Tab = "activity" | "opportunity" | "buildability";

const TABS: { key: Tab; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "opportunity", label: "Opportunity" },
  { key: "buildability", label: "Buildability" },
];

// The momentum-first "expand a Growth Area" breakdown -- three tabs
// answering the three investor questions in one place: why does this area
// have momentum (Activity), what specific properties are worth a look
// (Opportunity), and what could actually get built here (Buildability).
// Everything shown is scoped to this one area (see the pointInPolygon
// filtering in DevelopmentIntelligenceView) -- no new data, just a
// narrower slice of Plans/Opportunities/Potential already loaded for the
// market.
export default function GrowthAreaDetailPanel({
  growthArea,
  activityProjectsInArea,
  opportunitiesInArea,
  zoningZonesInArea,
  potentialSitesInArea,
  onSelectProject,
  onSelectOpportunity,
  onSelectPotentialSite,
  onClose,
}: {
  growthArea: GrowthArea;
  activityProjectsInArea: ProjectWithSource[];
  opportunitiesInArea: OpportunityWithSource[];
  zoningZonesInArea: OpportunityZoneWithSource[];
  potentialSitesInArea: PotentialSiteWithSource[];
  onSelectProject: (id: string) => void;
  onSelectOpportunity: (id: string) => void;
  onSelectPotentialSite: (id: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("activity");

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 flex w-[380px] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-black/75 shadow-2xl backdrop-blur-xl sm:top-3">
      <div className="overflow-y-auto p-5 pb-0">
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

        <div className="mt-4 flex items-center gap-1 border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative px-3 py-2 text-xs font-medium transition ${
                tab === t.key ? "text-white" : "text-white/45 hover:text-white/75"
              }`}
            >
              {t.label}
              {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-white" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pt-4">
        {tab === "activity" && (
          <ActivityTab growthArea={growthArea} projects={activityProjectsInArea} onSelectProject={onSelectProject} />
        )}
        {tab === "opportunity" && (
          <OpportunityTab opportunities={opportunitiesInArea} onSelectOpportunity={onSelectOpportunity} />
        )}
        {tab === "buildability" && (
          <BuildabilityTab
            zones={zoningZonesInArea}
            potentialSites={potentialSitesInArea}
            onSelectPotentialSite={onSelectPotentialSite}
          />
        )}
      </div>
    </div>
  );
}

function ActivityTab({
  growthArea,
  projects,
  onSelectProject,
}: {
  growthArea: GrowthArea;
  projects: ProjectWithSource[];
  onSelectProject: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {growthArea.narrative ? (
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Why We're Watching</div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">{growthArea.narrative}</p>
        </div>
      ) : (
        <p className="text-sm text-white/40">No narrative on file yet.</p>
      )}

      <div className="border-t border-white/10 pt-4">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-white/35">
          Signals In This Area ({projects.length})
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-white/40">No known plans or activity in this area yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => {
              const phase = resolveActivityPhase(project.stage, project.date_updated);
              const color = phase ? ACTIVITY_PHASE_COLOR[phase] : "#94a3b8";
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="flex w-full items-start gap-2 text-left"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-white/85">{project.title}</span>
                      {project.stage && (
                        <span className="block text-xs text-white/40">{PROJECT_STAGE_LABEL[project.stage]}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function OpportunityTab({
  opportunities,
  onSelectOpportunity,
}: {
  opportunities: OpportunityWithSource[];
  onSelectOpportunity: (id: string) => void;
}) {
  if (opportunities.length === 0) {
    return <p className="text-sm text-white/40">No opportunities identified in this area yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {opportunities.map((opp) => (
        <li key={opp.id}>
          <button
            type="button"
            onClick={() => onSelectOpportunity(opp.id)}
            className="flex w-full flex-col items-start gap-1 rounded-lg border border-white/10 p-2.5 text-left hover:border-white/25"
          >
            <span className="truncate text-sm text-white/85">{opp.address}</span>
            <span className="flex flex-wrap gap-1">
              {opp.signals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                  style={{ borderColor: `${OPPORTUNITIES_COLOR}55`, color: OPPORTUNITIES_COLOR }}
                >
                  {OPPORTUNITY_TYPE_LABEL[signal]}
                </span>
              ))}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function BuildabilityTab({
  zones,
  potentialSites,
  onSelectPotentialSite,
}: {
  zones: OpportunityZoneWithSource[];
  potentialSites: PotentialSiteWithSource[];
  onSelectPotentialSite: (id: string) => void;
}) {
  const hasAnything = zones.length > 0 || potentialSites.length > 0;

  if (!hasAnything) {
    return <p className="text-sm text-white/40">No zoning or site data curated for this area yet.</p>;
  }

  return (
    <div className="space-y-5">
      {zones.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-wide text-white/35">Favorable Zoning</div>
          <ul className="space-y-3">
            {zones.map((zone) => (
              <li key={zone.id} className="rounded-lg border border-white/10 p-2.5">
                <div className="text-sm text-white/85">{zone.title}</div>
                {zone.zoning_district && <div className="mt-0.5 text-xs text-white/45">{zone.zoning_district}</div>}
                {zone.description && <p className="mt-1.5 text-xs leading-relaxed text-white/60">{zone.description}</p>}
                {zone.rezoning_notes && (
                  <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                    <span className="text-white/40">Rezoning Potential: </span>
                    {zone.rezoning_notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {potentialSites.length > 0 && (
        <div className={zones.length > 0 ? "border-t border-white/10 pt-4" : undefined}>
          <div className="mb-2 text-[11px] uppercase tracking-wide text-white/35">
            Potential Sites ({potentialSites.length})
          </div>
          <ul className="space-y-1.5">
            {potentialSites.map((site) => (
              <li key={site.id}>
                <button
                  type="button"
                  onClick={() => onSelectPotentialSite(site.id)}
                  className="flex w-full items-center gap-2 text-left text-sm text-white/70 hover:text-white"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: POTENTIAL_COLOR }} />
                  <span className="truncate">{site.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-white/35">
                    {POTENTIAL_SITE_TIER_LABEL[site.tier]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
