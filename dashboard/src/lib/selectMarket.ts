import type { Market } from "@/lib/types";

// Picks the market matching ?market=<slug>, falling back to the first
// market in the (already name-sorted) list the caller has access to.
export function selectMarket(markets: Market[], slug?: string): Market | undefined {
  if (slug) {
    const match = markets.find((m) => m.slug === slug);
    if (match) return match;
  }
  return markets[0];
}
