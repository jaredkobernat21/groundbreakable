"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Market } from "@/lib/types";

const ALL_MARKETS_VALUE = "__all__";

// `currentSlug` lets a caller that already resolved the active market
// server-side (with its own default/fallback logic, e.g. the shift
// preview page defaulting to Topeka rather than whichever market sorts
// first alphabetically) pass that resolution in directly, so the select's
// shown value can't drift from what's actually loaded on the page. Falls
// back to reading the `market` query param itself when omitted, unchanged
// from the original behavior every existing caller relies on.
//
// `allMarketsHref`, when provided (Intelligence/Partner accounts, see
// dashboard/layout.tsx), adds a real "All Markets" option that navigates
// there instead of setting ?market= -- without a `market` param present,
// this is also what the select shows selected, since that's genuinely
// the default view for those accounts now (no single market implied).
export default function MarketSwitcher({
  markets,
  currentSlug: currentSlugProp,
  allMarketsHref,
}: {
  markets: Market[];
  currentSlug?: string;
  allMarketsHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (markets.length <= 1 && !allMarketsHref) {
    return <span className="text-sm text-[#1c1c1c]/50">{markets[0]?.name}</span>;
  }

  function handleChange(value: string) {
    if (value === ALL_MARKETS_VALUE && allMarketsHref) {
      router.push(allMarketsHref);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("market", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentSlug = currentSlugProp ?? searchParams.get("market") ?? undefined;
  const current = markets.find((m) => m.slug === currentSlug);
  const selectValue = current?.slug ?? (allMarketsHref ? ALL_MARKETS_VALUE : markets[0]?.slug);

  return (
    <select
      value={selectValue}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded border border-[#1c1c1c]/15 bg-white px-2 py-1 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
    >
      {allMarketsHref && <option value={ALL_MARKETS_VALUE}>All Markets</option>}
      {markets.map((m) => (
        <option key={m.id} value={m.slug}>
          {m.name}, {m.state}
        </option>
      ))}
    </select>
  );
}
