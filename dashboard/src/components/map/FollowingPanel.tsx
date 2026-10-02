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
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-[340px] overflow-y-auto border-l border-white/10 bg-black/90 p-5 shadow-2xl backdrop-blur-xl max-sm:right-3 max-sm:w-[calc(100%-1.5rem)]"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Following</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>

        <section className="mb-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Markets ({followedMarkets.length})</p>
          {followedMarkets.length === 0 ? (
            <p className="text-sm text-white/40">No markets followed yet.</p>
          ) : (
            <div className="space-y-1.5">
              {followedMarkets.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded border border-white/10 px-3 py-2">
                  <button type="button" onClick={() => onFlyToMarket(m)} className="text-left text-sm text-white/80 hover:text-white">
                    {m.name}, {m.state}
                  </button>
                  <button type="button" onClick={() => onUnfollowMarket(m.id)} className="text-xs text-white/30 hover:text-white/70">
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Projects ({followedCatalysts.length})</p>
          {followedCatalysts.length === 0 ? (
            <p className="text-sm text-white/40">No projects followed yet.</p>
          ) : (
            <div className="space-y-1.5">
              {followedCatalysts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded border border-white/10 px-3 py-2">
                  <button type="button" onClick={() => onSelectCatalyst(c.id)} className="text-left text-sm text-white/80 hover:text-white">
                    {c.title}
                  </button>
                  <button type="button" onClick={() => onUnfollowCatalyst(c.id)} className="text-xs text-white/30 hover:text-white/70">
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
