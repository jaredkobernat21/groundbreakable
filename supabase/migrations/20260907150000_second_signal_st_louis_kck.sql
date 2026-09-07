-- Second pass on the same two profiles closed in the prior migration
-- (Jared, 2026-09-07: "keep going") -- one more strong, distinct real
-- signal each for Fredo/KASA (St. Louis) and Dakota (Kansas City, KS),
-- so each has more than one "wow" match to lead a preview with.
--
-- St. Louis: "The Monarch on MLK" -- a real, SLFRF-funded workforce
-- campus (150,000 sq ft building + 29 adjacent parcels, purchased 2023,
-- targeting 2025 tenant move-in) sitting directly on the same MLK Dr
-- corridor already tracked -- plus a genuinely important detail: 79
-- MORE LRA-owned parcels are available within the surrounding six-block
-- area, well beyond the two specific assemblages already seeded.
--
-- Kansas City, KS: Quindaro Crossings -- a real, currently-groundbreaking
-- $93M/469-lot (up to 500-home) subdivision built entirely on Unified
-- Government land-bank lots, developer IMR Homes / builder CJR
-- Construction, targeting 60-70 new single-family homes per year once
-- ramped up. A multi-year, repeat-business pipeline, not a one-off --
-- exactly what a concrete contractor benefits from finding early.
--
-- No verified geocode was available for either new addressed item
-- (Monarch's own address is cited only in shift text since no new
-- opportunity is added for it -- the building itself isn't for sale;
-- Quindaro's model-home address has no confirmed lat/lng) -- left null.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('ab000000-0000-4000-8000-000000000001', 'St. Louis Development Corporation (SLDC)', 'The Monarch on MLK', 'agency_document', 'https://www.developstlouis.org/monarchonmlk', null),
  ('ab000000-0000-4000-8000-000000000002', 'KSHB (Scripps)', 'A developer plans to work quickly to build nearly 500 affordable homes in Quindaro neighborhood in KCK', 'news', 'https://www.kshb.com/news/local-news/a-developer-plans-to-work-quickly-to-build-nearly-500-affordable-homes-in-quindaro-neighborhood-in-kck', null);

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'st-louis-mo'), 'business', 'workforce_hub_anchor',
    'The Monarch on MLK: 150,000 sq ft workforce campus anchors North MLK corridor, 79 more LRA parcels available nearby',
    'The Land Clearance for Redevelopment Authority purchased a 150,000 sq ft industrial building at 3940 Dr. Martin Luther King Dr in October 2023, along with 29 adjacent parcels, wholly funded through federal SLFRF pass-through dollars. The 15-acre campus is being redeveloped into "The Monarch on MLK" -- a workforce training hub set to house the Land Reutilization Authority itself, the Northside Economic Empowerment Center, the Office of Violence Prevention, St. Louis Agency on Training and Employment, a modular-building construction company, and training programs in advanced manufacturing, geospatial services, logistics, biosciences, and construction -- targeting its first tenants in 2025. Beyond the 29 parcels bought with the anchor building, SLDC reports an additional 79 LRA-owned parcels available within the surrounding six-block area -- a large, direct-purchase land pool right around a well-funded public anchor investment.',
    '2026-09-07', 'high', array['investor']::shift_audience[],
    'ab000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'), 'building', 'new_subdivision_groundbreaking',
    'Quindaro Crossings breaks ground -- 500-home, $93M subdivision on Unified Government land-bank lots',
    'IMR Homes (developer) and CJR Construction broke ground on the first model home at 2910 Hiawatha St for Quindaro Crossings, a $93M project converting 469 Unified Government land-bank lots (part of a 4,300-parcel land bank) between 7th St/18th St and Quindaro Blvd into single-family homes and duplexes, with a stated goal of up to 500 homes total. Homes are priced from the low-to-high $200,000s, with a 10-year Neighborhood Revitalization Act property-tax rebate for buyers. The developer plans roughly 60-70 new homes per year (15 per quarter) once ramped up -- a genuine multi-year, repeat-business construction pipeline, not a single project. The Unified Government approved the project in April 2025; the model-home groundbreaking was delayed by an August 2026 storm and has now occurred.',
    '2026-09-01', 'high', array['contractor','developer']::shift_audience[],
    'ab000000-0000-4000-8000-000000000002', now()
  );

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'kansas-city-ks'),
    '2910 Hiawatha St, Kansas City, KS (Quindaro Crossings model home)',
    null, null,
    'New-Construction Subdivision -- Up to 500 Homes Planned, Groundbreaking Underway', 'high', 'early_project', 'contractor',
    array['large_new_construction_pipeline','land_bank_lots','phased_multi_year','no_sub_trades_locked_in'],
    array[
      'Groundbreaking held on the first model home for Quindaro Crossings -- a $93M, 469-lot project ultimately planned for up to 500 single-family homes and duplexes, all built on Unified Government land-bank lots',
      'Developer plans roughly 60-70 new homes per year (15 per quarter) once ramped up -- a genuine multi-year, repeat-business pipeline rather than a one-off project',
      'Homes priced in the low-to-high $200,000s and built for volume -- repeatable scopes of work favor a contractor who can commit to an ongoing relationship over a single custom job',
      'This is the very first home to break ground -- early positioning with the developer (IMR Homes) or builder (CJR Construction) now, before the pipeline scales up, is the highest-leverage window'
    ],
    array['ab000000-0000-4000-8000-000000000002'::uuid],
    '2026-09-07'
  );
