"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import type { GrowthArea, Market, ShiftWithSource } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL, POTENTIAL_COLOR } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, SHIFT_CATEGORY_LABEL, shiftPinMarkerSvgMarkup } from "@/lib/shiftConstants";
import { formatDate } from "@/lib/format";
import { polygonCentroid } from "@/lib/geo";

const MOMENTUM_AREA_SOURCE_ID = "roq-momentum-areas";
const MOMENTUM_AREA_LABEL_SOURCE_ID = "roq-momentum-area-labels";

// A single point-marker layer, one glyph per category (SHIFT_CATEGORY_ICON_PATHS)
// -- no zoom gating, no radius-reveal. Shifts without lat/lng (e.g. a
// market-wide employer relocation) are simply skipped here; they still
// show up in ShiftFeed. Momentum Areas (translucent polygons -- clusters
// of shifts/projects the Momentum tab has identified as one story) are an
// optional second layer, only added to the map when momentumAreas is
// passed with something in it -- the Plans/Permits/Infrastructure tabs
// call this same component without those props and just get the plain
// pin map they always have.
export default function ShiftMap({
  market,
  shifts,
  selectedShiftId,
  onSelectShift,
  momentumAreas,
  selectedMomentumAreaId,
  onSelectMomentumArea,
}: {
  market: Market;
  shifts: ShiftWithSource[];
  selectedShiftId: string | null;
  onSelectShift: (id: string | null) => void;
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

        map.addSource(MOMENTUM_AREA_SOURCE_ID, {
          type: "geojson",
          promoteId: "id",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${MOMENTUM_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: MOMENTUM_AREA_SOURCE_ID,
          paint: {
            "fill-color": POTENTIAL_COLOR,
            "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.22, 0.08],
          },
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
        map.addSource(MOMENTUM_AREA_LABEL_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${MOMENTUM_AREA_LABEL_SOURCE_ID}-symbol`,
          type: "symbol",
          source: MOMENTUM_AREA_LABEL_SOURCE_ID,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-anchor": "center",
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": POTENTIAL_COLOR,
            "text-opacity": 0.9,
            "text-halo-color": "rgba(0,0,0,0.65)",
            "text-halo-width": 1.2,
          },
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

        // Marker/area rendering is left to the `ready`-keyed effects below
        // rather than called directly here -- this handler is a native
        // listener locked to whatever closure existed at mount, while
        // those effects always run with the current render's props.
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

  // Render the Momentum Area polygons/labels whenever the list changes.
  // Selection highlighting is handled separately below (feature-state
  // only, no need to rebuild the whole source for that).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    if (!map.getSource(MOMENTUM_AREA_SOURCE_ID)) return;

    const areas = momentumAreas ?? [];

    (map.getSource(MOMENTUM_AREA_SOURCE_ID) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: areas.map((area) => ({
        type: "Feature" as const,
        properties: { id: area.id, momentum: area.momentum_state },
        geometry: area.geom,
      })),
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

  // Fly to and highlight the selected Momentum Area.
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

  function handleBackgroundClick() {
    onSelectShift(null);
    onSelectMomentumArea?.(null);
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm text-white/40">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  // Legend: one dot per category actually present in the current shift
  // list (not every possible category), plus a Momentum Area swatch when
  // that layer is showing -- relies on the parent always wrapping this
  // component in a `relative` container (every call site does, for the
  // detail-panel overlays).
  const presentCategories = Array.from(new Set(shifts.map((s) => s.category)));

  return (
    <>
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className="roq-dev-map h-full w-full overflow-hidden rounded-xl"
      />
      {(presentCategories.length > 0 || (momentumAreas && momentumAreas.length > 0)) && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          {presentCategories.map((category) => (
            <span key={category} className="flex items-center gap-1.5 text-[11px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SHIFT_CATEGORY_COLOR[category] }} />
              {SHIFT_CATEGORY_LABEL[category]}
            </span>
          ))}
          {momentumAreas && momentumAreas.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: POTENTIAL_COLOR }} />
              Momentum area
            </span>
          )}
        </div>
      )}
    </>
  );
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
