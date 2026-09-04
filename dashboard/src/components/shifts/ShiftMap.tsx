"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import type { Market, ShiftWithSource } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, SHIFT_CATEGORY_LABEL, shiftPinMarkerSvgMarkup } from "@/lib/shiftConstants";
import { formatDate } from "@/lib/format";

// A single point-marker layer, one glyph per category (SHIFT_CATEGORY_ICON_PATHS)
// -- no polygons, no zoom gating, no radius-reveal. Shifts without lat/lng
// (e.g. a market-wide employer relocation) are simply skipped here; they
// still show up in ShiftFeed.
export default function ShiftMap({
  market,
  shifts,
  selectedShiftId,
  onSelectShift,
}: {
  market: Market;
  shifts: ShiftWithSource[];
  selectedShiftId: string | null;
  onSelectShift: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Init map once per market.
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
        // Marker rendering is left to the `ready`-keyed effect below rather
        // than called directly here -- this handler is a native listener
        // locked to whatever closure existed at mount, while that effect
        // always runs with the current render's props.
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

  // Render markers whenever the filtered shift list or selection changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    import("mapbox-gl").then((mapboxgl) => {
      shifts.forEach((shift) => {
        if (shift.lat == null || shift.lng == null) return;

        const color = SHIFT_CATEGORY_COLOR[shift.category];
        const el = document.createElement("div");
        el.className = "roq-marker";
        el.style.opacity = !selectedShiftId || shift.id === selectedShiftId ? "1" : "0.35";
        el.classList.toggle("is-selected", shift.id === selectedShiftId);

        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">${escapeHtml(shift.event)}</span>
            <span class="roq-marker-card-sub">${escapeHtml(SHIFT_CATEGORY_LABEL[shift.category])}${
              formatDate(shift.event_date) ? " · " + escapeHtml(formatDate(shift.event_date)!) : ""
            }</span>
          </div>
          <div class="roq-marker-line" style="background:${color}"></div>
          <div class="roq-marker-pin">${shiftPinMarkerSvgMarkup(shift.category)}</div>
        `;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectShift(shift.id);
        });

        const marker = new mapboxgl.default.Marker({ element: el, anchor: "bottom" })
          .setLngLat([shift.lng!, shift.lat!])
          .addTo(map);
        markersRef.current.set(shift.id, marker);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, shifts, selectedShiftId]);

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
      onClick={() => onSelectShift(null)}
      className="roq-dev-map h-full w-full overflow-hidden rounded-xl"
    />
  );
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
