"use client";

import type { CatalystWithSources, Market } from "@/lib/types";

// National map redesign (Jared, 2026-09-30): "Following/Saved" as a
// slide-out panel, not a new route -- per "avoid adding sections unless
// necessary" and "less dashboard, more lens." Same visual pattern as
// FiltersPanel.
export default function FollowingPanel({
  open,
  onClose,
  followedCatalystIds,
  followedMarketIds,
  catalysts,
  markets,
  onUnfollowCatalyst,
  onUnfollowMarket,
  onSelectCatalyst,
  onFlyToMarket,
}: {
  open: boolean;
  onClose: () => void;
  followedCatalystIds: Set<string>;
  followedMarketIds: Set<string>;
  catalysts: CatalystWithSources[];
  markets: Market[];
  onUnfollowCatalyst: (id: string) => void;
  onUnfollowMarket: (id: string) => void;
  onSelectCatalyst: (id: string) => void;
  onFlyToMarket: (market: Market) => void;
}) {
  if (!open) return null;

  const followedCatalysts = catalysts.filter((c) => followedCatalystIds.has(c.id));
  const followedMarkets = markets.filter((m) => followedMarketIds.has(m.id));

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-3 top-16 bottom-3 z-50 w-[340px] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0E0F12]/95 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-[15px] font-medium text-[#EDECE8]">Following</h2>
          <button type="button" onClick={onClose} className="text-[#7A7E87] hover:text-[#EDECE8]">
            ✕
          </button>
        </div>

        <section className="mb-6">
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Markets ({followedMarkets.length})</p>
          {followedMarkets.length === 0 ? (
            <p className="text-[13px] text-[#6B6F78]">No markets followed yet.</p>
          ) : (
            <div className="space-y-1.5">
              {followedMarkets.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <button type="button" onClick={() => onFlyToMarket(m)} className="text-left text-[13px] text-[#C7C9CE] hover:text-[#EDECE8]">
                    {m.name}, {m.state}
                  </button>
                  <button type="button" onClick={() => onUnfollowMarket(m.id)} className="text-[11px] text-[#6B6F78] hover:text-[#9096A0]">
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Projects ({followedCatalysts.length})</p>
          {followedCatalysts.length === 0 ? (
            <p className="text-[13px] text-[#6B6F78]">No projects followed yet.</p>
          ) : (
            <div className="space-y-1.5">
              {followedCatalysts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <button type="button" onClick={() => onSelectCatalyst(c.id)} className="text-left text-[13px] text-[#C7C9CE] hover:text-[#EDECE8]">
                    {c.title}
                  </button>
                  <button type="button" onClick={() => onUnfollowCatalyst(c.id)} className="text-[11px] text-[#6B6F78] hover:text-[#9096A0]">
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
