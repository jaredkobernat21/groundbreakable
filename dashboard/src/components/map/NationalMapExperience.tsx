"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CatalystWithSources, Market } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { followCatalyst, unfollowCatalyst } from "@/lib/queries/catalystFollows";
import { followMarket, unfollowMarket } from "@/lib/queries/marketFollows";
import { CATALYST_STAGE_GROUP, catalystColorGroup } from "@/lib/catalystTypeColors";
import { computeDcStage, type DcStage } from "@/lib/catalysts/dcStage";
import { computeHousingStage, type HousingStage } from "@/lib/catalysts/housingStage";
import { infrastructureStatusGroup } from "@/lib/catalysts/infrastructureCriteria";
import { computeDataConfidence } from "@/lib/catalysts/potentialSiteCriteria";
import { buyerCriteriaActive, explainBuyerCriteriaMatch, matchesBuyerCriteria } from "@/lib/catalysts/buyerCriteria";
import NationalCatalystMap, { type NationalCatalystMapHandle } from "./NationalCatalystMap";
import CatalystIntelligencePanel from "./CatalystIntelligencePanel";
import MapSearch from "./MapSearch";
import FiltersPanel, { defaultMapFilters, type CategoryFilterValue, type MapFilters } from "./FiltersPanel";
import FollowingPanel from "./FollowingPanel";
import BuyerMatchPanel from "./BuyerMatchPanel";
import CategoryFilterBar from "./CategoryFilterBar";
import MobileBottomSheet from "./MobileBottomSheet";

