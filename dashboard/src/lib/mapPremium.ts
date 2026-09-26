import type { Map as MapboxMap } from "mapbox-gl";

// Shared "make this map instance feel premium" styling -- applied
// identically on every map surface (Hero/Plans/Opportunity), so it's a
// small shared helper rather than tripled inline config the way marker
// rendering is (marker content genuinely differs per surface; this
// doesn't). Fog reads as atmospheric depth even at the city-level zoom
// this dashboard actually operates at (globe curvature itself would not --
// see Jared's ask, 2026-09-25); 3D building extrusions are real massing
// data already present in Mapbox's composite source, pulled from
// wherever the current style would otherwise draw flat building
// footprints.
export function applyPremiumMapStyling(map: MapboxMap) {
  map.setFog({
    color: "rgb(20, 22, 28)",
    "high-color": "rgb(36, 40, 58)",
    "horizon-blend": 0.03,
    "space-color": "rgb(8, 9, 14)",
    "star-intensity": 0,
  });

  map.addLayer({
    id: "roq-3d-buildings",
    source: "composite",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#2c2f3a",
      "fill-extrusion-height": ["coalesce", ["get", "height"], 5],
      "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
      "fill-extrusion-opacity": 0.75,
    },
  });
}

// A slight tilt makes the building extrusions above actually read as 3D --
// flat-down (pitch 0) would render them with no visible sides at all.
export const PREMIUM_MAP_PITCH = 45;
