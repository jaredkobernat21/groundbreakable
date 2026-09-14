-- Personalizes Alexander Vaught's (Duct Wrangler LLC) dashboard with
-- real content (Jared, 2026-09-07): he wants to "dominate Kansas" --
-- Topeka, Lawrence, Kansas City KS, and Kansas City MO -- starting with
-- markets already tracked (KC MO isn't a Groundbreakable market yet;
-- deferred, same as Perry/Gardner/Spring Hill were for Dan Lynch until
-- a dedicated pass creates them).
--
-- Unlike Dan Lynch's land-bank profile, a duct/HVAC cleaning contractor's
-- useful signals are: (1) new-construction permits (duct work happens
-- near completion/move-in), (2) distressed/aging multifamily buildings
-- (renovation = HVAC/duct work, and a bigger, potentially recurring
-- client than a single house), (3) zoning/regulatory changes that widen
-- future construction volume generally. Topeka and Lawrence already had
-- exactly this kind of data seeded from prior sessions (Lawrence: 24
-- building-permit shifts including "Mechanical permit filed: 3008
-- Yellowstone Dr"; Topeka: 12 distress shifts including a delinquent tax
-- lien on Crown Point Apartments) -- it just wasn't reachable because his
-- profile only covered Basehor/Bonner Springs. Widening his
-- target_market_ids to include them surfaces all of that for free, no
-- new seeding required there.
--
-- Kansas City KS was the real gap -- the only shifts there were Dan
-- Lynch's big land-development signals (data center, American Royal),
-- nothing relevant to a duct contractor's day-to-day. This adds real,
-- freshly-sourced signals for it: an actively-building subdivision
-- (New Berry at Piper, phase 2), and KCK Housing Authority's public
-- multifamily portfolio (Chalet Manor mid-renovation now, Wyandotte
-- Towers -- 302 units -- nearing "obsolescence"), plus a real zoning
-- reform (SB 418 compliance) that will widen future single-family/ADU
-- construction citywide.

-- --- widen market access + profile fields ---

insert into investor_markets (investor_id, market_id)
select (select id from investor_profiles where full_name = 'Alexander Vaught'), id
from markets where slug in ('topeka-ks', 'lawrence-ks', 'kansas-city-ks')
on conflict do nothing;

update opportunity_profiles
set
  target_market_ids = target_market_ids || (
    select array_agg(id) from markets where slug in ('topeka-ks', 'lawrence-ks', 'kansas-city-ks')
  ),
  target_cities = target_cities || array['Topeka', 'Lawrence', 'Kansas City, MO'],
  preferred_project_types = array(select distinct unnest(preferred_project_types || array['multifamily']::text[])),
  travel_radius_mi = 50,
  notes = notes || E'\n\nUpdated 2026-09: wants to "dominate Kansas" -- Topeka, Lawrence, Kansas City KS, and ' ||
    'Kansas City MO specifically. Started with the three already-tracked KS markets per his own suggestion; ' ||
    'Kansas City MO isn''t a Groundbreakable market yet (would need a new market row + its own research pass, ' ||
    'same as Perry/Gardner/Spring Hill were for Dan Lynch). Topeka and Lawrence already had strong permit/distress ' ||
    'data on file from prior sessions once his markets were widened to include them -- no fresh seeding needed ' ||
    'there. Kansas City KS was genuinely empty for his trade (only Dan Lynch''s big land-development signals ' ||
    'existed) -- backfilled with real new-construction and public-multifamily-renovation signals below.'
where investor_profile_id = (select id from investor_profiles where full_name = 'Alexander Vaught');

-- --- sources ---

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a3000000-0000-4000-8000-000000000001', 'NewBerry at Piper', 'NewBerry at Piper -- New Homes, Kansas City, Kansas', 'other', 'https://newberryatpiper.com/', null),
  ('a3000000-0000-4000-8000-000000000002', 'The Beacon (Kansas City)', 'KCK Housing Authority monitoring condition of Wyandotte Towers', 'news', 'https://thebeaconnews.org/stories/2026/05/29/kck-housing-authority-wyandotte-towers/', '2026-05-29'),
  ('a3000000-0000-4000-8000-000000000003', 'The Beacon (Kansas City)', 'KCK looking to increase stock of single-family housing', 'news', 'https://thebeaconnews.org/stories/2026/08/21/kck-looking-to-increase-stock-of-single-family-housing/', '2026-08-21');

-- --- shifts ---

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'kansas-city-ks'), 'building', 'new_subdivision_construction',
    'New Berry at Piper subdivision, Phase 2, actively building',
    'New single-family homes near N 123rd St & Leavenworth Rd, Piper Schools district (66109). Lots being reserved quickly -- a real, ongoing pipeline of new-construction homes that will need duct/HVAC work near completion.',
    '2026-08-01', 'medium', array['contractor','developer']::shift_audience[],
    'a3000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'), 'distress', 'public_housing_renovation',
    'KCK Housing Authority renovating Chalet Manor',
    'Active renovation, construction estimated 90-120 days per building, targeting completion around September 2027. 43 units currently vacant. Residents requiring relocation get 30-day notice and return to original units post-renovation -- a real, dated, in-progress project, not a proposal.',
    '2026-05-29', 'medium', array['contractor']::shift_audience[],
    'a3000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'), 'distress', 'aging_multifamily',
    'Wyandotte Towers (302 units) nearing "obsolescence" status',
    'Ongoing hot water issues (135 shower valves already replaced); board report says the building is "within a couple of percentages of meeting obsolescence." A revised assessment expected to confirm obsolescence, which board discussion says would "open new routes for the future" -- worth watching for a major-renovation or redevelopment decision. A 302-unit public building reaching this point is a large potential client if renovation is chosen.',
    '2026-05-29', 'medium', array['contractor','investor']::shift_audience[],
    'a3000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'), 'plans', 'zoning_reform',
    'KCK preparing zoning ordinance to comply with SB 418 "By-Right Housing Development Act"',
    'Minimum lot size for single-family homes would drop from 5,000 to 3,000 sq ft; ADU eligibility being expanded; one zoning district allowing some residential but not single-family will need modification. Staff planned to present the ordinance the following month (as of the Aug 10, 2026 meeting). A citywide regulatory change like this widens future construction volume generally, not just at one site.',
    '2026-08-21', 'medium', array['contractor','developer']::shift_audience[],
    'a3000000-0000-4000-8000-000000000003', now()
  );

-- --- development_opportunities ---
-- Repurposing the land-development-oriented opportunity_group='contractor'
-- path deliberately, same pattern used when his profile was first created:
-- an active subdivision with no publicly-identified duct/HVAC contractor
-- is a real service-lead opportunity, framed honestly as such rather than
-- as a land acquisition target.

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'kansas-city-ks'),
    'New Berry at Piper subdivision, N 123rd St & Leavenworth Rd, Kansas City, KS 66109',
    39.175, -94.865,
    'Active New-Construction Subdivision — Phase 2', 'medium', 'early_project', 'contractor',
    array['active_construction','multi_lot_subdivision'],
    array[
      'New Berry at Piper is actively building Phase 2, with lots being reserved quickly -- a real, ongoing pipeline of new single-family homes in the Piper area',
      'No general or duct/HVAC contractor publicly identified for the subdivision -- an open door to pitch a builder relationship directly',
      'Multiple homes under construction at once means a single successful pitch could become repeat, recurring work rather than a one-off job',
      'Sits inside Kansas City, KS -- part of the Kansas footprint Alexander wants to dominate'
    ],
    array['a3000000-0000-4000-8000-000000000001'::uuid],
    '2026-09-07'
  );
