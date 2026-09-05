-- First real Investment records for Lawrence, KS, seeded against the new
-- `investments` schema (20260905000000_investment_schema.sql). Checked
-- existing shifts/projects/sources for this market directly before
-- writing this (per the documented dedup discipline) -- Beacon Landing,
-- the Iowa St overlay, and the Mass St grant were already real `shifts`
-- rows with real sources; this migration promotes the ones that clear
-- the Investment bar (development-impact capital, not routine activity)
-- into their own investment record and links back to the originating
-- shift/project row rather than duplicating the underlying fact.
-- D&S Land's 177-acre annexation proposal is genuinely new data found
-- this pass (Lawrence's real agenda-PDF host, lawrenceks.civicweb.net,
-- had never actually been queried before -- see project_roq_shift.md) --
-- it gets both a new `shifts` Plans row (a real "what's coming" signal)
-- and its own investment row, since the Planning Commission's 4-3
-- recommendation to deny is itself a real, dated, sourced event even
-- though the underlying annexation's fate isn't resolved yet.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date)
  values
    (
      'Lawrence Journal-World',
      'Plan to annex land west of SLT for housing hits a snag at Planning Commission; KU annexation near airport delayed',
      'news',
      'https://www2.ljworld.com/news/city-government/2026/aug/25/plan-to-annex-land-west-of-slt-for-housing-hits-a-snag-at-planning-commission-ku-annexation-near-airport-delayed/',
      '2026-08-25'
    ),
    (
      'City of Lawrence Planning & Development Services',
      'Planning Commission Agenda -- Aug 24 2026',
      'agency_document',
      'https://lawrenceks.civicweb.net/document/471297/Planning%20Commission%20-%20Aug%2024%202026.pdf?handle=3BD4784DB88A4F219AA8B6AE4271B20C',
      '2026-08-24'
    )
  returning id, url
)
select 1 from new_sources; -- no-op statement just to materialize the CTE's inserts

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, address, source_id)
select
  '068b61e6-d717-483c-9fa7-1e814b98d850',
  'plans',
  'annexation_denial_recommended',
  'Planning Commission recommends denial of 177-acre annexation west of K-10',
  'Planning Commission voted 4-3 to recommend denial of a request to annex ~177 acres at the southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway for a mix of homes and apartments (1,000+ units per reporting). Companion rezoning requests Z-26-0038 (76 ac AG-1 to R-3) and Z-26-0039 (38 ac AG-1 to R-5) were on the same agenda; their individual votes were not independently confirmed by news coverage. Kansas annexation law lets the City Commission override a Planning Commission recommendation, and coverage anticipated exactly that request -- not yet resolved.',
  '2026-08-24',
  'Recommended for denial by Planning Commission (4-3); expected to go to City Commission',
  'high',
  'Southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway, Lawrence, KS',
  (select id from sources where url = 'https://www2.ljworld.com/news/city-government/2026/aug/25/plan-to-annex-land-west-of-slt-for-housing-hits-a-snag-at-planning-commission-ku-annexation-near-airport-delayed/');

