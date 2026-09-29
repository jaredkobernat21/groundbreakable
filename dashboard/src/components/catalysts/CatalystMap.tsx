"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import type { CatalystWithSources, Market } from "@/lib/types";
import { CATALYSTS_COLOR, CATALYST_TYPE_LABEL } from "@/lib/types";
import { catalystAffectedAreaPolygon } from "@/lib/catalystRules";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";
import { applyPremiumMapStyling, PREMIUM_MAP_PITCH } from "@/lib/mapPremium";

const CATALYST_AREA_SOURCE_ID = "roq-catalysts-affected-areas";

// Same structure as OpportunityMap/PlansMap -- one small map component per
// surface. Unlike PlansMap (which layers catalysts on top of Plan pins),
// this is a pure Catalysts map for the new Catalysts tab (Jared,
// 2026-09-29): every catalyst gets its purple pin + affected-area polygon,
// nothing else drawn.
export default function CatalystMap({
  market,
  catalysts,
  selectedCatalystId,
  onSelectCatalyst,
}: {
  market: Market;
  catalysts: CatalystWithSources[];
  selectedCatalystId: string | null;
  onSelectCatalyst: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

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
        pitch: PREMIUM_MAP_PITCH,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;
        readyRef.current = true;
        setReady(true);

        applyPremiumMapStyling(map);

        map.addSource(CATALYST_AREA_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: CATALYST_AREA_SOURCE_ID,
          paint: { "fill-color": CATALYSTS_COLOR, "fill-opacity": 0.08 },
        });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-line`,
          type: "line",
          source: CATALYST_AREA_SOURCE_ID,
          paint: { "line-color": CATALYSTS_COLOR, "line-width": 1.5, "line-opacity": 0.6, "line-dasharray": [2, 2] },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    import("mapbox-gl").then((mapboxgl) => {
      catalysts.forEach((catalyst) => {
        const el = document.createElement("div");
        el.className = "roq-marker roq-marker-catalyst";
        el.style.opacity = !selectedCatalystId || catalyst.id === selectedCatalystId ? "1" : "0.5";
        el.classList.toggle("is-selected", catalyst.id === selectedCatalystId);
        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">⚡ ${escapeHtml(catalyst.title)}</span>
            <span class="roq-marker-card-sub">${escapeHtml(CATALYST_TYPE_LABEL[catalyst.catalyst_type])}</span>
          </div>
          <div class="roq-marker-line" style="background:${CATALYSTS_COLOR}"></div>
          <div class="roq-marker-pin">${catalystMarkerSvgMarkup({ size: 22, fill: CATALYSTS_COLOR })}</div>
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
      features: catalysts.map((catalyst) => ({
        type: "Feature" as const,
        properties: { id: catalyst.id },
        geometry: catalystAffectedAreaPolygon(catalyst),
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, catalysts]);

  // Same subtle pan/recenter-on-select convention as PlansMap/OpportunityMap
  // -- never zooms in below the market's default.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !selectedCatalystId) return;
    const catalyst = catalysts.find((c) => c.id === selectedCatalystId);
    if (!catalyst) return;

    map.flyTo({ center: [catalyst.longitude, catalyst.latitude], zoom: Math.max(map.getZoom(), market.default_zoom), duration: 800, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatalystId]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm text-white/40">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onClick={() => onSelectCatalyst(null)}
        className="roq-dev-map h-full w-full overflow-hidden rounded-xl"
      />
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-x-3 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-[11px] text-white/80">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATALYSTS_COLOR }} />
          Catalysts
        </span>
      </div>
    </>
  );
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
