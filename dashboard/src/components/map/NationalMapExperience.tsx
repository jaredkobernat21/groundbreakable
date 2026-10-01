"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CatalystWithSources, Market } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { followCatalyst, unfollowCatalyst } from "@/lib/queries/catalystFollows";
import { followMarket, unfollowMarket } from "@/lib/queries/marketFollows";
import { CATALYST_STAGE_GROUP, catalystColorGroup } from "@/lib/catalystTypeColors";
import { computeDcStage, type DcStage } from "@/lib/catalysts/dcStage";
import NationalCatalystMap, { type NationalCatalystMapHandle } from "./NationalCatalystMap";
import CatalystIntelligencePanel from "./CatalystIntelligencePanel";
import MapSearch from "./MapSearch";
import FiltersPanel, { defaultMapFilters, type MapFilters } from "./FiltersPanel";
import FollowingPanel from "./FollowingPanel";
import DcStageSummaryBar from "./DcStageSummaryBar";

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
  const [filters, setFilters] = useState<MapFilters>(defaultMapFilters());
  const [followedCatalystIds, setFollowedCatalystIds] = useState(new Set(initialFollowedCatalystIds));
  const [followedMarketIds, setFollowedMarketIds] = useState(new Set(initialFollowedMarketIds));

  const marketById = useMemo(() => new Map(markets.map((m) => [m.id, m])), [markets]);

  // Non-stage filters (time/state/market) apply to every catalyst
  // regardless of DC stage -- factored out so the live stage counts in
  // DcStageSummaryBar reflect those narrowing filters without also being
  // narrowed by the DC-stage checkboxes themselves (a stage pill shouldn't
  // disappear just because a user unchecked it).
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

  // Data Center Refocus: a staged (Possible/Predicted/Planned) catalyst is
  // primary and gated only by the DC Stage filter (plus, for Planned, the
  // construction-pipeline sub-filter). An unstaged catalyst is secondary --
  // hidden entirely unless "Show supporting layers" is on, then gated by
  // the Supporting Layers type filter.
  const filteredCatalysts = useMemo(() => {
    return baseFilteredCatalysts.filter((c) => {
      const dcStage = computeDcStage(c);
      if (dcStage) {
        if (!filters.dcStages.has(dcStage)) return false;
        if (dcStage === "planned") {
          const stageGroup = CATALYST_STAGE_GROUP[c.status];
          if (!stageGroup || !filters.stages.has(stageGroup)) return false;
        }
        return true;
      }
      if (!filters.showSupporting) return false;
      return filters.types.has(catalystColorGroup(c));
    });
  }, [baseFilteredCatalysts, filters]);

  const dcStageCounts = useMemo(() => {
    const counts: Record<DcStage, number> = { possible: 0, predicted: 0, planned: 0 };
    for (const c of baseFilteredCatalysts) {
      const stage = computeDcStage(c);
      if (stage) counts[stage] += 1;
    }
    return counts;
  }, [baseFilteredCatalysts]);

  function toggleDcStage(stage: DcStage) {
    const next = new Set(filters.dcStages);
    if (next.has(stage)) next.delete(stage);
    else next.add(stage);
    setFilters({ ...filters, dcStages: next });
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

          Mobile layout (2026-09-30): below `sm`, the row wraps instead of
          squeezing everything into one line -- the search bar (`order-3
          w-full`) drops to its own full-width row below the logo/pills row,
          and the pill group shrinks its padding/text and can itself wrap to
          a second line on very narrow phones. `shrink-0` on the logo and
          pill-group wrappers stops flexbox from compressing the logo image
          or pill text when space is tight (the "smushed icon" bug). At
          `sm:` and up this is byte-for-byte the original single-row,
          flex-1-search layout -- unchanged on desktop. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 sm:p-4">
        <div className="pointer-events-auto flex shrink-0 items-center rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <img src="/groundbreakable-icon.png" alt="Groundbreakable" className="h-5 w-5 shrink-0 brightness-0 invert" />
        </div>

        <DcStageSummaryBar counts={dcStageCounts} activeStages={filters.dcStages} onToggleStage={toggleDcStage} />

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

      {selectedCatalyst && (
        <CatalystIntelligencePanel
          catalyst={selectedCatalyst}
          allCatalysts={catalysts}
          isFollowing={followedCatalystIds.has(selectedCatalyst.id)}
          onToggleFollow={() => toggleFollowCatalystId(selectedCatalyst.id)}
          onClose={() => handleSelectCatalyst(null)}
        />
      )}

      <FiltersPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} onChange={setFilters} markets={markets} />

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
