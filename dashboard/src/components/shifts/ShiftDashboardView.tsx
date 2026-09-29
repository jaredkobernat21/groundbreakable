"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  CatalystWithSources,
  DevelopmentFrictionCaseWithSource,
  DevelopmentFrictionSignalWithSource,
  DevelopmentOpportunityWithSources,
  EntitlementCaseDetail,
  GrowthArea,
  InvestmentWithSource,
  Market,
  MarketIndicatorWithSource,
  MarketOverviewWithSources,
  ProjectEventWithProject,
  ProjectPersonWithSource,
  ProjectWithSource,
  ShiftCategory,
  ShiftWithSource,
  ZoningLandUseWithSource,
} from "@/lib/types";
import { OPPORTUNITIES_COLOR } from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, SHIFT_CATEGORY_COLOR, shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import { deriveOpportunityTypeTag, OPPORTUNITY_TYPE_TAG_LABEL, type OpportunityTypeTag } from "@/lib/opportunityConstants";
import { deriveInvestmentMarketCategory, INVESTMENT_MARKET_CATEGORY_LABEL, type InvestmentMarketCategory } from "@/lib/investmentConstants";
import { derivePlanSubcategory, PLAN_SUBCATEGORY_LABEL, type PlanSubcategory } from "@/lib/planSubcategory";
import { computeFrictionOpportunities } from "@/lib/opportunityRules";
import { buildPlanItems, planItemDate, planItemKey } from "@/lib/planItems";
import { nearbyCatalystForPoint, nearbyOpportunitiesForCatalyst, nearbyPlanItemsForCatalyst } from "@/lib/catalystRules";
import type { EntitlementRealityScoreResult } from "@/lib/entitlement/score";
import { pointInPolygon } from "@/lib/geo";
import BriefingSummary from "./BriefingSummary";
import MetricCardRow, { type MetricCard } from "./MetricCardRow";
import HeroMap, { type HeroMapLayer } from "./HeroMap";
import ShiftFilters from "./ShiftFilters";
import OpportunityMap from "./OpportunityMap";
import OpportunityFeed from "./OpportunityFeed";
import OpportunityDetailPanel from "./OpportunityDetailPanel";
import MarketOverviewSection from "./MarketOverviewSection";
import InvestmentSummary from "./InvestmentSummary";
import DevelopmentFrictionSection from "./DevelopmentFrictionSection";
import PlansMap from "../plans/PlansMap";
import PlansFeed from "../plans/PlansFeed";
import PlanDetailPanel from "../plans/PlanDetailPanel";
import CatalystDetailPanel from "../catalysts/CatalystDetailPanel";
import CatalystMap from "../catalysts/CatalystMap";
import CatalystFeed from "../catalysts/CatalystFeed";

// Redesign (Jared, 2026-09-25): the dashboard now has exactly two main
// features -- Plans (early, pre-permit development activity/decisions)
// and Opportunities (specific sites a developer could act on) -- plus an
// Overview landing that briefs both at once above one hero map. Projects/
// Friction/Companies are no longer their own destinations; that data now
// lives as context inside a Plan or Opportunity's own detail panel (see
// PlanDetailPanel and OpportunityDetailPanel's originFrictionCase).
// Catalysts is a real 4th top-level tab (Jared, 2026-09-29 -- supersedes
// the original "do not make CATALYST a third top-level category in V1"
// instruction) with its own map+feed, matching the Plans/Opportunities
// structural pattern. Market/Plans/Opportunities each carry a subcategory
// list, rendered as a collapsible dropdown nested under their sidebar
// entry (desktop) or a second chip row under the top nav (mobile) --
// replacing the in-page tab row (Market) and multi-select filter chips
// (Opportunities) that used to live on each page. Catalysts has none.
type View = "overview" | "plans" | "opportunities" | "catalysts";

const NAV: { value: View; label: string }[] = [
  { value: "overview", label: "Market" },
  { value: "plans", label: "Plans" },
  { value: "opportunities", label: "Opportunities" },
  { value: "catalysts", label: "Catalysts" },
];

