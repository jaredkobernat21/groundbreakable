// Generic paginated fetcher for any Esri ArcGIS REST FeatureServer/MapServer
// query endpoint. Per docs/DATA_INTELLIGENCE_PIPELINE.md section 4: prefer
// GIS/FeatureServer sources over PDF parsing wherever a county/city exposes
// one -- this is the one reusable piece that makes that possible for every
// market's parcel/zoning/city-limit layers, not just Lawrence's.

export type ArcGISFeature<A = Record<string, unknown>> = {
  type: "Feature";
  properties: A;
  geometry: GeoJSON.Geometry | null;
};

type QueryOptions = {
  where?: string;
  outFields?: string;
  geometry?: string; // "xmin,ymin,xmax,ymax" for an envelope, or JSON for a polygon
  geometryType?: string;
  inSR?: number;
  spatialRel?: string;
  outSR?: number;
};

// Fetches every feature matching the query, paging via resultOffset until a
// page comes back short of the server's per-request maxRecordCount. Callers
// pass GeoJSON (f=geojson) so geometry arrives WGS84 lon/lat, ready to write
// straight into a jsonb boundary column.
export async function fetchAllArcGISFeatures<A = Record<string, unknown>>(
  queryUrl: string,
  options: QueryOptions,
  pageSize = 2000
): Promise<ArcGISFeature<A>[]> {
  const features: ArcGISFeature<A>[] = [];
  let offset = 0;

  for (;;) {
    const params = new URLSearchParams({
      where: options.where ?? "1=1",
      outFields: options.outFields ?? "*",
      f: "geojson",
      resultRecordCount: String(pageSize),
      resultOffset: String(offset),
    });
    if (options.geometry) {
      params.set("geometry", options.geometry);
      params.set("geometryType", options.geometryType ?? "esriGeometryEnvelope");
      params.set("inSR", String(options.inSR ?? 4326));
      params.set("spatialRel", options.spatialRel ?? "esriSpatialRelIntersects");
    }
    if (options.outSR) params.set("outSR", String(options.outSR));

    const res = await fetch(`${queryUrl}?${params.toString()}`);
    if (!res.ok) throw new Error(`ArcGIS query failed (${res.status}): ${queryUrl}`);
    const body = (await res.json()) as { features?: ArcGISFeature<A>[]; error?: { message: string } };
    if (body.error) throw new Error(`ArcGIS query error: ${body.error.message}`);

    const page = body.features ?? [];
    if (page.length === 0) break;
    features.push(...page);
    // Some ArcGIS servers cut a page short via a response-size transfer
    // limit well before resultRecordCount, independent of how many records
    // actually match -- advancing by the real page length (not pageSize)
    // is required or records between the two get silently skipped.
    offset += page.length;
  }

  return features;
}
