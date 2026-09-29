// First-pass "zoning" Opportunities for Nashville (Jared, 2026-09-29:
// "some opportunities... for the first developer tester"). Built entirely
// from real entitlement_cases data already collected (collectNashville
// CouncilZoning.ts / collectNashvillePlanningCommission.ts) -- every
// opportunity here is a real, substantial (>=5 acre), already-approved
// rezoning, not a fabricated or inferred signal. No distress/early_project
// opportunities are seeded yet -- those need real tax-delinquency and
// developer-announcement research this pass didn't attempt; explicitly a
// gap to fill later, not silently skipped.
//
// Coordinates: entitlement_cases has no lat/lng (the source PDFs/API never
// state one), so each address is geocoded via the Census Bureau's free
// public geocoder (see the geocode() comment below for why, not Mapbox).
// A case whose address doesn't geocode cleanly is skipped rather than
// given an invented location.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const MARKET_SLUG = "nashville-tn";
const MIN_ACREAGE = 2;
const MAX_OPPORTUNITIES = 40;

type CandidateCase = {
  id: string;
  case_number: string;
  address: string | null;
  existing_zoning: string;
  requested_zoning: string;
  acreage: number;
  proposed_use: string | null;
  final_decision_date: string | null;
  planning_commission_hearing_date: string | null;
  ordinance_number: string | null;
  source_id: string;
};

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run seed:nashville-opportunities\` from dashboard/ so .env.local loads.`);
  return value;
}

function strengthForAcreage(acreage: number): "high" | "medium" | "low" {
  if (acreage >= 30) return "high";
  if (acreage >= 10) return "medium";
  return "low";
}

// The available NEXT_PUBLIC_MAPBOX_TOKEN turned out to be scoped for map
// rendering only (geocoding calls return 403 Forbidden) -- the Census
// Bureau's free public geocoder (no key required) works instead, and is
// arguably the better fit anyway per docs/DATA_INTELLIGENCE_PIPELINE.md's
// preference for structured government endpoints. It wants a single,
// clean street address -- multi-parcel case addresses like "13905 Old
// Hickory Boulevard and Old Hickory Boulevard" are trimmed to just the
// first real address before geocoding (still a real address stated in
// the case, not invented, just not the whole compound list).
// Nashville case addresses come in two compound shapes this trims down to
// one real, geocodable address: "A Street and B Street" (take the first)
// and "5633, 5637, ... 5655 Valley View Road" (one street, several house
// numbers -- take the first number with the shared street name, since a
// naive split on the first comma would strip the street name off
// entirely).
function firstAddress(raw: string): string {
  const sharedStreet = /^((?:\d+[,\s]+)+)([A-Za-z][A-Za-z0-9.\s]*?)(?:,| and |$)/.exec(raw);
  if (sharedStreet) {
    const firstNumber = sharedStreet[1].split(/[,\s]+/).filter(Boolean)[0];
    return `${firstNumber} ${sharedStreet[2].trim()}`;
  }
  return raw.split(/\s+and\s+|,/i)[0].trim();
}

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${firstAddress(address)}, Nashville, TN`);
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${query}&benchmark=Public_AR_Current&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const body = (await res.json()) as { result?: { addressMatches?: { coordinates: { x: number; y: number } }[] } };
  const match = body.result?.addressMatches?.[0];
  if (!match) return null;
  return { lat: match.coordinates.y, lng: match.coordinates.x };
}

function buildReasons(c: CandidateCase): string[] {
  const reasons: string[] = [];
  reasons.push(
    `Rezoned from ${c.existing_zoning} to ${c.requested_zoning}, approved by Metro Council${c.final_decision_date ? ` on ${c.final_decision_date}` : ""}${
      c.ordinance_number ? ` (Ordinance ${c.ordinance_number})` : ""
    }.`
  );
  reasons.push(`${c.acreage} acres at ${c.address}.`);
  reasons.push(
    c.proposed_use
      ? `Approved to permit ${c.proposed_use}.`
      : `No specific unit/use program stated in the approved ordinance record on file -- by-right development flexibility under the new zoning, not yet a stated program.`
  );
  return reasons;
}

async function main() {
  const supabaseUrl = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: market, error: marketError } = await supabase.from("markets").select("id").eq("slug", MARKET_SLUG).single();
  if (marketError || !market) throw new Error(`Market ${MARKET_SLUG} not found: ${marketError?.message}`);
  const marketId = market.id as string;

  const { data: candidates, error: candidatesError } = await supabase
    .from("entitlement_cases")
    .select(
      "id, case_number, address, existing_zoning, requested_zoning, acreage, proposed_use, final_decision_date, planning_commission_hearing_date, ordinance_number, source_id"
    )
    .eq("market_id", marketId)
    .eq("status", "approved")
    .not("existing_zoning", "is", null)
    .not("requested_zoning", "is", null)
    .not("address", "is", null)
    .gte("acreage", MIN_ACREAGE)
    .order("acreage", { ascending: false })
    .limit(MAX_OPPORTUNITIES);
  if (candidatesError) throw new Error(`Failed to load candidate cases: ${candidatesError.message}`);

  console.log(`Found ${candidates?.length ?? 0} candidate rezonings (>= ${MIN_ACREAGE} acres, approved). Geocoding and inserting...`);

  let inserted = 0;
  for (const c of (candidates ?? []) as CandidateCase[]) {
    const { data: existing } = await supabase
      .from("development_opportunities")
      .select("id")
      .eq("market_id", marketId)
      .contains("signals", ["recent_rezoning"])
      .ilike("address", c.address!)
      .limit(1);
    if (existing && existing.length > 0) {
      console.log(`  skip (already seeded): ${c.address}`);
      continue;
    }

    const coords = await geocode(c.address!);
    if (!coords) {
      console.log(`  ! could not geocode "${c.address}" -- skipping rather than guessing a location`);
      continue;
    }

    const identifiedDate = c.final_decision_date ?? c.planning_commission_hearing_date;
    if (!identifiedDate) {
      console.log(`  ! no decision or hearing date on file for ${c.case_number} -- skipping`);
      continue;
    }

    const { error } = await supabase.from("development_opportunities").insert({
      market_id: marketId,
      address: c.address,
      latitude: coords.lat,
      longitude: coords.lng,
      opportunity_type: `Recently Approved Rezoning -- ${c.acreage} Acres`,
      category: "zoning",
      strength: strengthForAcreage(c.acreage),
      signals: ["recent_rezoning", "favorable_zoning"],
      reasons: buildReasons(c),
      source_ids: [c.source_id],
      date_identified: identifiedDate,
      opportunity_group: "development",
      // Free-text narrative, matching existing rows' convention (see e.g.
      // "Rezoning approved Aug 18, 2026 -- pre-construction, no permits
      // filed yet") rather than a short status enum.
      status: c.final_decision_date
        ? `Rezoning approved ${c.final_decision_date} -- pre-construction, no permits filed yet on the record collected so far.`
        : `Recommended by Planning Commission ${c.planning_commission_hearing_date} -- Council decision not yet on file.`,
    });
    if (error) {
      console.error(`  ! failed to insert opportunity for ${c.case_number}: ${error.message}`);
      continue;
    }
    inserted++;
    console.log(`  + ${c.address} (${c.acreage} ac, ${c.existing_zoning} -> ${c.requested_zoning})`);
  }

  console.log(`Done. Inserted ${inserted} zoning opportunities for Nashville.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
