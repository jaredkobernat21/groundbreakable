// First non-PDF collector in the repo -- imports real parcel geometry for
// Lawrence from Douglas County, Kansas's public GIS server (gis.dgcoks.gov,
// no API key, no cost). See docs/DATA_INTELLIGENCE_PIPELINE.md sections 3/4/6.
//
// Two real gotchas found while building this, worth keeping in mind for the
// next market's parcel import:
//   1. apps.douglas.co.us is Douglas County, COLORADO -- a different county
//      entirely. The correct Kansas server is gis.dgcoks.gov.
//   2. Tax_Parcel's `city` field is the OWNER'S MAILING city, not the
//      parcel's physical location (a Lecompton Township parcel can have an
//      owner with a Lawrence mailing address). Filtering on it would both
//      pull in county land and miss real in-city parcels. The correct scope
//      is the real incorporated-city-limit polygon
//      (AdministrativeAreas/MapServer/3, CORPORATE='Lawrence') -- fetch its
//      envelope for the bbox query, then point-in-polygon test each
//      parcel's centroid against the real boundary, since Tax_Parcel itself
//      has no jurisdiction field to filter on server-side.
//
// PARCELNUMBER is not globally unique (two different parcels in different
// tax units can both be "02.00") -- PID is the real unique county parcel
// identifier and is what we store as parcels.parcel_number.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchAllArcGISFeatures, type ArcGISFeature } from "./lib/arcgisFeatureServer";
import { pointInPolygon, polygonCentroid } from "../src/lib/geo";

const MARKET_SLUG = "lawrence-ks";
const GIS_BASE = "https://gis.dgcoks.gov/server/rest/services";
const CITY_LIMITS_URL = `${GIS_BASE}/AdministrativeAreas/MapServer/3/query`;
const TAX_PARCEL_URL = `${GIS_BASE}/Tax_Parcel/FeatureServer/0/query`;
const SOURCE_AGENCY = "Douglas County KS GIS (Tax_Parcel layer)";
const SOURCE_URL = `${GIS_BASE}/Tax_Parcel/FeatureServer/0`;

type ParcelAttrs = {
  PID: string;
  owner1: string | null;
  owner2: string | null;
  owner3: string | null;
  address: string | null;
  situs: string | null;
  SYSCALACRES: number | null;
};

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run collect:lawrence-parcels\` from dashboard/ so .env.local loads.`);
  return value;
}

async function fetchLawrenceCityLimit(): Promise<{ geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon; bboxEnvelope: string }> {
  const params = new URLSearchParams({ where: "CORPORATE='Lawrence'", outFields: "CORPORATE", outSR: "4326", f: "geojson" });
  const res = await fetch(`${CITY_LIMITS_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch Lawrence city limit: ${res.status}`);
  const body = (await res.json()) as { features: ArcGISFeature[] };
  const geometry = body.features[0]?.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon | undefined;
  if (!geometry) throw new Error("Lawrence city limit polygon not found in AdministrativeAreas layer 3");

  const rings = geometry.type === "Polygon" ? [geometry.coordinates[0]] : geometry.coordinates.map((poly) => poly[0]);
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  }
  return { geometry, bboxEnvelope: `${minLng},${minLat},${maxLng},${maxLat}` };
}

function ownerName(attrs: ParcelAttrs): string | null {
  return [attrs.owner1, attrs.owner2, attrs.owner3].filter(Boolean).join("; ") || null;
}

async function ensureSource(supabase: SupabaseClient): Promise<string> {
  const { data: existing } = await supabase.from("sources").select("id").eq("url", SOURCE_URL).limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: inserted, error } = await supabase
    .from("sources")
    .insert({ agency: SOURCE_AGENCY, source_type: "agency_gis", url: SOURCE_URL, title: "Douglas County Tax Parcel GIS layer" })
    .select("id")
    .single();
  if (error || !inserted) throw new Error(`Failed to create source row: ${error?.message}`);
  return inserted.id;
}

async function main() {
  const supabaseUrl = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: market, error: marketError } = await supabase.from("markets").select("id").eq("slug", MARKET_SLUG).single();
  if (marketError || !market) throw new Error(`Market ${MARKET_SLUG} not found: ${marketError?.message}`);
  const marketId = market.id as string;

  console.log("Fetching Lawrence incorporated city limit boundary...");
  const { geometry: cityLimit, bboxEnvelope } = await fetchLawrenceCityLimit();

  console.log(`Fetching parcels within bbox ${bboxEnvelope} (this pages through ~2000 features per request)...`);
  const features = await fetchAllArcGISFeatures<ParcelAttrs>(TAX_PARCEL_URL, {
    outFields: "PID,owner1,owner2,owner3,address,situs,SYSCALACRES",
    geometry: bboxEnvelope,
    geometryType: "esriGeometryEnvelope",
    outSR: 4326,
  });
  console.log(`Fetched ${features.length} candidate parcels from the bbox; filtering to true city-limit boundary...`);

  const inCity = features.filter((f) => {
    if (!f.geometry || (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon")) return false;
    const centroid = polygonCentroid(f.geometry);
    return pointInPolygon(centroid, cityLimit);
  });
  console.log(`${inCity.length} of ${features.length} fall inside Lawrence's actual city limits.`);

  const sourceId = await ensureSource(supabase);

  console.log("Loading existing parcel_numbers for this market to avoid duplicating on re-run...");
  const existingNumbers = new Set<string>();
  {
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from("parcels").select("parcel_number").eq("market_id", marketId).range(offset, offset + pageSize - 1);
      if (error) throw new Error(`Failed to load existing parcels: ${error.message}`);
      for (const row of data ?? []) if (row.parcel_number) existingNumbers.add(row.parcel_number);
      if (!data || data.length < pageSize) break;
    }
  }
  console.log(`${existingNumbers.size} parcels already on file for this market.`);

  const toInsert = inCity
    .filter((f) => !existingNumbers.has(f.properties.PID))
    .map((f) => ({
      market_id: marketId,
      parcel_number: f.properties.PID,
      address: f.properties.situs || f.properties.address || null,
      owner_name: ownerName(f.properties),
      acreage: f.properties.SYSCALACRES ?? null,
      boundary: f.geometry,
      source_id: sourceId,
    }));

  console.log(`Inserting ${toInsert.length} new parcels (skipping ${inCity.length - toInsert.length} already on file)...`);
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error } = await supabase.from("parcels").insert(batch);
    if (error) {
      console.error(`  ! batch starting at ${i} failed: ${error.message}`);
      continue;
    }
    inserted += batch.length;
    console.log(`  ${inserted}/${toInsert.length} inserted...`);
  }

  console.log(`Done. Inserted ${inserted} new parcels for Lawrence (market ${marketId}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
