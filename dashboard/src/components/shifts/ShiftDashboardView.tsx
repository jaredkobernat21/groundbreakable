"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  DevelopmentOpportunityWithSources,
  GrowthArea,
  InvestmentType,
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
import { OPPORTUNITY_GROUP_LABEL } from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import { INVESTMENT_TYPE_LABEL } from "@/lib/investmentConstants";
import { OPPORTUNITY_GROUP_COLOR } from "@/lib/opportunityConstants";
import { computeProjectOpportunities } from "@/lib/opportunityRules";
import { pointInPolygon } from "@/lib/geo";
import { formatCurrency } from "@/lib/format";
import { ICON_PATHS } from "@/lib/icons";
import { PROJECT_ICON_PATHS } from "@/lib/markerIcons";
import { SHIFT_CATEGORY_COLOR, SHIFT_CATEGORY_ICON_PATHS } from "@/lib/shiftConstants";
import BriefingSummary from "./BriefingSummary";
import MetricCardRow, { type MetricCard } from "./MetricCardRow";
import ShiftFilters from "./ShiftFilters";
import ShiftMap from "./ShiftMap";
import ShiftFeed from "./ShiftFeed";
import ShiftDetailPanel from "./ShiftDetailPanel";
import ProjectsList from "./ProjectsList";
import PeopleList from "./PeopleList";
import MomentumAreaDetailPanel from "./MomentumAreaDetailPanel";
import BuildabilityMap from "./BuildabilityMap";
import BuildabilityList from "./BuildabilityList";
import BuildabilityDetailPanel from "./BuildabilityDetailPanel";
import InvestmentMap from "./InvestmentMap";
import InvestmentFeed from "./InvestmentFeed";
import InvestmentDetailPanel from "./InvestmentDetailPanel";
import InvestmentSummary from "./InvestmentSummary";
import OpportunityMap from "./OpportunityMap";
import OpportunityFeed from "./OpportunityFeed";
import OpportunityDetailPanel from "./OpportunityDetailPanel";
import MarketOverviewSection from "./MarketOverviewSection";

type View =
  | "plans"
  | "projects"
  | "permits"
  | "infrastructure"
  | "investment"
  | "momentum"
  | "opportunities"
  | "buildability"
  | "developers"
  | "contractors"
  | "market";

// Product decision (Jared, 2026-09-06): the Development Intelligence
// restructure groups the dashboard's 11 views under 5 primary nav
// destinations -- Market, Projects, Opportunities, Infrastructure,
// Companies -- each with its own sub-tabs, replacing the earlier flat
// 11-button rail. Every underlying view/component/state below is
// unchanged; this is purely a navigation regrouping.
type Group = "market" | "projects" | "opportunities" | "infrastructure" | "companies";

const GROUPS: { value: Group; label: string; views: View[] }[] = [
  { value: "market", label: "Market", views: ["momentum", "market", "investment"] },
  { value: "projects", label: "Projects", views: ["projects", "plans", "permits"] },
  { value: "opportunities", label: "Opportunities", views: ["opportunities", "buildability"] },
  { value: "infrastructure", label: "Infrastructure", views: ["infrastructure"] },
  { value: "companies", label: "Companies", views: ["developers", "contractors"] },
];

const VIEW_GROUP = GROUPS.reduce((acc, g) => {
  for (const v of g.views) acc[v] = g.value;
  return acc;
}, {} as Record<View, Group>);

// Sub-tab labels -- distinct from each group's own label so a sub-tab
// never just repeats its parent (e.g. "Projects > Pipeline", not
// "Projects > Projects").
const ALL_VIEWS: View[] = GROUPS.flatMap((g) => g.views);

const VIEW_LABEL: Record<View, string> = {
  market: "Overview",
  momentum: "Momentum",
  investment: "Investment",
  projects: "Pipeline",
  plans: "Plans",
  permits: "Permits",
  opportunities: "Opportunities",
  buildability: "Buildability",
  infrastructure: "Infrastructure",
  developers: "Developers",
  contractors: "Contractors",
};

