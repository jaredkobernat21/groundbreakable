-- Closes two of the three "thin" profiles flagged in the preview
-- readiness review (Jared, 2026-09-07): Fredo/KASA (St. Louis, only 6
-- scored items total, all from one MLK Dr block) and Dakota (Kansas
-- City KS, drops off fast after its top 2 matches). Dakota's fix
-- follows in this same migration; a separate St. Louis pass covers
-- Fredo/KASA.
--
-- St. Louis: pulled the city's own live, open LRA_INVENTORY_AVAILABLE
-- dataset (9,361 real, currently-available city-owned parcels) rather
-- than inventing new addresses. Found two genuinely strong,
-- directly-purchasable assemblages in Greater Ville -- one commercial/
-- mixed-use, one raw land -- plus verified a real, dated, high-impact
-- citywide program (LRA's $15M/ARPA-funded 1,000-demolition push)
-- that gives Fredo/KASA market-wide context beyond a single block.
--
-- Kansas City, KS: found a real, massive, currently-under-construction
-- project (Buc-ee's, $94M/74,000 sq ft travel center near Kansas
-- Speedway, broke ground Oct 2025) that was not yet on file -- directly
-- relevant to a concrete contractor given the scale of parking-lot and
-- fuel-island flatwork involved, and no GC was named in coverage.
--
-- No coordinates were available for any of these three new addressed
-- items (the LRA dataset has no lat/lng column; the Buc-ee's coverage
-- gives an intersection, not a geocoded point) -- left null throughout.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('aa000000-0000-4000-8000-000000000001', 'St. Louis Development Corporation (LRA)', 'LRA Available Property Inventory (live open-data pull)', 'agency_gis', 'https://static.stlouis-mo.gov/open-data/SLDC/REAL-ESTATE/LRA_INVENTORY_AVAILABLE.csv', '2026-09-07'),
  ('aa000000-0000-4000-8000-000000000002', 'FOX 2 (KTVI)', 'St. Louis'' north side envisions future as vacant buildings cleared', 'news', 'https://fox2now.com/news/missouri/st-louiss-north-side-envisions-future-as-vacant-buildings-cleared/', null),
  ('aa000000-0000-4000-8000-000000000003', 'Ingram''s', 'Buc-ee''s $94M KCK Location Officially Breaks Ground, Over 200 New Jobs', 'news', 'https://ingrams.com/article/buc-ees-94m-kck-location-officially-breaks-ground-over-200-new-jobs/', '2025-10-21');

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'st-louis-mo'), 'distress', 'citywide_demolition_revitalization_program',
    'LRA targets 1,000 vacant-structure demolitions citywide by 2026 ($15M state + ARPA funding)',
    'The Land Reutilization Authority, St. Louis Development Corporation, and Office of Violence Prevention are jointly running a $15M Missouri DED-funded (plus ARPA dollars) push to demolish 1,000 vacant structures citywide by 2026 -- 200 already completed, 800 scheduled -- alongside a separate $6.5M beautification effort. Named target neighborhoods include The Ville, Greater Ville, and Vandeventer (the latter also drawing $160M in combined private/public redevelopment funding). LRA leadership describes leveraging ARPA dollars to move forward with acquisitions and development for commercial, mixed-use, retail, and housing purposes -- a market-wide signal that city-owned inventory in these neighborhoods is being actively cleared and prepped for reinvestment, not just held.',
    '2026-09-07', 'high', array['investor']::shift_audience[],
    'aa000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'), 'building', 'major_commercial_construction',
    'Buc-ee''s breaks ground on $94M, 74,000 sq ft travel center near Kansas Speedway',
    'Broke ground October 2025 at 110th Street and Village West Parkway, near Kansas Speedway and Hollywood Casino -- a 74,000 sq ft travel center with roughly 120 fueling positions and 12 EV charging stations, over $90M invested, expected to open October 2027. No general contractor was named in coverage of the groundbreaking. One of the largest single commercial construction projects currently in the KC-KS pipeline.',
    '2025-10-21', 'high', array['contractor','developer']::shift_audience[],
    'aa000000-0000-4000-8000-000000000003', now()
  );

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'st-louis-mo'),
    '4553, 4555 & 4591 Dr Martin Luther King Dr, St. Louis, MO (Greater Ville)',
    null, null,
    'LRA-Owned Commercial/Mixed-Use Cluster -- Directly Purchasable', 'high', 'distress', 'development',
    array['city_owned_directly_purchasable','commercial_mixed_use','adjacent_parcels','same_corridor_as_existing_signals'],
    array[
      'Three adjacent city-owned buildings on the same block of Dr. Martin Luther King Dr already flagged for a severely-violated vacant building and an adjacent land-bank parcel -- two 2-story brick mixed-use buildings (4553, 4555) plus a 1-story brick commercial building (4591), ~9,500 sq ft combined',
      'All three are LRA inventory -- a direct purchase process through the city, not a negotiation with a private owner or a competitive auction',
      'Sits in Greater Ville, one of the neighborhoods explicitly named in the city''s $15M/ARPA-funded demolition and revitalization push',
      'Confirm current pricing and the offer process directly with LRA (314-657-3721) -- inventory availability can change'
    ],
    array['aa000000-0000-4000-8000-000000000001'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'st-louis-mo'),
    'Vine Grove Ave, St. Louis, MO (32 contiguous LRA-owned lots, Greater Ville)',
    null, null,
    '32-Parcel Vacant Land Assemblage -- City-Owned', 'medium', 'distress', 'development',
    array['city_owned_directly_purchasable','large_land_assemblage','vacant_lots'],
    array[
      '32 separate LRA-owned vacant lots along Vine Grove Ave, totaling roughly 4.65 acres (202,531 sq ft) -- a genuine assemblage-scale land position, not one scattered lot',
      'All city-owned, meaning a direct purchase process rather than tracking down dozens of individual private owners',
      'Sits in Greater Ville, one of the neighborhoods explicitly named in the city''s $15M/ARPA-funded demolition and revitalization push -- surrounding investment may support new construction here over time',
      'Confirm current per-lot pricing and any assemblage discount directly with LRA (314-657-3721)'
    ],
    array['aa000000-0000-4000-8000-000000000001'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'),
    '110th St & Village West Pkwy, Kansas City, KS (near Kansas Speedway)',
    null, null,
    'Under-Construction $94M Buc-ee''s Travel Center', 'high', 'early_project', 'contractor',
    array['major_commercial_construction','no_gc_confirmed','large_parking_flatwork'],
    array[
      '$94M, 74,000 sq ft travel center broke ground October 2025 near Kansas Speedway and Hollywood Casino -- one of the largest single commercial construction projects in the KC-KS pipeline',
      '~120 fueling positions plus 12 EV charging stations means an unusually large footprint of parking-lot, fuel-island, and canopy concrete work well beyond the building slab itself',
      'No general contractor was named in coverage of the groundbreaking -- worth confirming who has been awarded the site-work and flatwork packages',
      'Expected to open October 2027 -- construction is actively underway now, roughly a year in, with trade work ongoing'
    ],
    array['aa000000-0000-4000-8000-000000000003'::uuid],
    '2026-09-07'
  );
