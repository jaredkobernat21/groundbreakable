"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import type { GrowthArea, Market } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL, POTENTIAL_COLOR } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, shiftPinMarkerSvgMarkup } from "@/lib/shiftConstants";
import { planItemKey, planItemLocation, planItemSubtitle, planItemTitle, type PlanItem } from "@/lib/planItems";
import { polygonCentroid } from "@/lib/geo";

const MOMENTUM_AREA_SOURCE_ID = "roq-plans-momentum-areas";
const MOMENTUM_AREA_LABEL_SOURCE_ID = "roq-plans-momentum-area-labels";

// Same mapbox init/marker-effect structure as ShiftMap/OpportunityMap (one
// small map component per surface -- see the comment on OpportunityMap).
// Renders every Plan (bare shift or entitlement case, see lib/planItems)
// as one orange "plans" pin regardless of kind -- the marker card's
// title/subtitle already tells them apart, and a Plan is one concept to a
// developer scanning the map, not two.
export default function PlansMap({
  market,
  plans,
  selectedPlanKey,
  onSelectPlan,
  momentumAreas,
  selectedMomentumAreaId,
  onSelectMomentumArea,
}: {
  market: Market;
  plans: PlanItem[];
  selectedPlanKey: string | null;
  onSelectPlan: (key: string | null) => void;
  momentumAreas?: GrowthArea[];
  selectedMomentumAreaId?: string | null;
  onSelectMomentumArea?: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const selectedAreaFeatureIdRef = useRef<string | null>(null);

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
        readyRef.current = true;
        setReady(true);

        map.addSource(MOMENTUM_AREA_SOURCE_ID, { type: "geojson", promoteId: "id", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${MOMENTUM_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: MOMENTUM_AREA_SOURCE_ID,
          paint: { "fill-color": POTENTIAL_COLOR, "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.22, 0.08] },
        });
        map.addLayer({
          id: `${MOMENTUM_AREA_SOURCE_ID}-line`,
          type: "line",
          source: MOMENTUM_AREA_SOURCE_ID,
          paint: {
            "line-color": POTENTIAL_COLOR,
            "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2, 1],
            "line-opacity": 0.75,
          },
        });
        map.addSource(MOMENTUM_AREA_LABEL_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${MOMENTUM_AREA_LABEL_SOURCE_ID}-symbol`,
          type: "symbol",
          source: MOMENTUM_AREA_LABEL_SOURCE_ID,
          layout: { "text-field": ["get", "name"], "text-size": 12, "text-anchor": "center", "text-allow-overlap": false },
          paint: { "text-color": POTENTIAL_COLOR, "text-opacity": 0.9, "text-halo-color": "rgba(0,0,0,0.65)", "text-halo-width": 1.2 },
        });

        map.on("click", `${MOMENTUM_AREA_SOURCE_ID}-fill`, (e) => {
          e.originalEvent.stopPropagation();
          const id = e.features?.[0]?.properties?.id;
          if (id) onSelectMomentumArea?.(id);
        });
        map.on("mouseenter", `${MOMENTUM_AREA_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", `${MOMENTUM_AREA_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "";
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
      selectedAreaFeatureIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    import("mapbox-gl").then((mapboxgl) => {
      plans.forEach((plan) => {
        const location = planItemLocation(plan);
        if (!location) return;

        const key = planItemKey(plan);
        const color = SHIFT_CATEGORY_COLOR.plans;
        const el = document.createElement("div");
        el.className = "roq-marker";
        el.style.opacity = !selectedPlanKey || key === selectedPlanKey ? "1" : "0.35";
        el.classList.toggle("is-selected", key === selectedPlanKey);

        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">${escapeHtml(planItemTitle(plan))}</span>
            <span class="roq-marker-card-sub">${escapeHtml(planItemSubtitle(plan))}</span>
          </div>
          <div class="roq-marker-line" style="background:${color}"></div>
          <div class="roq-marker-pin">${shiftPinMarkerSvgMarkup("plans")}</div>
        `;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectPlan(key);
        });

        const marker = new mapboxgl.default.Marker({ element: el, anchor: "bottom" }).setLngLat([location.lng, location.lat]).addTo(map);
        markersRef.current.set(key, marker);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, plans, selectedPlanKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    if (!map.getSource(MOMENTUM_AREA_SOURCE_ID)) return;

    const areas = momentumAreas ?? [];

    (map.getSource(MOMENTUM_AREA_SOURCE_ID) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: areas.map((area) => ({ type: "Feature" as const, properties: { id: area.id }, geometry: area.geom })),
    });
    (map.getSource(MOMENTUM_AREA_LABEL_SOURCE_ID) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: areas.map((area) => {
        const center = polygonCentroid(area.geom);
        return {
          type: "Feature" as const,
          properties: { name: `${area.name} (${GROWTH_AREA_MOMENTUM_LABEL[area.momentum_state]})` },
          geometry: { type: "Point" as const, coordinates: [center.lng, center.lat] },
        };
      }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, momentumAreas]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    if (selectedAreaFeatureIdRef.current !== null) {
      map.setFeatureState({ source: MOMENTUM_AREA_SOURCE_ID, id: selectedAreaFeatureIdRef.current }, { selected: false });
      selectedAreaFeatureIdRef.current = null;
    }

    if (!selectedMomentumAreaId) return;
    const area = (momentumAreas ?? []).find((a) => a.id === selectedMomentumAreaId);
    if (!area) return;

    const center = polygonCentroid(area.geom);
    map.flyTo({ center: [center.lng, center.lat], zoom: Math.max(map.getZoom(), 13.5), duration: 1200, essential: true });
    map.setFeatureState({ source: MOMENTUM_AREA_SOURCE_ID, id: area.id }, { selected: true });
    selectedAreaFeatureIdRef.current = area.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMomentumAreaId, momentumAreas]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm text-white/40">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={() => {
        onSelectPlan(null);
        onSelectMomentumArea?.(null);
      }}
      className="roq-dev-map h-full w-full overflow-hidden rounded-xl"
    />
  );
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
