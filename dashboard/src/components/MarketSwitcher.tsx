"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Market } from "@/lib/types";

export default function MarketSwitcher({ markets }: { markets: Market[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (markets.length <= 1) {
    return <span className="text-sm text-white/50">{markets[0]?.name}</span>;
  }

  function handleChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("market", slug);
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentSlug = searchParams.get("market");
  const current = markets.find((m) => m.slug === currentSlug);

  return (
    <select
      value={current?.slug ?? markets[0].slug}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-white outline-none focus:border-white/30"
    >
      {markets.map((m) => (
        <option key={m.id} value={m.slug}>
          {m.name}, {m.state}
        </option>
      ))}
    </select>
  );
}
