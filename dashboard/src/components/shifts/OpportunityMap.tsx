"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import type { DevelopmentOpportunityWithSources, Market } from "@/lib/types";
import { OPPORTUNITY_STRENGTH_COLOR, opportunityPinMarkerSvgMarkup } from "@/lib/opportunityConstants";
import { OPPORTUNITY_STRENGTH_LABEL } from "@/lib/types";

// Same structure as InvestmentMap/ShiftMap -- one small map component per
// surface, marker rendering in a ready-keyed effect (not called directly
// from map.on('load')) so it never closes over stale props.
export default function OpportunityMap({
  market,
  opportunities,
  selectedOpportunityId,
  onSelectOpportunity,
}: {
  market: Market;
  opportunities: DevelopmentOpportunityWithSources[];
  selectedOpportunityId: string | null;
  onSelectOpportunity: (id: string | null) => void;
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
      opportunities.forEach((opp) => {
        const color = OPPORTUNITY_STRENGTH_COLOR[opp.strength];
        const el = document.createElement("div");
        el.className = "roq-marker";
        el.style.opacity = !selectedOpportunityId || opp.id === selectedOpportunityId ? "1" : "0.35";
        el.classList.toggle("is-selected", opp.id === selectedOpportunityId);

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
          onSelectOpportunity(opp.id);
        });

        const marker = new mapboxgl.default.Marker({ element: el, anchor: "bottom" })
          .setLngLat([opp.longitude, opp.latitude])
          .addTo(map);
        markersRef.current.set(opp.id, marker);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, opportunities, selectedOpportunityId]);

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
      onClick={() => onSelectOpportunity(null)}
      className="roq-dev-map h-full w-full overflow-hidden rounded-xl"
    />
  );
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
