"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  DevelopmentFrictionCaseWithSource,
  DevelopmentFrictionSignalWithSource,
  DevelopmentOpportunityWithSources,
  EntitlementCaseWithSource,
  GrowthArea,
  InvestmentWithSource,
  Market,
  MarketIndicatorWithSource,
  MarketOverviewWithSources,
  OpportunityGroup,
  ProjectPersonWithSource,
  ProjectWithSource,
  ShiftCategory,
  ShiftWithSource,
  ZoningLandUseWithSource,
} from "@/lib/types";
import { ACTIVITY_COLOR, OPPORTUNITIES_COLOR, OPPORTUNITY_GROUP_LABEL } from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import { OPPORTUNITY_GROUP_COLOR } from "@/lib/opportunityConstants";
import { computeProjectOpportunities } from "@/lib/opportunityRules";
import { buildCompanyProfiles } from "@/lib/companyProfiles";
import { pointInPolygon } from "@/lib/geo";
import { ICON_PATHS } from "@/lib/icons";
import { PROJECT_ICON_PATHS } from "@/lib/markerIcons";
import {
  FRICTION_STATUS_TAB_ORDER,
  outcomesForFrictionStatusTab,
  type FrictionStatusTab,
} from "@/lib/frictionStatus";
import BriefingSummary from "./BriefingSummary";
import MetricCardRow, { type MetricCard } from "./MetricCardRow";
import ShiftFilters from "./ShiftFilters";
import ShiftMap from "./ShiftMap";
import ShiftFeed from "./ShiftFeed";
import ShiftDetailPanel from "./ShiftDetailPanel";
import ProjectsList from "./ProjectsList";
import CompanyList from "./CompanyList";
import CompanyDetailPanel from "./CompanyDetailPanel";
import MomentumAreaDetailPanel from "./MomentumAreaDetailPanel";
import BuildabilityMap from "./BuildabilityMap";
import BuildabilityList from "./BuildabilityList";
import BuildabilityDetailPanel from "./BuildabilityDetailPanel";
import InvestmentSummary from "./InvestmentSummary";
import OpportunityMap from "./OpportunityMap";
import OpportunityFeed from "./OpportunityFeed";
import OpportunityDetailPanel from "./OpportunityDetailPanel";
import MarketOverviewSection from "./MarketOverviewSection";
import DevelopmentFrictionSection from "./DevelopmentFrictionSection";
import EntitlementCasesSection from "../entitlement/EntitlementCasesSection";
import DevelopmentFrictionCaseCard from "../friction/DevelopmentFrictionCaseCard";
import DevelopmentFrictionFilters, {
  emptyDevelopmentFrictionFilterState,
  type DevelopmentFrictionFilterState,
} from "../friction/DevelopmentFrictionFilters";
import DevelopmentFrictionOverview from "../friction/DevelopmentFrictionOverview";

type View = "market" | "momentum" | "opportunities" | "buildability" | "projects" | "friction" | "developers" | "contractors";

// Product decision (Jared, 2026-09-18): the dashboard nav collapses to 5
// primary destinations -- Market, Opportunities, Projects, Friction,
// Companies. Plans/Permits/Infrastructure/Investment/Opposed/Delayed/
// Failed are no longer their own primary-nav entries; the data behind
// them is unchanged and still reachable -- Plans/Permits/Infrastructure
// as category filter chips on the Momentum map (see ShiftFilters /
// ACTIVE_SHIFT_CATEGORIES), Investment as a summary card on the Market
// Overview page, and every friction outcome as a status tab on the one
// Friction page (see frictionStatus.ts). Every underlying view/component/
// query below is unchanged; this is purely a navigation regrouping.
type Group = "market" | "opportunities" | "projects" | "friction" | "companies";

const GROUPS: { value: Group; label: string; views: View[] }[] = [
  { value: "market", label: "Market", views: ["market", "momentum"] },
  { value: "opportunities", label: "Opportunities", views: ["opportunities", "buildability"] },
  { value: "projects", label: "Projects", views: ["projects"] },
  { value: "friction", label: "Friction", views: ["friction"] },
  { value: "companies", label: "Companies", views: ["developers", "contractors"] },
];

