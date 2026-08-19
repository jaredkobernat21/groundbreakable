"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";
import {
  ACTIVITY_PHASE_COLOR,
  OPPORTUNITY_TYPE_LABEL,
  PLAN_CATEGORY_LABEL,
  PROJECT_STAGE_LABEL,
  CATALYSTS_COLOR,
  OPPORTUNITIES_COLOR,
  POTENTIAL_COLOR,
  isStackedOpportunity,
  type CatalystWithSource,
  type GrowthArea,
  type Market,
  type OpportunityWithSource,
  type OpportunityZoneWithSource,
  type Parcel,
  type PotentialSiteWithSource,
  type ProjectWithSource,
} from "@/lib/types";
import { resolveActivityPhase } from "@/lib/activityPhase";
import { bulbMarkerSvgMarkup, pinMarkerSvgMarkup, resolveOpportunityIcon, resolveProjectPhaseIcon } from "@/lib/markerIcons";
import { formatCurrency } from "@/lib/format";
import { circlePolygon, polygonCentroid, ONE_MILE_METERS } from "@/lib/geo";

const PARCELS_SOURCE_ID = "roq-parcels";
const CATALYST_AREA_SOURCE_ID = "roq-catalyst-areas";
const CATALYST_LABEL_SOURCE_ID = "roq-catalyst-labels";
const OPPORTUNITY_ZONES_SOURCE_ID = "roq-opportunity-zones";
const OPPORTUNITY_ZONE_LABEL_SOURCE_ID = "roq-opportunity-zone-labels";
const GROWTH_AREAS_SOURCE_ID = "roq-growth-areas";
const GROWTH_AREA_LABEL_SOURCE_ID = "roq-growth-area-labels";
const SELECTION_RADIUS_SOURCE_ID = "roq-selection-radius";
const DEFAULT_PARCEL_COLOR = "#94a3b8"; // neutral gray -- context/inactive, not tied to a category

// Potential Sites are parcel-level detail -- per the architecture review's
// §12 progressive-disclosure direction, they only reveal once zoomed in
// close enough to make sense as individual points; Growth Areas (regions)
// stay visible at every zoom. ~13.5 is roughly "city block" zoom in Mapbox.
const POTENTIAL_SITE_MIN_ZOOM = 13.5;

