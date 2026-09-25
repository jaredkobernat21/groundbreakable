"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import type { CatalystWithSources, DevelopmentOpportunityWithSources, GrowthArea, Market } from "@/lib/types";
import { CATALYSTS_COLOR, CATALYST_TYPE_LABEL, GROWTH_AREA_MOMENTUM_LABEL, OPPORTUNITY_STRENGTH_LABEL, POTENTIAL_COLOR } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, shiftPinMarkerSvgMarkup } from "@/lib/shiftConstants";
import { OPPORTUNITY_STRENGTH_COLOR, opportunityPinMarkerSvgMarkup } from "@/lib/opportunityConstants";
import { planItemKey, planItemLocation, planItemSubtitle, planItemTitle, type PlanItem } from "@/lib/planItems";
import { catalystAffectedAreaPolygon } from "@/lib/catalystRules";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";
import { polygonCentroid } from "@/lib/geo";

const MOMENTUM_AREA_SOURCE_ID = "roq-hero-momentum-areas";
const MOMENTUM_AREA_LABEL_SOURCE_ID = "roq-hero-momentum-area-labels";
const CATALYST_AREA_SOURCE_ID = "roq-hero-catalyst-areas";

export type HeroMapLayer = "both" | "plans" | "opportunities";

// The Overview page's single hero map -- Plans and Opportunities pins
// together (per the redesign, a developer's two questions -- "what's
// changing" and "what should I pursue" -- live on one map, not two), plus
// the same Momentum Area polygon layer every other map in this app draws.
// Same mapbox init/marker-effect structure as PlansMap/OpportunityMap;
// duplicated rather than shared, matching this codebase's existing
// "one small map component per surface" convention (see OpportunityMap).
export default function HeroMap({
  market,
  plans,
  opportunities,
  catalysts,
  layer,
  selectedKey,
  onSelectKey,
  momentumAreas,
}: {
  market: Market;
  plans: PlanItem[];
  opportunities: DevelopmentOpportunityWithSources[];
  catalysts: CatalystWithSources[];
  layer: HeroMapLayer;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  momentumAreas?: GrowthArea[];
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
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;
        readyRef.current = true;
        setReady(true);

        map.addSource(MOMENTUM_AREA_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${MOMENTUM_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: MOMENTUM_AREA_SOURCE_ID,
          paint: { "fill-color": POTENTIAL_COLOR, "fill-opacity": 0.08 },
        });
        map.addLayer({
          id: `${MOMENTUM_AREA_SOURCE_ID}-line`,
          type: "line",
          source: MOMENTUM_AREA_SOURCE_ID,
          paint: { "line-color": POTENTIAL_COLOR, "line-width": 1, "line-opacity": 0.75 },
        });
        map.addSource(MOMENTUM_AREA_LABEL_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${MOMENTUM_AREA_LABEL_SOURCE_ID}-symbol`,
          type: "symbol",
          source: MOMENTUM_AREA_LABEL_SOURCE_ID,
          layout: { "text-field": ["get", "name"], "text-size": 12, "text-anchor": "center", "text-allow-overlap": false },
          paint: { "text-color": POTENTIAL_COLOR, "text-opacity": 0.9, "text-halo-color": "rgba(0,0,0,0.65)", "text-halo-width": 1.2 },
        });

        // Catalyst affected-area layer -- a distinct dashed white outline
        // (CATALYSTS_COLOR), own source/color from the Momentum Area
        // polygons, per Jared's "distinct marker or visual treatment" ask.
        map.addSource(CATALYST_AREA_SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: CATALYST_AREA_SOURCE_ID,
          paint: { "fill-color": CATALYSTS_COLOR, "fill-opacity": 0.06 },
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
      if (layer !== "opportunities") {
        plans.forEach((plan) => {
          const location = planItemLocation(plan);
          if (!location) return;

          const key = planItemKey(plan);
          const color = SHIFT_CATEGORY_COLOR.plans;
          const el = document.createElement("div");
          el.className = "roq-marker";
          el.style.opacity = !selectedKey || key === selectedKey ? "1" : "0.35";
          el.classList.toggle("is-selected", key === selectedKey);
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
            onSelectKey(key);
          });
          markersRef.current.set(key, new mapboxgl.default.Marker({ element: el, anchor: "bottom" }).setLngLat([location.lng, location.lat]).addTo(map));
        });
      }

      if (layer !== "plans") {
        opportunities.forEach((opp) => {
          if (opp.latitude == null || opp.longitude == null) return;

          const key = `opportunity-${opp.id}`;
          const color = OPPORTUNITY_STRENGTH_COLOR[opp.strength];
          const el = document.createElement("div");
          el.className = "roq-marker";
          el.style.opacity = !selectedKey || key === selectedKey ? "1" : "0.35";
          el.classList.toggle("is-selected", key === selectedKey);
          el.innerHTML = `
            <div class="roq-marker-card">
              <span class="roq-marker-card-title">${escapeHtml(opp.address)}</span>
              <span class="roq-marker-card-sub">${escapeHtml(opp.opportunity_type)} · ${OPPORTUNITY_STRENGTH_LABEL[opp.strength]}</span>
            </div>
            <div class="roq-marker-line" style="background:${color}"></div>
            <div class="roq-marker-pin">${opportunityPinMarkerSvgMarkup(opp.strength)}</div>
          `;
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            onSelectKey(key);
          });
          markersRef.current.set(key, new mapboxgl.default.Marker({ element: el, anchor: "bottom" }).setLngLat([opp.longitude!, opp.latitude!]).addTo(map));
        });
      }

      // Catalysts always render regardless of the Plans/Opportunities
      // toggle -- a high-priority designation, not a layer to hide.
      catalysts.forEach((catalyst) => {
        const key = `catalyst-${catalyst.id}`;
        const el = document.createElement("div");
        el.className = "roq-marker roq-marker-catalyst";
        el.style.opacity = !selectedKey || key === selectedKey ? "1" : "0.5";
        el.classList.toggle("is-selected", key === selectedKey);
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
          onSelectKey(key);
        });
        markersRef.current.set(key, new mapboxgl.default.Marker({ element: el, anchor: "center" }).setLngLat([catalyst.longitude, catalyst.latitude]).addTo(map));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, plans, opportunities, catalysts, layer, selectedKey]);

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

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm text-white/40">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  return <div ref={containerRef} onClick={() => onSelectKey(null)} className="roq-dev-map h-full w-full overflow-hidden rounded-xl" />;
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