// "overview" means "no subcategory filter" for each -- Market indicators
// and the friction section aren't collapsed into any of the four
// Infrastructure/Budget/Utilities/Incentive categories in the schema
// today, so they only show under Market's unfiltered state rather than
// being force-fit or silently duplicated under every subcategory.
type MarketSubTab = "overview" | InvestmentMarketCategory;
type OpportunitySubTab = "all" | OpportunityTypeTag;
type PlanSubTab = "all" | PlanSubcategory;

const MARKET_SUB_TABS: { value: InvestmentMarketCategory; label: string }[] = [
  { value: "infrastructure", label: INVESTMENT_MARKET_CATEGORY_LABEL.infrastructure },
  { value: "budget", label: INVESTMENT_MARKET_CATEGORY_LABEL.budget },
  { value: "utilities", label: INVESTMENT_MARKET_CATEGORY_LABEL.utilities },
  { value: "incentive", label: INVESTMENT_MARKET_CATEGORY_LABEL.incentive },
];

const OPPORTUNITY_SUB_TABS: { value: OpportunityTypeTag; label: string }[] = (
  Object.keys(OPPORTUNITY_TYPE_TAG_LABEL) as OpportunityTypeTag[]
).map((value) => ({ value, label: OPPORTUNITY_TYPE_TAG_LABEL[value] }));

// "other" is a catch-all bucket (see derivePlanSubcategory) for whatever
// doesn't match a real request type -- not worth its own dropdown row.
const PLAN_SUB_TABS: { value: PlanSubcategory; label: string }[] = (
  ["rezoning", "plat", "conditional_use_permit", "annexation", "site_plan", "infrastructure"] as PlanSubcategory[]
).map((value) => ({ value, label: PLAN_SUBCATEGORY_LABEL[value] }));

