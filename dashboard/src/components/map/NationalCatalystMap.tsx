"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import type { GeoJSONSource, LngLatBoundsLike, Map as MapboxMap, Marker } from "mapbox-gl";
import type { CatalystWithSources } from "@/lib/types";
import { catalystAffectedAreaPolygon } from "@/lib/catalystRules";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";
import { applyPremiumMapStyling, addZoomAdaptiveSatellite, PREMIUM_MAP_PITCH } from "@/lib/mapPremium";
import { CATALYST_SIZE_TIER_PX, catalystColorHex, catalystSizeTier } from "@/lib/catalystTypeColors";

const CATALYST_AREA_SOURCE_ID = "roq-national-catalyst-areas";

// Continental US -- fitBounds default view. No `projection: 'globe'`: Jared
// already considered and passed on globe curvature this session (see
// lib/mapPremium.ts's own comment), and mercator + fitBounds is the
// established, lower-risk V1 choice.
const US_BOUNDS: LngLatBoundsLike = [
  [-125.0, 24.5],
  [-66.9, 49.5],
];

export type NationalCatalystMapHandle = {
  flyTo: (center: [number, number], zoom?: number) => void;
};

// National map redesign (Jared, 2026-09-30). Forked from
// components/catalysts/CatalystMap.tsx's proven pattern (DOM markers, same
// dim/focus toggle, same affected-area polygon layer) rather than switching
// to native GL layers/clustering -- catalyst volume is small and curated
// (10 rows today), so flat DOM markers stay correct at national scale; see
// the plan's "no clustering for V1" note. Two differences from the
// single-market original: (1) US-wide fitBounds default instead of one
// market's center/zoom, no per-market re-init; (2) marker color/size vary
// by catalyst_type/catalyst_score instead of one flat purple dot.
const NationalCatalystMap = forwardRef<
  NationalCatalystMapHandle,
  {
    catalysts: CatalystWithSources[];
    selectedCatalystId: string | null;
    onSelectCatalyst: (id: string | null) => void;
  }
>(function NationalCatalystMap({ catalysts, selectedCatalystId, onSelectCatalyst }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({
    flyTo: (center, zoom = 10) => {
      mapRef.current?.flyTo({ center, zoom, duration: 1000, essential: true });
    },
  }));

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
        bounds: US_BOUNDS,
        fitBoundsOptions: { padding: 40 },
        pitch: 0, // flat at national zoom -- PREMIUM_MAP_PITCH's tilt is for city-scale 3D buildings
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;
        readyRef.current = true;
        setReady(true);

        applyPremiumMapStyling(map);
        addZoomAdaptiveSatellite(map);

        map.addSource(CATALYST_AREA_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: CATALYST_AREA_SOURCE_ID,
          paint: { "fill-color": ["get", "color"], "fill-opacity": 0.1 },
        });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-line`,
          type: "line",
          source: CATALYST_AREA_SOURCE_ID,
          paint: { "line-color": ["get", "color"], "line-width": 1.5, "line-opacity": 0.7, "line-dasharray": [2, 2] },
        });
      });
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    import("mapbox-gl").then((mapboxgl) => {
      catalysts.forEach((catalyst) => {
        const color = catalystColorHex(catalyst);
        const size = CATALYST_SIZE_TIER_PX[catalystSizeTier(catalyst)];

        const el = document.createElement("div");
        el.className = "roq-marker roq-marker-catalyst";
        el.style.opacity = !selectedCatalystId || catalyst.id === selectedCatalystId ? "1" : "0.4";
        el.classList.toggle("is-selected", catalyst.id === selectedCatalystId);
        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">${escapeHtml(catalyst.title)}</span>
            <span class="roq-marker-card-sub">${escapeHtml(catalyst.address ?? "")}</span>
          </div>
          <div class="roq-marker-line" style="background:${color}"></div>
          <div class="roq-marker-pin">${catalystMarkerSvgMarkup({ size, fill: color })}</div>
        `;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectCatalyst(catalyst.id);
        });

        const marker = new mapboxgl.default.Marker({ element: el, anchor: "center" }).setLngLat([catalyst.longitude, catalyst.latitude]).addTo(map);
        markersRef.current.set(catalyst.id, marker);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, catalysts, selectedCatalystId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    if (!map.getSource(CATALYST_AREA_SOURCE_ID)) return;

    (map.getSource(CATALYST_AREA_SOURCE_ID) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: catalysts
        .filter((c) => c.id === selectedCatalystId)
        .map((catalyst) => ({
          type: "Feature" as const,
          properties: { id: catalyst.id, color: catalystColorHex(catalyst) },
          geometry: catalystAffectedAreaPolygon(catalyst),
        })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, catalysts, selectedCatalystId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !selectedCatalystId) return;
    const catalyst = catalysts.find((c) => c.id === selectedCatalystId);
    if (!catalyst) return;

    map.flyTo({ center: [catalyst.longitude, catalyst.latitude], zoom: Math.max(map.getZoom(), 10), duration: 900, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatalystId]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-black/90 text-sm text-white/40">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  return <div ref={containerRef} onClick={() => onSelectCatalyst(null)} className="roq-dev-map h-full w-full" />;
});

export default NationalCatalystMap;

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