// National map redesign (Jared, 2026-09-30): "the map should be the
// product." This is the fixed full-screen overlay that replaces the old
// Plans/Opportunities/Catalysts tabbed dashboard for investors. Rendered
// as `fixed inset-0` rather than making dashboard/layout.tsx pathname-aware
// -- that layout also wraps /dashboard/admin/** and /dashboard/leads/**,
// and there's no clean way to opt just this page out of it without risking
// those routes. This approach needs zero changes to layout.tsx/admin/leads.
export default function NationalMapExperience({
  markets,
  catalysts,
  userId,
  userEmail,
  isAdmin = false,
  initialFollowedCatalystIds,
  initialFollowedMarketIds,
}: {
  markets: Market[];
  catalysts: CatalystWithSources[];
  userId: string;
  userEmail: string | null;
  isAdmin?: boolean;
  initialFollowedCatalystIds: string[];
  initialFollowedMarketIds: string[];
}) {
  const mapRef = useRef<NationalCatalystMapHandle>(null);
  const [selectedCatalystId, setSelectedCatalystId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [buyerMatchesOpen, setBuyerMatchesOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilters>(defaultMapFilters());
  const [followedCatalystIds, setFollowedCatalystIds] = useState(new Set(initialFollowedCatalystIds));
  const [followedMarketIds, setFollowedMarketIds] = useState(new Set(initialFollowedMarketIds));
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Mobile account menu (2026-10-02 mobile optimization): same
  // click-outside-closes pattern CategoryFilterBar/MapSearch already use.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) setMobileMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const marketById = useMemo(() => new Map(markets.map((m) => [m.id, m])), [markets]);

  // Non-category filters (time/state/market) apply to every catalyst
  // regardless of category -- factored out so the live category/stage
  // counts in CategoryFilterBar reflect those narrowing filters without
  // also being narrowed by the category/stage selection itself (a count
  // shouldn't change just because a user switched tabs).
  const baseFilteredCatalysts = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return catalysts.filter((c) => {
      if (filters.time === "new_week" && new Date(c.created_at).getTime() < weekAgo) return false;
      if (filters.time === "new_month" && new Date(c.created_at).getTime() < monthAgo) return false;
      if (filters.time === "active" && (c.status === "completed" || c.status === "cancelled")) return false;

      const market = marketById.get(c.market_id);
      if (filters.states.size > 0 && (!market || !filters.states.has(market.state))) return false;
      if (filters.marketIds.size > 0 && !filters.marketIds.has(c.market_id)) return false;

      return true;
    });
  }, [catalysts, filters, marketById]);

  // Data Center Refocus: exactly one category renders at a time, except
  // "All" (an explicit opt-in, last in the dropdown) which shows every
  // category together. A staged (Possible/Planned) catalyst lives
  // exclusively under the Data Centers category, gated by the DC Stage
  // filter (plus, for Planned, the construction-pipeline sub-filter).
  // Every other category shows only unstaged catalysts matching that
  // category's color group -- a catalyst never appears under two tabs at
  // once (outside of "All").
  const filteredCatalysts = useMemo(() => {
    return baseFilteredCatalysts.filter((c) => {
      const dcStage = computeDcStage(c);
      const housingStage = computeHousingStage(c);
      if (filters.category === "all") return true;
      if (filters.category === "data_center") {
        if (!dcStage) return false;
        if (!filters.dcStages.has(dcStage)) return false;
        if (dcStage === "planned") {
          const stageGroup = CATALYST_STAGE_GROUP[c.status];
          if (!stageGroup || !filters.stages.has(stageGroup)) return false;
        }
        // Buyer Criteria (2026-10-04) -- meaningless for Possible/Planned (they don't carry
        // these fields); only ever excludes a Potential site, and only when a KNOWN fact
        // actively fails an active criterion (never for an unresearched/unknown one).
        if (dcStage === "potential" && buyerCriteriaActive(filters.buyerCriteria)) {
          if (!matchesBuyerCriteria(c, filters.buyerCriteria, computeDataConfidence(c))) return false;
        }
        return true;
      }
      if (filters.category === "housing") {
        if (!housingStage) return false;
        if (!filters.housingStages.has(housingStage)) return false;
        if (housingStage === "potential" && filters.housingTypes.size > 0) {
          if (!c.housing_type || !filters.housingTypes.has(c.housing_type)) return false;
        }
        return true;
      }
      if (filters.category === "infrastructure") {
        if (catalystColorGroup(c) !== "infrastructure") return false;
        if (filters.infrastructureTypes.size > 0) {
          if (!c.infrastructure_type || !filters.infrastructureTypes.has(c.infrastructure_type)) return false;
        }
        const statusGroup = infrastructureStatusGroup(c.status);
        if (!statusGroup || !filters.infrastructureStatuses.has(statusGroup)) return false;
        if (filters.developmentImpactTypes.size > 0) {
          if (!c.development_impact_types.some((impact) => filters.developmentImpactTypes.has(impact))) return false;
        }
        return true;
      }
      if (dcStage || housingStage) return false;
      return catalystColorGroup(c) === filters.category;
    });
  }, [baseFilteredCatalysts, filters]);

  // Buyer Criteria ranked matches (2026-10-04) -- every Potential site passing the same
  // base/state/market filters (dcStageCounts-style, i.e. independent of the dcStages
  // checkbox selection itself) ranked by match %, for BuyerMatchPanel's "best sites that fit
  // this buyer's deal profile" list. Computed only when a criterion is actually active.
  const buyerMatches = useMemo(() => {
    if (!buyerCriteriaActive(filters.buyerCriteria)) return [];
    return baseFilteredCatalysts
      .filter((c) => computeDcStage(c) === "potential")
      .map((c) => {
        const { matchPercent, lines } = explainBuyerCriteriaMatch(c, filters.buyerCriteria, computeDataConfidence(c));
        return { catalystId: c.id, title: c.title, matchPercent, lines };
      })
      .sort((a, b) => b.matchPercent - a.matchPercent);
  }, [baseFilteredCatalysts, filters.buyerCriteria]);

  const dcStageCounts = useMemo(() => {
    const counts: Record<DcStage, number> = { potential: 0, possible: 0, planned: 0 };
    for (const c of baseFilteredCatalysts) {
      const stage = computeDcStage(c);
      if (stage) counts[stage] += 1;
    }
    return counts;
  }, [baseFilteredCatalysts]);

  const housingStageCounts = useMemo(() => {
    const counts: Record<HousingStage, number> = { potential: 0, planned: 0 };
    for (const c of baseFilteredCatalysts) {
      const stage = computeHousingStage(c);
      if (stage) counts[stage] += 1;
    }
    return counts;
  }, [baseFilteredCatalysts]);

  // The active category's own count, for the dropdown button -- counts
  // every catalyst that would render under the *current* category/stage/
  // planned-stage selection (time/state/market-filtered), matching
  // filteredCatalysts.length exactly without recomputing it twice.
  const categoryCount = filteredCatalysts.length;

  function toggleDcStage(stage: DcStage) {
    const next = new Set(filters.dcStages);
    if (next.has(stage)) next.delete(stage);
    else next.add(stage);
    setFilters({ ...filters, dcStages: next });
  }

  function toggleHousingStage(stage: HousingStage) {
    const next = new Set(filters.housingStages);
    if (next.has(stage)) next.delete(stage);
    else next.add(stage);
    setFilters({ ...filters, housingStages: next });
  }

  function changeCategory(category: CategoryFilterValue) {
    setFilters({ ...filters, category });
  }

  const selectedCatalyst = catalysts.find((c) => c.id === selectedCatalystId) ?? null;

  function handleSelectCatalyst(id: string | null) {
    setSelectedCatalystId(id);
  }

  // Id-parameterized so both the intelligence panel's Follow button (always
  // the selected catalyst) and the Following panel's per-row Unfollow
  // button (any followed catalyst, not necessarily the selected one) share
  // one correct implementation.
  async function toggleFollowCatalystId(catalystId: string) {
    const supabase = createClient();
    const isFollowing = followedCatalystIds.has(catalystId);
    const next = new Set(followedCatalystIds);
    if (isFollowing) {
      next.delete(catalystId);
      setFollowedCatalystIds(next);
      await unfollowCatalyst(supabase, userId, catalystId).catch(() => setFollowedCatalystIds(followedCatalystIds));
    } else {
      next.add(catalystId);
      setFollowedCatalystIds(next);
      await followCatalyst(supabase, userId, catalystId).catch(() => setFollowedCatalystIds(followedCatalystIds));
    }
  }

  async function toggleFollowMarket(marketId: string) {
    const supabase = createClient();
    const isFollowing = followedMarketIds.has(marketId);
    const next = new Set(followedMarketIds);
    if (isFollowing) {
      next.delete(marketId);
      setFollowedMarketIds(next);
      await unfollowMarket(supabase, userId, marketId).catch(() => setFollowedMarketIds(followedMarketIds));
    } else {
      next.add(marketId);
      setFollowedMarketIds(next);
      await followMarket(supabase, userId, marketId).catch(() => setFollowedMarketIds(followedMarketIds));
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <div className="absolute inset-0">
        <NationalCatalystMap
          ref={mapRef}
          catalysts={filteredCatalysts}
          selectedCatalystId={selectedCatalystId}
          onSelectCatalyst={handleSelectCatalyst}
        />
      </div>

      {/* Top nav -- logo, search, filters, following, profile. No permanent
          sidebar; the map occupies the rest of the screen.

          Desktop only (`sm:` and up) -- byte-for-byte the original
          single-row, flex-1-search layout. Mobile (below `sm`) gets its own
          dedicated, much shorter bar in the "Mobile top bar" block below
          instead of this row wrapping to two lines -- a parallel mobile-only
          block is safer here than interleaving responsive classes into this
          one, since any accidental shared-class change would regress
          desktop. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden items-center gap-4 p-4 sm:flex">
        <div className="pointer-events-auto flex shrink-0 items-center rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <img src="/groundbreakable-icon.png" alt="Groundbreakable" className="h-5 w-5 shrink-0 brightness-0 invert" />
        </div>

        <CategoryFilterBar
          category={filters.category}
          onCategoryChange={changeCategory}
          categoryCount={categoryCount}
          dcStageCounts={dcStageCounts}
          activeDcStages={filters.dcStages}
          onToggleDcStage={toggleDcStage}
          housingStageCounts={housingStageCounts}
          activeHousingStages={filters.housingStages}
          onToggleHousingStage={toggleHousingStage}
        />

        <div className="pointer-events-auto order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <MapSearch
            catalysts={catalysts}
            markets={markets}
            followedMarketIds={followedMarketIds}
            onFlyTo={(center, zoom) => mapRef.current?.flyTo(center, zoom)}
            onSelectCatalyst={handleSelectCatalyst}
            onToggleFollowMarket={toggleFollowMarket}
          />
        </div>

        <div className="pointer-events-auto ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:ml-0 sm:flex-nowrap sm:gap-2">
          {isAdmin && (
            <Link
              href="/dashboard/admin/users"
              className="whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm hover:border-white/30 hover:text-white sm:px-3 sm:py-1.5 sm:text-xs"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm hover:border-white/30 hover:text-white sm:px-3 sm:py-1.5 sm:text-xs"
          >
            Filters
          </button>
          <button
            type="button"
            onClick={() => setFollowingOpen(true)}
            className="whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm hover:border-white/30 hover:text-white sm:px-3 sm:py-1.5 sm:text-xs"
          >
            Following
          </button>
          <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white/60 backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs">
            <span className="hidden sm:inline">{userEmail}</span>
            <button type="button" onClick={handleSignOut} className="text-white/50 hover:text-white">
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile top bar (2026-10-02 mobile optimization) -- `sm:hidden`, so
          this never renders at the desktop breakpoint above. One short row:
          logo, the same compact CategoryFilterBar the desktop bar uses, and
          a search/filters/account icon cluster. Admin/Following/Sign
          out/email move into the account dropdown below instead of sitting
          in the row -- the row's job is just "get out of the map's way."
          Tapping the search icon swaps the row for the same MapSearch input
          desktop uses (full width, with a back control) rather than
          cramming a visible input in permanently. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 sm:hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="pointer-events-auto flex items-center gap-2 p-3">
          {mobileSearchOpen ? (
            <>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                aria-label="Back"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <MapSearch
                  catalysts={catalysts}
                  markets={markets}
                  followedMarketIds={followedMarketIds}
                  onFlyTo={(center, zoom) => mapRef.current?.flyTo(center, zoom)}
                  onSelectCatalyst={handleSelectCatalyst}
                  onToggleFollowMarket={toggleFollowMarket}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex shrink-0 items-center rounded-full bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
                <img src="/groundbreakable-icon.png" alt="Groundbreakable" className="h-5 w-5 shrink-0 brightness-0 invert" />
              </div>

              <CategoryFilterBar
                category={filters.category}
                onCategoryChange={changeCategory}
                categoryCount={categoryCount}
                dcStageCounts={dcStageCounts}
                activeDcStages={filters.dcStages}
                onToggleDcStage={toggleDcStage}
                housingStageCounts={housingStageCounts}
                activeHousingStages={filters.housingStages}
                onToggleHousingStage={toggleHousingStage}
              />

              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  aria-label="Search"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Filters"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M8 12h12M11 18h9" />
                    <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
                    <circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </button>
                <div ref={mobileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen((v) => !v)}
                    aria-label="Account menu"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                      <circle cx="12" cy="8" r="3.5" />
                      <path strokeLinecap="round" d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
                    </svg>
                  </button>

                  {mobileMenuOpen && (
                    <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/90 py-1 shadow-2xl backdrop-blur-xl">
                      {isAdmin && (
                        <Link
                          href="/dashboard/admin/users"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setFollowingOpen(true);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white"
                      >
                        Following
                      </button>
                      {userEmail && (
                        <div className="truncate border-t border-white/10 px-4 py-2.5 text-xs text-white/40">{userEmail}</div>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedCatalyst && (
        <CatalystIntelligencePanel
          catalyst={selectedCatalyst}
          allCatalysts={catalysts}
          isFollowing={followedCatalystIds.has(selectedCatalyst.id)}
          onToggleFollow={() => toggleFollowCatalystId(selectedCatalyst.id)}
          onClose={() => handleSelectCatalyst(null)}
        />
      )}

      <MobileBottomSheet
        visibleCatalysts={filteredCatalysts}
        allCatalysts={catalysts}
        selectedCatalyst={selectedCatalyst}
        isFollowing={selectedCatalyst ? followedCatalystIds.has(selectedCatalyst.id) : false}
        onToggleFollow={() => selectedCatalyst && toggleFollowCatalystId(selectedCatalyst.id)}
        onSelectCatalyst={handleSelectCatalyst}
        onFlyTo={(center, zoom) => mapRef.current?.flyTo(center, zoom)}
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenFollowing={() => setFollowingOpen(true)}
      />

      <FiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        markets={markets}
        matchCount={buyerMatches.length}
        onViewMatches={() => {
          setFiltersOpen(false);
          setBuyerMatchesOpen(true);
        }}
      />

      <BuyerMatchPanel
        open={buyerMatchesOpen}
        onClose={() => setBuyerMatchesOpen(false)}
        matches={buyerMatches}
        onSelectCatalyst={(id) => {
          handleSelectCatalyst(id);
          setBuyerMatchesOpen(false);
          const c = catalysts.find((x) => x.id === id);
          if (c) mapRef.current?.flyTo([c.longitude, c.latitude], 11);
        }}
      />

      <FollowingPanel
        open={followingOpen}
        onClose={() => setFollowingOpen(false)}
        followedCatalystIds={followedCatalystIds}
        followedMarketIds={followedMarketIds}
        catalysts={catalysts}
        markets={markets}
        onUnfollowCatalyst={toggleFollowCatalystId}
        onUnfollowMarket={toggleFollowMarket}
        onSelectCatalyst={(id) => {
          handleSelectCatalyst(id);
          setFollowingOpen(false);
          const c = catalysts.find((x) => x.id === id);
          if (c) mapRef.current?.flyTo([c.longitude, c.latitude], 11);
        }}
        onFlyToMarket={(m) => {
          setFollowingOpen(false);
          mapRef.current?.flyTo([m.center_lng, m.center_lat], m.default_zoom);
        }}
      />
    </div>
  );
}
