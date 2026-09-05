"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Market } from "@/lib/types";

// `currentSlug` lets a caller that already resolved the active market
// server-side (with its own default/fallback logic, e.g. the shift
// preview page defaulting to Topeka rather than whichever market sorts
// first alphabetically) pass that resolution in directly, so the select's
// shown value can't drift from what's actually loaded on the page. Falls
// back to reading the `market` query param itself when omitted, unchanged
// from the original behavior every existing caller relies on.
export default function MarketSwitcher({ markets, currentSlug: currentSlugProp }: { markets: Market[]; currentSlug?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (markets.length <= 1) {
    return <span className="text-sm text-[#1c1c1c]/50">{markets[0]?.name}</span>;
  }

  function handleChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("market", slug);
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentSlug = currentSlugProp ?? searchParams.get("market") ?? undefined;
  const current = markets.find((m) => m.slug === currentSlug);

  return (
    <select
      value={current?.slug ?? markets[0].slug}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded border border-[#1c1c1c]/15 bg-white px-2 py-1 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
    >
      {markets.map((m) => (
        <option key={m.id} value={m.slug}>
          {m.name}, {m.state}
        </option>
      ))}
    </select>
  );
}
