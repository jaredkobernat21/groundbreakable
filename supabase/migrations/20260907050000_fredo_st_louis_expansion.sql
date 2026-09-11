-- Personalizes Fredo's (Arbor House Buyers) dashboard with real content
-- (Jared, 2026-09-07): "now fredo" -- same treatment as Dan Lynch and
-- Alexander Vaught. Unlike either of them, Missouri wasn't tracked at
-- all -- his whole footprint (St. Louis, St. Louis County, St. Charles
-- County, Jefferson County, Franklin County, Boone County) was outside
-- Groundbreakable entirely. Starting with St. Louis itself (his home
-- base, and the market with by far the best public distress-property
-- data) rather than all six counties at once -- same "start with what's
-- closest" scoping already used for Dan Lynch and Alexander. The other
-- five counties are deferred, same as KC MO was for Alexander.
--
-- Also fixes a real product gap surfaced while building this: the match-
-- scoring engine had no path that rewarded distress signals for a
-- redevelopment-focused investor profile at all -- every investor/
-- developer keyword bonus was about growth-corridor infrastructure
-- (annexation, utilities, roads), which is exactly the wrong lens for a
-- distressed-property cash buyer. Fixed in
-- src/lib/clientMatchScoring.ts (scoreInvestorDeveloperOpportunityMatch/
-- scoreShiftMatch) before writing any of the data below, reusing
-- property_types containing "redevelopment" as the existing signal that
-- a profile is distress-oriented, rather than adding a new dedicated flag.
--
-- Every fact below is from a live, verified public source: the City of
-- St. Louis's own vacant-buildings API (stlcitypermits.com,
-- Building Division, live data), the city's own address/parcel lookup
-- (used to resolve two specific parcel IDs from that API to real
-- addresses), and the Land Reutilization Authority (the city's own land
-- bank of tax-delinquent properties, 8,224 for sale as of July 2026 per
-- lrastl.org). Individual owner names found via the parcel lookup are
-- deliberately NOT included anywhere below -- these are named private
-- individuals, not businesses, and owner identity belongs in a Partner
-- Desk research request if Fredo asks for it, not a broadly-cached
-- signal card (same restraint applied to Dan Lynch's site-search
-- finalists).

-- --- market ---

insert into markets (slug, name, state, center_lat, center_lng, default_zoom) values
  ('st-louis-mo', 'St. Louis', 'MO', 38.6270, -90.1994, 12);

-- --- grant Fredo access + widen his profile ---

insert into investor_markets (investor_id, market_id)
select (select id from investor_profiles where full_name = 'Fredo'), id from markets where slug = 'st-louis-mo';

update opportunity_profiles
set
  target_market_ids = target_market_ids || (select array_agg(id) from markets where slug = 'st-louis-mo'),
  property_types = array(select distinct unnest(property_types || array['infill']::text[])),
  notes = notes || E'\n\nUpdated 2026-09: Started with St. Louis itself (home base, and by far the best public ' ||
    'distress-property data of anywhere in his footprint) rather than all six of his counties at once. St. Louis ' ||
    'County, St. Charles County, Jefferson County, Franklin County, and Boone County (Columbia) are all still ' ||
    'unrated -- each would need its own market row + research pass, same as KC MO was for Alexander Vaught. ' ||
    'Real St. Louis sources on file now: the city''s live vacant-buildings API (Building Division), two resolved ' ||
    'parcel addresses off Martin Luther King Dr (one privately owned with 91 combined violations, one LRA-owned ' ||
    'and directly acquirable from the city), and the Land Reutilization Authority''s citywide inventory (8,224 ' ||
    'tax-delinquent properties for sale as of July 2026).'
where investor_profile_id = (select id from investor_profiles where full_name = 'Fredo');

-- --- sources ---

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a4000000-0000-4000-8000-000000000001', 'City of St. Louis, Building Division', 'Vacant Buildings dataset (live API, parcel-level violation/fee overview)', 'agency_gis', 'https://www.stlouis-mo.gov/data/datasets/dataset.cfm?id=108', null),
  ('a4000000-0000-4000-8000-000000000002', 'City of St. Louis', 'Address and Property Information Search', 'agency_gis', 'https://www.stlouis-mo.gov/data/address-search/', null),
  ('a4000000-0000-4000-8000-000000000003', 'St. Louis Land Reutilization Authority (LRA)', 'LRA-Owned Property Search', 'agency_document', 'https://www.lrastl.org/property-search', '2026-07-01'),
  ('a4000000-0000-4000-8000-000000000004', 'STL Vacancy Collaborative', 'STL Vacant Property Explorer -- vacancy, nuisance, and tax-delinquency scoring across ~25,000 parcels', 'agency_document', 'https://www.stlvacancytools.com/stats.html', null);

