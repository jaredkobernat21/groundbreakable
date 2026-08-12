"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import type { Market, MarketEvent } from "@/lib/types";

const EVENT_COLORS: Record<MarketEvent["type"], string> = {
  development: "#3b82f6",
  permit: "#22c55e",
  infrastructure: "#a855f7",
  risk: "#f97316",
};

export default function MarketMap({
  market,
  events,
}: {
  market: Market;
  events: MarketEvent[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;

      mapboxgl.default.accessToken = token;
      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [market.center_lng, market.center_lat],
        zoom: market.default_zoom,
      });
      mapRef.current = map;

      events
        .filter((e) => e.lat != null && e.lng != null)
        .forEach((e) => {
          new mapboxgl.default.Marker({ color: EVENT_COLORS[e.type] })
            .setLngLat([e.lng!, e.lat!])
            .setPopup(new mapboxgl.default.Popup().setText(e.title))
            .addTo(map);
        });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
    };
  }, [market, events]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm text-white/40">
        Set NEXT_PUBLIC_MAPBOX_TOKEN to render the map
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-80 overflow-hidden rounded-lg border border-white/10"
    />
  );
}
