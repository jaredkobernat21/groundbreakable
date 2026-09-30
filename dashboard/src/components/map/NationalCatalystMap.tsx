"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import type { GeoJSONSource, LngLatBounds, LngLatBoundsLike, Map as MapboxMap, Marker } from "mapbox-gl";
import type { CatalystWithSources } from "@/lib/types";
import { circlePolygon } from "@/lib/geo";
import { applyInstitutionalMapStyling } from "@/lib/mapPremium";
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

// Institutional redesign (Jared, 2026-09-30). Markers are now "intelligence
// signals" (lib/catalystTypeColors.ts colors + globals.css .gb-signal-*
// classes) instead of the card+pin treatment CatalystMap.tsx uses -- no
// hover card, a thin ring (solid confirmed / dashed unconfirmed) around a
// solid dot, with a soft glow that strengthens on selection. Impact areas
// are now 2-3 concentric, decreasing-opacity rings instead of one flat
// polygon, approximating a "feathered" edge without custom shaders (Mapbox
// GL doesn't expose blur on vector fills from application code).
const NationalCatalystMap = forwardRef<
  NationalCatalystMapHandle,
  {
    catalysts: CatalystWithSources[];
    selectedCatalystId: string | null;
    onSelectCatalyst: (id: string | null) => void;
    onViewportChange?: (bounds: LngLatBounds) => void;
    showImpactAreas?: boolean;
  }
>(function NationalCatalystMap({ catalysts, selectedCatalystId, onSelectCatalyst, onViewportChange, showImpactAreas = true }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

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
        pitch: 0, // flat at national zoom -- 3D tilt is for city-scale buildings
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      const reportViewport = () => onViewportChangeRef.current?.(map.getBounds()!);

      map.on("load", () => {
        if (cancelled) return;
        readyRef.current = true;
        setReady(true);

        applyInstitutionalMapStyling(map);

        map.addSource(CATALYST_AREA_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: CATALYST_AREA_SOURCE_ID,
          paint: { "fill-color": ["get", "color"], "fill-opacity": ["get", "opacity"] },
        });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-line`,
          type: "line",
          source: CATALYST_AREA_SOURCE_ID,
          paint: { "line-color": ["get", "color"], "line-width": 1, "line-opacity": ["get", "lineOpacity"] },
        });

        reportViewport();
      });

      map.on("moveend", reportViewport);
      map.on("zoomend", reportViewport);
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
        const diameter = CATALYST_SIZE_TIER_PX[catalystSizeTier(catalyst)];
        const isSelected = catalyst.id === selectedCatalystId;
        const isUnconfirmed = catalyst.confidence === "unconfirmed" || catalyst.catalyst_type === "potential_data_center";
        const ringSize = diameter + 10;
        const dotSize = Math.round(diameter * 0.4);

        const el = document.createElement("div");
        el.className = "gb-signal";
        el.style.setProperty("--gb-signal-color", color);
        el.style.opacity = !selectedCatalystId || isSelected ? "1" : "0.45";
        el.classList.toggle("is-selected", isSelected);
        el.style.width = `${ringSize}px`;
        el.style.height = `${ringSize}px`;
        el.innerHTML = `
          <div class="gb-signal-glow" style="width:${ringSize}px;height:${ringSize}px;background:${color}"></div>
          <div class="gb-signal-ring ${isUnconfirmed ? "is-unconfirmed" : "is-confirmed"}" style="width:${ringSize}px;height:${ringSize}px">
            <div class="gb-signal-dot" style="width:${dotSize}px;height:${dotSize}px"></div>
          </div>
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

  // Concentric, decreasing-opacity rings around the selected catalyst --
  // innermost ring uses a real traced boundary when one exists, falling
  // back to circlePolygon (lib/geo.ts) like every other influence-radius
  // display in this app.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    if (!map.getSource(CATALYST_AREA_SOURCE_ID)) return;

    const selected = showImpactAreas ? catalysts.find((c) => c.id === selectedCatalystId) : undefined;
    const features = selected
      ? [0, 1, 2].map((ring) => {
          const radius = selected.influence_radius_meters * [1, 1.7, 2.5][ring];
          const geometry = ring === 0 && selected.boundary ? selected.boundary : circlePolygon(selected.longitude, selected.latitude, radius);
          return {
            type: "Feature" as const,
            properties: { color: catalystColorHex(selected), opacity: [0.14, 0.07, 0.03][ring], lineOpacity: [0.55, 0.3, 0.12][ring] },
            geometry,
          };
        })
      : [];

    (map.getSource(CATALYST_AREA_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, catalysts, selectedCatalystId, showImpactAreas]);

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
