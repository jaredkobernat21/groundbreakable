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

// Zoom-adaptive satellite hybrid (Jared, 2026-09-30): "premium, satellite
// type view" without giving up the dark/muted look at the national zoom
// this map actually lives at most of the time -- real aerial imagery looks
// flat and washed-out at that scale (no information advantage over a
// styled vector map) but genuinely premium once zoomed into a specific
// catalyst/parcel. Rather than swapping the whole style (map.setStyle()
// tears down and reloads every layer/source, a visible flash, and would
// need the load handler's setup re-run on every style.load), this layers
// Mapbox's standard satellite raster tileset directly on top of the
// existing dark-v11 style with a zoom-interpolated opacity ramp -- zero at
// national/metro zoom, fading in only past city scale. raster-brightness/
// -contrast/-saturation darken and desaturate the imagery so it reads as
// this product's own moody, institutional tone rather than a bright,
// generic satellite photo. Inserted just below the first road layer so
// roads/labels stay legible on top of it once it's visible.
export function addZoomAdaptiveSatellite(map: MapboxMap) {
  map.addSource("roq-satellite", {
    type: "raster",
    url: "mapbox://mapbox.satellite",
    tileSize: 256,
  });

  const style = map.getStyle();
  const firstRoadLayerId = style?.layers?.find((l) => l.id.startsWith("road-"))?.id;

  map.addLayer(
    {
      id: "roq-satellite-layer",
      type: "raster",
      source: "roq-satellite",
      paint: {
        "raster-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 15, 0.55, 17, 0.9],
        "raster-brightness-max": 0.55,
        "raster-contrast": 0.15,
        "raster-saturation": -0.25,
      },
    },
    firstRoadLayerId
  );
}
