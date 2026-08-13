"use client";

import { useMemo, useState } from "react";
import type {
  CatalystWithSource,
  Market,
  OpportunityType,
  OpportunityWithSource,
  Parcel,
  ProjectCategory,
  ProjectWithSource,
} from "@/lib/types";
import { resolveActivityPhase } from "@/lib/activityPhase";
import DevelopmentMap from "./DevelopmentMap";
import DevelopmentLegend from "./DevelopmentLegend";
import OpportunityLegend from "./OpportunityLegend";
import ProjectDetailPanel from "./ProjectDetailPanel";
import OpportunityDetailPanel from "./OpportunityDetailPanel";
import CatalystDetailPanel, { findNearbySignals } from "./CatalystDetailPanel";
import LayerSwitcher, { type MapSegment } from "./LayerSwitcher";

export type MapCategory = "all" | "activity" | "opportunities" | "catalysts";

// Single All/Planning/Opportunities toggle -- that's the whole filter
// surface now (no per-phase, per-category, or per-property-type chips, and
// no separate Catalysts toggle). Catalysts, and every phase within
// Planning (planning/active/completed), always show together whenever
// their segment is visible -- "All" shows everything at once, including
// catalysts; "Planning" or "Opportunities" narrows to just that layer.
// initialCategory lets the header nav land here pre-filtered; a
// "catalysts"-only landing has no equivalent segment anymore, so it falls
// back to "all" (the only place catalysts appear).
function initialSegment(category: MapCategory): MapSegment {
  if (category === "activity") return "activity";
  if (category === "opportunities") return "opportunities";
  return "all";
}

// Orchestrates the map + segment toggle + legend + detail panel as one
// reusable unit. Market-agnostic -- nothing here is Topeka-specific.
export default function DevelopmentIntelligenceView({
  market,
  projects,
  parcels,
  opportunities,
  catalysts,
  initialCategory = "all",
}: {
  market: Market;
  projects: ProjectWithSource[];
  parcels: Parcel[];
  opportunities: OpportunityWithSource[];
  catalysts: CatalystWithSource[];
  initialCategory?: MapCategory;
}) {
  const [segment, setSegment] = useState<MapSegment>(initialSegment(initialCategory));
  const showActivity = segment === "all" || segment === "activity";
  const showOpportunities = segment === "all" || segment === "opportunities";
  const showCatalysts = segment === "all";

  const [selectedProjectId, setSelectedProjectIdRaw] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityIdRaw] = useState<string | null>(null);
  const [selectedCatalystId, setSelectedCatalystIdRaw] = useState<string | null>(null);

  function selectSegment(next: MapSegment) {
    setSegment(next);
    selectProject(null);
    selectOpportunity(null);
    selectCatalyst(null);
  }

  // Only one signal is ever selected at a time, regardless of which
  // marker collection it came from -- selecting one clears the others.
  function selectProject(id: string | null) {
    setSelectedProjectIdRaw(id);
    if (id) {
      setSelectedOpportunityIdRaw(null);
      setSelectedCatalystIdRaw(null);
    }
  }
  function selectOpportunity(id: string | null) {
    setSelectedOpportunityIdRaw(id);
    if (id) {
      setSelectedProjectIdRaw(null);
      setSelectedCatalystIdRaw(null);
    }
  }
  function selectCatalyst(id: string | null) {
    setSelectedCatalystIdRaw(id);
    if (id) {
      setSelectedProjectIdRaw(null);
      setSelectedOpportunityIdRaw(null);
    }
  }

  // Every phase (planning/active/completed) shows at once -- excludes only
  // on_hold/cancelled/stale-completed, which resolveActivityPhase already
  // filters out.
  const phaseProjects = useMemo(() => {
    return projects.filter((p) => resolveActivityPhase(p.status, p.date_updated) !== null);
  }, [projects]);

  const categoryCounts = useMemo(() => {
    const result: Partial<Record<ProjectCategory, number>> = {};
    phaseProjects.forEach((p) => {
      result[p.category] = (result[p.category] ?? 0) + 1;
    });
    return result;
  }, [phaseProjects]);

  // A property can carry more than one signal at once, so this sums to
  // more than opportunities.length -- same idea as categoryCounts above,
  // just not mutually exclusive per row.
  const signalCounts = useMemo(() => {
    const result: Partial<Record<OpportunityType, number>> = {};
    opportunities.forEach((o) => {
      o.signals.forEach((signal) => {
        result[signal] = (result[signal] ?? 0) + 1;
      });
    });
    return result;
  }, [opportunities]);

  const selectedProject = phaseProjects.find((p) => p.id === selectedProjectId) ?? null;
  const selectedOpportunity = opportunities.find((o) => o.id === selectedOpportunityId) ?? null;
  const selectedCatalyst = catalysts.find((c) => c.id === selectedCatalystId) ?? null;

  // Nearby-signal lookup for a selected catalyst always runs against the
  // full, unfiltered projects/opportunities arrays.
  const nearby = selectedCatalyst ? findNearbySignals(selectedCatalyst, projects, opportunities) : null;

  return (
    <div className="space-y-3">
      <div className="relative h-[640px]">
        <DevelopmentMap
          market={market}
          showActivity={showActivity}
          showOpportunities={showOpportunities}
          projects={phaseProjects}
          parcels={parcels}
          opportunities={opportunities}
          catalysts={catalysts}
          showCatalysts={showCatalysts}
          selectedProjectId={selectedProjectId}
          onSelectProject={selectProject}
          selectedOpportunityId={selectedOpportunityId}
          onSelectOpportunity={selectOpportunity}
          selectedCatalystId={selectedCatalystId}
          onSelectCatalyst={selectCatalyst}
        />

        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
          <div className="pointer-events-auto">
            <LayerSwitcher segment={segment} onSelectSegment={selectSegment} />
          </div>
        </div>

        {(showActivity || showOpportunities) && (
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-3">
            {showActivity && (
              <div className="pointer-events-auto">
                <DevelopmentLegend counts={categoryCounts} total={phaseProjects.length} />
              </div>
            )}
            {showOpportunities && (
              <div className="pointer-events-auto">
                <OpportunityLegend counts={signalCounts} total={opportunities.length} />
              </div>
            )}
          </div>
        )}

        {selectedProject && <ProjectDetailPanel project={selectedProject} onClose={() => selectProject(null)} />}
        {selectedOpportunity && (
          <OpportunityDetailPanel
            opportunity={selectedOpportunity}
            projects={projects}
            onClose={() => selectOpportunity(null)}
          />
        )}
        {selectedCatalyst && nearby && (
          <CatalystDetailPanel
            catalyst={selectedCatalyst}
            nearbyProjects={nearby.nearbyProjects}
            nearbyOpportunities={nearby.nearbyOpportunities}
            onClose={() => selectCatalyst(null)}
          />
        )}
      </div>

      {showActivity && phaseProjects.length === 0 && (
        <p className="text-sm text-white/40">No matching Activity signals for {market.name} right now.</p>
      )}
      {showOpportunities && opportunities.length === 0 && (
        <p className="text-sm text-white/40">
          No verified opportunities entered yet for {market.name} — add them from the admin
          opportunities tool once sourced.
        </p>
      )}
    </div>
  );
}
