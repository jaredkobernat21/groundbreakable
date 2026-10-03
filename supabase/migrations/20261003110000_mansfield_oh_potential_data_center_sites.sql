-- Mansfield, OH / North Central Ohio (market `mansfield-oh`) "Potential
-- Data Center Site" pass -- GENUINE RE-RUN of the prior pass
-- (20261003100000_mansfield_oh_potential_data_center_sites.sql), which was
-- cut off mid-research by a WebSearch budget cap one query in and
-- deliberately contained no statements. This migration completes the
-- pass: county-level moratorium/zoning status for all three counties
-- (Richland, Ashland, Crawford) was checked, site-level research was done
-- on every candidate that cleared the "no known data-center activity" bar,
-- and 2 new Potential sites are added. Existing catalysts reconfirmed via
-- live DB query before this research began: US-30 Bridge Replacement at
-- SR 98 (Crawford County, infrastructure_project) and Newman Technology
-- Mansfield Plant Expansion (major_employer) -- both neither data-center-
-- relevant, both untouched by this migration.
--
-- STATEWIDE MORATORIUM COUNT (re-confirmed): at least 138 Ohio
-- municipalities/townships had active data-center moratoriums as of
-- 2026-09-17 (Ohio Capital Journal, 2026-09-18) -- same figure the prior
-- incomplete pass found before being cut off. Also confirmed this pass:
-- 23 Ohio communities have effectively banned data centers outright, and
-- 18 Ohio communities had data-center-related measures on the Nov. 2026
-- ballot (nine of them bans covering facilities above 25MW) as of this
-- same article.
--
-- COUNTY-SPECIFIC FINDINGS (the prior pass's single biggest open
-- question):
--
--   RICHLAND COUNTY -- the most consequential finding of this pass.
--   Richland County commissioners have no legal authority to impose a
--   countywide moratorium ("County commissioners are not a legislative
--   body," per their own public statement), so no county-level ordinance
--   exists. But this county had a real, high-profile, named, county-
--   spanning data-center fight in April-May 2026: EnergiAcres (the same
--   company behind the already-logged "Stargate Ohio"/Belmont County
--   exploratory pursuit in the Eastern Appalachian Ohio market) proposed a
--   600-700 acre power-plant-plus-data-center campus on farmland in
--   Franklin Township, north of Mansfield Lahm Regional Airport, requiring
--   annexation into the City of Mansfield. The developer (Shawn Cutter)
--   held a public community meeting before briefing city leaders; this
--   backfired badly -- a resident Facebook group grew to ~750 members and
--   a petition gathered nearly 1,000 signatures in three weeks (fears of
--   24/7 noise, light pollution, property-value decline), all three
--   Richland County commissioners publicly declared "no interest" in
--   working with EnergiAcres, and Mansfield Mayor Jodie Perry announced in
--   April 2026 the city "will no longer pursue" the project. EnergiAcres
--   has since shifted its exploratory focus to Belmont County (where it
--   remains in a self-described "preliminary, exploratory phase" per the
--   Eastern Appalachian Ohio migration). Net effect: this specific
--   pursuit is resolved/dead, not an open "could be anywhere in the
--   county" ambiguity -- but per the same "too much real, DC-specific
--   history in the same jurisdiction for the zero-known-activity bar to
--   cleanly apply" logic already used to exclude Spring Hill, KS in the
--   KC metro pass, NO new Potential site is added anywhere in Richland
--   County this pass, including Airport West Industrial Park at Mansfield
--   Lahm Regional Airport itself (a real, SiteOhio-authenticated, 100-acre
--   shovel-ready city-owned park with no DC-specific search hit of its
--   own) -- it sits in the same city, the same airport-adjacent corridor,
--   and the same community that just fought off a different data-center
--   proposal five months before this research. A future pass could
--   revisit Richland County once more time has passed without further
--   DC-specific activity.
--
--   ASHLAND COUNTY -- Montgomery Township (center of the county, directly
--   adjacent to/bordering the City of Ashland -- road-level geocoding this
--   pass actually placed Wells Road, on the edge of the Ashland Business
--   Park corridor researched below, inside Montgomery Township's limits)
--   unanimously approved a 2-year moratorium on data centers in June 2026,
--   to study impacts on infrastructure, utilities, emergency services, and
--   roads. No moratorium or hostile zoning action was found for the City
--   of Ashland itself (a separately-zoned incorporated municipality) or
--   for Ashland County as a whole. Given the real geographic proximity/
--   possible boundary overlap, this is logged as a genuine, unresolved
--   proximity risk on the Ashland Business Park candidate below (not
--   treated as disqualifying, since the moratorium's actual jurisdiction
--   over city-owned, city-zoned land was not confirmed either way).
--
--   CRAWFORD COUNTY -- no moratorium or hostile data-center-specific
--   zoning action was found at the county level, or for the cities of
--   Bucyrus, Galion, or Crestline specifically, despite a dedicated search
--   pass. (Note: an initial search hit on "Crawford County" + moratorium
--   turned out to be Crawford County, GEORGIA, not Ohio -- discarded. A
--   separate "Upper Sandusky" data-center moratorium is genuinely real but
--   sits in Wyandot County, not Crawford County, despite both being
--   covered by the "Crawford County Now" outlet -- also discarded as
--   inapplicable.) This is logged as a confirmed absence of findings, not
--   assumed-clean: worth re-checking in a future pass given how fast
--   Ohio's moratorium count is moving.
--
-- SITE-LEVEL RESEARCH / RESULT: 2 new Potential sites added, one each in
-- Ashland and Crawford counties -- the two counties not disqualified by
-- the Richland County history above. Both are real, named, actively
-- marketed industrial parks with no data-center-specific search hit by
-- name, address, or combined with their respective utility/economic-
-- development-org names. Both score modestly (low-40s) rather than being
-- inflated to match larger markets from earlier in this session -- real
-- but genuinely small/unconfirmed power and land fundamentals at this
-- research depth, honestly reflected in potential_score_components and
-- unknowns_to_verify rather than guessed.
--
--   1. Ohio Crossroads Industrial Center (Bucyrus, Crawford County) --
--      44.8-acre, SiteOhio-authenticated, AEP-partnered shovel-ready park
--      owned by the Crawford County Development Board. Real but modest
--      power story (single-feed substation 1.2 miles away, only 2.7MW of
--      confirmed excess capacity) and real but small land story (22 of
--      the 44.8 acres already separately certified for Food & Beverage
--      use specifically, not data centers).
--   2. Ashland Business Park (Ford Drive & Wells Road, Ashland, Ashland
--      County) -- city-owned, actively growing industrial park (13
--      businesses, 600+ daily employees, several 2025-2026 tenant
--      announcements) adjacent to a new $11.6M FirstEnergy 138kV/69kV
--      transmission substation built specifically to support Ashland-
--      area economic growth. Real but unconfirmed power-capacity figures
--      (the substation's existence is confirmed, a usable large-load MW
--      number is not), and the Montgomery Township proximity/overlap risk
--      noted above.
--
-- Also checked and NOT added: nothing else in the corridor cleared the
-- bar well enough to be worth a row -- Galion Industrial Park (JBS
-- Development spec building, Crawford County) and the broader Crawford
-- Partnership portfolio were checked but Crossroads was the only one with
-- enough concrete power/land/entitlement detail published to score
-- honestly; no comparable Richland or Ashland industrial-park candidate
-- beyond Airport West (excluded above) and Ashland Business Park turned
-- up concrete enough data to add as a separate row.

insert into sources (agency, title, source_type, url, published_date) values
  ('Ohio Capital Journal', 'Ohio now has over 125 active moratoriums on data centers. See where they are', 'news',
   'https://ohiocapitaljournal.com/2026/09/18/ohio-now-has-over-125-active-moratoriums-on-data-centers-see-where-they-are/', '2026-09-18'),
  ('Richland Source', 'Mansfield mayor says city ''will no longer pursue'' data center project', 'news',
   'https://www.richlandsource.com/2026/04/21/mansfield-mayor-says-city-will-no-longer-pursue-data-center-project/', '2026-04-21'),
  ('Richland Source', 'All 3 Richland County commissioners declare no interest in data center development', 'news',
   'https://www.richlandsource.com/2026/04/24/all-3-richland-county-commissioners-declare-no-interest-in-data-center-development/', '2026-04-24'),
  ('Richland Source', 'Richland County commissioners oppose data center plan, but cannot ban them', 'news',
   'https://www.richlandsource.com/2026/05/12/richland-county-commissioners-oppose-data-center-plan-but-cannot-ban-them/', '2026-05-12'),
  ('DataCenterDynamics', 'Mayor of Mansfield, Ohio, says city will "no longer pursue" data center project', 'news',
   'https://www.datacenterdynamics.com/en/news/mayor-of-mansfield-ohio-says-city-will-no-longer-pursue-data-center-project/', null),
  ('1812 Blockhouse', 'A New Kind Of Data Center, And A New Kind Of Debate, Takes Shape North Of Mansfield', 'news',
   'https://1812blockhouse.com/a-new-kind-of-data-center-and-a-new-kind-of-debate-takes-shape-north-of-mansfield/', null),
  ('Ashland Source', 'Montgomery Twp. trustees approve 2-year data center moratorium', 'news',
   'https://www.ashlandsource.com/2026/06/18/montgomery-township-approves-data-center-moratorium/', '2026-06-18'),
  ('JobsOhio', 'Ohio Crossroads Industrial Center: SiteOhio Authenticated', 'other',
   'https://www.jobsohio.com/available-sites/ohio-crossroads-industrial-center', null),
  ('Crawford County Now', 'AEP and CCEEDP celebrate shovel-ready certification at Crossroads Industrial Center', 'news',
   'https://crawfordcountynow.com/local/aep-and-cceedp-celebrate-shovel-ready-certification-at-crossroads-industrial-center/', null),
  ('Crawford Partnership for Education & Economic Development', 'Properties', 'other',
   'https://crawfordpartnership.org/properties/', null),
  ('Ashland Source', 'Wells Road extension spells big potential for Ashland''s industrial park', 'news',
   'https://www.ashlandsource.com/news/wells-road-extension-spells-big-potential-for-ashlands-industrial-park/article_79eaf63e-1316-11eb-8309-eb84786ea99d.html', null),
  ('Ashland Source', 'Growth is on the horizon for Ashland development', 'news',
   'https://www.ashlandsource.com/2026/09/16/growth-is-on-the-horizon-for-ashland-development/', '2026-09-16'),
  ('Ashland Source', 'Crown Jewlz eyes property at Ashland''s industrial park adjacent to Amazon', 'news',
   'https://www.ashlandsource.com/2025/06/12/crown-jewlz-eyes-property-at-ashlands-industrial-park-adjacent-to-amazon/', '2025-06-12'),
  ('FirstEnergy', 'Construction Underway on New FirstEnergy Transmission Substation to Reinforce Power System in Ashland County', 'press_release',
   'https://www.firstenergycorp.com/newsroom/news_articles/construction-underway-on-new-firstenergy-transmission-substation.html', null);

insert into catalysts (
  market_id, title, catalyst_type, description, address, latitude, longitude,
  influence_radius_meters, status, estimated_value, estimated_scale_note,
  confidence, signal_categories, signal_confidence, power_load_mw,
  catalyst_score, reason_for_catalyst_classification, why_it_matters,
  expected_timeline, related_context, source_id, additional_source_ids,
  potential_score, potential_score_components, opportunity_area,
  power_notes, fiber_notes, land_notes, incentives_notes,
  development_environment_notes, risk_notes, water_notes, natural_gas_notes,
  unknowns_to_verify, why_still_potential, potential_site_type,
  power_pillar_label, site_pillar_label, approval_pillar_label,
  entitlement_velocity, entitlement_velocity_notes,
  city_receptiveness, city_receptiveness_notes,
  community_friction, community_friction_notes,
  utility_timeline, utility_timeline_notes
) values
(
  (select id from markets where slug = 'mansfield-oh'),
  'Ohio Crossroads Industrial Center (Bucyrus, Crawford County)',
  'prospective_data_center_site',
  'A 44.8-acre, SiteOhio-authenticated, shovel-ready industrial park at 149 Holmes Court South, Bucyrus (Crawford County), OH, owned and marketed by the Crawford County Development Board, within Bucyrus city limits and under a mile from US-30. AEP partnered with the Crawford County Partnership for Education & Economic Development (CCEEDP) to certify the site shovel-ready; 22 of the 44.8 acres are separately certified by Austin Consulting specifically for Food & Beverage manufacturing. All utilities reach the park boundary and all due-diligence studies have reportedly been completed with clear findings. No data-center-specific activity was found for this site by name, address, or combined with AEP/CCEEDP/the Crawford County Development Board.',
  '149 Holmes Court South, Bucyrus, OH 44820 (Crawford County) -- geocoded to Holmes Court South; exact parcel boundary within the 44.8-acre park not independently geocoded',
  40.8292886, -82.9659437,
  1600, 'under_study', null, '44.8-acre industrial park; 22 acres further certified specifically for Food & Beverage manufacturing',
  'reported', '{}', null, null,
  5, 'High-impact type (potential data center site) + 3 reinforcing cited context items, but no disclosed investment figure and a specific-site (not regional) footprint.',
  'The cleanest Potential candidate identified in Crawford County this pass -- a real, AEP-partnered, shovel-ready park with no known data-center interest, in a county with no confirmed moratorium or hostile zoning posture, unlike neighboring Richland County''s recent, high-profile EnergiAcres fight.',
  'No confirmed timeline -- park has been shovel-ready-certified and actively marketed by the County Development Board since the AEP/CCEEDP certification; land is currently for sale at $10,000/acre',
  array['SiteOhio authenticated/shovel-ready; 22 of 44.8 acres additionally Austin Consulting-certified for Food & Beverage use', 'AEP partnered directly with CCEEDP on the shovel-ready certification', 'Owned by the Crawford County Development Board, priced at $10,000/acre'],
  (select id from sources where url = 'https://www.jobsohio.com/available-sites/ohio-crossroads-industrial-center'),
  array[
    (select id from sources where url ilike '%crawfordcountynow.com%crossroads-industrial-center%'),
    (select id from sources where url = 'https://crawfordpartnership.org/properties/')
  ],
  41,
  '[
    {"key":"power_grid","points":10,"evidence":["AEP Ohio territory; substation 1.2 miles from the park, single feed","2.7MW of confirmed excess electric capacity at the park per the SiteOhio/JobsOhio listing"],"unknowns":["2.7MW is a real, modest, confirmed figure -- well below typical large-load/hyperscale draw, and no substation-upgrade study or timeline was found"],"status":"verified"},
    {"key":"land_expansion","points":4,"evidence":["44.8 contiguous acres, zoned industrial, within Bucyrus city limits"],"unknowns":["22 of the 44.8 acres are already separately certified for Food & Beverage manufacturing specifically -- a real, named competing-use designation, not just unclaimed acreage","Total acreage is small relative to typical hyperscale campus footprints"],"status":"verified"},
    {"key":"fiber_connectivity","points":2,"evidence":[],"unknowns":["No fiber carrier or route information found for this park"],"status":"unknown"},
    {"key":"government_incentives","points":6,"evidence":["Owned and directly marketed by the Crawford County Development Board at a competitive $10,000/acre","Crawford County ranked in the top 3% of micropolitan counties nationally for economic development (Site Selection magazine)"],"unknowns":["No data-center-specific incentive program identified"],"status":"verified"},
    {"key":"development_entitlement","points":7,"evidence":["SiteOhio-authenticated shovel-ready status with due-diligence studies reportedly completed","Already zoned industrial, within Bucyrus city limits"],"unknowns":["Crawford County''s own data-center-specific zoning posture was searched directly and no moratorium or hostile action was found -- logged as a genuine confirmed absence, not assumed clean"],"status":"verified"},
    {"key":"physical_environmental_risk","points":5,"evidence":["Marketed as having completed all due-diligence studies \"with clear findings\""],"unknowns":["No specific floodplain or wetlands study was independently found"],"status":"indicated"},
    {"key":"water_cooling","points":3,"evidence":["Excess water/sewer capacity of 2.3 MGD / 1.4 MGD confirmed at the park"],"unknowns":["No confirmation of what large continuous industrial draw this excess capacity could actually support"],"status":"verified"},
    {"key":"transportation_workforce","points":4,"evidence":["Adjacent to a four-lane divided highway connecting to I-71 and I-75; under a mile from US-30"],"unknowns":[]}
  ]'::jsonb,
  '149 Holmes Court South, Bucyrus, OH (Crawford County) -- 44.8-acre SiteOhio-authenticated industrial park',
  'AEP Ohio territory. A substation sits 1.2 miles from the park with a single feed; the SiteOhio/JobsOhio listing confirms 2.7MW of currently available excess electric capacity -- a real, modest, limiting figure, not an estimate of eventual large-load capacity. No substation-upgrade study or interconnection timeline was found.',
  null,
  '44.8 contiguous acres, zoned industrial, within Bucyrus city limits, less than one mile from US-30 and adjacent to a four-lane divided highway to I-71/I-75. 22 of the 44.8 acres are separately certified by Austin Consulting specifically for Food & Beverage manufacturing use -- a real, named competing designation that reduces the park''s effectively "open" acreage for other large-load uses.',
  'Owned and actively marketed by the Crawford County Development Board at $10,000/acre; AEP partnered directly with CCEEDP on the park''s shovel-ready certification; Crawford County ranked top 3% nationally among micropolitan counties for economic development (Site Selection magazine, cited via Crawford Partnership materials).',
  'SiteOhio authentication implies completed due-diligence studies "with clear findings." No moratorium or other data-center-specific hostile zoning action was found for Crawford County, Bucyrus, Galion, or Crestline despite a dedicated search -- a genuine confirmed absence of findings as of this pass, not an assumption of a clean posture going forward.',
  'No floodplain, wetlands, or other specific environmental constraint was independently found for this park in available sources -- not confirmed clean, just not flagged.',
  'Excess water/sewer capacity of 2.3 MGD / 1.4 MGD confirmed at the park per SiteOhio/JobsOhio materials.',
  null,
  array[
    'Whether the 2.7MW of confirmed excess electric capacity could be expanded, and at what cost/timeline, for a large continuous load',
    'Fiber carrier presence or dark-fiber availability at the park',
    'Actual uncommitted acreage once the 22 acres earmarked for Food & Beverage use are excluded',
    'Floodplain or other environmental constraints specific to this park',
    'Confirmation that Crawford County''s current absence of a data-center moratorium/hostile zoning action remains true going forward, given how quickly Ohio''s statewide moratorium count has moved (138+ municipalities/townships as of Sept. 2026)'
  ],
  'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at the Ohio Crossroads Industrial Center specifically, or anywhere else in Crawford County -- a dedicated search for Crawford County-level data-center zoning action also found no confirmed moratorium or hostile posture, unlike neighboring Richland County.',
  'site',
  'weak', 'weak', 'favorable',
  'favorable', 'SiteOhio-authenticated shovel-ready status with due-diligence studies reportedly already completed, and a direct AEP/CCEEDP partnership on the certification itself -- real, documented precedent for fast industrial-use approval at this specific park.',
  'high', 'Directly owned and marketed by the Crawford County Development Board at a below-market $10,000/acre, with AEP partnering on the shovel-ready certification -- active, general industrial recruitment, though not confirmed as data-center-specific.',
  'unknown', 'No opposition or controversy was found specific to this park, to Bucyrus, or to Crawford County generally regarding data centers -- genuinely no signal either way, not an inference from a quiet market.',
  'unknown', 'No substation-upgrade cost/timeline was found beyond the currently confirmed 2.7MW of excess capacity.'
),
(
  (select id from markets where slug = 'mansfield-oh'),
  'Ashland Business Park (Ford Drive & Wells Road, Ashland, Ashland County)',
  'prospective_data_center_site',
  'A city-owned industrial park at Ford Drive & Wells Road, Ashland (Ashland County), OH, already home to 13 businesses and over 600 daily commuting employees. The Wells Road extension to US-250 opened up 57 developable acres to the north and 51 further undeveloped acres to the south. Recent tenant announcements include Dorm Dudes (10,000 sq ft office, 2026), Crown Jewlz ($4.5M planned investment, 2026), and Meptagon (chip-manufacturing-conduit facility), with the park also adjacent to an existing Amazon facility. FirstEnergy/Ohio Edison completed an $11.6M, 138kV/69kV transmission substation in neighboring Milton Township specifically to support economic growth in the Ashland region, tying in five high-voltage lines. No data-center-specific activity was found for this park by name, address, or combined with the City of Ashland/Ohio Edison/FirstEnergy. Note: Montgomery Township -- directly adjacent to, and per this pass''s own road-level geocoding possibly overlapping, this park''s Wells Road frontage -- unanimously enacted a 2-year moratorium on data centers in June 2026; it was not confirmed either way whether that moratorium''s jurisdiction extends to this specific, separately-zoned, city-owned park.',
  'Ford Drive & Wells Road, Ashland, OH 44805 (Ashland County) -- geocoded to Ford Drive; exact parcel boundary within the park not independently geocoded',
  40.8920119, -82.3393825,
  1600, 'under_study', null, '57 developable acres plus 51 further undeveloped acres (Wells Road extension corridor); 13 existing businesses, 600+ daily employees',
  'reported', '{}', null, null,
  5, 'High-impact type (potential data center site) + 3 reinforcing cited context items, but no disclosed investment figure and a specific-site (not regional) footprint.',
  'A real, actively growing, city-owned industrial park with a genuinely new regional transmission-substation investment and no known data-center interest -- the strongest fundamentals-only candidate found in Ashland County, caveated by its physical proximity to Montgomery Township''s new data-center moratorium.',
  'No confirmed timeline -- the park has been actively developing since at least the Wells Road extension, with multiple 2025-2026 tenant announcements already completed',
  array['13 existing businesses, 600+ daily employees; several 2025-2026 tenant announcements (Dorm Dudes, Crown Jewlz, Meptagon)', 'City purchased additional industrial-park acreage in January 2026 and approved an 18-acre sale to a local manufacturer', 'New $11.6M FirstEnergy 138kV/69kV substation in neighboring Milton Township explicitly built to support Ashland-area economic growth'],
  (select id from sources where url ilike '%ashlandsource.com%wells-road-extension%'),
  array[
    (select id from sources where url = 'https://www.firstenergycorp.com/newsroom/news_articles/construction-underway-on-new-firstenergy-transmission-substation.html'),
    (select id from sources where url ilike '%ashlandsource.com%growth-is-on-the-horizon%'),
    (select id from sources where url ilike '%ashlandsource.com%montgomery-township-approves%'),
    (select id from sources where url ilike '%ashlandsource.com%crown-jewlz%')
  ],
  42,
  '[
    {"key":"power_grid","points":12,"evidence":["FirstEnergy/Ohio Edison territory; a new $11.6M 138kV/69kV transmission substation was built in neighboring Milton Township specifically \"to support economic growth in the Ashland region,\" tying in five high-voltage lines, benefiting Ohio Edison customers in Milton Township, Ashland, and nearby communities"],"unknowns":["No specific MW excess-capacity figure was found for this substation or for the park itself","Substation was reported \"under construction\" in a 2022 article -- current completion status not independently reconfirmed this pass"],"status":"indicated"},
    {"key":"land_expansion","points":7,"evidence":["57 developable acres plus 51 further undeveloped acres opened up by the Wells Road extension to US-250","Park already supports 13 businesses and 600+ daily employees -- real, proven industrial-use precedent"],"unknowns":["Not SiteOhio-certified or otherwise confirmed shovel-ready, unlike the Crawford County candidate above","\"Developable\" vs. \"undeveloped\" acreage distinction suggests grading/infrastructure status differs between the two parcels and was not itemized further"],"status":"indicated"},
    {"key":"fiber_connectivity","points":2,"evidence":[],"unknowns":["No fiber carrier or route information found for this park"],"status":"unknown"},
    {"key":"government_incentives","points":6,"evidence":["City-owned park; City of Ashland purchased additional industrial-park acreage in January 2026 and has approved acreage sales to manufacturers at this park before"],"unknowns":["No data-center-specific incentive program identified"],"status":"verified"},
    {"key":"development_entitlement","points":6,"evidence":["Already zoned industrial with 13 operating businesses and multiple 2025-2026 construction approvals (Dorm Dudes, Crown Jewlz)"],"unknowns":["Montgomery Township, which enacted a 2-year data-center moratorium in June 2026, directly borders and -- per this pass''s own road-level geocoding of Wells Road -- may overlap this park''s location; whether that moratorium''s jurisdiction extends to this specific city-owned, city-zoned park was not confirmed either way"],"status":"indicated"},
    {"key":"physical_environmental_risk","points":4,"evidence":[],"unknowns":["No floodplain or environmental study specific to this park was found"],"status":"unknown"},
    {"key":"water_cooling","points":1,"evidence":[],"unknowns":["No water/sewer capacity figures found for this park"],"status":"unknown"},
    {"key":"transportation_workforce","points":4,"evidence":["Direct access to US-250 via the Wells Road extension, within the I-71 corridor; the Ashland Railway short line (56 miles, interchanges with CSX at Willard) serves the broader region","600+ employees already commuting to the park daily"],"unknowns":["Rail service directly into this specific park, as opposed to the broader Ashland Railway service area, was not confirmed"]}
  ]'::jsonb,
  'Ford Drive & Wells Road, Ashland, OH (Ashland County) -- 57 developable acres plus 51 further undeveloped acres, 13 existing businesses',
  'FirstEnergy/Ohio Edison territory. A new $11.6M, 138kV/69kV transmission substation was completed (construction reported underway in 2022) in neighboring Milton Township specifically to support economic growth in the Ashland region, tying in five high-voltage lines and benefiting Ohio Edison customers in Milton Township, Ashland, and nearby communities. No specific MW excess-capacity figure was found for the park itself, and current substation completion status was not independently reconfirmed this pass.',
  null,
  '57 developable acres plus 51 further undeveloped acres, opened up by the Wells Road extension connecting Ford Drive to US-250. The park already supports 13 businesses and over 600 daily employees, with several 2025-2026 tenant announcements (Dorm Dudes, Crown Jewlz, Meptagon) and is adjacent to an existing Amazon facility. Not SiteOhio-certified or otherwise independently confirmed shovel-ready.',
  'City-owned; the City of Ashland purchased additional industrial-park acreage in January 2026 and has approved acreage sales to manufacturers at this park (e.g., an 18-acre sale) before. No data-center-specific incentive program identified.',
  'Already zoned industrial with a real, active, growing tenant base and multiple recent construction approvals. Genuine unresolved risk: Montgomery Township, which unanimously enacted a 2-year data-center moratorium in June 2026 specifically to study infrastructure/utility/emergency-service/road impacts, directly borders this park''s Wells Road frontage, and this pass''s own road-level geocoding placed a segment of Wells Road inside Montgomery Township itself. Whether the moratorium''s jurisdiction extends to this specific city-owned, city-zoned park was not confirmed either way -- logged as an open question, not assumed to be either clean or disqualifying.',
  'No floodplain, wetlands, or other specific environmental constraint was independently found for this park in available sources.',
  'No specific water/sewer capacity figures were found for this park.',
  null,
  array[
    'Whether Montgomery Township''s 2-year data-center moratorium (enacted June 2026) has any jurisdiction over this specific city-owned, city-zoned park, given the two share a boundary and possibly overlap along Wells Road',
    'A specific MW excess-capacity figure for the new Milton Township FirstEnergy substation, and confirmation of its current completion status',
    'Fiber carrier presence or dark-fiber availability at the park',
    'Water/sewer capacity for a large continuous industrial load',
    'Whether any portion of the 57+51 acres has been independently certified as shovel-ready (e.g., SiteOhio), as opposed to simply "developable"'
  ],
  'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at Ashland Business Park specifically, or anywhere else in the City of Ashland. The one real, nearby data-center-specific signal found this pass -- Montgomery Township''s 2-year moratorium -- is a different, adjacent jurisdiction''s defensive zoning action taken in the absence of any known local proposal, not evidence of a pursuit at this park.',
  'site',
  'moderate', 'moderate', 'moderate',
  'moderate', 'Already zoned industrial with 13 operating businesses and multiple 2025-2026 construction approvals, but not independently confirmed shovel-ready (no SiteOhio or equivalent certification found), unlike the Crawford County candidate above.',
  'high', 'The City of Ashland has actively purchased and sold acreage in this exact park as recently as January 2026, and multiple 2025-2026 tenant announcements show sustained general-industrial recruitment -- though none of it is data-center-specific, and the city''s posture toward a data-center proposal specifically has not been tested.',
  'unknown', 'No opposition or controversy was found specific to this park or to the City of Ashland regarding data centers. Montgomery Township, bordering/possibly overlapping this park, did see enough concern to pass a defensive 2-year moratorium in June 2026 -- a real, nearby, DC-specific signal worth weighing, but not demonstrated evidence of friction at this specific site, so community_friction is left at the honest default rather than inferred from adjacent-jurisdiction action.',
  'unknown', 'The new Milton Township FirstEnergy substation was reported "under construction" in 2022 coverage; current completion status and any specific large-load capacity figure were not independently reconfirmed this pass.'
);
