const EARTH_RADIUS_METERS = 6371000;

export const ONE_MILE_METERS = 1609.34;

export function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

// Shared "which of these have a lat/lng within radiusMeters of center"
// filter -- used anywhere a signal type needs a nearby-items lookup
// (Catalyst watch zones, a selected project's opportunities-within-1-mile
// reveal) so there's one implementation of the distance check instead of
// one per component.
export function filterWithinRadius<T>(
  center: { lat: number; lng: number },
  radiusMeters: number,
  items: T[],
  getCoord: (item: T) => { lat: number; lng: number }
): T[] {
  return items.filter((item) => {
    const coord = getCoord(item);
    return haversineDistanceMeters(center.lat, center.lng, coord.lat, coord.lng) <= radiusMeters;
  });
}

// Simple vertex-average centroid for an admin-traced polygon (opportunity
// zones, catalyst boundaries) -- good enough for flyTo targets and label
// placement on hand-drawn parcels; not an area-weighted true centroid.
export function polygonCentroid(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): { lat: number; lng: number } {
  const rings = geometry.type === "Polygon" ? [geometry.coordinates[0]] : geometry.coordinates.map((poly) => poly[0]);
  let sumLng = 0;
  let sumLat = 0;
  let count = 0;
  rings.forEach((ring) => {
    ring.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
      count++;
    });
  });
  return { lat: sumLat / count, lng: sumLng / count };
}

// Standard ray-casting point-in-polygon test, run per ring (outer ring
// only matters for this codebase's admin-traced areas -- none of them
// carry holes) -- used to scope a Growth Area's momentum breakdown to
// just the projects/opportunities/zoning zones that actually fall inside
// it, same "good enough for these hand-traced polygons" spirit as
// polygonCentroid above.
export function pointInPolygon(
  point: { lat: number; lng: number },
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): boolean {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some((rings) => pointInRing(point, rings[0]));
}

function pointInRing(point: { lat: number; lng: number }, ring: GeoJSON.Position[]): boolean {
  const { lng: x, lat: y } = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

// Approximates a circle of `radiusMeters` around [lng, lat] as a GeoJSON
// polygon -- plain trig, no turf/geo dependency needed for a marker-sized
// influence zone.
export function circlePolygon(lng: number, lat: number, radiusMeters: number, points = 64) {
  const latRad = (lat * Math.PI) / 180;
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = (radiusMeters * Math.cos(angle)) / (EARTH_RADIUS_METERS * Math.cos(latRad));
    const dy = (radiusMeters * Math.sin(angle)) / EARTH_RADIUS_METERS;
    coords.push([lng + (dx * 180) / Math.PI, lat + (dy * 180) / Math.PI]);
  }
  return { type: "Polygon" as const, coordinates: [coords] };
}
