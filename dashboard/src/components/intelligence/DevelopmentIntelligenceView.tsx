"use client";

import { useMemo, useState } from "react";
import type {
  ActivityPhase,
  CatalystWithSource,
  Market,
  OpportunityType,
  OpportunityWithSource,
  Parcel,
  ProjectCategory,
  ProjectStatus,
  ProjectWithSource,
} from "@/lib/types";
import { resolveActivityPhase } from "@/lib/activityPhase";
import DevelopmentMap from "./DevelopmentMap";
import DevelopmentFilterBar from "./DevelopmentFilterBar";
import DevelopmentLegend from "./DevelopmentLegend";
import ProjectDetailPanel from "./ProjectDetailPanel";
import OpportunityDetailPanel from "./OpportunityDetailPanel";
import CatalystDetailPanel, { findNearbySignals } from "./CatalystDetailPanel";
import LayerSwitcher from "./LayerSwitcher";
import ActivitySubBar from "./ActivitySubBar";
import PropertyTypeTabs from "./PropertyTypeTabs";

// Orchestrates the map + view toggles + filters + legend + detail panel as
// one reusable unit. Activity and Opportunities are independent on/off
// toggles (both default on, so the default view shows everything at
// once), each with its own sub-filters -- phase (multi-select, plus the
// Catalysts overlay toggle) for Activity, property type for Opportunities.
// Market-agnostic -- nothing here is Topeka-specific.
export default function DevelopmentIntelligenceView({
  market,
  projects,
  parcels,
  opportunities,
  catalysts,
}: {
  market: Market;
  projects: ProjectWithSource[];
  parcels: Parcel[];
  opportunities: OpportunityWithSource[];
  catalysts: CatalystWithSource[];
}) {
  const [showActivity, setShowActivity] = useState(true);
  const [showOpportunities, setShowOpportunities] = useState(true);
  const [activePhases, setActivePhases] = useState<Set<ActivityPhase>>(new Set());
  const [showCatalysts, setShowCatalysts] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<ProjectCategory>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<ProjectStatus>>(new Set());
  const [activePropertyTypes, setActivePropertyTypes] = useState<Set<OpportunityType>>(new Set());

  const [selectedProjectId, setSelectedProjectIdRaw] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityIdRaw] = useState<string | null>(null);
  const [selectedCatalystId, setSelectedCatalystIdRaw] = useState<string | null>(null);

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

  function togglePhase(phase: ActivityPhase) {
    setActivePhases((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
    selectProject(null);
  }

  // Phase is Activity's primary grouping axis (multi-select -- empty
  // selection means "show all phases"); category/status filter further
  // within whichever phases are active.
  const phaseProjects = useMemo(() => {
    return projects.filter((p) => {
      const phase = resolveActivityPhase(p.status, p.date_updated);
      if (!phase) return false;
      return activePhases.size === 0 || activePhases.has(phase);
    });
  }, [projects, activePhases]);

  const phaseCounts = useMemo(() => {
    const counts: Record<ActivityPhase, number> = { planning: 0, active: 0, completed: 0 };
    projects.forEach((p) => {
      const phase = resolveActivityPhase(p.status, p.date_updated);
      if (phase) counts[phase] += 1;
    });
    return counts;
  }, [projects]);

  const availableCategories = useMemo(
    () => Array.from(new Set(phaseProjects.map((p) => p.category))),
    [phaseProjects]
  );
  const availableStatuses = useMemo(
    () => Array.from(new Set(phaseProjects.map((p) => p.status))),
    [phaseProjects]
  );

  const filteredProjects = useMemo(() => {
    return phaseProjects.filter((project) => {
      if (activeCategories.size > 0 && !activeCategories.has(project.category)) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(project.status)) return false;
      return true;
    });
  }, [phaseProjects, activeCategories, activeStatuses]);

  const categoryCounts = useMemo(() => {
    const result: Partial<Record<ProjectCategory, number>> = {};
    filteredProjects.forEach((p) => {
      result[p.category] = (result[p.category] ?? 0) + 1;
    });
    return result;
  }, [filteredProjects]);

  function toggleCategory(category: ProjectCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }
  function toggleStatus(status: ProjectStatus) {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  }

  const filteredOpportunities = useMemo(() => {
    if (activePropertyTypes.size === 0) return opportunities;
    return opportunities.filter((o) => activePropertyTypes.has(o.opportunity_type));
  }, [opportunities, activePropertyTypes]);

  const propertyTypeCounts = useMemo(() => {
    const result: Partial<Record<OpportunityType, number>> = {};
    opportunities.forEach((o) => {
      result[o.opportunity_type] = (result[o.opportunity_type] ?? 0) + 1;
    });
    return result;
  }, [opportunities]);

  function togglePropertyType(type: OpportunityType) {
    setActivePropertyTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  const selectedProject = filteredProjects.find((p) => p.id === selectedProjectId) ?? null;
  const selectedOpportunity = opportunities.find((o) => o.id === selectedOpportunityId) ?? null;
  const selectedCatalyst = catalysts.find((c) => c.id === selectedCatalystId) ?? null;

  // Nearby-signal lookup for a selected catalyst always runs against the
  // full, unfiltered projects/opportunities arrays.
  const nearby = selectedCatalyst ? findNearbySignals(selectedCatalyst, projects, opportunities) : null;

  return (
    <div className="space-y-3">
      <LayerSwitcher
        showActivity={showActivity}
        onToggleActivity={() => setShowActivity((prev) => !prev)}
        showOpportunities={showOpportunities}
        onToggleOpportunities={() => setShowOpportunities((prev) => !prev)}
      />

      {showActivity && (
        <>
          <ActivitySubBar
            activePhases={activePhases}
            onTogglePhase={togglePhase}
            phaseCounts={phaseCounts}
            showCatalysts={showCatalysts}
            onToggleCatalysts={() => setShowCatalysts((prev) => !prev)}
            catalystCount={catalysts.length}
          />
          <DevelopmentFilterBar
            availableCategories={availableCategories}
            availableStatuses={availableStatuses}
            activeCategories={activeCategories}
            activeStatuses={activeStatuses}
            onToggleCategory={toggleCategory}
            onToggleStatus={toggleStatus}
            onReset={() => {
              setActiveCategories(new Set());
              setActiveStatuses(new Set());
            }}
          />
        </>
      )}

      {showOpportunities && (
        <PropertyTypeTabs
          activeTypes={activePropertyTypes}
          onToggleType={togglePropertyType}
          onReset={() => setActivePropertyTypes(new Set())}
          typeCounts={propertyTypeCounts}
        />
      )}

      <div className="relative h-[640px]">
        <DevelopmentMap
          market={market}
          showActivity={showActivity}
          showOpportunities={showOpportunities}
          projects={filteredProjects}
          parcels={parcels}
          opportunities={filteredOpportunities}
          catalysts={catalysts}
          showCatalysts={showCatalysts}
          selectedProjectId={selectedProjectId}
          onSelectProject={selectProject}
          selectedOpportunityId={selectedOpportunityId}
          onSelectOpportunity={selectOpportunity}
          selectedCatalystId={selectedCatalystId}
          onSelectCatalyst={selectCatalyst}
        />

        {showActivity && (
          <div className="pointer-events-none absolute left-3 top-3">
            <div className="pointer-events-auto">
              <DevelopmentLegend counts={categoryCounts} />
            </div>
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

      {!showActivity && !showOpportunities && (
        <p className="text-sm text-white/40">Both Activity and Opportunities are hidden — toggle one on to see signals.</p>
      )}
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