export default function DevelopmentMap({
  market,
  showPlans,
  showOpportunities,
  showPotential,
  projects,
  parcels,
  opportunities,
  catalysts,
  opportunityZones,
  growthAreas,
  potentialSites,
  nearbyOpportunityIds,
  selectedProjectId,
  onSelectProject,
  selectedOpportunityId,
  onSelectOpportunity,
  selectedCatalystId,
  onSelectCatalyst,
  selectedOpportunityZoneId,
  onSelectOpportunityZone,
  selectedGrowthAreaId,
  onSelectGrowthArea,
  selectedPotentialSiteId,
  onSelectPotentialSite,
}: {
  market: Market;
  showPlans: boolean;
  showOpportunities: boolean;
  showPotential: boolean;
  projects: ProjectWithSource[];
  parcels: Parcel[];
  opportunities: OpportunityWithSource[];
  catalysts: CatalystWithSource[];
  opportunityZones: OpportunityZoneWithSource[];
  growthAreas: GrowthArea[];
  potentialSites: PotentialSiteWithSource[];
  // Opportunities within 1 mile of the currently-selected project -- these
  // render even when showOpportunities is off (e.g. the Plans-only
  // segment), so the radius-reveal "pop up nearby opportunities" behavior
  // works regardless of which segment the user is on. See
  // DevelopmentIntelligenceView for the computation.
  nearbyOpportunityIds: Set<string>;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  selectedOpportunityId: string | null;
  onSelectOpportunity: (id: string | null) => void;
  selectedCatalystId: string | null;
  onSelectCatalyst: (id: string | null) => void;
  selectedOpportunityZoneId: string | null;
  onSelectOpportunityZone: (id: string | null) => void;
  selectedGrowthAreaId: string | null;
  onSelectGrowthArea: (id: string | null) => void;
  selectedPotentialSiteId: string | null;
  onSelectPotentialSite: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const potentialSiteMarkersRef = useRef<Map<string, Marker>>(new Map());
  const readyRef = useRef(false);
  // Mirrors readyRef as real state so the marker/layer-render effect below
  // (keyed on `ready`) reliably re-fires once the map finishes loading --
  // without it, a segment change that lands during the async map-load
  // window gets silently dropped: the "load" handler is a native listener
  // registered once on mount, so calling render functions directly from it
  // closes over that mount render's stale showPlans/showOpportunities/
  // showPotential instead of whatever the user last selected.
  const [ready, setReady] = useState(false);
  const selectedParcelIdRef = useRef<string | null>(null);
  const selectedAreaFeatureRef = useRef<{ source: string; id: string } | null>(null);
  const radiusAnimTokenRef = useRef(0);
  // The map's "load"/'zoom' handlers are native Mapbox listeners registered
  // once on mount -- they close over whichever render's showPotential/
  // potentialSites happened to be current at that moment, which goes stale
  // the instant either prop changes. The zoom listener below only ever
  // flips this boolean (comparing against a ref, so it doesn't fire on
  // every zoom tick) and lets a normal React effect -- always running with
  // this render's fresh props -- do the actual marker rendering.
  const zoomGateOpenRef = useRef(false);
  const [potentialSiteZoomGateOpen, setPotentialSiteZoomGateOpen] = useState(false);

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
        setReady(true);

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

        // Catalysts: an always-on white "watch zone" area, not a Marker --
        // per the product direction, this is the radius where the most
        // planning activity is concentrated, visible regardless of segment
        // (Plans or Opportunities). promoteId lets feature-state
        // selection work with UUID string ids, same pattern as parcels.
        map.addSource(CATALYST_AREA_SOURCE_ID, {
          type: "geojson",
          promoteId: "id",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-fill`,
          type: "fill",
          source: CATALYST_AREA_SOURCE_ID,
          paint: {
            "fill-color": CATALYSTS_COLOR,
            "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.16, 0.06],
          },
        });
        map.addLayer({
          id: `${CATALYST_AREA_SOURCE_ID}-line`,
          type: "line",
          source: CATALYST_AREA_SOURCE_ID,
          paint: {
            "line-color": CATALYSTS_COLOR,
            "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2, 1],
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.9, 0.5],
            "line-dasharray": [2, 2],
          },
        });

        // Removing the point pin also removed its hover tooltip, so a
        // permanent (not hover-only) small label replaces it -- otherwise
        // there'd be no way to tell one watch zone from another at a
        // glance.
        map.addSource(CATALYST_LABEL_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${CATALYST_LABEL_SOURCE_ID}-symbol`,
          type: "symbol",
          source: CATALYST_LABEL_SOURCE_ID,
          layout: {
            "text-field": ["get", "title"],
            "text-size": 11,
            "text-anchor": "top",
            "text-offset": [0, 0.4],
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": CATALYSTS_COLOR,
            "text-opacity": 0.75,
            "text-halo-color": "rgba(0,0,0,0.65)",
            "text-halo-width": 1.2,
          },
        });

        // Opportunity zones: green-outlined favorable-zoning areas -- a
        // second Opportunities geometry alongside the point bulbs. Same
        // shape as the catalyst layer above, scoped to the Opportunities
        // segment (see renderAreaLayers).
        map.addSource(OPPORTUNITY_ZONES_SOURCE_ID, {
          type: "geojson",
          promoteId: "id",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${OPPORTUNITY_ZONES_SOURCE_ID}-fill`,
          type: "fill",
          source: OPPORTUNITY_ZONES_SOURCE_ID,
          paint: {
            "fill-color": OPPORTUNITIES_COLOR,
            "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.2, 0.08],
          },
        });
        map.addLayer({
          id: `${OPPORTUNITY_ZONES_SOURCE_ID}-line`,
          type: "line",
          source: OPPORTUNITY_ZONES_SOURCE_ID,
          paint: {
            "line-color": OPPORTUNITIES_COLOR,
            "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2, 1.2],
            "line-opacity": 0.8,
          },
        });
        map.addSource(OPPORTUNITY_ZONE_LABEL_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${OPPORTUNITY_ZONE_LABEL_SOURCE_ID}-symbol`,
          type: "symbol",
          source: OPPORTUNITY_ZONE_LABEL_SOURCE_ID,
          layout: {
            "text-field": ["get", "title"],
            "text-size": 11,
            "text-anchor": "top",
            "text-offset": [0, 0.4],
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": OPPORTUNITIES_COLOR,
            "text-opacity": 0.85,
            "text-halo-color": "rgba(0,0,0,0.65)",
            "text-halo-width": 1.2,
          },
        });

        // Growth Areas: translucent Potential regions, always visible at
        // every zoom while the Potential segment is active (Potential
        // Sites are the layer that's zoom-gated, not this one -- see the
        // 'zoom' listener below). Same source/fill/line/label shape as
        // catalyst watch-zones and opportunity zones above.
        map.addSource(GROWTH_AREAS_SOURCE_ID, {
          type: "geojson",
          promoteId: "id",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${GROWTH_AREAS_SOURCE_ID}-fill`,
          type: "fill",
          source: GROWTH_AREAS_SOURCE_ID,
          paint: {
            "fill-color": POTENTIAL_COLOR,
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              0.22,
              ["match", ["get", "momentum"], "established", 0.14, "accelerating", 0.1, 0.06],
            ],
          },
        });
        map.addLayer({
          id: `${GROWTH_AREAS_SOURCE_ID}-line`,
          type: "line",
          source: GROWTH_AREAS_SOURCE_ID,
          paint: {
            "line-color": POTENTIAL_COLOR,
            "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2, 1],
            "line-opacity": 0.7,
          },
        });
        map.addSource(GROWTH_AREA_LABEL_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${GROWTH_AREA_LABEL_SOURCE_ID}-symbol`,
          type: "symbol",
          source: GROWTH_AREA_LABEL_SOURCE_ID,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-anchor": "center",
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": POTENTIAL_COLOR,
            "text-opacity": 0.85,
            "text-halo-color": "rgba(0,0,0,0.65)",
            "text-halo-width": 1.2,
          },
        });

        // Selection radius: the 1-mile "premium reveal" ring drawn around
        // a clicked project pin (see animateRadiusReveal). Empty until a
        // project is selected. Opacity transitions give the reveal a soft
        // fade rather than a hard snap on top of the animated geometry.
        map.addSource(SELECTION_RADIUS_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: `${SELECTION_RADIUS_SOURCE_ID}-fill`,
          type: "fill",
          source: SELECTION_RADIUS_SOURCE_ID,
          paint: {
            "fill-color": "#ffffff",
            "fill-opacity": 0.06,
            "fill-opacity-transition": { duration: 300 },
          },
        });
        map.addLayer({
          id: `${SELECTION_RADIUS_SOURCE_ID}-line`,
          type: "line",
          source: SELECTION_RADIUS_SOURCE_ID,
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-opacity": 0.55,
            "line-opacity-transition": { duration: 300 },
            "line-dasharray": [1, 2],
          },
        });

        map.on("click", `${CATALYST_AREA_SOURCE_ID}-fill`, (e) => {
          e.originalEvent.stopPropagation();
          const id = e.features?.[0]?.properties?.id;
          if (id) onSelectCatalyst(id);
        });
        map.on("mouseenter", `${CATALYST_AREA_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", `${CATALYST_AREA_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", `${OPPORTUNITY_ZONES_SOURCE_ID}-fill`, (e) => {
          e.originalEvent.stopPropagation();
          const id = e.features?.[0]?.properties?.id;
          if (id) onSelectOpportunityZone(id);
        });
        map.on("mouseenter", `${OPPORTUNITY_ZONES_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", `${OPPORTUNITY_ZONES_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", `${GROWTH_AREAS_SOURCE_ID}-fill`, (e) => {
          e.originalEvent.stopPropagation();
          const id = e.features?.[0]?.properties?.id;
          if (id) onSelectGrowthArea(id);
        });
        map.on("mouseenter", `${GROWTH_AREAS_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", `${GROWTH_AREAS_SOURCE_ID}-fill`, () => {
          map.getCanvas().style.cursor = "";
        });

        // Potential Sites are zoom-gated (see POTENTIAL_SITE_MIN_ZOOM).
        // This only flips potentialSiteZoomGateOpen -- and only when
        // crossing the threshold actually changes, not on every zoom tick
        // -- which lets the effect below (always running with this
        // render's fresh showPotential/potentialSites) do the real work.
        // Calling renderPotentialSiteMarkers() directly from here would
        // run it against this closure's props forever, which are only
        // ever correct for the instant this "load" handler first fired.
        map.on("zoom", () => {
          const shouldOpen = map.getZoom() >= POTENTIAL_SITE_MIN_ZOOM;
          if (shouldOpen !== zoomGateOpenRef.current) {
            zoomGateOpenRef.current = shouldOpen;
            setPotentialSiteZoomGateOpen(shouldOpen);
          }
        });

        zoomGateOpenRef.current = map.getZoom() >= POTENTIAL_SITE_MIN_ZOOM;
        setPotentialSiteZoomGateOpen(zoomGateOpenRef.current);

        // Initial marker/layer render is left to the `ready`-keyed effect
        // below rather than called directly here -- that effect always
        // runs with the current render's props, while this handler is a
        // native listener locked to whatever closure existed at mount.
      });
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      potentialSiteMarkersRef.current.forEach((marker) => marker.remove());
      potentialSiteMarkersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
      setReady(false);
      selectedParcelIdRef.current = null;
      selectedAreaFeatureRef.current = null;
      zoomGateOpenRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id]);

  function handleBackgroundClick() {
    onSelectProject(null);
    onSelectOpportunity(null);
    onSelectCatalyst(null);
    onSelectOpportunityZone(null);
    onSelectGrowthArea(null);
    onSelectPotentialSite(null);
  }

  function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    import("mapbox-gl").then((mapboxgl) => {
      // Plans and Opportunities are independent toggles, not exclusive
      // tabs -- both can render simultaneously so "one view shows the
      // whole map" is a reachable default.
      if (showPlans) {
        projects.forEach((project) => {
          const phase = resolveActivityPhase(project.stage, project.date_updated);
          if (!phase) return; // on_hold/cancelled/stale-completed -- shouldn't reach here if pre-filtered, but stay defensive
          const color = ACTIVITY_PHASE_COLOR[phase];

          const el = document.createElement("div");
          el.className = "roq-marker";

          const metric =
            formatCurrency(project.project_value) ??
            (project.units != null ? `${project.units.toLocaleString()} units` : null);
          const icon = resolveProjectPhaseIcon(phase);

          el.innerHTML = `
            <div class="roq-marker-card">
              <span class="roq-marker-card-title">${escapeHtml(project.title)}</span>
              <span class="roq-marker-card-sub">${escapeHtml(
                [
                  project.plan_category ? PLAN_CATEGORY_LABEL[project.plan_category] : null,
                  project.stage ? PROJECT_STAGE_LABEL[project.stage] : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              )}</span>
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
      }

      // Opportunities render whenever the segment is on, PLUS any
      // opportunity within 1 mile of the currently-selected project --
      // that's the "click a property pin, nearby opportunities pop up"
      // reveal, and it works even on the Plans-only segment.
      opportunities.forEach((opp) => {
        const isNearbyForced = nearbyOpportunityIds.has(opp.id);
        if (!showOpportunities && !isNearbyForced) return;

        const el = document.createElement("div");
        const stacked = isStackedOpportunity(opp.signals);
        el.className = `roq-marker roq-marker-opportunity${stacked ? " roq-marker-stacked" : ""}`;

        const metric = formatCurrency(opp.estimated_equity) ?? formatCurrency(opp.assessed_value);
        const signalLabels = opp.signals.map((s) => OPPORTUNITY_TYPE_LABEL[s]).join(" + ");

        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">${escapeHtml(opp.address)}</span>
            <span class="roq-marker-card-sub">${escapeHtml(signalLabels)}${opp.listing_status ? " · " + escapeHtml(opp.listing_status) : ""}</span>
            ${metric ? `<span class="roq-marker-card-metric" style="color:${OPPORTUNITIES_COLOR}">${escapeHtml(metric)}</span>` : ""}
          </div>
          <div class="roq-marker-line" style="background:${OPPORTUNITIES_COLOR}"></div>
          <div class="roq-marker-pin">${bulbMarkerSvgMarkup({ fill: OPPORTUNITIES_COLOR, icon: resolveOpportunityIcon(opp.signals), stacked })}</div>
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
    });
  }

  // Potential Sites: zoom-gated point markers (§12's "reveal parcel-level
  // detail only once zoomed in" direction) -- rebuilt whenever zoom
  // crosses POTENTIAL_SITE_MIN_ZOOM (see the 'zoom' listener) or the
  // segment/data/selection changes. Separate marker map from
  // markersRef so clearing project/opportunity markers on a data refresh
  // never touches these.
  function renderPotentialSiteMarkers() {
    const map = mapRef.current;
    if (!map) return;

    potentialSiteMarkersRef.current.forEach((marker) => marker.remove());
    potentialSiteMarkersRef.current.clear();

    if (!showPotential || map.getZoom() < POTENTIAL_SITE_MIN_ZOOM) return;

    import("mapbox-gl").then((mapboxgl) => {
      potentialSites.forEach((site) => {
        if (site.latitude == null || site.longitude == null) return;

        const el = document.createElement("div");
        el.className = "roq-marker";

        el.innerHTML = `
          <div class="roq-marker-card">
            <span class="roq-marker-card-title">${escapeHtml(site.title)}</span>
            <span class="roq-marker-card-sub">Potential Site</span>
          </div>
          <div class="roq-marker-line" style="background:${POTENTIAL_COLOR}"></div>
          <div class="roq-marker-pin">${pinMarkerSvgMarkup("star", { fill: POTENTIAL_COLOR })}</div>
        `;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectPotentialSite(site.id);
        });

        const marker = new mapboxgl.default.Marker({ element: el, anchor: "bottom" })
          .setLngLat([site.longitude!, site.latitude!])
          .addTo(map);
        potentialSiteMarkersRef.current.set(site.id, marker);
        el.style.opacity = !selectedPotentialSiteId || site.id === selectedPotentialSiteId ? "1" : "0.35";
        el.classList.toggle("is-selected", site.id === selectedPotentialSiteId);
      });
    });
  }

  function renderParcels() {
    const map = mapRef.current;
    if (!map || !map.getSource(PARCELS_SOURCE_ID)) return;

    // Parcels are Plans-scoped context -- keep other segments quiet.
    if (!showPlans) {
      (map.getSource(PARCELS_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const projectColorByParcel = new Map(
      projects
        .filter((p) => p.parcel_id)
        .map((p) => {
          const phase = resolveActivityPhase(p.stage, p.date_updated);
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

  // Catalyst watch zones and opportunity (favorable-zoning) zones -- area
  // layers independent of markers/parcels. Catalysts render on every
  // segment; favorable zoning only when the Potential segment is active
  // -- it's a future-development-capacity signal (zoning), not a
  // property-level distress/acquisition one, so it lives with Growth
  // Areas/Potential Sites rather than the Opportunities signal pins.
  // Same "clear the source when the segment is off" pattern as
  // renderParcels.
  function renderAreaLayers() {
    const map = mapRef.current;
    if (!map) return;

    if (map.getSource(CATALYST_AREA_SOURCE_ID)) {
      const features = catalysts.map((c) => ({
        type: "Feature" as const,
        properties: { id: c.id },
        geometry: c.boundary ?? circlePolygon(c.longitude, c.latitude, c.influence_radius_meters),
      }));
      (map.getSource(CATALYST_AREA_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features });
    }
    if (map.getSource(CATALYST_LABEL_SOURCE_ID)) {
      const features = catalysts.map((c) => ({
        type: "Feature" as const,
        properties: { title: c.title },
        geometry: { type: "Point" as const, coordinates: [c.longitude, c.latitude] },
      }));
      (map.getSource(CATALYST_LABEL_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features });
    }

    if (map.getSource(OPPORTUNITY_ZONES_SOURCE_ID)) {
      const features = showPotential
        ? opportunityZones.map((z) => ({
            type: "Feature" as const,
            properties: { id: z.id },
            geometry: z.boundary,
          }))
        : [];
      (map.getSource(OPPORTUNITY_ZONES_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features });
    }
    if (map.getSource(OPPORTUNITY_ZONE_LABEL_SOURCE_ID)) {
      const features = showPotential
        ? opportunityZones.map((z) => ({
            type: "Feature" as const,
            properties: { title: z.title },
            geometry: { type: "Point" as const, coordinates: [polygonCentroid(z.boundary).lng, polygonCentroid(z.boundary).lat] },
          }))
        : [];
      (map.getSource(OPPORTUNITY_ZONE_LABEL_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features });
    }

    if (map.getSource(GROWTH_AREAS_SOURCE_ID)) {
      const features = showPotential
        ? growthAreas.map((g) => ({
            type: "Feature" as const,
            properties: { id: g.id, momentum: g.momentum_state },
            geometry: g.geom,
          }))
        : [];
      (map.getSource(GROWTH_AREAS_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features });
    }
    if (map.getSource(GROWTH_AREA_LABEL_SOURCE_ID)) {
      const features = showPotential
        ? growthAreas.map((g) => ({
            type: "Feature" as const,
            properties: { name: g.name },
            geometry: { type: "Point" as const, coordinates: [polygonCentroid(g.geom).lng, polygonCentroid(g.geom).lat] },
          }))
        : [];
      (map.getSource(GROWTH_AREA_LABEL_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features });
    }
  }

  // Re-render markers/parcels/areas when the data or view changes -- also
  // keyed on `ready` so a segment change that lands while the map is still
  // loading gets picked up the instant it finishes, instead of being stuck
  // showing whatever was current when the map's "load" event fired.
  useEffect(() => {
    if (!readyRef.current) return;
    renderMarkers();
    renderParcels();
    renderAreaLayers();
    renderPotentialSiteMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    showPlans,
    showOpportunities,
    showPotential,
    projects,
    parcels,
    opportunities,
    catalysts,
    opportunityZones,
    growthAreas,
    potentialSites,
    potentialSiteZoomGateOpen,
    nearbyOpportunityIds,
  ]);

  // Selection: fly the camera in, fade the unrelated markers in that
  // signal's own collection, and highlight the selected parcel/catalyst
  // zone/opportunity zone via feature-state. A selected project additionally
  // triggers the 1-mile radius-reveal animation (see animateRadiusReveal).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    markersRef.current.forEach((marker, id) => {
      const isProjectMarker = projects.some((p) => p.id === id);
      const relevantSelectedId = isProjectMarker ? selectedProjectId : selectedOpportunityId;
      // A nearby-forced opportunity marker (radius reveal) stays at full
      // opacity as long as no other opportunity is explicitly selected.
      const isNearbyForced = !isProjectMarker && nearbyOpportunityIds.has(id) && !selectedOpportunityId;
      marker.getElement().style.opacity =
        !relevantSelectedId || id === relevantSelectedId || isNearbyForced ? "1" : "0.35";
      marker.getElement().classList.toggle("is-selected", id === relevantSelectedId);
    });

    potentialSiteMarkersRef.current.forEach((marker, id) => {
      marker.getElement().style.opacity = !selectedPotentialSiteId || id === selectedPotentialSiteId ? "1" : "0.35";
      marker.getElement().classList.toggle("is-selected", id === selectedPotentialSiteId);
    });

    if (selectedParcelIdRef.current !== null) {
      map.setFeatureState({ source: PARCELS_SOURCE_ID, id: selectedParcelIdRef.current }, { selected: false });
      selectedParcelIdRef.current = null;
    }
    if (selectedAreaFeatureRef.current) {
      map.setFeatureState(selectedAreaFeatureRef.current, { selected: false });
      selectedAreaFeatureRef.current = null;
    }

    // Bumping the token invalidates any in-flight radius-reveal animation
    // frame from a previous selection (see animateRadiusReveal's
    // isCancelled check) without needing to track raw rAF ids.
    radiusAnimTokenRef.current += 1;
    const animToken = radiusAnimTokenRef.current;
    if (map.getSource(SELECTION_RADIUS_SOURCE_ID)) {
      (map.getSource(SELECTION_RADIUS_SOURCE_ID) as GeoJSONSource).setData({ type: "FeatureCollection", features: [] });
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
        animateRadiusReveal(
          map,
          SELECTION_RADIUS_SOURCE_ID,
          project.longitude,
          project.latitude,
          ONE_MILE_METERS,
          () => radiusAnimTokenRef.current !== animToken || !readyRef.current
        );
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
        if (map.getSource(CATALYST_AREA_SOURCE_ID)) {
          map.setFeatureState({ source: CATALYST_AREA_SOURCE_ID, id: catalyst.id }, { selected: true });
          selectedAreaFeatureRef.current = { source: CATALYST_AREA_SOURCE_ID, id: catalyst.id };
        }
      }
    } else if (selectedOpportunityZoneId) {
      const zone = opportunityZones.find((z) => z.id === selectedOpportunityZoneId);
      if (zone) {
        const center = polygonCentroid(zone.boundary);
        map.flyTo({
          center: [center.lng, center.lat],
          zoom: Math.max(map.getZoom(), 14),
          pitch: 50,
          duration: 1200,
          essential: true,
        });
        if (map.getSource(OPPORTUNITY_ZONES_SOURCE_ID)) {
          map.setFeatureState({ source: OPPORTUNITY_ZONES_SOURCE_ID, id: zone.id }, { selected: true });
          selectedAreaFeatureRef.current = { source: OPPORTUNITY_ZONES_SOURCE_ID, id: zone.id };
        }
      }
    } else if (selectedGrowthAreaId) {
      const area = growthAreas.find((g) => g.id === selectedGrowthAreaId);
      if (area) {
        const center = polygonCentroid(area.geom);
        map.flyTo({
          center: [center.lng, center.lat],
          zoom: Math.min(map.getZoom(), 13),
          pitch: 40,
          duration: 1200,
          essential: true,
        });
        if (map.getSource(GROWTH_AREAS_SOURCE_ID)) {
          map.setFeatureState({ source: GROWTH_AREAS_SOURCE_ID, id: area.id }, { selected: true });
          selectedAreaFeatureRef.current = { source: GROWTH_AREAS_SOURCE_ID, id: area.id };
        }
      }
    } else if (selectedPotentialSiteId) {
      const site = potentialSites.find((s) => s.id === selectedPotentialSiteId);
      if (site && site.latitude != null && site.longitude != null) {
        map.flyTo({
          center: [site.longitude, site.latitude],
          zoom: Math.max(map.getZoom(), POTENTIAL_SITE_MIN_ZOOM + 1),
          pitch: 55,
          duration: 1200,
          essential: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProjectId,
    selectedOpportunityId,
    selectedCatalystId,
    selectedOpportunityZoneId,
    selectedGrowthAreaId,
    selectedPotentialSiteId,
    projects,
    opportunities,
    catalysts,
    opportunityZones,
    growthAreas,
    potentialSites,
    nearbyOpportunityIds,
  ]);

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

// Animates a circle's radius from 0 up to targetRadiusMeters with an
// ease-out curve, recomputing the polygon each frame -- the "premium
// reveal" on a project-pin click, rather than an instant snap. isCancelled
// is checked every frame so a new selection (or unmount) can halt an
// in-flight animation without needing to track/cancel raw rAF ids.
function animateRadiusReveal(
  map: MapboxMap,
  sourceId: string,
  lng: number,
  lat: number,
  targetRadiusMeters: number,
  isCancelled: () => boolean,
  durationMs = 700
) {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  if (!source) return;

  const start = performance.now();

  function frame(now: number) {
    if (isCancelled()) return;
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    source!.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: circlePolygon(lng, lat, Math.max(targetRadiusMeters * eased, 1)),
        },
      ],
    });
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
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
