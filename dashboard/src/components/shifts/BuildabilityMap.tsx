"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { Market, ZoningLandUseWithSource } from "@/lib/types";

const SOURCE_ID = "buildability-zones";

// Coarse color-by-district-family so the map reads at a glance even
// before a zone is clicked -- residential/multifamily/downtown-mixed-use
// are the three families seeded so far (see the Topeka buildability
// migration); anything else falls back to a neutral gray rather than
// guessing a family for a code never seen yet.
function districtColor(code: string | null): string {
  if (!code) return "#94a3b8";
  const prefix = code.replace(/[^A-Za-z].*$/, "");
  if (prefix === "R") return "#3b82f6"; // blue -- single-family residential
  if (prefix === "M") return "#818cf8"; // indigo -- multi-family
  if (prefix === "D") return "#f97316"; // orange -- downtown mixed-use
  if (prefix === "C") return "#ef4444"; // red -- commercial
  if (prefix === "I") return "#64748b"; // slate -- industrial
  return "#94a3b8";
}

// Polygon layer for zoning districts, same source/fill/line/label
// convention DevelopmentMap.tsx uses for opportunity zones and growth
// areas -- fill polygons (colored by district family, highlighted on
// selection), an outline, and a district-code label at each polygon's
// centroid-ish point (Mapbox symbol placement default).
export default function BuildabilityMap({
  market,
  zones,
  selectedZoneId,
  onSelectZone,
}: {
  market: Market;
  zones: ZoningLandUseWithSource[];
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
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
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;

        map.addSource(SOURCE_ID, { type: "geojson", promoteId: "id", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${SOURCE_ID}-fill`,
          type: "fill",
          source: SOURCE_ID,
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.45, 0.22],
          },
        });
        map.addLayer({
          id: `${SOURCE_ID}-line`,
          type: "line",
          source: SOURCE_ID,
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.5, 1.2],
          },
        });
        map.addLayer({
          id: `${SOURCE_ID}-label`,
          type: "symbol",
          source: SOURCE_ID,
          layout: { "text-field": ["get", "code"], "text-size": 12, "text-allow-overlap": true },
          paint: { "text-color": "#fff", "text-halo-color": "rgba(0,0,0,0.7)", "text-halo-width": 1.2 },
        });

        map.on("click", `${SOURCE_ID}-fill`, (e) => {
          const id = e.features?.[0]?.properties?.id;
          if (id) onSelectZone(id);
        });
        map.on("mouseenter", `${SOURCE_ID}-fill`, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", `${SOURCE_ID}-fill`, () => (map.getCanvas().style.cursor = ""));

        readyRef.current = true;
        setReady(true);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id]);

  // Push zone data whenever the list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    const source = map.getSource(SOURCE_ID);
    if (!source || source.type !== "geojson") return;

    source.setData({
      type: "FeatureCollection",
      features: zones.map((zone) => ({
        type: "Feature",
        id: zone.id,
        geometry: zone.geom,
        properties: { id: zone.id, code: zone.district_code ?? "", color: districtColor(zone.district_code) },
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, zones]);

  // Selection highlight via feature-state, same pattern as DevelopmentMap.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    zones.forEach((zone) => {
      map.setFeatureState({ source: SOURCE_ID, id: zone.id }, { selected: zone.id === selectedZoneId });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, zones, selectedZoneId]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm text-white/40">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  return <div ref={containerRef} className="roq-dev-map h-full w-full overflow-hidden rounded-xl" />;
}