insert into investments (
  market_id, project_name, project_description, investment_type, asset_type,
  acreage, address, lat, lng, developer_or_investor, project_status, previous_status,
  announcement_date, approval_date, source_id, confidence_level, last_verified_date,
  development_impact, primary_impact, geographic_scope, geographic_note, why_it_matters, notes
) values
  (
    '068b61e6-d717-483c-9fa7-1e814b98d850',
    'Beacon Landing',
    'Annexation and rezoning of 288 acres west of K-10, south of 6th St/US-40, mostly north of Bob Billings Parkway. Mix of low/medium/high-density residential (70.1/16.9/23.5 acres), 126.7 acres commercial center district, 51 acres open space -- called "probably the largest single annexation request in the last three decades" by the city planner.',
    'private_development',
    'mixed_use',
    288, 'West of K-10, south of 6th St, Lawrence, KS', 38.971550078483, -95.273618892341,
    null, -- developer not named in sourced reporting; Landplan Engineering is the applicant's engineer, not confirmed as developer/owner
    'approved', 'under_review',
    '2026-07-20', '2026-08-18',
    '66188a9e-8a75-4242-867f-ef45be965d14', -- existing source: Lawrence Times, City Commission approval article
    'high', current_date,
    'very_high', array['unlocks_land', 'adds_housing', 'adds_commercial'],
    'growth_area', 'West Lawrence growth corridor along K-10 / Bob Billings Parkway',
    'The largest single annexation in Lawrence in three decades unlocks 288 acres for mixed residential/commercial development west of K-10 -- 111 acres of new residential land plus a 126.7-acre commercial center. Already approved by the City Commission, so this is committed, not speculative. Watch for site plan, plat, and initial building permit filings as the next concrete signals.',
    null
  ),
  (
    '068b61e6-d717-483c-9fa7-1e814b98d850',
    'D & S Land LLC annexation and rezoning (SW of K-10 / Bob Billings)',
    'Proposed annexation of ~177 acres at the southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway for a mix of homes and apartments (1,000+ units per reporting). Companion rezoning requests Z-26-0038 (76 ac AG-1 to R-3) and Z-26-0039 (38 ac AG-1 to R-5) were on the same Aug 24, 2026 Planning Commission agenda.',
    'private_development',
    'residential',
    177, 'Southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway, Lawrence, KS', null, null, -- no confident parcel-level coordinate found this pass; don't reuse Beacon Landing's coordinate, it would misleadingly imply the same site
    'D & S Land LLC (property owner); Landplan Engineering (applicant)',
    'under_review', 'proposed',
    '2026-08-24', null,
    (select id from sources where url = 'https://www2.ljworld.com/news/city-government/2026/aug/25/plan-to-annex-land-west-of-slt-for-housing-hits-a-snag-at-planning-commission-ku-annexation-near-airport-delayed/'),
    'medium', current_date,
    'high', array['unlocks_land', 'adds_housing'],
    'growth_area', 'Southwest of the K-10 / Bob Billings Parkway interchange, immediately adjacent to the Beacon Landing site',
    'A second large annexation proposal (177 acres, reported at 1,000+ potential homes/apartments) in the same west-Lawrence growth corridor as Beacon Landing. The Planning Commission voted 4-3 to recommend denial on Aug 24, 2026, citing conflict with the city''s Plan 2040 comprehensive plan -- but Kansas annexation law lets the City Commission override that recommendation, and coverage anticipated exactly that request. Not yet resolved either way: watch the City Commission agenda before treating this parcel as dead or approved.',
    'Companion rezonings Z-26-0038 and Z-26-0039 were on the same agenda; their individual outcomes were not independently confirmed by news coverage this pass -- see the linked agenda PDF for the raw item text.'
  ),
  (
    '068b61e6-d717-483c-9fa7-1e814b98d850',
    'Massachusetts Street bus stop improvements',
    'Blue Cross and Blue Shield of Kansas "Pathways to a Healthy Kansas" grant for bus stop improvements on the southern portion of Massachusetts St, part of the upcoming Mass St 14th-23rd multimodal reconfiguration. Specific projects not yet detailed by the city.',
    'incentivized_development',
    'grant',
    null, 'Massachusetts St, 14th to 23rd St, Lawrence, KS', 38.951840560453, -95.235826226711,
    null,
    'funded', 'proposed',
    '2026-09-04', null,
    '0272c48f-1700-4d43-8d90-e3f44ab00a89', -- existing source: LJWorld grant article
    'high', current_date,
    'low', array['improves_public_realm', 'improves_transportation'],
    'corridor', 'Massachusetts St, 14th to 23rd St',
    '$50,000 grant funds bus stop improvements as part of a larger planned multimodal reconfiguration of Mass St between 14th and 23rd -- a small, fully-funded piece of a bigger corridor project. On its own this doesn''t unlock land or add capacity; it''s worth tracking mainly as an early marker that the larger Mass St multimodal project is moving toward implementation.',
    null
  ),
  (
    '068b61e6-d717-483c-9fa7-1e814b98d850',
    'Iowa Street mill and overlay (6th St to Harvard Rd)',
    'Asphalt overlay/resurfacing on Iowa St between 6th St and Harvard Rd; one northbound and one southbound lane stayed open throughout construction. Started week of July 20, 2026, expected to wrap the week of Sept 4, 2026.',
    'infrastructure_enabling',
    'road_resurfacing',
    null, 'Iowa St between 6th St and Harvard Rd, Lawrence, KS', 38.951781204545, -95.260400318239,
    null,
    'under_construction', 'approved',
    null, null,
    '4203048b-d048-4a1a-96f1-a50caaffe8fe', -- existing source: Lawrence Times construction-update article
    'medium', current_date,
    'low', array['improves_transportation'],
    'corridor', 'Iowa St, 6th St to Harvard Rd',
    'Routine pavement maintenance on a major north-south arterial, not a capacity expansion -- keeps the corridor functional but doesn''t unlock new development capacity on its own. No public dollar figure was disclosed in the sourced reporting; flagged here mainly for completeness of the Infrastructure record, not because it materially changes buildability nearby.',
    'No total_investment_amount found in sourced reporting -- a real gap, not an omission; a future pass should check the city''s CIP budget document directly for the contract amount.'
  );

-- Supporting (non-primary) source for D&S Land: the raw agenda PDF itself,
-- alongside the LJWorld article already set as its primary source.
insert into investment_sources (investment_id, source_id)
select
  (select id from investments where project_name = 'D & S Land LLC annexation and rezoning (SW of K-10 / Bob Billings)' and market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'),
  (select id from sources where url = 'https://lawrenceks.civicweb.net/document/471297/Planning%20Commission%20-%20Aug%2024%202026.pdf?handle=3BD4784DB88A4F219AA8B6AE4271B20C');

-- Section 13 connectivity: link each investment to the shift/project
-- row(s) that already recorded the same underlying fact, so the same
-- real-world event isn't presented as unrelated duplicate records.
insert into investment_links (investment_id, linked_table, linked_id) values
  (
    (select id from investments where project_name = 'Beacon Landing' and market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'),
    'shifts', 'f5ecda5f-4776-4b8e-a12f-f22b11fe5f44'
  ),
  (
    (select id from investments where project_name = 'Beacon Landing' and market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'),
    'shifts', 'a00e0a00-1804-4dc0-b892-9bf77eaec9d7'
  ),
  (
    (select id from investments where project_name = 'Beacon Landing' and market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'),
    'projects', '29fb6565-e99f-445e-81e8-fc657cfd58c9'
  ),
  (
    (select id from investments where project_name = 'D & S Land LLC annexation and rezoning (SW of K-10 / Bob Billings)' and market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'),
    'shifts', (select id from shifts where market_id = '068b61e6-d717-483c-9fa7-1e814b98d850' and shift_type = 'annexation_denial_recommended')
  ),
  (
    (select id from investments where project_name = 'Massachusetts Street bus stop improvements' and market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'),
    'shifts', '0dfacb07-4198-4abf-98f3-536a849108e9'
  ),
  (
    (select id from investments where project_name = 'Iowa Street mill and overlay (6th St to Harvard Rd)' and market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'),
    'shifts', '4480a4c0-f021-4b4a-b339-70d720a9df02'
  );
