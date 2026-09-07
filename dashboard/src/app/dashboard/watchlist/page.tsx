import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile } from "@/lib/tiers";
import { getWatchlist } from "@/lib/queries/watchlist";
import type { GrowthArea, Market, WatchlistItemType } from "@/lib/types";
import { addToWatchlist, removeFromWatchlist } from "./actions";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";
const selectClass = "rounded-lg border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c]";

const TYPE_LABEL: Record<WatchlistItemType, string> = {
  market: "Market",
  corridor: "Corridor",
  opportunity: "Opportunity",
  shift: "Signal",
  investment: "Investment",
};

const TYPE_HREF: Record<WatchlistItemType, (id: string) => string> = {
  market: () => "/dashboard/markets",
  corridor: (id) => `/dashboard/markets/corridors/${id}`,
  opportunity: () => "/dashboard/opportunities",
  shift: () => "/dashboard/opportunities",
  investment: () => "/dashboard",
};

// Available to every tier ("Watchlist if useful" per spec's Access
// feature list) -- available even without an Opportunity Profile, since
// saving a market or corridor to track doesn't require personalization.
export default async function WatchlistPage() {
  const supabase = createClient();
  const account = await getCurrentInvestorProfile(supabase);
  if (!account) redirect("/login");

  const [items, { data: marketsData }, { data: corridorsData }] = await Promise.all([
    getWatchlist(supabase, account.id),
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    supabase.from("growth_areas").select("*").order("name").returns<GrowthArea[]>(),
  ]);
  const markets = marketsData ?? [];
  const corridors = corridorsData ?? [];
  const marketById = new Map(markets.map((m) => [m.id, m]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Watchlist</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/60">Saved markets, corridors, and opportunities.</p>
      </div>

      <section className={cardClass}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Add to Watchlist</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <form action={addToWatchlist} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="item_type" value="market" />
            <select name="item_choice" required className={selectClass}>
              <option value="">Track a market…</option>
              {markets.map((m) => (
                <option key={m.id} value={`${m.id}::${m.name}, ${m.state}`}>
                  {m.name}, {m.state}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-full bg-[#1c1c1c] px-3 py-2 text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
              Add
            </button>
          </form>
          <form action={addToWatchlist} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="item_type" value="corridor" />
            <select name="item_choice" required className={selectClass}>
              <option value="">Track a corridor…</option>
              {corridors.map((c) => (
                <option key={c.id} value={`${c.id}::${c.name}`}>
                  {c.name} ({marketById.get(c.market_id)?.name ?? "—"})
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-full bg-[#1c1c1c] px-3 py-2 text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
              Add
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-2">
        {items.map((item) => {
          const removeItemAction = removeFromWatchlist.bind(null, item.id);
          return (
            <div key={item.id} className={`${cardClass} flex items-center justify-between`}>
              <div>
                <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">{TYPE_LABEL[item.item_type]}</div>
                <Link href={TYPE_HREF[item.item_type](item.item_id)} className="text-sm font-medium text-[#1c1c1c] hover:underline">
                  {item.label}
                </Link>
                {item.note && <div className="mt-1 text-xs text-[#1c1c1c]/50">{item.note}</div>}
              </div>
              <form action={removeItemAction}>
                <button type="submit" className="text-xs text-[#1c1c1c]/40 hover:text-red-600">
                  Remove
                </button>
              </form>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-[#1c1c1c]/40">Nothing on your watchlist yet.</p>}
      </section>
    </div>
  );
}
