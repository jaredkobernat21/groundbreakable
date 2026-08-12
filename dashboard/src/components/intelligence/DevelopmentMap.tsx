"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import {
  ACTIVITY_PHASE_COLOR,
  CATALYST_TYPE_LABEL,
  OPPORTUNITY_TYPE_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  CATALYST_STATUS_LABEL,
  CATALYSTS_COLOR,
  OPPORTUNITIES_COLOR,
  type CatalystWithSource,
  type Market,
  type OpportunityWithSource,
  type Parcel,
  type ProjectWithSource,
} from "@/lib/types";
import { resolveActivityPhase } from "@/lib/activityPhase";
import {
  bulbMarkerSvgMarkup,
  catalystMarkerSvgMarkup,
  pinMarkerSvgMarkup,
  resolveProjectIcon,
} from "@/lib/markerIcons";
import { formatCurrency } from "@/lib/format";
import { circlePolygon } from "@/lib/geo";

const PARCELS_SOURCE_ID = "roq-parcels";
const CATALYST_RADIUS_SOURCE_ID = "roq-catalyst-radius";
const DEFAULT_PARCEL_COLOR = "#94a3b8"; // neutral gray -- context/inactive, not tied to a category

export default function DevelopmentMap({
  market,
  showActivity,
  showOpportunities,
  projects,
  parcels,
  opportunities,
  catalysts,
  showCatalysts,
  selectedProjectId,
  onSelectProject,
  selectedOpportunityId,
  onSelectOpportunity,
  selectedCatalystId,
  onSelectCatalyst,
}: {
  market: Market;
  showActivity: boolean;
  showOpportunities: boolean;
  projects: ProjectWithSource[];
  parcels: Parcel[];
  opportunities: OpportunityWithSource[];
  catalysts: CatalystWithSource[];
  showCatalysts: boolean;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  selectedOpportunityId: string | null;
  onSelectOpportunity: (id: string | null) => void;
  selectedCatalystId: string | null;
  onSelectCatalyst: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const readyRef = useRef(false);
  const selectedParcelIdRef = useRef<string | null>(null);

  // Init map once.
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
        pitch: 45,
        bearing: -16,
        antialias: true,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;
        readyRef.current = true;

        muteBasemapLayers(map);

        map.addSource(PARCELS_SOURCE_ID, {
          type: "geojson",
          promoteId: "id",
          data: { type: "FeatureCollection", features: [] },
        });

        // Quiet by default (thin outline, no fill, no glow); selection is
        // driven entirely by feature-state so nothing needs re-rendering
        // when the user clicks a signal -- see the selection effect below.
        map.addLayer({
          id: `${PARCELS_SOURCE_ID}-glow`,
          type: "line",
          source: PARCELS_SOURCE_ID,
          paint: {
            "line-color": ["get", "color"],
            "line-width": 3,
            "line-blur": 2,
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.2, 0],
          },
        });
        map.addLayer({
          id: `${PARCELS_SOURCE_ID}-line`,
          type: "line",
          source: PARCELS_SOURCE_ID,
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2, 1],
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.95, 0.4],
          },
        });
        map.addLayer({
          id: `${PARCELS_SOURCE_ID}-fill`,
          type: "fill",
          source: PARCELS_SOURCE_ID,
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.22, 0],
          },
        });

        // Catalyst influence-radius zone -- empty until a catalyst is
        // selected (see the selection effect). Only one catalyst can show
        // its radius at a time, so setData with either one circle or an
        // empty collection is simpler than feature-state here.
        map.addSource(CATALYST_RADIUS_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${CATALYST_RADIUS_SOURCE_ID}-fill`,
          type: "fill",
          source: CATALYST_RADIUS_SOURCE_ID,
          paint: { "fill-color": CATALYSTS_COLOR, "fill-opacity": 0.08 },
        });
        map.addLayer({
          id: `${CATALYST_RADIUS_SOURCE_ID}-line`,
          type: "line",
          source: CATALYST_RADIUS_SOURCE_ID,
          paint: { "line-color": CATALYSTS_COLOR, "line-width": 1.5, "line-opacity": 0.45 },
        });

        renderMarkers();
        renderParcels();
      });
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
      selectedParcelIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id]);

  function handleBackgroundClick() {
    onSelectProject(null);
    onSelectOpportunity(null);
    onSelectCatalyst(null);
  }

  function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    import("mapbox-gl").then((mapboxgl) => {
      // Activity and Opportunities are independent toggles, not exclusive
      // tabs -- both can render simultaneously so "one view shows the
      // whole map" is a reachable default.
      if (showActivity) {
        projects.forEach((project) => {
          const phase = resolveActivityPhase(project.status, project.date_updated);
          if (!phase) return; // on_hold/cancelled/stale-completed -- shouldn't reach here if pre-filtered, but stay defensive
          const color = ACTIVITY_PHASE_COLOR[phase];

          const el = document.createElement("div");
          el.className = "roq-marker";

          const metric =
            formatCurrency(project.project_value) ??
            (project.units != null ? `${project.units.toLocaleString()} units` : null);
          const icon = resolveProjectIcon(project.category, project.status);

          el.innerHTML = `
            <div class="roq-marker-card">
              <span class="roq-marker-card-title">${escapeHtml(project.title)}</span>
              <span class="roq-marker-card-sub">${escapeHtml(PROJECT_CATEGORY_LABEL[project.category])} · ${escapeHtml(PROJECT_STATUS_LABEL[project.status])}</span>
              ${metric ? `<span class="roq-marker-card-metric" style="color:${color}">${escapeHtml(metric)}</span>` : ""}
            </div>
            <div class="roq-marker-line" style="background:${color}"></div>
            <div class="roq-marker-pin">${pinMarkerSvgMarkup(icon, { fill: color })}</div>
          `;
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            onSelectProject(project.id);
          });

          const marker = new mapboxgl.default.Marker({ element: el, anchor: "bottom" })
            .setLngLat([project.longitude, project.latitude])
            .addTo(map);
          markersRef.current.set(project.id, marker);
          el.style.opacity = !selectedProjectId || project.id === selectedProjectId ? "1" : "0.35";
          el.classList.toggle("is-selected", project.id === selectedProjectId);
        });

        if (showCatalysts) {
          catalysts.forEach((catalyst) => {
            const el = document.createElement("div");
            el.className = "roq-marker roq-marker-catalyst";

            const metric = formatCurrency(catalyst.estimated_value);

            el.innerHTML = `
              <div class="roq-marker-card">
                <span class="roq-marker-card-title">${escapeHtml(catalyst.title)}</span>
                <span class="roq-marker-card-sub">${escapeHtml(CATALYST_TYPE_LABEL[catalyst.catalyst_type])} · ${escapeHtml(CATALYST_STATUS_LABEL[catalyst.status])}</span>
                ${metric ? `<span class="roq-marker-card-metric" style="color:${CATALYSTS_COLOR}">${escapeHtml(metric)}</span>` : ""}
              </div>
              <div class="roq-marker-line" style="background:${CATALYSTS_COLOR}"></div>
              <div class="roq-marker-pin">${catalystMarkerSvgMarkup({ fill: CATALYSTS_COLOR })}</div>
            `;
            el.addEventListener("click", (event) => {
              event.stopPropagation();
              onSelectCatalyst(catalyst.id);
            });

            // Circle marker has no natural "tip" -- anchor at its center.
            const marker = new mapboxgl.default.Marker({ element: el, anchor: "center" })
              .setLngLat([catalyst.longitude, catalyst.latitude])
              .addTo(map);
            markersRef.current.set(catalyst.id, marker);
            el.style.opacity = !selectedCatalystId || catalyst.id === selectedCatalystId ? "1" : "0.35";
            el.classList.toggle("is-selected", catalyst.id === selectedCatalystId);
          });
        }
      }

      if (showOpportunities) {
        opportunities.forEach((opp) => {
          const el = document.createElement("div");
          el.className = "roq-marker roq-marker-opportunity";

          const metric = formatCurrency(opp.estimated_equity) ?? formatCurrency(opp.assessed_value);

          el.innerHTML = `
            <div class="roq-marker-card">
              <span class="roq-marker-card-title">${escapeHtml(opp.address)}</span>
              <span class="roq-marker-card-sub">${escapeHtml(OPPORTUNITY_TYPE_LABEL[opp.opportunity_type])}${opp.listing_status ? " · " + escapeHtml(opp.listing_status) : ""}</span>
              ${metric ? `<span class="roq-marker-card-metric" style="color:${OPPORTUNITIES_COLOR}">${escapeHtml(metric)}</span>` : ""}
            </div>
            <div class="roq-marker-line" style="background:${OPPORTUNITIES_COLOR}"></div>
            <div class="roq-marker-pin">${bulbMarkerSvgMarkup({ fill: OPPORTUNITIES_COLOR })}</div>
          `;
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            onSelectOpportunity(opp.id);
          });

          const marker = new mapboxgl.default.Marker({ element: el, anchor: "bottom" })
            .setLngLat([opp.longitude, opp.latitude])
            .addTo(map);
          markersRef.current.set(opp.id, marker);
          el.style.opacity = !selectedOpportunityId || opp.id === selectedOpportunityId ? "1" : "0.35";
          el.classList.toggle("is-selected", opp.id === selectedOpportunityId);
        });
      }
    });
  }

  function renderParcels() {
    const map = mapRef.current;
    if (!map || !map.getSource(PARCELS_SOURCE_ID)) return;

    // Parcels are Activity-scoped context -- keep Opportunities quiet.
    if (!showActivity) {
      (map.getSource(PARCELS_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const projectColorByParcel = new Map(
      projects
        .filter((p) => p.parcel_id)
        .map((p) => {
          const phase = resolveActivityPhase(p.status, p.date_updated);
          return [p.parcel_id as string, phase ? ACTIVITY_PHASE_COLOR[phase] : DEFAULT_PARCEL_COLOR];
        })
    );

    const features = parcels
      .filter((parcel) => parcel.boundary)
      .map((parcel) => ({
        type: "Feature" as const,
        geometry: parcel.boundary!,
        properties: { id: parcel.id, color: projectColorByParcel.get(parcel.id) ?? DEFAULT_PARCEL_COLOR },
      }));

    (map.getSource(PARCELS_SOURCE_ID) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features,
    });
  }

  // Re-render markers/parcels when the data, view, or catalyst toggle changes.
  useEffect(() => {
    if (!readyRef.current) return;
    renderMarkers();
    renderParcels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showActivity, showOpportunities, showCatalysts, projects, parcels, opportunities, catalysts]);

  // Selection: fly the camera in, fade the unrelated markers in that
  // signal's own collection, and (Activity/project) highlight the selected
  // parcel via feature-state, or (Catalyst) draw the influence-radius zone.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    markersRef.current.forEach((marker, id) => {
      const isProjectMarker = projects.some((p) => p.id === id);
      const isCatalystMarker = catalysts.some((c) => c.id === id);
      const relevantSelectedId = isProjectMarker
        ? selectedProjectId
        : isCatalystMarker
          ? selectedCatalystId
          : selectedOpportunityId;
      marker.getElement().style.opacity = !relevantSelectedId || id === relevantSelectedId ? "1" : "0.35";
      marker.getElement().classList.toggle("is-selected", id === relevantSelectedId);
    });

    if (selectedParcelIdRef.current !== null) {
      map.setFeatureState({ source: PARCELS_SOURCE_ID, id: selectedParcelIdRef.current }, { selected: false });
      selectedParcelIdRef.current = null;
    }
    if (map.getSource(CATALYST_RADIUS_SOURCE_ID)) {
      (map.getSource(CATALYST_RADIUS_SOURCE_ID) as GeoJSONSource).setData({
        type: "FeatureCollection",
        features: [],
      });
    }

    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) {
        map.flyTo({
          center: [project.longitude, project.latitude],
          zoom: Math.max(map.getZoom(), 15.5),
          pitch: 55,
          duration: 1200,
          essential: true,
        });
        if (project.parcel_id) {
          map.setFeatureState({ source: PARCELS_SOURCE_ID, id: project.parcel_id }, { selected: true });
          selectedParcelIdRef.current = project.parcel_id;
        }
      }
    } else if (selectedOpportunityId) {
      const opp = opportunities.find((o) => o.id === selectedOpportunityId);
      if (opp) {
        map.flyTo({
          center: [opp.longitude, opp.latitude],
          zoom: Math.max(map.getZoom(), 15.5),
          pitch: 55,
          duration: 1200,
          essential: true,
        });
      }
    } else if (selectedCatalystId) {
      const catalyst = catalysts.find((c) => c.id === selectedCatalystId);
      if (catalyst) {
        map.flyTo({
          center: [catalyst.longitude, catalyst.latitude],
          zoom: Math.max(map.getZoom(), 14),
          pitch: 50,
          duration: 1200,
          essential: true,
        });
        if (map.getSource(CATALYST_RADIUS_SOURCE_ID)) {
          (map.getSource(CATALYST_RADIUS_SOURCE_ID) as GeoJSONSource).setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: circlePolygon(catalyst.longitude, catalyst.latitude, catalyst.influence_radius_meters),
              },
            ],
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, selectedOpportunityId, selectedCatalystId, projects, opportunities, catalysts]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-white/40">
        Set NEXT_PUBLIC_MAPBOX_TOKEN to render the map
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleBackgroundClick}
      className="roq-dev-map h-full min-h-[520px] overflow-hidden rounded-xl border border-white/10"
    />
  );
}

// Tones down a handful of dark-v11's default layers so roads/buildings read
// as quiet gray context rather than competing with signal markers -- per
// the spec's "most of the map should remain visually quiet" direction.
// Defensive about layer ids: dark-v11's internal layer list can shift
// between style versions, so every call no-ops rather than throws if a
// given id or paint property isn't present in the loaded style.
function muteBasemapLayers(map: MapboxMap) {
  const mute = (id: string, prop: string, value: string | number) => {
    if (!map.getLayer(id)) return;
    try {
      map.setPaintProperty(id, prop as never, value as never);
    } catch {
      // property not supported on this layer type in this style version
    }
  };

  ["road-primary", "road-secondary-tertiary", "road-street", "road-motorway-trunk"].forEach((id) => {
    mute(id, "line-color", "#3a3f4a");
    mute(id, "line-opacity", 0.5);
  });
  mute("building", "fill-color", "#20242c");
  mute("building", "fill-opacity", 0.5);
  mute("road-label", "text-opacity", 0.45);
  mute("poi-label", "text-opacity", 0.25);
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
