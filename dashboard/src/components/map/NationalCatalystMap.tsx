"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import type { GeoJSONSource, LngLatBoundsLike, Map as MapboxMap, Marker } from "mapbox-gl";
import type { CatalystWithSources } from "@/lib/types";
import { catalystAffectedAreaPolygon } from "@/lib/catalystRules";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";
import { applyPremiumMapStyling, addZoomAdaptiveSatellite, PREMIUM_MAP_PITCH } from "@/lib/mapPremium";
import {
  CATALYST_SIZE_TIER_PX,
  catalystColorHex,
  catalystIconKey,
  catalystMarkerPriority,
  catalystMarkerTier,
  catalystSizeTier,
} from "@/lib/catalystTypeColors";

const CATALYST_AREA_SOURCE_ID = "roq-national-catalyst-areas";

// Screen-space declutter (Jared, 2026-10-01): Mapbox DOM markers have no
// collision handling of their own -- every marker draws, so a dense metro
// like KC turns into a pile of overlapping squares at national zoom. This
// is a greedy highest-priority-wins pass: project every marker to screen
// px, walk them in priority order, and collapse any marker whose circle
// would overlap one already placed. Collapsed markers stay in the DOM as
// quiet dots (hover restores them) rather than disappearing, so nothing is
// silently lost from the map. O(n^2) over ~100 markers is a few thousand
// distance checks per frame -- cheap, and it's rAF-throttled below.
const COLLISION_PADDING_PX = 3;

type DeclutterEntry = { el: HTMLElement; lng: number; lat: number; size: number; priority: number };

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
  const declutterRef = useRef<DeclutterEntry[]>([]);
  const declutterFrameRef = useRef<number | null>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  const runDeclutter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const entries = declutterRef.current;
    if (entries.length === 0) return;

    const placed: { x: number; y: number; radius: number }[] = [];
    // Highest priority first, so the winner of any overlap is the more
    // significant catalyst rather than whichever happened to render first.
    const byPriority = [...entries].sort((a, b) => b.priority - a.priority);

    for (const entry of byPriority) {
      const point = map.project([entry.lng, entry.lat]);
      const radius = entry.size / 2 + COLLISION_PADDING_PX;
      let collapsed = false;
      for (const other of placed) {
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const minDistance = radius + other.radius;
        if (dx * dx + dy * dy < minDistance * minDistance) {
          collapsed = true;
          break;
        }
      }
      entry.el.classList.toggle("is-collapsed", collapsed);
      if (!collapsed) placed.push({ x: point.x, y: point.y, radius });
    }
  }, []);

  const scheduleDeclutter = useCallback(() => {
    if (declutterFrameRef.current != null) return;
    declutterFrameRef.current = requestAnimationFrame(() => {
      declutterFrameRef.current = null;
      runDeclutter();
    });
  }, [runDeclutter]);

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
    declutterRef.current = [];

    import("mapbox-gl").then((mapboxgl) => {
      const entries: DeclutterEntry[] = [];

      catalysts.forEach((catalyst) => {
        const color = catalystColorHex(catalyst);
        const size = CATALYST_SIZE_TIER_PX[catalystSizeTier(catalyst)];
        const isSelected = catalyst.id === selectedCatalystId;

        const el = document.createElement("div");
        el.className = "roq-marker roq-marker-catalyst";
        el.style.opacity = !selectedCatalystId || isSelected ? "1" : "0.4";
        // Drives the category-tinted selection glow in globals.css -- kept
        // as a CSS variable so the glow colour follows the marker without
        // the stylesheet needing to know anything about catalyst types.
        el.style.setProperty("--marker-accent", color);
        el.classList.toggle("is-selected", isSelected);
        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">${escapeHtml(catalyst.title)}</span>
            <span class="roq-marker-card-sub">${escapeHtml(catalyst.address ?? "")}</span>
          </div>
          <div class="roq-marker-line" style="background:${color}"></div>
          <div class="roq-marker-pin">${catalystMarkerSvgMarkup({
            size,
            fill: color,
            icon: catalystIconKey(catalyst),
            tier: catalystMarkerTier(catalyst),
          })}</div>
        `;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectCatalyst(catalyst.id);
        });

        const marker = new mapboxgl.default.Marker({ element: el, anchor: "center" }).setLngLat([catalyst.longitude, catalyst.latitude]).addTo(map);
        markersRef.current.set(catalyst.id, marker);
        entries.push({
          el,
          lng: catalyst.longitude,
          lat: catalyst.latitude,
          size,
          // A selected catalyst always wins its spot -- collapsing the thing
          // the user just clicked on would be actively wrong.
          priority: catalystMarkerPriority(catalyst) + (isSelected ? 1_000_000 : 0),
        });
      });

      declutterRef.current = entries;
      runDeclutter();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, catalysts, selectedCatalystId]);

  // Re-run the overlap pass as the viewport changes -- what collides at
  // national zoom is fully separated three zoom levels in.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.on("move", scheduleDeclutter);
    map.on("zoom", scheduleDeclutter);
    return () => {
      map.off("move", scheduleDeclutter);
      map.off("zoom", scheduleDeclutter);
      if (declutterFrameRef.current != null) {
        cancelAnimationFrame(declutterFrameRef.current);
        declutterFrameRef.current = null;
      }
    };
  }, [ready, scheduleDeclutter]);

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
