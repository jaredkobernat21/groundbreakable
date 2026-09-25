"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import type { CatalystWithSources, Market } from "@/lib/types";
import { CATALYSTS_COLOR, CATALYST_TYPE_LABEL } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, shiftPinMarkerSvgMarkup } from "@/lib/shiftConstants";
import { planItemKey, planItemLocation, planItemSubtitle, planItemTitle, type PlanItem } from "@/lib/planItems";
import { catalystAffectedAreaPolygon } from "@/lib/catalystRules";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";

const CATALYST_AREA_SOURCE_ID = "roq-plans-catalyst-areas";

// Same mapbox init/marker-effect structure as ShiftMap/OpportunityMap (one
// small map component per surface -- see the comment on OpportunityMap).
// Renders every Plan (bare shift or entitlement case, see lib/planItems)
// as one yellow pin regardless of kind -- the marker card's title/subtitle
// already tells them apart, and a Plan is one concept to a developer
// scanning the map, not two. Catalysts get their own purple zone+marker
// treatment. The Momentum Area polygon layer was removed here per Jared,
// 2026-09-25 -- momentum context still drives BriefingSummary's headline,
// it's just no longer drawn on the map itself.
export default function PlansMap({
  market,
  plans,
  catalysts,
  selectedPlanKey,
  onSelectPlan,
}: {
  market: Market;
  plans: PlanItem[];
  catalysts: CatalystWithSources[];
  selectedPlanKey: string | null;
  onSelectPlan: (key: string | null) => void;
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

        // Catalyst affected-area layer -- own dashed purple outline, see
        // the same treatment on HeroMap.
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

      catalysts.forEach((catalyst) => {
        const key = `catalyst-${catalyst.id}`;
        const el = document.createElement("div");
        el.className = "roq-marker roq-marker-catalyst";
        el.style.opacity = !selectedPlanKey || key === selectedPlanKey ? "1" : "0.5";
        el.classList.toggle("is-selected", key === selectedPlanKey);
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
          onSelectPlan(key);
        });
        markersRef.current.set(key, new mapboxgl.default.Marker({ element: el, anchor: "center" }).setLngLat([catalyst.longitude, catalyst.latitude]).addTo(map));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, plans, catalysts, selectedPlanKey]);

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
      onClick={() => onSelectPlan(null)}
      className="roq-dev-map h-full w-full overflow-hidden rounded-xl"
    />
  );
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
