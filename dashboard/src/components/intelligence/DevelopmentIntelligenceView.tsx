"use client";

import { useMemo, useState } from "react";
import type {
  ActivityPhase,
  CatalystWithSource,
  GrowthArea,
  Market,
  OpportunityType,
  OpportunityWithSource,
  OpportunityZoneWithSource,
  Parcel,
  PotentialSiteWithSource,
  ProjectWithSource,
} from "@/lib/types";
import { resolveActivityPhase } from "@/lib/activityPhase";
import { filterWithinRadius, ONE_MILE_METERS, pointInPolygon, polygonCentroid } from "@/lib/geo";
import DevelopmentMap from "./DevelopmentMap";
import DevelopmentLegend from "./DevelopmentLegend";
import OpportunityLegend from "./OpportunityLegend";
import PotentialLegend from "./PotentialLegend";
import ProjectDetailPanel from "./ProjectDetailPanel";
import OpportunityDetailPanel from "./OpportunityDetailPanel";
import CatalystDetailPanel, { findNearbySignals } from "./CatalystDetailPanel";
import OpportunityZoneDetailPanel from "./OpportunityZoneDetailPanel";
import GrowthAreaDetailPanel from "./GrowthAreaDetailPanel";
import PotentialSiteDetailPanel from "./PotentialSiteDetailPanel";
import LayerSwitcher, { type MapSegment } from "./LayerSwitcher";

export type MapCategory = MapSegment;

// Single All/Plans/Opportunities/Potential toggle -- that's the whole
// filter surface now (no per-phase, per-category, or per-property-type
// chips, and no separate Catalysts toggle). Every phase within Plans
// (planning/active/completed) shows together whenever that segment is
// visible; "All" shows everything at once. Catalyst watch zones always
// render regardless of segment (see DevelopmentMap) -- there's no
// equivalent "catalysts" segment.