const VIEW_GROUP = GROUPS.reduce((acc, g) => {
  for (const v of g.views) acc[v] = g.value;
  return acc;
}, {} as Record<View, Group>);

// Sub-tab labels -- only rendered for groups with more than one view (see
// desktopNavTree), so Projects/Friction (single-view groups) never show
// theirs.
const VIEW_LABEL: Record<View, string> = {
  market: "Overview",
  momentum: "Momentum",
  opportunities: "Opportunities",
  buildability: "Buildability",
  projects: "Projects",
  friction: "Friction",
  developers: "Developers",
  contractors: "Contractors",
};

const OPPORTUNITY_GROUP_FILTER_OPTIONS = Object.keys(OPPORTUNITY_GROUP_LABEL) as OpportunityGroup[];

// alert-circle -- matches the triangle/circle-alert convention used
// elsewhere for friction/risk chrome.
const FRICTION_ICON_PATHS = ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 8v5", "M12 16h.01"];

// Tie-break for "which Momentum Area is the primary one" -- higher wins.
// Ranked ahead of raw signal count (see momentumAreaBreakdowns) since two
// areas at the same count should still favor whichever one is actually
// accelerating right now over one that's merely emerging.
const MOMENTUM_STATE_RANK: Record<GrowthArea["momentum_state"], number> = {
  accelerating: 2,
  established: 1,
  emerging: 0,
};

