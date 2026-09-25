"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import type { CatalystWithSources, DevelopmentOpportunityWithSources, Market } from "@/lib/types";
import { CATALYSTS_COLOR, CATALYST_TYPE_LABEL, OPPORTUNITIES_COLOR, OPPORTUNITY_STRENGTH_LABEL } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, shiftPinMarkerSvgMarkup } from "@/lib/shiftConstants";
import { opportunityPinMarkerSvgMarkup } from "@/lib/opportunityConstants";
import { planItemKey, planItemLocation, planItemSubtitle, planItemTitle, type PlanItem } from "@/lib/planItems";
import { catalystAffectedAreaPolygon } from "@/lib/catalystRules";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";

const CATALYST_AREA_SOURCE_ID = "roq-hero-catalyst-areas";

export type HeroMapLayer = "both" | "plans" | "opportunities";

// The Overview page's single hero map -- Plans (yellow) and Opportunities
// (green) pins together, plus Catalysts (purple, always on regardless of
// the toggle) with their affected-area outline. The Momentum Area polygon
// layer was removed from every map per Jared, 2026-09-25 -- momentum
// context still drives BriefingSummary's headline, it's just no longer
// drawn on the map itself. Same mapbox init/marker-effect structure as
// PlansMap/OpportunityMap; duplicated rather than shared, matching this
// codebase's existing "one small map component per surface" convention
// (see OpportunityMap).
export default function HeroMap({
  market,
  plans,
  opportunities,
  catalysts,
  layer,
  selectedKey,
  onSelectKey,
}: {
  market: Market;
  plans: PlanItem[];
  opportunities: DevelopmentOpportunityWithSources[];
  catalysts: CatalystWithSources[];
  layer: HeroMapLayer;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
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

        // Catalyst affected-area layer -- a distinct dashed purple outline
        // (CATALYSTS_COLOR), per Jared's "distinct marker or visual
        // treatment" ask.
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
          const el = document.createElement("div");
          el.className = "roq-marker";
          el.style.opacity = !selectedKey || key === selectedKey ? "1" : "0.35";
          el.classList.toggle("is-selected", key === selectedKey);
          el.innerHTML = `
            <div class="roq-marker-card">
              <span class="roq-marker-card-title">${escapeHtml(opp.address)}</span>
              <span class="roq-marker-card-sub">${escapeHtml(opp.opportunity_type)} · ${OPPORTUNITY_STRENGTH_LABEL[opp.strength]}</span>
            </div>
            <div class="roq-marker-line" style="background:${OPPORTUNITIES_COLOR}"></div>
            <div class="roq-marker-pin">${opportunityPinMarkerSvgMarkup(opp.strength, { fill: OPPORTUNITIES_COLOR })}</div>
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