// Which shift categories feed each rail tab's map+feed view. Investment
// is no longer part of this -- as of 2026-09-05 it's backed by its own
// `investments` table (see supabase/migrations/20260905000000_investment_
// schema.sql), not a filter over the business/property shift categories.
const CATEGORIES_BY_VIEW: Partial<Record<View, ShiftCategory[]>> = {
  plans: ["plans"],
  permits: ["building"],
  infrastructure: ["infrastructure"],
};

const INVESTMENT_TYPE_FILTER_OPTIONS = Object.keys(INVESTMENT_TYPE_LABEL) as InvestmentType[];
const OPPORTUNITY_GROUP_FILTER_OPTIONS = Object.keys(OPPORTUNITY_GROUP_LABEL) as OpportunityGroup[];

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
}) {
  const [view, setView] = useState<View>("momentum");
  const [categories, setCategories] = useState<Set<ShiftCategory>>(new Set(ACTIVE_SHIFT_CATEGORIES));
  const [range, setRange] = useState<ShiftDateRange>("7d");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedCategoryShiftId, setSelectedCategoryShiftId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [investmentTypeFilter, setInvestmentTypeFilter] = useState<Set<InvestmentType>>(new Set(INVESTMENT_TYPE_FILTER_OPTIONS));
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [selectedMomentumAreaId, setSelectedMomentumAreaId] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [opportunityGroupFilter, setOpportunityGroupFilter] = useState<Set<OpportunityGroup>>(
    new Set(OPPORTUNITY_GROUP_FILTER_OPTIONS)
  );

  function toggleInvestmentType(type: InvestmentType) {
    setInvestmentTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

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

  const categoryShifts = useMemo(() => {
    const wantedCategories = CATEGORIES_BY_VIEW[view];
    if (!wantedCategories) return [];
    return shifts.filter((s) => wantedCategories.includes(s.category));
  }, [shifts, view]);

  const filteredInvestments = useMemo(
    () => investments.filter((i) => investmentTypeFilter.has(i.investment_type)),
    [investments, investmentTypeFilter]
  );

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

  const developerPeople = useMemo(() => projectPeople.filter((p) => p.role === "developer"), [projectPeople]);
  const contractorPeople = useMemo(() => projectPeople.filter((p) => p.role === "contractor"), [projectPeople]);
  const developerCount = useMemo(() => new Set(developerPeople.map((p) => p.person_name ?? p.company_name)).size, [developerPeople]);
  const contractorCount = useMemo(() => new Set(contractorPeople.map((p) => p.person_name ?? p.company_name)).size, [contractorPeople]);

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

  const topMomentumArea = momentumAreas.find((a) => a.id === primaryMomentumAreaId) ?? null;

  const selectedMomentumAreaBreakdown = momentumAreaBreakdowns.find((b) => b.area.id === selectedMomentumAreaId) ?? null;

  function selectMomentumTab() {
    setView("momentum");
    setSelectedMomentumAreaId(primaryMomentumAreaId);
  }

  const selectedShift = filteredShifts.find((s) => s.id === selectedShiftId) ?? null;
  const selectedCategoryShift = categoryShifts.find((s) => s.id === selectedCategoryShiftId) ?? null;
  const selectedZone = buildabilityZones.find((z) => z.id === selectedZoneId) ?? null;
  const selectedInvestment = filteredInvestments.find((i) => i.id === selectedInvestmentId) ?? null;
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

  const railCounts = useMemo(() => {
    const counts: Partial<Record<View, number>> = {
      projects: projects.length,
      investment: investments.length,
      developers: developerCount,
      contractors: contractorCount,
      opportunities: allOpportunities.length,
    };
    for (const v of ALL_VIEWS) {
      const wanted = CATEGORIES_BY_VIEW[v];
      if (wanted) counts[v] = shifts.filter((s) => wanted.includes(s.category)).length;
    }
    return counts;
  }, [shifts, projects, investments, developerCount, contractorCount, allOpportunities]);

  // "vs. previous 7 days" on each metric card is a real count of items
  // dated in the last 7 days -- event_date for shifts, date_announced for
  // projects, announcement_date for investments -- not a fabricated
  // trend. Deliberately NOT date_updated for projects: that column gets
  // bumped by this app's own migrations/admin edits, which would read as
  // "market activity" when it's really just data curation.
  const metricCards: MetricCard[] = useMemo(() => {
    const since7d = shiftDateRangeToDate("7d");
    const plansDelta = shifts.filter((s) => s.category === "plans" && s.event_date >= since7d).length;
    const permitsDelta = shifts.filter((s) => s.category === "building" && s.event_date >= since7d).length;
    const infraDelta = shifts.filter((s) => s.category === "infrastructure" && s.event_date >= since7d).length;
    const projectsDelta = projects.filter((p) => p.date_announced != null && p.date_announced >= since7d).length;
    const investmentDelta = investments.filter((i) => i.announcement_date != null && i.announcement_date >= since7d).length;
    const totalInvestmentAmount = investments.reduce((sum, i) => sum + (i.total_investment_amount ?? 0), 0);

    return [
      {
        key: "projects",
        label: "Projects",
        value: String(projects.length),
        weeklyDelta: projectsDelta,
        iconPaths: PROJECT_ICON_PATHS.building,
        color: "#3b82f6",
        onClick: () => setView("projects"),
      },
      {
        key: "plans",
        label: "Plans",
        value: String(railCounts.plans ?? 0),
        weeklyDelta: plansDelta,
        iconPaths: SHIFT_CATEGORY_ICON_PATHS.plans,
        color: SHIFT_CATEGORY_COLOR.plans,
        onClick: () => setView("plans"),
      },
      {
        key: "permits",
        label: "Permits",
        value: String(railCounts.permits ?? 0),
        weeklyDelta: permitsDelta,
        iconPaths: SHIFT_CATEGORY_ICON_PATHS.building,
        color: SHIFT_CATEGORY_COLOR.building,
        onClick: () => setView("permits"),
      },
      {
        key: "infrastructure",
        label: "Infrastructure",
        value: String(railCounts.infrastructure ?? 0),
        weeklyDelta: infraDelta,
        iconPaths: SHIFT_CATEGORY_ICON_PATHS.infrastructure,
        color: SHIFT_CATEGORY_COLOR.infrastructure,
        onClick: () => setView("infrastructure"),
      },
      {
        key: "investment",
        label: "Investment",
        value: formatCurrency(totalInvestmentAmount) ?? "$0",
        weeklyDelta: investmentDelta,
        iconPaths: ICON_PATHS.dollar,
        color: "#818cf8",
        onClick: () => setView("investment"),
      },
    ];
  }, [shifts, projects, investments, railCounts]);

  function tabButtonClass(active: boolean, block: boolean) {
    return `rounded-lg px-3 py-2 text-left text-sm font-medium transition ${block ? "lg:w-full" : ""} ${
      active ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
    }`;
  }

  function selectView(v: View) {
    if (v === "momentum") selectMomentumTab();
    else setView(v);
  }

  function selectGroup(group: Group) {
    if (VIEW_GROUP[view] === group) return;
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

  // Second-level tabs for whichever group is active. Omitted entirely for
  // single-view groups (Infrastructure today) -- a sub-nav row with one
  // option is just noise. Reuses the same rounded-pill pattern already
  // used for the Momentum-area/Investment-type/Opportunity-category
  // toggles below, so it reads as "more navigation," not a new filter
  // idiom.
  function subNav() {
    const group = GROUPS.find((g) => g.value === VIEW_GROUP[view]);
    if (!group || group.views.length < 2) return null;
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

  return (
    <div>
      {/* Persistent far-left rail (desktop): logo, then the six list-first
          destinations. Fixed so it spans the full page height regardless of
          where this component sits in the header's centered content column. */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-56 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:border-r lg:border-[#1c1c1c]/10 lg:bg-[#f4f2ee] lg:px-4 lg:py-6">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2">
          <img src="/groundbreakable-icon.svg" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
        </Link>
        <nav className="flex flex-col gap-0.5">{primaryNav()}</nav>
        {subNav() && <div className="mt-2 px-0.5">{subNav()}</div>}
        <p className="mt-auto pt-6 text-xs leading-relaxed text-[#1c1c1c]/40">From insight to a more buildable tomorrow.</p>
      </aside>

      <div className="lg:pl-56">
        <div className="space-y-3">
          {/* Below lg the fixed aside is hidden, so the logo needs a home
              here instead -- otherwise mobile loses all branding. */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <img src="/groundbreakable-icon.svg" alt="" className="h-7 w-7" />
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
            <p className="text-sm text-[#1c1c1c]/50">Smarter development starts here.</p>
          </div>

          <BriefingSummary
            shifts={shifts}
            projects={projects}
            buildabilityZones={buildabilityZones}
            topMomentumArea={topMomentumArea}
          />

          <MetricCardRow cards={metricCards} />

          <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">{primaryNav()}</nav>
          {subNav() && <div className="lg:hidden">{subNav()}</div>}

          <div className="min-w-0 flex-1 space-y-3">
            {view === "market" && <MarketOverviewSection indicators={marketIndicators} overview={marketOverview} />}

            {view === "momentum" && (
              <>
                {momentumAreaBreakdowns.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
                    {momentumAreaBreakdowns.map(({ area, count }) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => setSelectedMomentumAreaId(area.id === selectedMomentumAreaId ? null : area.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          selectedMomentumAreaId === area.id ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
                        }`}
                      >
                        {area.name} ({count})
                      </button>
                    ))}
                  </div>
                )}

                <ShiftFilters categories={categories} onToggleCategory={toggleCategory} range={range} onSelectRange={setRange} />

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                  <div className="relative h-[640px]">
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
                        <div className="absolute bottom-3 left-3 right-3 max-h-[320px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white shadow-lg">
                          <MomentumAreaDetailPanel
                            area={selectedMomentumAreaBreakdown.area}
                            shiftsByCategory={selectedMomentumAreaBreakdown.shiftsByCategory}
                            projects={selectedMomentumAreaBreakdown.projects}
                            projectPeople={projectPeople}
                            selectedShiftId={selectedShiftId}
                            onSelectShift={setSelectedShiftId}
                            onClose={() => setSelectedMomentumAreaId(null)}
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
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
              <div className="max-h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                <PeopleList people={developerPeople} />
              </div>
            )}

            {view === "contractors" && (
              <div className="max-h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                <PeopleList people={contractorPeople} />
              </div>
            )}

            {view === "investment" && (
              <>
                <InvestmentSummary investments={investments} />

                <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
                  {INVESTMENT_TYPE_FILTER_OPTIONS.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleInvestmentType(type)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        investmentTypeFilter.has(type) ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
                      }`}
                    >
                      {INVESTMENT_TYPE_LABEL[type]}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                  <div className="relative h-[640px]">
                    <InvestmentMap
                      market={market}
                      investments={filteredInvestments}
                      selectedInvestmentId={selectedInvestmentId}
                      onSelectInvestment={setSelectedInvestmentId}
                    />
                    {selectedInvestment && (
                      <InvestmentDetailPanel investment={selectedInvestment} onClose={() => setSelectedInvestmentId(null)} />
                    )}
                  </div>
                  <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                    <InvestmentFeed
                      investments={filteredInvestments}
                      selectedInvestmentId={selectedInvestmentId}
                      onSelectInvestment={setSelectedInvestmentId}
                    />
                  </div>
                </div>

                {investments.length === 0 && (
                  <p className="text-sm text-[#1c1c1c]/40">
                    No investments recorded yet for {market.name} — this market hasn't been researched yet.
                  </p>
                )}
              </>
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

            {(view === "plans" || view === "permits" || view === "infrastructure") && (
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                <div className="relative h-[640px]">
                  <ShiftMap
                    market={market}
                    shifts={categoryShifts}
                    selectedShiftId={selectedCategoryShiftId}
                    onSelectShift={setSelectedCategoryShiftId}
                  />
                  {selectedCategoryShift && (
                    <ShiftDetailPanel
                      shift={selectedCategoryShift}
                      people={projectPeople}
                      onClose={() => setSelectedCategoryShiftId(null)}
                    />
                  )}
                </div>
                <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <ShiftFeed shifts={categoryShifts} selectedShiftId={selectedCategoryShiftId} onSelectShift={setSelectedCategoryShiftId} />
                </div>
              </div>
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
