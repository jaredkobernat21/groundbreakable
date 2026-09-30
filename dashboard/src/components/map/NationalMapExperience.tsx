"use client";

import { useMemo, useRef, useState } from "react";
import type { LngLatBounds } from "mapbox-gl";
import type { CatalystWithSources, Market } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { followCatalyst, unfollowCatalyst } from "@/lib/queries/catalystFollows";
import { followMarket, unfollowMarket } from "@/lib/queries/marketFollows";
import { CATALYST_STAGE_GROUP, catalystColorGroup, catalystImpactRadiusTier } from "@/lib/catalystTypeColors";
import NationalCatalystMap, { type NationalCatalystMapHandle } from "./NationalCatalystMap";
import CatalystIntelligencePanel from "./CatalystIntelligencePanel";
import MapSearch from "./MapSearch";
import TopFilterBar from "./TopFilterBar";
import FiltersPanel, { defaultMapFilters, type MapFilters } from "./FiltersPanel";
import FollowingPanel from "./FollowingPanel";
import CatalystsInViewRail from "./CatalystsInViewRail";

// Institutional redesign (Jared, 2026-09-30): "the map should be the
// product." Fixed full-screen overlay replacing the old Plans/
// Opportunities/Catalysts tabbed dashboard for investors -- rendered as
// `fixed inset-0` rather than making dashboard/layout.tsx pathname-aware
// (that layout also wraps /dashboard/admin/** and /dashboard/leads/**).
// Zero changes to layout.tsx/admin/leads. Background/text tokens below
// (charcoal #0B0C0F, off-white #EDECE8, cool-gray #7A7E87/#9096A0) are the
// shared palette for every surface in this experience.
export default function NationalMapExperience({
  markets,
  catalysts,
  userId,
  userEmail,
  initialFollowedCatalystIds,
  initialFollowedMarketIds,
}: {
  markets: Market[];
  catalysts: CatalystWithSources[];
  userId: string;
  userEmail: string | null;
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
  const [viewportBounds, setViewportBounds] = useState<LngLatBounds | null>(null);

  const marketById = useMemo(() => new Map(markets.map((m) => [m.id, m])), [markets]);

  const filteredCatalysts = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return catalysts.filter((c) => {
      if (!filters.types.has(catalystColorGroup(c))) return false;
      const stageGroup = CATALYST_STAGE_GROUP[c.status];
      if (!stageGroup || !filters.stages.has(stageGroup)) return false;
      if (!filters.impactRadiusTiers.has(catalystImpactRadiusTier(c))) return false;

      if (filters.time === "new_week" && new Date(c.created_at).getTime() < weekAgo) return false;
      if (filters.time === "new_month" && new Date(c.created_at).getTime() < monthAgo) return false;
      if (filters.time === "active" && (c.status === "completed" || c.status === "cancelled")) return false;

      const market = marketById.get(c.market_id);
      if (filters.states.size > 0 && (!market || !filters.states.has(market.state))) return false;
      if (filters.marketIds.size > 0 && !filters.marketIds.has(c.market_id)) return false;

      return true;
    });
  }, [catalysts, filters, marketById]);

  const catalystsInView = useMemo(() => {
    if (!viewportBounds) return filteredCatalysts;
    return filteredCatalysts.filter((c) => viewportBounds.contains([c.longitude, c.latitude]));
  }, [filteredCatalysts, viewportBounds]);

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
    <div className="fixed inset-0 z-40 bg-[#0B0C0F]">
      <div className="absolute inset-0">
        <NationalCatalystMap
          ref={mapRef}
          catalysts={filteredCatalysts}
          selectedCatalystId={selectedCatalystId}
          onSelectCatalyst={handleSelectCatalyst}
          onViewportChange={setViewportBounds}
          showImpactAreas={filters.showImpactAreas}
        />
      </div>

      {/* Top nav -- logo, search, filters, following, profile. No permanent
          sidebar; the map occupies the rest of the screen. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0E0F12]/80 px-3 py-1.5 backdrop-blur-xl">
            <img src="/groundbreakable-icon.png" alt="Groundbreakable" className="h-5 w-5 brightness-0 invert" />
          </div>

          <div className="pointer-events-auto flex-1">
            <MapSearch
              catalysts={catalysts}
              markets={markets}
              followedMarketIds={followedMarketIds}
              onFlyTo={(center, zoom) => mapRef.current?.flyTo(center, zoom)}
              onSelectCatalyst={handleSelectCatalyst}
              onToggleFollowMarket={toggleFollowMarket}
            />
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFollowingOpen(true)}
              className="rounded-full border border-white/[0.08] bg-[#0E0F12]/80 px-3 py-1.5 text-[12px] font-medium text-[#9096A0] backdrop-blur-xl transition hover:border-white/20 hover:text-[#EDECE8]"
            >
              Following
            </button>
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0E0F12]/80 px-3 py-1.5 text-[12px] text-[#7A7E87] backdrop-blur-xl">
              <span className="hidden sm:inline">{userEmail}</span>
              <button type="button" onClick={handleSignOut} className="text-[#7A7E87] hover:text-[#EDECE8]">
                Sign out
              </button>
            </div>
          </div>
        </div>

        <TopFilterBar
          activeTypes={filters.types}
          onChangeTypes={(types) => setFilters({ ...filters, types })}
          onOpenMoreFilters={() => setFiltersOpen(true)}
        />
      </div>

      {filters.showInViewRail && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 px-4">
          <CatalystsInViewRail catalysts={catalystsInView} selectedCatalystId={selectedCatalystId} onSelectCatalyst={handleSelectCatalyst} />
        </div>
      )}

      {selectedCatalyst && (
        <CatalystIntelligencePanel
          catalyst={selectedCatalyst}
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