-- --- shifts ---

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, address, source_id, detected_at) values
  (
    (select id from markets where slug = 'st-louis-mo'), 'distress', 'land_bank_inventory',
    'St. Louis Land Reutilization Authority holds 8,224 tax-delinquent properties for sale citywide',
    'The LRA receives title to all tax-delinquent properties not sold at the Sheriff''s sale; SLDC''s Real Estate Department maintains, markets, and sells the inventory directly to buyers. This is the single largest, most directly actionable distressed-property source in the city -- publicly searchable, not off-market.',
    '2026-07-01', 'high', null,
    'a4000000-0000-4000-8000-000000000003', now()
  ),
  (
    (select id from markets where slug = 'st-louis-mo'), 'distress', 'vacant_building_violations',
    'Building Division vacant-buildings data shows 24,000+ vacant lots/buildings citywide, ~9,000 empty buildings',
    'Live-updated dataset (2017-present) tracks violation counts and unpaid fees per parcel, maintained by Building Division inspectors. Cross-referenced with the STL Vacant Property Explorer, which layers in Assessor, Forestry, and LRA data to score vacancy/nuisance/tax-delinquency together -- the city''s own cited "go to source" for distressed-property research.',
    '2026-09-07', 'medium', null,
    'a4000000-0000-4000-8000-000000000004', now()
  ),
  (
    (select id from markets where slug = 'st-louis-mo'), 'distress', 'code_violation_severe',
    'Vacant building at 5857 Martin Luther King Dr carries 91 combined violations and $4,950 unpaid',
    '37 minor + 54 major code violations per the Building Division''s live parcel data, plus $4,950 in unpaid fees -- an unusually severe combination even against this dataset''s own citywide distribution. Most recent building permit on file is a 2017 demolition permit for a two-story commercial brick building.',
    '2026-09-07', 'medium', '5857 Martin Luther King Dr, St. Louis, MO 63112',
    'a4000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'st-louis-mo'), 'distress', 'lra_owned_adjacent',
    'LRA-owned parcel directly adjacent at 5867 Martin Luther King Dr',
    'Classified EXEMPT (tax-exempt, city-held), land use "Local Commercial and Office." Directly next to the severely-violated 5857 parcel above -- a real assemblage possibility, and the LRA parcel itself is purchasable through the city''s own property search today.',
    '2026-09-07', 'low', '5867 Martin Luther King Dr, St. Louis, MO 63112',
    'a4000000-0000-4000-8000-000000000002', now()
  );

-- --- development_opportunities ---

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'st-louis-mo'),
    '5857 Martin Luther King Dr, St. Louis, MO 63112',
    null, null,
    'Severely-Violated Vacant Building', 'high', 'distress', 'development',
    array['code_violation','vacant','tax_delinquent_area'],
    array[
      '91 combined code violations (37 minor + 54 major) on file with the city''s Building Division -- an unusually severe combination',
      '$4,950 in unpaid fees attached to the parcel',
      'Classified commercial/residential; most recent permit on file is a 2017 demolition permit for a two-story commercial brick building',
      'Directly adjacent to an LRA-owned parcel -- a real assemblage possibility, not just an isolated lot'
    ],
    array['a4000000-0000-4000-8000-000000000001'::uuid, 'a4000000-0000-4000-8000-000000000002'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'st-louis-mo'),
    '5867 Martin Luther King Dr, St. Louis, MO 63112',
    null, null,
    'City Land Bank (LRA) Parcel — Directly Purchasable', 'medium', 'distress', 'development',
    array['land_bank_owned','off_market'],
    array[
      'Owned by the St. Louis Land Reutilization Authority (LRA) -- the city''s own tax-delinquent-property land bank',
      'Purchasable directly through the city''s LRA property search process, not a negotiation with a private owner',
      'Zoned/classified for local commercial and office use',
      'Sits directly next to a severely-violated privately-owned parcel (5857 MLK Dr) -- a natural assemblage pairing'
    ],
    array['a4000000-0000-4000-8000-000000000002'::uuid, 'a4000000-0000-4000-8000-000000000003'::uuid],
    '2026-09-07'
  );