export default function ShiftDashboardView({
  market,
  shifts,
  projects,
  buildabilityZones,
  investments,
  momentumAreas,
  projectPeople,
  opportunities,
  marketIndicators,
  marketOverview,
  developmentFrictionSignals,
  entitlementCases,
  developmentFrictionCases,
  markets,
}: {
  market: Market;
  shifts: ShiftWithSource[];
  projects: ProjectWithSource[];
  buildabilityZones: ZoningLandUseWithSource[];
  investments: InvestmentWithSource[];
  momentumAreas: GrowthArea[];
  projectPeople: ProjectPersonWithSource[];
  opportunities: DevelopmentOpportunityWithSources[];
  marketIndicators: MarketIndicatorWithSource[];
  marketOverview: MarketOverviewWithSources | null;
  developmentFrictionSignals: DevelopmentFrictionSignalWithSource[];
  entitlementCases: EntitlementCaseWithSource[];
  developmentFrictionCases: DevelopmentFrictionCaseWithSource[];
  markets: Market[];
}) {
  const [view, setView] = useState<View>("market");
  // Which group's sub-tab dropdown is open in the rail -- independent of
  // `view` so clicking the already-active group's button can collapse the
  // dropdown back without changing what content is showing. Starts open
  // on the initial view's group ("market", since the initial view is
  // "market").
  const [expandedGroup, setExpandedGroup] = useState<Group | null>("market");
  const [categories, setCategories] = useState<Set<ShiftCategory>>(new Set(ACTIVE_SHIFT_CATEGORIES));
  const [range, setRange] = useState<ShiftDateRange>("7d");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedMomentumAreaId, setSelectedMomentumAreaId] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [opportunityGroupFilter, setOpportunityGroupFilter] = useState<Set<OpportunityGroup>>(
    new Set(OPPORTUNITY_GROUP_FILTER_OPTIONS)
  );
  const [selectedCompanyKey, setSelectedCompanyKey] = useState<string | null>(null);
  const [frictionFilters, setFrictionFilters] = useState<DevelopmentFrictionFilterState>(emptyDevelopmentFrictionFilterState(market.id));
  const [frictionStatusTab, setFrictionStatusTab] = useState<FrictionStatusTab>("all");

  function toggleOpportunityGroup(group: OpportunityGroup) {
    setOpportunityGroupFilter((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  function toggleCategory(category: ShiftCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const filteredShifts = useMemo(() => {
    const since = shiftDateRangeToDate(range);
    return shifts.filter((s) => categories.has(s.category) && s.event_date >= since);
  }, [shifts, categories, range]);

  // Hand-authored development_opportunities rows plus Builder/Contractor
  // opportunities computed live off the projects pipeline (see
  // lib/opportunityRules.ts) -- merged into one list so they filter/map/
  // feed together as a single Opportunities section per the Development
  // Intelligence spec.
  const allOpportunities = useMemo(
    () => [...opportunities, ...computeProjectOpportunities(projects, projectPeople)],
    [opportunities, projects, projectPeople]
  );

  const filteredOpportunities = useMemo(
    () => allOpportunities.filter((o) => opportunityGroupFilter.has(o.opportunity_group)),
    [allOpportunities, opportunityGroupFilter]
  );

  // Every pill/search facet empty means "no restriction" (see
  // emptyDevelopmentFrictionFilterState); the outcome bucket instead
  // comes from which status tab is active (outcomesForFrictionStatusTab).
  function matchesFrictionFilters(c: DevelopmentFrictionCaseWithSource): boolean {
    const search = frictionFilters.developerSearch.trim().toLowerCase();
    if (frictionFilters.markets.size > 0 && !frictionFilters.markets.has(c.market_id)) return false;
    if (frictionFilters.frictionTypes.size > 0 && !frictionFilters.frictionTypes.has(c.friction_type)) return false;
    if (frictionFilters.severities.size > 0 && (!c.severity || !frictionFilters.severities.has(c.severity))) return false;
    if (frictionFilters.projectTypes.size > 0 && (!c.project_type || !frictionFilters.projectTypes.has(c.project_type))) return false;
    if (search && !(c.developer_name ?? "").toLowerCase().includes(search)) return false;
    return true;
  }

  const filteredFrictionCases = useMemo(() => {
    const outcomeBucket = outcomesForFrictionStatusTab(frictionStatusTab);
    return developmentFrictionCases.filter((c) => {
      if (outcomeBucket && !outcomeBucket.includes(c.outcome)) return false;
      return matchesFrictionFilters(c);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developmentFrictionCases, frictionFilters, frictionStatusTab]);

  const frictionStatusCounts = useMemo(() => {
    const counts = {} as Record<FrictionStatusTab, number>;
    for (const tab of FRICTION_STATUS_TAB_ORDER) {
      const outcomeBucket = outcomesForFrictionStatusTab(tab);
      counts[tab] = developmentFrictionCases.filter(
        (c) => (!outcomeBucket || outcomeBucket.includes(c.outcome)) && matchesFrictionFilters(c)
      ).length;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developmentFrictionCases, frictionFilters]);

  // Companies profiles -- one per uniquely-named developer/contractor,
  // with every rollup (project counts, stage breakdown, estimated
  // volume, frequent partners) computed live from project_people +
  // projects. See lib/companyProfiles.ts.
  const developerProfiles = useMemo(() => buildCompanyProfiles("developer", projectPeople, projects), [projectPeople, projects]);
  const contractorProfiles = useMemo(() => buildCompanyProfiles("contractor", projectPeople, projects), [projectPeople, projects]);

  // Every real shift/project whose lat/lng falls inside a Momentum Area's
  // polygon -- computed client-side (pointInPolygon), not a join table, so
  // adding/editing an area's boundary never needs a data backfill. Scoped
  // to the full `shifts`/`projects` lists, not filteredShifts, so an
  // area's breakdown always explains its whole story regardless of
  // whatever category/date filter happens to be set on the pin layer.
  const momentumAreaBreakdowns = useMemo(() => {
    return momentumAreas.map((area) => {
      const shiftsByCategory: Partial<Record<ShiftCategory, ShiftWithSource[]>> = {};
      for (const shift of shifts) {
        if (shift.lat == null || shift.lng == null) continue;
        if (!pointInPolygon({ lat: shift.lat, lng: shift.lng }, area.geom)) continue;
        (shiftsByCategory[shift.category] ??= []).push(shift);
      }
      const areaProjects = projects.filter(
        (p) => p.latitude != null && p.longitude != null && pointInPolygon({ lat: p.latitude, lng: p.longitude }, area.geom)
      );
      const count = Object.values(shiftsByCategory).reduce((sum, items) => sum + items.length, 0) + areaProjects.length;
      return { area, shiftsByCategory, projects: areaProjects, count };
    });
  }, [momentumAreas, shifts, projects]);

  const primaryMomentumAreaId = useMemo(() => {
    if (momentumAreaBreakdowns.length === 0) return null;
    const sorted = [...momentumAreaBreakdowns].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const rankDiff = MOMENTUM_STATE_RANK[b.area.momentum_state] - MOMENTUM_STATE_RANK[a.area.momentum_state];
      if (rankDiff !== 0) return rankDiff;
      return a.area.name.localeCompare(b.area.name);
    });
    return sorted[0].area.id;
  }, [momentumAreaBreakdowns]);

  const topMomentumAreaBreakdown = momentumAreaBreakdowns.find((b) => b.area.id === primaryMomentumAreaId) ?? null;

  const selectedMomentumAreaBreakdown = momentumAreaBreakdowns.find((b) => b.area.id === selectedMomentumAreaId) ?? null;

  function selectMomentumTab() {
    setView("momentum");
    setSelectedMomentumAreaId(primaryMomentumAreaId);
  }

  const selectedShift = filteredShifts.find((s) => s.id === selectedShiftId) ?? null;
  const selectedZone = buildabilityZones.find((z) => z.id === selectedZoneId) ?? null;
  const selectedOpportunity = filteredOpportunities.find((o) => o.id === selectedOpportunityId) ?? null;

  // Momentum/Buildability for the selected opportunity are computed here
  // (pointInPolygon against growth_areas/zoning_land_use), not stored on
  // development_opportunities -- same single-source-of-truth reasoning
  // as the Momentum tab's own area breakdown. Some opportunities (see
  // the "zoning" category's intersection-only rows) have no lat/lng at
  // all, in which case there's nothing to test against either polygon
  // layer.
  const selectedOpportunityMomentumArea = useMemo(() => {
    if (!selectedOpportunity || selectedOpportunity.latitude == null || selectedOpportunity.longitude == null) return null;
    const point = { lat: selectedOpportunity.latitude, lng: selectedOpportunity.longitude };
    return momentumAreas.find((area) => pointInPolygon(point, area.geom)) ?? null;
  }, [selectedOpportunity, momentumAreas]);

  const selectedOpportunityBuildabilityZone = useMemo(() => {
    if (!selectedOpportunity || selectedOpportunity.latitude == null || selectedOpportunity.longitude == null) return null;
    const point = { lat: selectedOpportunity.latitude, lng: selectedOpportunity.longitude };
    return buildabilityZones.find((zone) => pointInPolygon(point, zone.geom)) ?? null;
  }, [selectedOpportunity, buildabilityZones]);

  const railCounts = useMemo<Partial<Record<View, number>>>(
    () => ({
      opportunities: allOpportunities.length,
      developers: developerProfiles.length,
      contractors: contractorProfiles.length,
    }),
    [allOpportunities, developerProfiles, contractorProfiles]
  );

  // The Overview page's 4 summary cards -- Active Projects, Development
  // Signals (every plans/permits/infrastructure/business/property/
  // distress shift on file, not just one category), Opportunities,
  // Friction Cases -- each a real count off data already loaded, plus a
  // real "vs. previous 7 days" delta where a trustworthy date field
  // exists (date_announced/event_date/date_identified). Friction Cases
  // has no delta: development_friction_cases has no "case opened" date
  // field, only created_at (data-curation timestamp, not a real-world
  // event -- see the same reasoning ShiftDashboardView used to avoid
  // date_updated for Projects).
  const metricCards: MetricCard[] = useMemo(() => {
    const since7d = shiftDateRangeToDate("7d");
    const activeProjects = projects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
    const activeProjectsDelta = activeProjects.filter((p) => p.date_announced != null && p.date_announced >= since7d).length;
    const signalsDelta = shifts.filter((s) => s.event_date >= since7d).length;
    const opportunitiesDelta = allOpportunities.filter((o) => o.date_identified >= since7d).length;
    const marketFrictionCaseCount = developmentFrictionCases.filter((c) => c.market_id === market.id).length;

    return [
      {
        key: "activeProjects",
        label: "Active Projects",
        value: String(activeProjects.length),
        weeklyDelta: activeProjectsDelta,
        iconPaths: PROJECT_ICON_PATHS.building,
        color: "#3b82f6",
        onClick: () => selectView("projects"),
      },
      {
        key: "signals",
        label: "Development Signals",
        value: String(shifts.length),
        weeklyDelta: signalsDelta,
        iconPaths: ICON_PATHS.pulse,
        color: ACTIVITY_COLOR,
        onClick: () => selectView("momentum"),
      },
      {
        key: "opportunities",
        label: "Opportunities",
        value: String(allOpportunities.length),
        weeklyDelta: opportunitiesDelta,
        iconPaths: ICON_PATHS.barChart,
        color: OPPORTUNITIES_COLOR,
        onClick: () => selectView("opportunities"),
      },
      {
        key: "friction",
        label: "Friction Cases",
        value: String(marketFrictionCaseCount),
        weeklyDelta: 0,
        iconPaths: FRICTION_ICON_PATHS,
        color: "#ef4444",
        onClick: () => selectView("friction"),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shifts, projects, allOpportunities, developmentFrictionCases, market.id]);

  function tabButtonClass(active: boolean, block: boolean) {
    return `rounded-lg px-3 py-2 text-left text-sm font-medium transition ${block ? "lg:w-full" : ""} ${
      active ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
    }`;
  }

  function selectView(v: View) {
    setExpandedGroup(VIEW_GROUP[v]);
    if (v === "momentum") selectMomentumTab();
    else setView(v);
  }

  // Clicking the group you're already in toggles its dropdown open/closed
  // without touching `view` (the content underneath doesn't change).
  // Clicking a different group jumps to its first sub-view and opens its
  // dropdown, same as before.
  function selectGroup(group: Group) {
    if (VIEW_GROUP[view] === group) {
      setExpandedGroup((prev) => (prev === group ? null : group));
      return;
    }
    const g = GROUPS.find((x) => x.value === group)!;
    selectView(g.views[0]);
  }

  function primaryNav() {
    return GROUPS.map((g) => (
      <button
        key={g.value}
        type="button"
        onClick={() => selectGroup(g.value)}
        className={tabButtonClass(VIEW_GROUP[view] === g.value, true)}
      >
        {g.label}
      </button>
    ));
  }

  // Second-level tabs for whichever group is active -- only rendered
  // while that group's dropdown is expanded, and omitted entirely for
  // single-view groups (Projects, Friction today), where a dropdown with
  // one option is just noise.
  function subNav() {
    const group = GROUPS.find((g) => g.value === VIEW_GROUP[view]);
    if (!group || group.views.length < 2 || expandedGroup !== group.value) return null;
    return (
      <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
        {group.views.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => selectView(v)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              view === v ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
            }`}
          >
            {VIEW_LABEL[v]}
            {railCounts[v] != null && ` (${railCounts[v]})`}
          </button>
        ))}
      </div>
    );
  }

  // Desktop rail: unlike the mobile pill row (primaryNav + subNav stacked
  // as two separate rows), the sub-tabs nest directly under their own
  // group button here -- a proper expand/collapse accordion, with a
  // chevron that flips per Jared's ask, rather than a second list
  // detached at the bottom of the whole nav.
  function desktopNavTree() {
    return GROUPS.map((g) => {
      const isActiveGroup = VIEW_GROUP[view] === g.value;
      const isExpandable = g.views.length > 1;
      const isExpanded = isExpandable && expandedGroup === g.value;
      return (
        <div key={g.value}>
          <button
            type="button"
            onClick={() => selectGroup(g.value)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
              isActiveGroup ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
            }`}
          >
            <span>{g.label}</span>
            {isExpandable && (
              <svg viewBox="0 0 20 20" fill="none" className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          {isExpanded && (
            <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l border-[#1c1c1c]/10 pl-2">
              {g.views.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => selectView(v)}
                  className={`rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${
                    view === v ? "bg-[#1c1c1c]/10 text-[#1c1c1c]" : "text-[#1c1c1c]/50 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
                  }`}
                >
                  {VIEW_LABEL[v]}
                  {railCounts[v] != null && ` (${railCounts[v]})`}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div>
      {/* Persistent far-left rail (desktop): logo, then the five list-first
          destinations. Fixed so it spans the full page height regardless of
          where this component sits in the header's centered content column. */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-56 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:border-r lg:border-[#1c1c1c]/10 lg:bg-[#f4f2ee] lg:px-4 lg:py-6">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2">
          <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
        </Link>
        <nav className="flex flex-col gap-0.5">{desktopNavTree()}</nav>
      </aside>

      <div className="lg:pl-56">
        <div className="space-y-3">
          {/* Below lg the fixed aside is hidden, so the logo needs a home
              here instead -- otherwise mobile loses all branding. */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
          </Link>

          {/* Lives here (not in the page above) so it stays inside the
              lg:pl-56 offset -- a page-level <h1> rendered as this
              component's sibling would sit outside that padding and get
              hidden behind the fixed rail at typical viewport widths. */}
          <div>
            <h1 className="text-2xl font-semibold text-[#1c1c1c]">
              {market.name}, {market.state}
            </h1>
          </div>

          {/* What Matters Now + the 4 summary cards are Overview-only --
              every other tab (Momentum especially) stays decluttered so
              its map/feed/list can be the whole page. */}
          {view === "market" && (
            <>
              <BriefingSummary
                shifts={shifts}
                projects={projects}
                allOpportunities={allOpportunities}
                topMomentumAreaBreakdown={topMomentumAreaBreakdown}
              />

              <MetricCardRow cards={metricCards} />
            </>
          )}

          {view === "friction" && (
            <DevelopmentFrictionOverview counts={frictionStatusCounts} activeTab={frictionStatusTab} onSelectTab={setFrictionStatusTab} />
          )}

          <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">{primaryNav()}</nav>
          {subNav() && <div className="lg:hidden">{subNav()}</div>}

          <div className="min-w-0 flex-1 space-y-3">
            {view === "market" && (
              <>
                <MarketOverviewSection indicators={marketIndicators} overview={marketOverview} />
                <InvestmentSummary investments={investments} />
                <DevelopmentFrictionSection signals={developmentFrictionSignals} />
                <EntitlementCasesSection cases={entitlementCases} marketSlug={market.slug} />
              </>
            )}

            {view === "friction" && (
              <>
                <DevelopmentFrictionFilters markets={markets} filters={frictionFilters} onChange={setFrictionFilters} />
                {filteredFrictionCases.length === 0 ? (
                  <p className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-sm text-[#1c1c1c]/40">
                    No development friction cases match these filters yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {filteredFrictionCases.map((frictionCase) => (
                      <DevelopmentFrictionCaseCard key={frictionCase.id} frictionCase={frictionCase} />
                    ))}
                  </div>
                )}
              </>
            )}

            {view === "momentum" && (
              <>
                <ShiftFilters categories={categories} onToggleCategory={toggleCategory} range={range} onSelectRange={setRange} />

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_320px]">
                  <div className="relative h-[calc(100vh-220px)] min-h-[520px]">
                    <ShiftMap
                      market={market}
                      shifts={filteredShifts}
                      selectedShiftId={selectedShiftId}
                      onSelectShift={setSelectedShiftId}
                      momentumAreas={momentumAreas}
                      selectedMomentumAreaId={selectedMomentumAreaId}
                      onSelectMomentumArea={setSelectedMomentumAreaId}
                    />
                    {selectedShift ? (
                      <ShiftDetailPanel shift={selectedShift} people={projectPeople} onClose={() => setSelectedShiftId(null)} />
                    ) : (
                      selectedMomentumAreaBreakdown && (
                        <MomentumAreaDetailPanel
                          area={selectedMomentumAreaBreakdown.area}
                          shiftsByCategory={selectedMomentumAreaBreakdown.shiftsByCategory}
                          projects={selectedMomentumAreaBreakdown.projects}
                          projectPeople={projectPeople}
                          selectedShiftId={selectedShiftId}
                          onSelectShift={setSelectedShiftId}
                          onClose={() => setSelectedMomentumAreaId(null)}
                        />
                      )
                    )}
                  </div>

                  <div className="h-[calc(100vh-220px)] min-h-[520px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                    <ShiftFeed shifts={filteredShifts} selectedShiftId={selectedShiftId} onSelectShift={setSelectedShiftId} />
                  </div>
                </div>

                {shifts.length === 0 && (
                  <p className="text-sm text-[#1c1c1c]/40">
                    No shifts recorded yet for {market.name} — this market hasn't been researched yet.
                  </p>
                )}
              </>
            )}

            {view === "projects" && (
              <div className="max-h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                <ProjectsList projects={projects} projectPeople={projectPeople} />
              </div>
            )}

            {view === "developers" && (
              <div className="relative h-[640px]">
                <div className="h-full overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <CompanyList profiles={developerProfiles} selectedKey={selectedCompanyKey} onSelect={setSelectedCompanyKey} />
                </div>
                {(() => {
                  const selected = developerProfiles.find((p) => p.key === selectedCompanyKey) ?? null;
                  return selected && <CompanyDetailPanel profile={selected} onClose={() => setSelectedCompanyKey(null)} />;
                })()}
              </div>
            )}

            {view === "contractors" && (
              <div className="relative h-[640px]">
                <div className="h-full overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <CompanyList profiles={contractorProfiles} selectedKey={selectedCompanyKey} onSelect={setSelectedCompanyKey} />
                </div>
                {(() => {
                  const selected = contractorProfiles.find((p) => p.key === selectedCompanyKey) ?? null;
                  return selected && <CompanyDetailPanel profile={selected} onClose={() => setSelectedCompanyKey(null)} />;
                })()}
              </div>
            )}

            {view === "opportunities" && (
              <>
                <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
                  {OPPORTUNITY_GROUP_FILTER_OPTIONS.map((group) => {
                    const active = opportunityGroupFilter.has(group);
                    const color = OPPORTUNITY_GROUP_COLOR[group];
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => toggleOpportunityGroup(group)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition"
                        style={active ? { backgroundColor: color, color: "#fff" } : { color: "#1c1c1c80" }}
                      >
                        {OPPORTUNITY_GROUP_LABEL[group]}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                  <div className="relative h-[640px]">
                    <OpportunityMap
                      market={market}
                      opportunities={filteredOpportunities}
                      selectedOpportunityId={selectedOpportunityId}
                      onSelectOpportunity={setSelectedOpportunityId}
                    />
                    {selectedOpportunity && (
                      <OpportunityDetailPanel
                        opportunity={selectedOpportunity}
                        momentumArea={selectedOpportunityMomentumArea}
                        buildabilityZone={selectedOpportunityBuildabilityZone}
                        onClose={() => setSelectedOpportunityId(null)}
                      />
                    )}
                  </div>
                  <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                    <OpportunityFeed
                      opportunities={filteredOpportunities}
                      selectedOpportunityId={selectedOpportunityId}
                      onSelectOpportunity={setSelectedOpportunityId}
                    />
                  </div>
                </div>
              </>
            )}

            {view === "buildability" && (
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                <div className="relative h-[640px]">
                  <BuildabilityMap
                    market={market}
                    zones={buildabilityZones}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={setSelectedZoneId}
                  />
                  {selectedZone && (
                    <div className="absolute bottom-3 left-3 right-3 max-h-[300px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white shadow-lg">
                      <BuildabilityDetailPanel zone={selectedZone} onClose={() => setSelectedZoneId(null)} />
                    </div>
                  )}
                </div>
                <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <BuildabilityList zones={buildabilityZones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
