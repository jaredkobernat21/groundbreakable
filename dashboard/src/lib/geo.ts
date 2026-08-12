const EARTH_RADIUS_METERS = 6371000;

export function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
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