// Orchestrates the map + segment toggle + legend + detail panel as one
// reusable unit. Market-agnostic -- nothing here is Topeka-specific.
export default function DevelopmentIntelligenceView({
  market,
  projects,
  parcels,
  opportunities,
  catalysts,
  opportunityZones,
  growthAreas,
  potentialSites,
  initialCategory = "plans",
  initialSelection = null,
}: {
  market: Market;
  projects: ProjectWithSource[];
  parcels: Parcel[];
  opportunities: OpportunityWithSource[];
  catalysts: CatalystWithSource[];
  opportunityZones: OpportunityZoneWithSource[];
  growthAreas: GrowthArea[];
  potentialSites: PotentialSiteWithSource[];
  initialCategory?: MapCategory;
  // Deep-link from the AskBar's "View on map" link -- pre-selects a
  // specific project/opportunity pin on mount.
  initialSelection?: { type: "project" | "opportunity"; id: string } | null;
}) {
  const [segment, setSegment] = useState<MapSegment>(initialCategory);
  const showPlans = segment === "all" || segment === "plans";
  const showOpportunities = segment === "all" || segment === "opportunities";
  const showPotential = segment === "all" || segment === "potential";

  const [selectedProjectId, setSelectedProjectIdRaw] = useState<string | null>(
    initialSelection?.type === "project" ? initialSelection.id : null
  );
  const [selectedOpportunityId, setSelectedOpportunityIdRaw] = useState<string | null>(
    initialSelection?.type === "opportunity" ? initialSelection.id : null
  );
  const [selectedCatalystId, setSelectedCatalystIdRaw] = useState<string | null>(null);
  const [selectedOpportunityZoneId, setSelectedOpportunityZoneIdRaw] = useState<string | null>(null);
  const [selectedGrowthAreaId, setSelectedGrowthAreaIdRaw] = useState<string | null>(null);
  const [selectedPotentialSiteId, setSelectedPotentialSiteIdRaw] = useState<string | null>(null);

  function selectSegment(next: MapSegment) {
    setSegment(next);
    selectProject(null);
    selectOpportunity(null);
    selectCatalyst(null);
    selectOpportunityZone(null);
    selectGrowthArea(null);
    selectPotentialSite(null);
  }

  // Only one signal is ever selected at a time, regardless of which
  // marker/layer it came from -- selecting one clears the others.
  function selectProject(id: string | null) {
    setSelectedProjectIdRaw(id);
    if (id) {
      setSelectedOpportunityIdRaw(null);
      setSelectedCatalystIdRaw(null);
      setSelectedOpportunityZoneIdRaw(null);
      setSelectedGrowthAreaIdRaw(null);
      setSelectedPotentialSiteIdRaw(null);
    }
  }
  function selectOpportunity(id: string | null) {
    setSelectedOpportunityIdRaw(id);
    if (id) {
      setSelectedProjectIdRaw(null);
      setSelectedCatalystIdRaw(null);
      setSelectedOpportunityZoneIdRaw(null);
      setSelectedGrowthAreaIdRaw(null);
      setSelectedPotentialSiteIdRaw(null);
    }
  }
  function selectCatalyst(id: string | null) {
    setSelectedCatalystIdRaw(id);
    if (id) {
      setSelectedProjectIdRaw(null);
      setSelectedOpportunityIdRaw(null);
      setSelectedOpportunityZoneIdRaw(null);
      setSelectedGrowthAreaIdRaw(null);
      setSelectedPotentialSiteIdRaw(null);
    }
  }
  function selectOpportunityZone(id: string | null) {
    setSelectedOpportunityZoneIdRaw(id);
    if (id) {
      setSelectedProjectIdRaw(null);
      setSelectedOpportunityIdRaw(null);
      setSelectedCatalystIdRaw(null);
      setSelectedGrowthAreaIdRaw(null);
      setSelectedPotentialSiteIdRaw(null);
    }
  }
  function selectGrowthArea(id: string | null) {
    setSelectedGrowthAreaIdRaw(id);
    if (id) {
      setSelectedProjectIdRaw(null);
      setSelectedOpportunityIdRaw(null);
      setSelectedCatalystIdRaw(null);
      setSelectedOpportunityZoneIdRaw(null);
      setSelectedPotentialSiteIdRaw(null);
    }
  }
  function selectPotentialSite(id: string | null) {
    setSelectedPotentialSiteIdRaw(id);
    if (id) {
      setSelectedProjectIdRaw(null);
      setSelectedOpportunityIdRaw(null);
      setSelectedCatalystIdRaw(null);
      setSelectedOpportunityZoneIdRaw(null);
      setSelectedGrowthAreaIdRaw(null);
    }
  }

  // Every phase (planning/active/completed) shows at once -- excludes only
  // on_hold/cancelled/stale-completed, which resolveActivityPhase already
  // filters out.
  const phaseProjects = useMemo(() => {
    return projects.filter((p) => resolveActivityPhase(p.stage, p.date_updated) !== null);
  }, [projects]);

  // Legend breakdown now mirrors what's actually drawn on the map: phase
  // (color + icon), not category -- see DevelopmentLegend.
  const phaseCounts = useMemo(() => {
    const result: Partial<Record<ActivityPhase, number>> = {};
    phaseProjects.forEach((p) => {
      const phase = resolveActivityPhase(p.stage, p.date_updated);
      if (phase) result[phase] = (result[phase] ?? 0) + 1;
    });
    return result;
  }, [phaseProjects]);

  // A property can carry more than one signal at once, so this sums to
  // more than opportunities.length -- same idea as phaseCounts above, just
  // not mutually exclusive per row.
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
  const selectedOpportunityZone = opportunityZones.find((z) => z.id === selectedOpportunityZoneId) ?? null;
  const selectedGrowthArea = growthAreas.find((g) => g.id === selectedGrowthAreaId) ?? null;
  const selectedPotentialSite = potentialSites.find((s) => s.id === selectedPotentialSiteId) ?? null;

  // A selected Growth Area's panel lists the Potential Sites inside it;
  // a selected Potential Site's panel names the Growth Area it's in, if
  // any -- both computed here rather than re-fetched, same "share what's
  // already loaded" pattern as nearbyOpportunities below.
  const potentialSitesInSelectedGrowthArea = useMemo(
    () => (selectedGrowthArea ? potentialSites.filter((s) => s.growth_area_id === selectedGrowthArea.id) : []),
    [selectedGrowthArea, potentialSites]
  );
  const growthAreaOfSelectedSite = selectedPotentialSite
    ? (growthAreas.find((g) => g.id === selectedPotentialSite.growth_area_id) ?? null)
    : null;

  // A selected Growth Area's momentum breakdown: Plans-pillar projects and
  // Opportunities signals whose point falls inside the area's polygon, plus
  // Favorable Zoning zones whose centroid does -- same "share what's
  // already loaded, just filter it" pattern as nearbyOpportunities below,
  // just polygon-based instead of radius-based. Feeds both the map's
  // forced-visible markers and GrowthAreaDetailPanel's tabs.
  const activityProjectsInSelectedGrowthArea = useMemo(() => {
    if (!selectedGrowthArea) return [];
    return phaseProjects.filter((p) =>
      pointInPolygon({ lat: p.latitude, lng: p.longitude }, selectedGrowthArea.geom)
    );
  }, [selectedGrowthArea, phaseProjects]);
  const opportunitiesInSelectedGrowthArea = useMemo(() => {
    if (!selectedGrowthArea) return [];
    return opportunities.filter((o) =>
      pointInPolygon({ lat: o.latitude, lng: o.longitude }, selectedGrowthArea.geom)
    );
  }, [selectedGrowthArea, opportunities]);
  const zoningZonesInSelectedGrowthArea = useMemo(() => {
    if (!selectedGrowthArea) return [];
    return opportunityZones.filter((z) => pointInPolygon(polygonCentroid(z.boundary), selectedGrowthArea.geom));
  }, [selectedGrowthArea, opportunityZones]);
  const areaActivityProjectIds = useMemo(
    () => new Set(activityProjectsInSelectedGrowthArea.map((p) => p.id)),
    [activityProjectsInSelectedGrowthArea]
  );
  const areaOpportunityIds = useMemo(
    () => new Set(opportunitiesInSelectedGrowthArea.map((o) => o.id)),
    [opportunitiesInSelectedGrowthArea]
  );

  // The project-pin "premium reveal": opportunities within 1 mile of the
  // selected project. Computed once here and shared by the map (which
  // forces those markers visible even off the Opportunities segment) and
  // the project's own detail panel (which lists them).
  const nearbyOpportunities = useMemo(() => {
    if (!selectedProject) return [];
    return filterWithinRadius(
      { lat: selectedProject.latitude, lng: selectedProject.longitude },
      ONE_MILE_METERS,
      opportunities,
      (o) => ({ lat: o.latitude, lng: o.longitude })
    );
  }, [selectedProject, opportunities]);
  const nearbyOpportunityIds = useMemo(
    () => new Set(nearbyOpportunities.map((o) => o.id)),
    [nearbyOpportunities]
  );

  // Nearby-signal lookup for a selected catalyst always runs against the
  // full, unfiltered projects/opportunities arrays.
  const nearby = selectedCatalyst ? findNearbySignals(selectedCatalyst, projects, opportunities) : null;

  return (
    <div className="space-y-3">
      <div className="relative h-[640px]">
        <DevelopmentMap
          market={market}
          segment={segment}
          showPlans={showPlans}
          showOpportunities={showOpportunities}
          showPotential={showPotential}
          projects={phaseProjects}
          parcels={parcels}
          opportunities={opportunities}
          catalysts={catalysts}
          opportunityZones={opportunityZones}
          growthAreas={growthAreas}
          potentialSites={potentialSites}
          nearbyOpportunityIds={nearbyOpportunityIds}
          areaActivityProjectIds={areaActivityProjectIds}
          areaOpportunityIds={areaOpportunityIds}
          zoningZonesInSelectedGrowthArea={zoningZonesInSelectedGrowthArea}
          selectedProjectId={selectedProjectId}
          onSelectProject={selectProject}
          selectedOpportunityId={selectedOpportunityId}
          onSelectOpportunity={selectOpportunity}
          selectedCatalystId={selectedCatalystId}
          onSelectCatalyst={selectCatalyst}
          selectedOpportunityZoneId={selectedOpportunityZoneId}
          onSelectOpportunityZone={selectOpportunityZone}
          selectedGrowthAreaId={selectedGrowthAreaId}
          onSelectGrowthArea={selectGrowthArea}
          selectedPotentialSiteId={selectedPotentialSiteId}
          onSelectPotentialSite={selectPotentialSite}
        />

        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
          <div className="pointer-events-auto">
            <LayerSwitcher segment={segment} onSelectSegment={selectSegment} />
          </div>
        </div>

        {(showPlans || showOpportunities || showPotential) && (
          <div className="pointer-events-none absolute left-3 top-16 z-10 flex flex-col gap-3 sm:top-3">
            {showPlans && (
              <div className="pointer-events-auto">
                <DevelopmentLegend counts={phaseCounts} total={phaseProjects.length} />
              </div>
            )}
            {showOpportunities && (
              <div className="pointer-events-auto">
                <OpportunityLegend counts={signalCounts} total={opportunities.length} />
              </div>
            )}
            {showPotential && (
              <div className="pointer-events-auto">
                <PotentialLegend
                  growthAreaCount={growthAreas.length}
                  potentialSiteCount={potentialSites.length}
                  zoneCount={opportunityZones.length}
                />
              </div>
            )}
          </div>
        )}

        {selectedProject && (
          <ProjectDetailPanel
            project={selectedProject}
            nearbyOpportunities={nearbyOpportunities}
            onSelectOpportunity={selectOpportunity}
            onClose={() => selectProject(null)}
          />
        )}
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
        {selectedOpportunityZone && (
          <OpportunityZoneDetailPanel zone={selectedOpportunityZone} onClose={() => selectOpportunityZone(null)} />
        )}
        {selectedGrowthArea && (
          <GrowthAreaDetailPanel
            growthArea={selectedGrowthArea}
            activityProjectsInArea={activityProjectsInSelectedGrowthArea}
            opportunitiesInArea={opportunitiesInSelectedGrowthArea}
            zoningZonesInArea={zoningZonesInSelectedGrowthArea}
            potentialSitesInArea={potentialSitesInSelectedGrowthArea}
            onSelectProject={selectProject}
            onSelectOpportunity={selectOpportunity}
            onSelectPotentialSite={selectPotentialSite}
            onClose={() => selectGrowthArea(null)}
          />
        )}
        {selectedPotentialSite && (
          <PotentialSiteDetailPanel
            site={selectedPotentialSite}
            growthArea={growthAreaOfSelectedSite}
            onClose={() => selectPotentialSite(null)}
          />
        )}
      </div>

      {showPlans && phaseProjects.length === 0 && (
        <p className="text-sm text-white/40">No matching Plans activity for {market.name} right now.</p>
      )}
      {showOpportunities && opportunities.length === 0 && (
        <p className="text-sm text-white/40">
          No verified opportunities entered yet for {market.name} — add them from the admin
          opportunities tool once sourced.
        </p>
      )}
      {showPotential && growthAreas.length === 0 && potentialSites.length === 0 && opportunityZones.length === 0 && (
        <p className="text-sm text-white/40">
          No Growth Areas, Potential Sites, or Favorable Zoning curated yet for {market.name} — add them
          from the admin Potential tools once researched.
        </p>
      )}
    </div>
  );
}
