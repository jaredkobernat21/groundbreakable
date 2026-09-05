"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import type { InvestmentWithSource, Market } from "@/lib/types";
import { INVESTMENT_TYPE_COLOR, INVESTMENT_TYPE_LABEL, investmentPinMarkerSvgMarkup } from "@/lib/investmentConstants";
import { formatCurrency } from "@/lib/format";

// Same structure as ShiftMap (see that file's own comment on why marker
// rendering is a separate ready-keyed effect, not called from map.on('load')
// directly -- a native listener closes over stale props otherwise). Kept
// as its own component rather than a generalized shared map: this
// project's existing pattern is one small map component per surface
// (ShiftMap, BuildabilityMap), not one component parameterized over every
// marker shape -- lower risk than reworking ShiftMap's already-fragile
// closure handling to fit a second data shape.
export default function InvestmentMap({
  market,
  investments,
  selectedInvestmentId,
  onSelectInvestment,
}: {
  market: Market;
  investments: InvestmentWithSource[];
  selectedInvestmentId: string | null;
  onSelectInvestment: (id: string | null) => void;
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
      investments.forEach((inv) => {
        if (inv.lat == null || inv.lng == null) return;

        const color = INVESTMENT_TYPE_COLOR[inv.investment_type];
        const el = document.createElement("div");
        el.className = "roq-marker";
        el.style.opacity = !selectedInvestmentId || inv.id === selectedInvestmentId ? "1" : "0.35";
        el.classList.toggle("is-selected", inv.id === selectedInvestmentId);

        const amount = formatCurrency(inv.total_investment_amount);
        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">${escapeHtml(inv.project_name)}</span>
            <span class="roq-marker-card-sub">${escapeHtml(INVESTMENT_TYPE_LABEL[inv.investment_type])}${
              amount ? " · " + escapeHtml(amount) : ""
            }</span>
          </div>
          <div class="roq-marker-line" style="background:${color}"></div>
          <div class="roq-marker-pin">${investmentPinMarkerSvgMarkup(inv.investment_type)}</div>
        `;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectInvestment(inv.id);
        });

        const marker = new mapboxgl.default.Marker({ element: el, anchor: "bottom" })
          .setLngLat([inv.lng!, inv.lat!])
          .addTo(map);
        markersRef.current.set(inv.id, marker);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, investments, selectedInvestmentId]);

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
      onClick={() => onSelectInvestment(null)}
      className="roq-dev-map h-full w-full overflow-hidden rounded-xl"
    />
  );
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
