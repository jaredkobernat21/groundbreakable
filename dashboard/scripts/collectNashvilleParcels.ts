// Second GIS-based parcel import (see collectLawrenceParcels.ts for the
// first). Nashville/Davidson County is a consolidated city-county
// government, so unlike Lawrence there's no separate "city limits vs.
// county land" distinction to filter on -- every parcel in the county's
// GIS layer genuinely is within the Nashville market.
//
// Nashville's server (maps.nashville.gov) has a real TLS misconfiguration:
// it serves only its leaf certificate, not the Sectigo intermediate, so
// standard TLS verification fails (`unable to get local issuer
// certificate`). This is a server-side gap, not a security concern with
// the data itself (a public government open-data endpoint) -- the fix is
// supplying the missing intermediate via NODE_EXTRA_CA_CERTS (set in the
// npm script), not disabling verification. The intermediate is saved at
// scripts/lib/certs/sectigo-public-server-authentication-ca-ov-r36.pem
// (fetched from its own AIA "CA Issuers" URL, the same chain-completion
// step a browser does automatically).
//
// This layer is far richer than Douglas County KS's Tax_Parcel layer --
// real appraised land/improvement/total value, zoning, land use, and most
// recent owner-of-record change date/price are all joined directly to the
// parcel record, not a separate assessor system. All captured here.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchAllArcGISFeatures } from "./lib/arcgisFeatureServer";

const MARKET_SLUG = "nashville-tn";
const PARCELS_QUERY_URL = "https://maps.nashville.gov/arcgis/rest/services/Cadastral/Parcels/MapServer/0/query";
const SOURCE_AGENCY = "Metro Nashville GIS (Cadastral/Parcels layer)";
const SOURCE_URL = "https://maps.nashville.gov/arcgis/rest/services/Cadastral/Parcels/MapServer/0";

type ParcelAttrs = {
  APN: string | null;
  Owner: string | null;
  PropAddr: string | null;
  Acres: number | null;
  DeededAcreage: number | null;
  LandAppr: number | null;
  ImprAppr: number | null;
  TotlAppr: number | null;
  Zoning: string | null;
  LUCode: string | null;
  LUDesc: string | null;
  SalePrice: number | null;
  OwnDate: number | null; // epoch millis, ArcGIS date field -- owner-of-record change date, the closest available proxy for a sale date
};

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run collect:nashville-parcels\` from dashboard/ so .env.local loads.`);
  return value;
}

function epochToDateString(epochMillis: number | null): string | null {
  if (epochMillis == null) return null;
  return new Date(epochMillis).toISOString().slice(0, 10);
}

async function ensureSource(supabase: SupabaseClient): Promise<string> {
  const { data: existing } = await supabase.from("sources").select("id").eq("url", SOURCE_URL).limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: inserted, error } = await supabase
    .from("sources")
    .insert({ agency: SOURCE_AGENCY, source_type: "agency_gis", url: SOURCE_URL, title: "Metro Nashville Cadastral Parcels GIS layer" })
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

  console.log("Fetching Davidson County parcels (this pages through ~2000 features per request, ~287k total)...");
  const features = await fetchAllArcGISFeatures<ParcelAttrs>(PARCELS_QUERY_URL, {
    outFields: "APN,Owner,PropAddr,Acres,DeededAcreage,LandAppr,ImprAppr,TotlAppr,Zoning,LUCode,LUDesc,SalePrice,OwnDate",
    outSR: 4326,
  });
  console.log(`Fetched ${features.length} parcels.`);

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

  const toInsert = features
    .filter((f) => f.properties.APN && f.geometry && !existingNumbers.has(f.properties.APN))
    .map((f) => ({
      market_id: marketId,
      parcel_number: f.properties.APN,
      address: f.properties.PropAddr || null,
      owner_name: f.properties.Owner || null,
      acreage: f.properties.Acres ?? f.properties.DeededAcreage ?? null,
      boundary: f.geometry,
      source_id: sourceId,
      land_value: f.properties.LandAppr ?? null,
      improvement_value: f.properties.ImprAppr ?? null,
      total_value: f.properties.TotlAppr ?? null,
      zoning: f.properties.Zoning || null,
      land_use_code: f.properties.LUCode || null,
      land_use_description: f.properties.LUDesc || null,
      last_sale_price: f.properties.SalePrice ?? null,
      last_sale_date: epochToDateString(f.properties.OwnDate),
    }));

  console.log(`Inserting ${toInsert.length} new parcels (skipping ${features.length - toInsert.length} already on file / missing APN)...`);
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
    if (inserted % 5000 < batchSize) console.log(`  ${inserted}/${toInsert.length} inserted...`);
  }

  console.log(`Done. Inserted ${inserted} new parcels for Nashville (market ${marketId}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
