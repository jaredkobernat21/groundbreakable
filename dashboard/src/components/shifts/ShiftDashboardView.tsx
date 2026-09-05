"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  InvestmentType,
  InvestmentWithSource,
  Market,
  ProjectWithSource,
  ShiftCategory,
  ShiftWithSource,
  ZoningLandUseWithSource,
} from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import { INVESTMENT_TYPE_LABEL } from "@/lib/investmentConstants";
import BriefingSummary from "./BriefingSummary";
import ShiftFilters from "./ShiftFilters";
import ShiftMap from "./ShiftMap";
import ShiftFeed from "./ShiftFeed";
import ShiftDetailPanel from "./ShiftDetailPanel";
import ProjectsList from "./ProjectsList";
import BuildabilityMap from "./BuildabilityMap";
import BuildabilityList from "./BuildabilityList";
import BuildabilityDetailPanel from "./BuildabilityDetailPanel";
import InvestmentMap from "./InvestmentMap";
import InvestmentFeed from "./InvestmentFeed";
import InvestmentDetailPanel from "./InvestmentDetailPanel";
import InvestmentSummary from "./InvestmentSummary";

type View = "plans" | "projects" | "permits" | "infrastructure" | "investment" | "momentum" | "buildability";

// Product decision (Jared, 2026-09-05): the dashboard's real-estate lens
// covers 7 views -- "what's coming" (Plans), "what's being built"
// (Projects), "what's moving" (Permits), "what's enabling growth"
// (Infrastructure), "where capital is flowing" (Investment), "what's
// happening right now" (Momentum -- every active category on one map),
// and "where could development happen next" (Buildability -- zoning/
// land-use). Land was considered as an 8th tab but folded into
// Buildability -- both meant the same thing (favorable-zoning parcels),
// so there's no separate Land destination.
//
// Momentum/Buildability were originally a small map-layer-toggle pill
// group sitting above the map instead of real rail entries (both just
// set the same `view` state as everything else, only visually grouped
// differently) -- moved into the rail proper per Jared's follow-up ask
// (2026-09-05) once the rail itself existed. All 7 are now equal rail
// destinations.
const RAIL_TABS: { value: View; label: string }[] = [
  { value: "momentum", label: "Momentum" },
  { value: "plans", label: "Plans" },
  { value: "projects", label: "Projects" },
  { value: "permits", label: "Permits" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "investment", label: "Investment" },
  { value: "buildability", label: "Buildability" },
];

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

export default function ShiftDashboardView({
  market,
  shifts,
  projects,
  buildabilityZones,
  investments,
}: {
  market: Market;
  shifts: ShiftWithSource[];
  projects: ProjectWithSource[];
  buildabilityZones: ZoningLandUseWithSource[];
  investments: InvestmentWithSource[];
}) {
  const [view, setView] = useState<View>("momentum");
  const [categories, setCategories] = useState<Set<ShiftCategory>>(new Set(ACTIVE_SHIFT_CATEGORIES));
  const [range, setRange] = useState<ShiftDateRange>("7d");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedCategoryShiftId, setSelectedCategoryShiftId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [investmentTypeFilter, setInvestmentTypeFilter] = useState<Set<InvestmentType>>(new Set(INVESTMENT_TYPE_FILTER_OPTIONS));
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);

  function toggleInvestmentType(type: InvestmentType) {
    setInvestmentTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
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

  const selectedShift = filteredShifts.find((s) => s.id === selectedShiftId) ?? null;
  const selectedCategoryShift = categoryShifts.find((s) => s.id === selectedCategoryShiftId) ?? null;
  const selectedZone = buildabilityZones.find((z) => z.id === selectedZoneId) ?? null;
  const selectedInvestment = filteredInvestments.find((i) => i.id === selectedInvestmentId) ?? null;

  const railCounts = useMemo(() => {
    const counts: Partial<Record<View, number>> = { projects: projects.length, investment: investments.length };
    for (const tab of RAIL_TABS) {
      const wanted = CATEGORIES_BY_VIEW[tab.value];
      if (wanted) counts[tab.value] = shifts.filter((s) => wanted.includes(s.category)).length;
    }
    return counts;
  }, [shifts, projects, investments]);

  function tabButtonClass(active: boolean, block: boolean) {
    return `rounded-lg px-3 py-2 text-left text-sm font-medium transition ${block ? "lg:w-full" : ""} ${
      active ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
    }`;
  }

  function railTabs() {
    return RAIL_TABS.map((tab) => (
      <button key={tab.value} type="button" onClick={() => setView(tab.value)} className={tabButtonClass(view === tab.value, true)}>
        {tab.label}
        {railCounts[tab.value] != null && ` (${railCounts[tab.value]})`}
      </button>
    ));
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
        <nav className="flex flex-col gap-0.5">{railTabs()}</nav>
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
          <h1 className="text-2xl font-semibold text-[#1c1c1c]">
            {market.name}, {market.state}
          </h1>

          <BriefingSummary shifts={shifts} projects={projects} buildabilityZones={buildabilityZones} />

          <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">{railTabs()}</nav>

          <div className="min-w-0 flex-1 space-y-3">
            {view === "momentum" && (
              <>
                <ShiftFilters categories={categories} onToggleCategory={toggleCategory} range={range} onSelectRange={setRange} />

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                  <div className="relative h-[640px]">
                    <ShiftMap
                      market={market}
                      shifts={filteredShifts}
                      selectedShiftId={selectedShiftId}
                      onSelectShift={setSelectedShiftId}
                    />
                    {selectedShift && <ShiftDetailPanel shift={selectedShift} onClose={() => setSelectedShiftId(null)} />}
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
                <ProjectsList projects={projects} />
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
                    <ShiftDetailPanel shift={selectedCategoryShift} onClose={() => setSelectedCategoryShiftId(null)} />
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
