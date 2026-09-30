"use client";

import { useEffect, useRef, useState } from "react";
import type { CatalystWithSources, Market } from "@/lib/types";

type GeocodeResult = { kind: "place"; label: string; center: [number, number] };
// Distinct from a plain geocoded place -- a real markets row, so it can
// offer "Follow this market" inline (Jared's spec names this explicitly:
// "Kansas City, Charlotte, Nashville"). A geocoded address/city has nowhere
// else in this UI to become followable, so that action lives here.
type MarketResult = { kind: "market"; label: string; center: [number, number]; zoom: number; id: string };
type CatalystResult = { kind: "catalyst"; label: string; sub: string; center: [number, number]; id: string };
type SearchResult = GeocodeResult | MarketResult | CatalystResult;

// National map redesign (Jared, 2026-09-30): "Search city, market, project,
// or address." No geocoding exists anywhere in this repo today -- calls
// Mapbox's Geocoding API directly with the same public token every map
// already uses, debounced (300ms) since it's billed per request and no
// debounce pattern exists elsewhere to copy. Merges geocoder results with a
// local substring match over the already-loaded national catalysts/markets
// (no extra network round trip for those) into one dropdown.
export default function MapSearch({
  catalysts,
  markets,
  followedMarketIds,
  onFlyTo,
  onSelectCatalyst,
  onToggleFollowMarket,
}: {
  catalysts: CatalystWithSources[];
  markets: Market[];
  followedMarketIds: Set<string>;
  onFlyTo: (center: [number, number], zoom?: number) => void;
  onToggleFollowMarket: (marketId: string) => void;
  onSelectCatalyst: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const local: SearchResult[] = [
      ...markets
        .filter((m) => `${m.name} ${m.state}`.toLowerCase().includes(trimmed.toLowerCase()))
        .map((m) => ({
          kind: "market" as const,
          label: `${m.name}, ${m.state}`,
          center: [m.center_lng, m.center_lat] as [number, number],
          zoom: m.default_zoom,
          id: m.id,
        })),
      ...catalysts
        .filter((c) => c.title.toLowerCase().includes(trimmed.toLowerCase()))
        .map((c) => ({ kind: "catalyst" as const, label: c.title, sub: c.address ?? "", center: [c.longitude, c.latitude] as [number, number], id: c.id })),
    ];
    setResults(local);
    setOpen(true);

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&country=US&types=place,address&limit=5`
        );
        const json = await res.json();
        const geocoded: SearchResult[] = (json.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
          kind: "place" as const,
          label: f.place_name,
          center: f.center,
        }));
        setResults([...local, ...geocoded]);
      } catch {
        // Geocoding unavailable -- local results still stand, fail soft.
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, catalysts, markets]);

  function selectResult(result: SearchResult) {
    if (result.kind === "catalyst") {
      onSelectCatalyst(result.id);
      onFlyTo(result.center, 11);
    } else if (result.kind === "market") {
      onFlyTo(result.center, result.zoom);
    } else {
      onFlyTo(result.center, 9);
    }
    setQuery(result.label);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search city, market, project, or address"
        className="w-full rounded-full border border-white/[0.08] bg-[#0E0F12]/80 px-4 py-2 text-[13px] text-[#EDECE8] placeholder:text-[#6B6F78] outline-none backdrop-blur-xl focus:border-white/20"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0E0F12]/95 py-1 shadow-2xl backdrop-blur-2xl">
          {results.map((result, i) => (
            <div key={i} className="flex items-center justify-between gap-2 px-1 hover:bg-white/[0.05]">
              <button
                type="button"
                onClick={() => selectResult(result)}
                className="flex-1 px-3 py-2 text-left text-[13px] text-[#C7C9CE] hover:text-[#EDECE8]"
              >
                <span className="font-medium">{result.label}</span>
                {result.kind === "catalyst" && result.sub && <span className="ml-2 text-[11px] text-[#6B6F78]">{result.sub}</span>}
              </button>
              {result.kind === "market" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollowMarket(result.id);
                  }}
                  className="mr-2 shrink-0 rounded-full border border-white/[0.08] px-2 py-1 text-[11px] text-[#7A7E87] hover:border-white/20 hover:text-[#EDECE8]"
                >
                  {followedMarketIds.has(result.id) ? "Following" : "Follow"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
