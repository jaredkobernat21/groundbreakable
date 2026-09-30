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

// Institutional redesign (Jared, 2026-09-30): "charcoal / graphite /
// near-black background... muted roads and map labels... minimal visual
// clutter." dark-v11 is Mapbox's stock dark style -- fairly saturated
// blue-gray roads and bright white labels by default. There's no custom
// Mapbox Studio style available in this environment, so this mutes the
// known dark-v11 layers via setPaintProperty rather than swapping styles --
// best-effort against Mapbox's current layer set, not guaranteed pixel-
// perfect if Mapbox renames/restructures dark-v11 in a future release.
// Applied only on the national map (NationalCatalystMap.tsx) -- every other
// map surface keeps applyPremiumMapStyling's existing look unchanged.
export function applyInstitutionalMapStyling(map: MapboxMap) {
  map.setFog({
    color: "rgb(14, 15, 17)",
    "high-color": "rgb(22, 24, 28)",
    "horizon-blend": 0.02,
    "space-color": "rgb(6, 6, 8)",
    "star-intensity": 0,
  });

  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    // Roads: dim and desaturate rather than hide -- still legible as
    // geography, just not competing with catalyst markers for attention.
    if (layer.id.startsWith("road-") && layer.type === "line") {
      try {
        map.setPaintProperty(layer.id, "line-opacity", 0.35);
      } catch {
        // Layer doesn't support this paint property -- skip rather than throw.
      }
    }
    // Labels (place names, road shields, POIs): quiet cool-gray instead of
    // near-white, lower opacity so they read as reference, not content.
    if (layer.type === "symbol" && layer.layout?.["text-field"]) {
      try {
        map.setPaintProperty(layer.id, "text-color", "#8B8F98");
        map.setPaintProperty(layer.id, "text-halo-color", "rgba(10,10,12,0.6)");
        map.setPaintProperty(layer.id, "text-opacity", 0.55);
      } catch {
        // Skip layers without text paint properties.
      }
    }
    // Water: darker, quieter than dark-v11's default blue-black.
    if (layer.id === "water" && layer.type === "fill") {
      try {
        map.setPaintProperty(layer.id, "fill-color", "rgb(10, 12, 15)");
      } catch {
        // Skip if unavailable.
      }
    }
  }

  map.addLayer({
    id: "roq-institutional-3d-buildings",
    source: "composite",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#1C1E22",
      "fill-extrusion-height": ["coalesce", ["get", "height"], 5],
      "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
      "fill-extrusion-opacity": 0.7,
    },
  });
}