// Tie-break for "which Momentum Area is the primary one" -- higher wins.
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
  entitlementCaseDetails,
  developmentFrictionCases,
  projectEvents,
  entitlementRealityScores,
  catalysts,
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
  entitlementCaseDetails: EntitlementCaseDetail[];
  developmentFrictionCases: DevelopmentFrictionCaseWithSource[];
  projectEvents: ProjectEventWithProject[];
  entitlementRealityScores: Record<string, EntitlementRealityScoreResult>;
  catalysts: CatalystWithSources[];
}) {
  const [view, setView] = useState<View>("overview");
  const [expandedNav, setExpandedNav] = useState<Set<View>>(new Set());
  const [marketSubTab, setMarketSubTab] = useState<MarketSubTab>("overview");
  const [opportunitySubTab, setOpportunitySubTab] = useState<OpportunitySubTab>("all");
  const [plansSubTab, setPlansSubTab] = useState<PlanSubTab>("all");
  const [heroLayer, setHeroLayer] = useState<HeroMapLayer>("both");
  const [categories, setCategories] = useState<Set<ShiftCategory>>(new Set(ACTIVE_SHIFT_CATEGORIES));
  const [range, setRange] = useState<ShiftDateRange>("all");
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedCatalystId, setSelectedCatalystId] = useState<string | null>(null);

  function toggleCategory(category: ShiftCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  // Switching main sidebar tab always resets that tab's own subcategory
  // back to "all"/"overview" -- clicking a subcategory item directly (see
  // the nav tree below) is the only way to land on a filtered view.
  function selectView(v: View) {
    setView(v);
    if (v === "overview") setMarketSubTab("overview");
    else if (v === "plans") setPlansSubTab("all");
    else if (v === "opportunities") setOpportunitySubTab("all");
  }

  function isNavExpanded(v: View) {
    return view === v || expandedNav.has(v);
  }

  function toggleNavExpanded(v: View) {
    setExpandedNav((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  // The dashboard's baseline Plans scope is pre-permit shifts
  // (ACTIVE_SHIFT_CATEGORIES) plus every entitlement case -- this is what
  // the Overview hero and BriefingSummary always show. The Plans tab's own
  // category/date filters (below) narrow *within* this scope, they never
  // widen past it.
  const scopedShifts = useMemo(() => shifts.filter((s) => ACTIVE_SHIFT_CATEGORIES.includes(s.category)), [shifts]);
  const allPlanItems = useMemo(() => buildPlanItems(scopedShifts, entitlementCaseDetails), [scopedShifts, entitlementCaseDetails]);

  const visiblePlanItems = useMemo(() => {
    const since = shiftDateRangeToDate(range);
    return allPlanItems.filter((item) => {
      if (item.kind === "shift" && !categories.has(item.shift.category)) return false;
      if (plansSubTab !== "all" && derivePlanSubcategory(item) !== plansSubTab) return false;
      return planItemDate(item) >= since;
    });
  }, [allPlanItems, categories, range, plansSubTab]);

  // Site Opportunities (development_opportunities rows tagged for the
  // "development" audience) plus stalled/abandoned sites derived live from
  // this market's friction cases (see lib/opportunityRules.ts) -- the
  // Builder/Contractor lens is dropped from this dashboard per Jared,
  // that's a different audience than "sites a developer could act on."
  const marketFrictionCases = useMemo(
    () => developmentFrictionCases.filter((c) => c.market_id === market.id),
    [developmentFrictionCases, market.id]
  );

  const allOpportunities = useMemo(() => {
    const siteOpportunities = opportunities.filter((o) => o.opportunity_group === "development");
    return [...siteOpportunities, ...computeFrictionOpportunities(marketFrictionCases)];
  }, [opportunities, marketFrictionCases]);

  const filteredOpportunities = useMemo(
    () =>
      opportunitySubTab === "all" ? allOpportunities : allOpportunities.filter((o) => deriveOpportunityTypeTag(o) === opportunitySubTab),
    [allOpportunities, opportunitySubTab]
  );

  const marketSubTabInvestments = useMemo(
    () => (marketSubTab === "overview" ? investments : investments.filter((i) => deriveInvestmentMarketCategory(i) === marketSubTab)),
    [investments, marketSubTab]
  );

  // Every real shift/project whose lat/lng falls inside a Momentum Area's
  // polygon -- computed client-side (pointInPolygon), not a join table.
  // Scoped to the full shifts/projects lists (not the user's Plans-tab
  // filters), so an area's breakdown always explains its whole story.
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

  const selectedPlan = useMemo(() => allPlanItems.find((p) => planItemKey(p) === selectedPlanKey) ?? null, [allPlanItems, selectedPlanKey]);

  const selectedCaseDetail = useMemo(
    () => (selectedPlan?.kind === "entitlement" ? entitlementCaseDetails.find((c) => c.id === selectedPlan.id) ?? null : null),
    [selectedPlan, entitlementCaseDetails]
  );

  const selectedProject = useMemo(
    () => (selectedCaseDetail?.project_id ? projects.find((p) => p.id === selectedCaseDetail.project_id) ?? null : null),
    [selectedCaseDetail, projects]
  );

  const selectedProjectEvents = useMemo(
    () => (selectedProject ? projectEvents.filter((e) => e.project.id === selectedProject.id) : []),
    [projectEvents, selectedProject]
  );

  const selectedRealityScore = selectedCaseDetail ? entitlementRealityScores[selectedCaseDetail.id] ?? null : null;

  const selectedPlanFrictionCases = useMemo(() => {
    if (!selectedCaseDetail) return [];
    return developmentFrictionCases.filter(
      (fc) => fc.related_entitlement_case_id === selectedCaseDetail.id || (selectedProject != null && fc.related_project_id === selectedProject.id)
    );
  }, [developmentFrictionCases, selectedCaseDetail, selectedProject]);

  const selectedOpportunity = filteredOpportunities.find((o) => o.id === selectedOpportunityId) ?? null;

  const selectedOpportunityOriginFrictionCase = useMemo(() => {
    if (!selectedOpportunity?.id.startsWith("friction-opportunity-")) return null;
    const frictionId = selectedOpportunity.id.replace("friction-opportunity-", "");
    return developmentFrictionCases.find((fc) => fc.id === frictionId) ?? null;
  }, [selectedOpportunity, developmentFrictionCases]);

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

  const selectedOpportunityNearbyCatalyst = useMemo(() => {
    if (!selectedOpportunity || selectedOpportunity.latitude == null || selectedOpportunity.longitude == null) return null;
    return nearbyCatalystForPoint(catalysts, { lat: selectedOpportunity.latitude, lng: selectedOpportunity.longitude });
  }, [selectedOpportunity, catalysts]);

  // The market's single editorially spotlighted Catalyst ("the one
  // development most likely to move this market") -- surfaced prominently
  // in BriefingSummary. At most one per market (DB-enforced), see
  // lib/queries/catalysts.ts.
  const spotlightCatalyst = useMemo(() => catalysts.find((c) => c.is_spotlight) ?? null, [catalysts]);

  const selectedCatalyst = useMemo(() => catalysts.find((c) => c.id === selectedCatalystId) ?? null, [catalysts, selectedCatalystId]);

  const selectedCatalystNearbyPlans = useMemo(
    () => (selectedCatalyst ? nearbyPlanItemsForCatalyst(selectedCatalyst, allPlanItems) : []),
    [selectedCatalyst, allPlanItems]
  );

  const selectedCatalystNearbyOpportunities = useMemo(
    () => (selectedCatalyst ? nearbyOpportunitiesForCatalyst(selectedCatalyst, allOpportunities) : []),
    [selectedCatalyst, allOpportunities]
  );

  const heroSelectedKey =
    selectedPlanKey ??
    (selectedOpportunityId ? `opportunity-${selectedOpportunityId}` : selectedCatalystId ? `catalyst-${selectedCatalystId}` : null);

  // Shared selection router for every map (Hero, Plans) and the "Related
  // Plans/Opportunities" links inside CatalystDetailPanel and the "Nearby
  // Catalyst" link inside OpportunityDetailPanel -- one place that knows
  // how to read the kind-prefixed key convention (see lib/planItems.ts's
  // planItemKey and the `catalyst-`/`opportunity-` prefixes used on the
  // maps) and route to the right selection state, clearing the others so
  // only one detail panel is ever open at once.
  function handleMapSelect(key: string | null) {
    if (!key) {
      setSelectedPlanKey(null);
      setSelectedOpportunityId(null);
      setSelectedCatalystId(null);
      return;
    }
    if (key.startsWith("catalyst-")) {
      setSelectedCatalystId(key.replace("catalyst-", ""));
      setSelectedPlanKey(null);
      setSelectedOpportunityId(null);
    } else if (key.startsWith("opportunity-")) {
      setSelectedOpportunityId(key.replace("opportunity-", ""));
      setSelectedPlanKey(null);
      setSelectedCatalystId(null);
      // A "Related Opportunity" link inside a Catalyst panel can be
      // clicked from Plans or Catalysts (neither renders
      // OpportunityDetailPanel) -- jump to a view that does.
      if (view === "plans" || view === "catalysts") setView("overview");
    } else {
      setSelectedPlanKey(key);
      setSelectedOpportunityId(null);
      setSelectedCatalystId(null);
      // Same reasoning in reverse: a "Related Plan" link can be clicked
      // from Opportunities or Catalysts, neither of which renders
      // PlanDetailPanel.
      if (view === "opportunities" || view === "catalysts") setView("plans");
    }
  }

  // The Overview page's 2 summary cards -- Plans and Opportunities, the
  // dashboard's only two features now. Real counts + a real "vs. previous
  // 7 days" delta off data already loaded.
  const metricCards: MetricCard[] = useMemo(() => {
    const since7d = shiftDateRangeToDate("7d");
    const plansDelta = allPlanItems.filter((p) => planItemDate(p) >= since7d).length;
    const opportunitiesDelta = allOpportunities.filter((o) => o.date_identified >= since7d).length;

    return [
      {
        key: "plans",
        label: "Plans",
        value: String(allPlanItems.length),
        weeklyDelta: plansDelta,
        color: SHIFT_CATEGORY_COLOR.plans,
        onClick: () => selectView("plans"),
      },
      {
        key: "opportunities",
        label: "Opportunities",
        value: String(allOpportunities.length),
        weeklyDelta: opportunitiesDelta,
        color: OPPORTUNITIES_COLOR,
        onClick: () => selectView("opportunities"),
      },
    ];
  }, [allPlanItems, allOpportunities]);

  function navButtonClass(active: boolean) {
    return `rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
      active ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
    }`;
  }

  function subNavButtonClass(active: boolean) {
    return `rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${
      active ? "bg-[#1c1c1c]/10 text-[#1c1c1c]" : "text-[#1c1c1c]/50 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
    }`;
  }

  // Desktop sidebar nav tree: Market/Plans/Opportunities each get a label
  // button + a chevron toggle (siblings, not nested, so the chevron click
  // never also fires the label's onClick) and a collapsible subcategory
  // list; Catalysts has none. Explicit per-category JSX rather than a
  // generic loop -- each subcategory list has its own value type
  // (InvestmentMarketCategory / PlanSubcategory / OpportunityTypeTag), and
  // this codebase favors direct repetition over forcing them into one
  // shared shape.
  function navGroup<T extends string>(
    navValue: View,
    label: string,
    subTabs: { value: T; label: string }[],
    activeSubTab: string,
    onSelectSubTab: (value: T) => void
  ) {
    return (
      <div key={navValue} className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => selectView(navValue)} className={`flex-1 ${navButtonClass(view === navValue)}`}>
            {label}
          </button>
          <button
            type="button"
            onClick={() => toggleNavExpanded(navValue)}
            aria-label={`Toggle ${label} subcategories`}
            className="rounded-lg px-2 py-2 text-[#1c1c1c]/40 transition hover:text-[#1c1c1c]"
          >
            <span className={`inline-block transition-transform ${isNavExpanded(navValue) ? "rotate-90" : ""}`}>›</span>
          </button>
        </div>
        {isNavExpanded(navValue) && (
          <div className="ml-3 flex flex-col gap-0.5 border-l border-[#1c1c1c]/10 pl-2">
            {subTabs.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setView(navValue);
                  onSelectSubTab(t.value);
                }}
                className={subNavButtonClass(view === navValue && activeSubTab === t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function desktopNav() {
    return (
      <>
        {navGroup("overview", "Market", MARKET_SUB_TABS, marketSubTab, setMarketSubTab)}
        {navGroup("plans", "Plans", PLAN_SUB_TABS, plansSubTab, setPlansSubTab)}
        {navGroup("opportunities", "Opportunities", OPPORTUNITY_SUB_TABS, opportunitySubTab, setOpportunitySubTab)}
        <button type="button" onClick={() => setView("catalysts")} className={navButtonClass(view === "catalysts")}>
          Catalysts
        </button>
      </>
    );
  }

  return (
    <div>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-56 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:border-r lg:border-[#1c1c1c]/10 lg:bg-[#f4f2ee] lg:px-4 lg:py-6">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2">
          <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
        </Link>
        <nav className="flex flex-col gap-0.5">{desktopNav()}</nav>
      </aside>

      <div className="lg:pl-56">
        <div className="space-y-3">
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
          </Link>

          <h1 className="text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/45">
            {market.name}, {market.state}
          </h1>

          <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">
            {NAV.map((n) => (
              <button key={n.value} type="button" onClick={() => selectView(n.value)} className={navButtonClass(view === n.value)}>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Mobile has no room for a nested dropdown -- the active tab's
              subcategory list (when it has one) renders as a second
              horizontal chip row instead, same data as the desktop dropdown. */}
          {view === "overview" && (
            <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">
              {MARKET_SUB_TABS.map((t) => (
                <button key={t.value} type="button" onClick={() => setMarketSubTab(t.value)} className={subNavButtonClass(marketSubTab === t.value)}>
                  {t.label}
                </button>
              ))}
            </nav>
          )}
          {view === "plans" && (
            <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">
              {PLAN_SUB_TABS.map((t) => (
                <button key={t.value} type="button" onClick={() => setPlansSubTab(t.value)} className={subNavButtonClass(plansSubTab === t.value)}>
                  {t.label}
                </button>
              ))}
            </nav>
          )}
          {view === "opportunities" && (
            <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">
              {OPPORTUNITY_SUB_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setOpportunitySubTab(t.value)}
                  className={subNavButtonClass(opportunitySubTab === t.value)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          )}

          {view === "overview" && (
            <>
              <BriefingSummary
                shifts={shifts}
                projects={projects}
                allOpportunities={allOpportunities}
                plansCount={allPlanItems.length}
                spotlightCatalyst={spotlightCatalyst}
                onSelectCatalyst={(id) => handleMapSelect(`catalyst-${id}`)}
                topMomentumAreaBreakdown={topMomentumAreaBreakdown}
              />

              <MetricCardRow cards={metricCards} />

              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="flex items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1">
                  {(["both", "plans", "opportunities"] as HeroMapLayer[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setHeroLayer(l)}
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                        heroLayer === l ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative h-[calc(100vh-260px)] min-h-[520px]">
                <HeroMap
                  market={market}
                  plans={allPlanItems}
                  opportunities={filteredOpportunities}
                  catalysts={catalysts}
                  layer={heroLayer}
                  selectedKey={heroSelectedKey}
                  onSelectKey={handleMapSelect}
                />
                {selectedCatalyst ? (
                  <CatalystDetailPanel
                    catalyst={selectedCatalyst}
                    nearbyPlans={selectedCatalystNearbyPlans}
                    nearbyOpportunities={selectedCatalystNearbyOpportunities}
                    onSelectPlan={handleMapSelect}
                    onSelectOpportunity={(id) => handleMapSelect(`opportunity-${id}`)}
                    onClose={() => setSelectedCatalystId(null)}
                  />
                ) : selectedPlan ? (
                  <PlanDetailPanel
                    plan={selectedPlan}
                    catalysts={catalysts}
                    caseDetail={selectedCaseDetail}
                    project={selectedProject}
                    projectEvents={selectedProjectEvents}
                    realityScore={selectedRealityScore}
                    relatedFrictionCases={selectedPlanFrictionCases}
                    people={projectPeople}
                    onClose={() => setSelectedPlanKey(null)}
                  />
                ) : (
                  selectedOpportunity && (
                    <OpportunityDetailPanel
                      opportunity={selectedOpportunity}
                      momentumArea={selectedOpportunityMomentumArea}
                      buildabilityZone={selectedOpportunityBuildabilityZone}
                      originFrictionCase={selectedOpportunityOriginFrictionCase}
                      nearbyCatalyst={selectedOpportunityNearbyCatalyst}
                      onSelectCatalyst={(id) => handleMapSelect(`catalyst-${id}`)}
                      onClose={() => setSelectedOpportunityId(null)}
                    />
                  )
                )}
              </div>

              {marketSubTab === "overview" && <MarketOverviewSection indicators={marketIndicators} overview={marketOverview} />}
              <InvestmentSummary investments={marketSubTabInvestments} category={marketSubTab === "overview" ? null : marketSubTab} />
              {marketSubTab === "overview" && <DevelopmentFrictionSection signals={developmentFrictionSignals} />}
            </>
          )}

          {view === "plans" && (
            <>
              <ShiftFilters categories={categories} onToggleCategory={toggleCategory} range={range} onSelectRange={setRange} />

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                <div className="relative h-[calc(100vh-220px)] min-h-[520px]">
                  <PlansMap
                    market={market}
                    plans={visiblePlanItems}
                    catalysts={catalysts}
                    selectedPlanKey={heroSelectedKey}
                    onSelectPlan={handleMapSelect}
                  />
                  {selectedCatalyst ? (
                    <CatalystDetailPanel
                      catalyst={selectedCatalyst}
                      nearbyPlans={selectedCatalystNearbyPlans}
                      nearbyOpportunities={selectedCatalystNearbyOpportunities}
                      onSelectPlan={handleMapSelect}
                      onSelectOpportunity={(id) => handleMapSelect(`opportunity-${id}`)}
                      onClose={() => setSelectedCatalystId(null)}
                    />
                  ) : (
                    selectedPlan && (
                      <PlanDetailPanel
                        plan={selectedPlan}
                        catalysts={catalysts}
                        caseDetail={selectedCaseDetail}
                        project={selectedProject}
                        projectEvents={selectedProjectEvents}
                        realityScore={selectedRealityScore}
                        relatedFrictionCases={selectedPlanFrictionCases}
                        people={projectPeople}
                        onClose={() => setSelectedPlanKey(null)}
                      />
                    )
                  )}
                </div>

                <div className="h-[calc(100vh-220px)] min-h-[520px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <PlansFeed plans={visiblePlanItems} catalysts={catalysts} selectedPlanKey={selectedPlanKey} onSelectPlan={setSelectedPlanKey} />
                </div>
              </div>

              {allPlanItems.length === 0 && (
                <p className="text-sm text-[#1c1c1c]/40">No plans recorded yet for {market.name} — this market hasn't been researched yet.</p>
              )}
            </>
          )}

          {view === "opportunities" && (
            <>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                <div className="relative h-[calc(100vh-220px)] min-h-[520px]">
                  <OpportunityMap
                    market={market}
                    opportunities={filteredOpportunities}
                    selectedOpportunityId={selectedOpportunityId}
                    onSelectOpportunity={setSelectedOpportunityId}
                  />
                  {selectedCatalyst ? (
                    <CatalystDetailPanel
                      catalyst={selectedCatalyst}
                      nearbyPlans={selectedCatalystNearbyPlans}
                      nearbyOpportunities={selectedCatalystNearbyOpportunities}
                      onSelectPlan={handleMapSelect}
                      onSelectOpportunity={(id) => handleMapSelect(`opportunity-${id}`)}
                      onClose={() => setSelectedCatalystId(null)}
                    />
                  ) : (
                    selectedOpportunity && (
                      <OpportunityDetailPanel
                        opportunity={selectedOpportunity}
                        momentumArea={selectedOpportunityMomentumArea}
                        buildabilityZone={selectedOpportunityBuildabilityZone}
                        originFrictionCase={selectedOpportunityOriginFrictionCase}
                        nearbyCatalyst={selectedOpportunityNearbyCatalyst}
                        onSelectCatalyst={(id) => handleMapSelect(`catalyst-${id}`)}
                        onClose={() => setSelectedOpportunityId(null)}
                      />
                    )
                  )}
                </div>
                <div className="h-[calc(100vh-220px)] min-h-[520px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <OpportunityFeed
                    opportunities={filteredOpportunities}
                    selectedOpportunityId={selectedOpportunityId}
                    onSelectOpportunity={setSelectedOpportunityId}
                  />
                </div>
              </div>
            </>
          )}

          {view === "catalysts" && (
            <>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                <div className="relative h-[calc(100vh-220px)] min-h-[520px]">
                  <CatalystMap
                    market={market}
                    catalysts={catalysts}
                    selectedCatalystId={selectedCatalystId}
                    onSelectCatalyst={setSelectedCatalystId}
                  />
                  {selectedCatalyst && (
                    <CatalystDetailPanel
                      catalyst={selectedCatalyst}
                      nearbyPlans={selectedCatalystNearbyPlans}
                      nearbyOpportunities={selectedCatalystNearbyOpportunities}
                      onSelectPlan={handleMapSelect}
                      onSelectOpportunity={(id) => handleMapSelect(`opportunity-${id}`)}
                      onClose={() => setSelectedCatalystId(null)}
                    />
                  )}
                </div>
                <div className="h-[calc(100vh-220px)] min-h-[520px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <CatalystFeed catalysts={catalysts} selectedCatalystId={selectedCatalystId} onSelectCatalyst={setSelectedCatalystId} />
                </div>
              </div>

              {catalysts.length === 0 && (
                <p className="text-sm text-[#1c1c1c]/40">No catalysts identified yet for {market.name}.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
