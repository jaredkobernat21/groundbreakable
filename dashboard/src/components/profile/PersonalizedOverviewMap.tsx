"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";

export type OverviewMapPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  score: number;
};

// Same green/amber/gray banding as matchBadge() in PersonalizedOverview,
// so a pin's color always means the same thing as its card's badge.
function scoreColor(score: number): string {
  return score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#6b7280";
}

// Same teardrop body used by every other pin marker in the app
// (OpportunityMap, ShiftMap, etc. via markerIcons.ts/opportunityConstants.ts)
// -- plain-colored, no inner glyph, since these pins span both
// opportunities and shifts and are banded by match score, not by a
// single entity type.
function teardropPinSvg(color: string, size = 28): string {
  const height = Math.round((size * 32) / 24);
  return `<svg width="${size}" height="${height}" viewBox="0 0 24 32" fill="none">
    <path d="M12 0C6.477 0 2 4.595 2 10.263c0 7.692 10 21.737 10 21.737s10-14.045 10-21.737C22 4.595 17.523 0 12 0z" fill="${color}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
  </svg>`;
}

// The Personalized Overview's hero map -- unlike every other map in the
// app (ShiftMap, OpportunityMap, InvestmentMap, BuildabilityMap), this
// one isn't scoped to a single market's center/zoom, since it's plotting
// top matches across every market in the account's Opportunity Profile.
// Fits bounds to whatever pins actually exist instead.
export default function PersonalizedOverviewMap({ pins }: { pins: OverviewMapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);

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
        center: pins[0] ? [pins[0].lng, pins[0].lat] : [-95.2, 39.0],
        zoom: 8,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;

        pins.forEach((pin) => {
          const el = document.createElement("div");
          el.className = "roq-marker";
          el.innerHTML = `
            <div class="roq-marker-card">
              <span class="roq-marker-card-title">${escapeHtml(pin.title)}</span>
              <span class="roq-marker-card-sub">${escapeHtml(pin.subtitle)} · ${pin.score}% match</span>
            </div>
            <div class="roq-marker-line" style="background:${scoreColor(pin.score)}"></div>
            <div class="roq-marker-pin">${teardropPinSvg(scoreColor(pin.score))}</div>
          `;
          new mapboxgl.default.Marker({ element: el, anchor: "bottom" }).setLngLat([pin.lng, pin.lat]).addTo(map);
        });

        if (pins.length > 1) {
          const bounds = new mapboxgl.default.LngLatBounds();
          pins.forEach((p) => bounds.extend([p.lng, p.lat]));
          map.fitBounds(bounds, { padding: 70, maxZoom: 11 });
        }
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-[#1c1c1c]/10 bg-[#1c1c1c]/5 text-sm text-[#1c1c1c]/40">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  return <div ref={containerRef} className="roq-dev-map h-full w-full overflow-hidden rounded-2xl" />;
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
