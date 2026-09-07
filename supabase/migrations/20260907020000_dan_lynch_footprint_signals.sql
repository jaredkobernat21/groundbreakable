-- Seeds real, sourced pre-development signals for Dan Lynch's three
-- thinnest tracked markets (Tonganoxie: 3 shifts, Basehor: 7, Bonner
-- Springs: 5 -- vs. Lawrence's 38) so his personalized Opportunities
-- feed and Client Match Score actually have something to match against.
-- Requested by Jared 2026-09-07: "personalize each dashboard with real
-- content/data ... start with Dan Lynch."
--
-- Every fact here is drawn from either (a) the two prior Groundbreakable
-- research engagements already on file for Dan Lynch
-- (research/dan-lynch-site-search/report.md,
-- research/dan-lynch-emerging-area/report.md, both 2026-08-19) or (b) a
-- fresh, re-verified public-record/news search run today specifically to
-- backfill real citable URLs for facts the reports had only summarized
-- by outlet name. Nothing here is fabricated or inferred beyond what a
-- cited source states. Growth-area boundaries are approximate bounding
-- boxes around the cited location (same convention as every existing
-- growth_areas row, e.g. Lawrence's "Downtown / Near-Downtown Core"),
-- not parcel-traced polygons.

-- --- sources ---

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a1000000-0000-4000-8000-000000000001', 'Leavenworth County GIS', 'GIS Mapping Data (parcels, zoning, future land use, sewer/water districts)', 'agency_gis', 'https://www.leavenworthcounty.gov/departments/gis/gis_mapping_data.php', null),
  ('a1000000-0000-4000-8000-000000000002', 'Leavenworth County Planning & Zoning', 'Leavenworth County Comprehensive Plan (Amended 10/23/2024)', 'agency_document', 'https://files.leavenworthcounty.gov/Department/Planning%20&%20Zoning/Document%20Center/Comprehensive%20Plan%20Project/Leavenworth%20County%20Comprehensive%20Plan_Amended_10.23.24_Reduced%20File%20Size.pdf', '2024-10-23'),
  ('a1000000-0000-4000-8000-000000000003', 'Leavenworth County', 'Public Parcel Map Viewer (owner/zoning/FLU lookup by PID)', 'agency_gis', 'https://leavenworthgis.integritygis.com/H5/Index.html?viewer=leavenworth', null),
  ('a1000000-0000-4000-8000-000000000004', 'City of Basehor', '2040 Comprehensive Plan StoryMap', 'agency_document', 'https://storymaps.arcgis.com/stories/b3b56a1df3854c14a2b46e206bf58d31', null),
  ('a1000000-0000-4000-8000-000000000005', 'City of Basehor', 'Bid Posting: Basehor Town Center Multi-Family TIF RFP', 'agency_document', 'https://www.cityofbasehor.org/bids.aspx?bidID=15&PRINT=YES', '2023-11-09'),
  ('a1000000-0000-4000-8000-000000000006', 'City of Basehor', 'Bid Posting: 2302 Southwest Lift Station Project', 'agency_document', 'https://www.cityofbasehor.org/bids.aspx?bidID=11', '2023-05-17'),
  ('a1000000-0000-4000-8000-000000000007', 'Basehor-Linwood School District (USD 458)', 'Bond 2024', 'agency_document', 'https://www.usd458.org/apps/pages/index.jsp?uREC_ID=681005&type=d&pREC_ID=2452292', '2024-04-02'),
  ('a1000000-0000-4000-8000-000000000008', 'City of Tonganoxie', 'City Planning and Zoning', 'agency_document', 'https://www.tonganoxie.org/city-planning-and-zoning', null),
  ('a1000000-0000-4000-8000-000000000009', 'CitizenPortal.ai', 'Tonganoxie Council approves KDHE SRF loan amendment and $6.35 million wastewater contract', 'news', 'https://citizenportal.ai/articles/7009207/Kansas/Leavenworth-County/Tonganoxie-City/Tonganoxie-Council-approves-KDHE-SRF-loan-amendment-and-635-million-wastewater-contract', '2025-11-17'),
  ('a1000000-0000-4000-8000-000000000010', 'Kansas Department of Commerce', 'Governor Kelly Cuts Ribbon on $450M, 100+ Job Hill''s Pet Nutrition Tonganoxie Plant', 'agency_document', 'https://www.kansascommerce.gov/2023/10/governor-kelly-cuts-ribbon-on-450m-100-job-hills-pet-nutrition-tonganoxie-plant/', '2023-10-17'),
  ('a1000000-0000-4000-8000-000000000011', 'Tonganoxie Mirror', 'Tonganoxie officially opens new Stone Creek subdivision', 'news', 'https://www.tonganoxiemirror.com/news/local/2024/nov/20/tonganoxie-officially-opens-new-stone-creek-subdivision/', '2024-11-20'),
  ('a1000000-0000-4000-8000-000000000012', 'City of Bonner Springs', 'Current Development Projects', 'agency_document', 'https://www.bonnersprings.org/1255/Current-Development-Projects', null),
  ('a1000000-0000-4000-8000-000000000013', 'Ingram''s Magazine', 'Bonner Springs Planning Commissioners Approve Rezoning for $539M Destination KCK', 'news', 'https://ingrams.com/article/bonner-springs-approve-rezoning-539m-destination-kck/', '2025-10-14');

-- --- shifts (pre-development signals) ---

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  -- Tonganoxie
  (
    (select id from markets where name = 'Tonganoxie'), 'infrastructure', 'wastewater_capacity_expansion',
    'City council approves $6.35M wastewater treatment contract, doubling plant capacity',
    'KDHE SRF-funded construction contract for wastewater treatment improvements, contingent on final KDHE approvals; bids came in materially above the engineer''s prior estimate. Intended to meet growth and updated permitting requirements.',
    '2025-11-17', 'high', array['developer','investor']::shift_audience[],
    'a1000000-0000-4000-8000-000000000009', now()
  ),
  (
    (select id from markets where name = 'Tonganoxie'), 'business', 'major_employer_announcement',
    'Hill''s Pet Nutrition opens $450M smart factory at Tonganoxie Business Park',
    '365,000 sq ft facility on 80+ acres, 100+ jobs, LEED Gold certified. Increases production capacity for canned pet food and Science Diet/Prescription Diet brands.',
    '2023-10-17', 'high', array['developer','investor']::shift_audience[],
    'a1000000-0000-4000-8000-000000000010', now()
  ),
  (
    (select id from markets where name = 'Tonganoxie'), 'building', 'subdivision_opening',
    'Stone Creek subdivision officially opens (Rausch-Coleman Homes, 145 homes, two phases)',
    'East-side Tonganoxie subdivision; the clearest direct residential-absorption comp found in the market.',
    '2024-11-20', 'medium', array['developer','investor','contractor']::shift_audience[],
    'a1000000-0000-4000-8000-000000000011', now()
  ),
  -- Basehor
  (
    (select id from markets where name = 'Basehor'), 'plans', 'tif_district',
    'City issues RFP for 40-acre Basehor Town Center multifamily tract inside a TIF district',
    'City-owned tract, real estate taxes reimburse developer-agreed infrastructure costs. Site is wooded with abandoned agricultural buildings, recently purchased by the city.',
    '2023-11-09', 'high', array['developer','investor']::shift_audience[],
    'a1000000-0000-4000-8000-000000000005', now()
  ),
  (
    (select id from markets where name = 'Basehor'), 'infrastructure', 'sewer_lift_station',
    'City awards construction contract for 2302 Southwest Lift Station',
    'New force main, gravity pipe, sanitary sewer lift station with precast building, wet well, spare pump for future use, and connection to existing headworks.',
    '2023-05-17', 'medium', array['developer','investor']::shift_audience[],
    'a1000000-0000-4000-8000-000000000006', now()
  ),
  (
    (select id from markets where name = 'Basehor'), 'infrastructure', 'school_bond',
    'USD 458 Bond 2024 passes: new HS classroom wing + Early Learning Center expansion',
    '3-story classroom wing and multipurpose center at Basehor-Linwood High School (construction began Jan 2025, complete ~July 2026) plus additional preschool/childcare classrooms at the Early Learning Center -- a real enrollment-growth signal.',
    '2024-04-02', 'medium', array['developer','investor']::shift_audience[],
    'a1000000-0000-4000-8000-000000000007', now()
  ),
  -- Bonner Springs
  (
    (select id from markets where name = 'Bonner Springs'), 'plans', 'development_agreement',
    'City approves development agreement for Destination KCK -- $539M, 180-acre entertainment district',
    'Mattel-branded resort at 118th St & State Ave (developer EMAP-KC): Hot Wheels coasters, Barbie rooftop restaurant, hotels, retail, a 12-acre lake, STAR bonds district. Adventure Park alone ~$158M. ~1,750 projected jobs. Site clearance permit in process; vertical construction required to begin by Oct 2027. Largest committed project found in any of Dan Lynch''s tracked markets -- not itself an acquisition target (already under signed agreement), but hard evidence of institutional capital moving into this corridor.',
    '2025-10-14', 'high', array['developer','investor','contractor']::shift_audience[],
    'a1000000-0000-4000-8000-000000000013', now()
  );

-- --- growth_areas (corridors) ---

insert into growth_areas (market_id, name, momentum_state, narrative, thesis, catalyst_timeline, geom) values
  (
    (select id from markets where name = 'Basehor'),
    'Basehor NW Growth Corridor',
    'accelerating',
    E'Favorable county Future Land Use designation (Mixed Use / Mixed Residential) on the most explicitly growth-coded land found in the county.\nSewer lift-station investment underway 0.1-0.7 mi away.\nOne parcel already carries a PUD entitlement fragment -- someone has already started the process.\nBasehor reported as Kansas''s 2nd-fastest-growing city and the KC metro''s 3rd-fastest-growing suburb.',
    'Basehor is combining sewer capacity, a TIF-backed multifamily tract, and a passed school bond in the same 2023-2024 window, while remaining one of the fastest-growing cities in Kansas. A 203-acre off-market assemblage immediately NW of city limits sits on the county''s most favorable land-use designation, with one parcel already carrying a PUD entitlement fragment.',
    '[
      {"year":"2023","label":"City awards 2302 Southwest Lift Station construction contract","status":"occurred"},
      {"year":"2023","label":"City issues RFP for 40-acre Basehor Town Center multifamily TIF tract","status":"occurred"},
      {"year":"2024","label":"USD 458 Bond 2024 passes, funding new HS classroom wing + Early Learning Center expansion","status":"occurred"},
      {"year":"2026","label":"Basehor-Linwood HS classroom wing construction expected complete","status":"planned"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-95.005 39.125, -94.985 39.125, -94.985 39.145, -95.005 39.145, -95.005 39.125)))', 4326)
  ),
  (
    (select id from markets where name = 'Tonganoxie'),
    'Tonganoxie US-24/40 East Corridor',
    'emerging',
    E'Hill''s Pet Nutrition''s $450M plant and the newly-opened 145-home Stone Creek subdivision are real, converging demand signals.\nCity is actively investing in wastewater capacity ($6.35M contract, doubling treatment capacity).\nCounty Future Land Use layer designates this corridor Mixed Use.\nConstraint: the strongest available land position sits ~4 miles outside the current sewer-district boundary -- infrastructure-dependent, not shovel-ready.',
    'Tonganoxie just landed a $450M employer and opened a 145-home subdivision, then followed with a wastewater-capacity expansion -- real, converging demand. The catch: the best-positioned land on this corridor sits well outside the current sewer-service radius, making this a longer-dated, infrastructure-dependent play rather than a shovel-ready one.',
    '[
      {"year":"2023","label":"Hill''s Pet Nutrition opens $450M smart factory at Tonganoxie Business Park","status":"occurred"},
      {"year":"2024","label":"Stone Creek subdivision (145 homes, Rausch-Coleman) officially opens","status":"occurred"},
      {"year":"2025","label":"City council approves $6.35M wastewater treatment plant expansion contract","status":"occurred"},
      {"year":"2026","label":"Wastewater expansion under construction; eastern/southeastern service-area extension unconfirmed","status":"planned"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-95.085 39.096, -95.065 39.096, -95.065 39.116, -95.085 39.116, -95.085 39.096)))', 4326)
  ),
  (
    (select id from markets where name = 'Bonner Springs'),
    'Bonner Springs 118th & State Ave Corridor',
    'accelerating',
    E'A $539M, 180-acre entertainment-district development agreement (Destination KCK) was approved at 118th & State Ave.\nSTAR bonds district approved specifically to support the project.\n~1,750 projected jobs.\nLargest single committed project found across any of Dan Lynch''s tracked markets.',
    'Not itself a Dan-fit acquisition -- the 180 acres is already under a signed developer agreement -- but a $539M institutional commitment this size is hard evidence the corridor is repricing, worth watching for second-order land demand (housing, retail, workforce) nearby as the project proceeds toward its required October 2027 construction start.',
    '[
      {"year":"2025","label":"Planning Commission approves rezoning for $539M Destination KCK (180 ac)","status":"occurred"},
      {"year":"2025","label":"City council approves development agreement with EMAP-KC","status":"occurred"},
      {"year":"2026","label":"Site clearance permitting in process","status":"occurred"},
      {"year":"2027","label":"Vertical construction required to begin by October","status":"planned"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-94.878 39.075, -94.852 39.075, -94.852 39.095, -94.878 39.095, -94.878 39.075)))', 4326)
  );

-- --- development_opportunities (3 of the site-search's 5 finalists that
-- fall within a tracked market -- Piper/Knetter (Wyandotte Co.) and
-- Lansing are real, verified findings too but neither market is tracked
-- yet, so they're not seedable as market-scoped rows here) ---

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where name = 'Basehor'),
    'NW Basehor city limits (Fairmount/Stranger Twp), Leavenworth County, KS',
    39.135, -94.995,
    'Multi-Parcel Land Assemblage — Mixed Use FLU', 'high', 'early_project', 'development',
    array['parcel_assemblage','favorable_land_use','nearby_infrastructure','high_momentum'],
    array[
      '203.3 contiguous acres across 3 parcels, verified physically touching via county parcel polygons',
      'County Future Land Use layer designates the area Mixed Use / Mixed Residential -- the most favorable FLU designation found anywhere in the search',
      'One of the three parcels (46.6 ac) is already zoned PUD -- a planned-development entitlement process has already started on part of the assemblage',
      'Sits against Basehor, reported as Kansas''s 2nd-fastest-growing city and the KC metro''s 3rd-fastest-growing suburb'
    ],
    array['a1000000-0000-4000-8000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000002'::uuid, 'a1000000-0000-4000-8000-000000000004'::uuid],
    '2026-08-19'
  ),
  (
    (select id from markets where name = 'Bonner Springs'),
    '17353 142nd St, Bonner Springs, KS 66012 (Leavenworth County side of city limits)',
    39.092, -94.914,
    'In-City 82-Acre Tract — No Annexation Required', 'medium', 'early_project', 'development',
    array['already_annexed','low_flood_risk'],
    array[
      '82.06 acres, single parcel, already inside Bonner Springs city limits -- removes the annexation step every other candidate in the same search carried',
      'Only 0.5% flood overlap, directly verified from county floodplain shapefile',
      'Bonner Springs population grew from 6,896 (2020) to an estimated 7,996 (July 2025), a 3.6% single-year gain',
      'County record links two house photos to this parcel -- likely a teardown/partial-subdivision play around an existing residence, not raw land'
    ],
    array['a1000000-0000-4000-8000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid],
    '2026-08-19'
  ),
  (
    (select id from markets where name = 'Tonganoxie'),
    '00000 State Ave, Tonganoxie, KS (Stranger Township, east/SE of city)',
    39.106, -95.075,
    'US-24/40 Corridor Tract — Infrastructure-Dependent', 'medium', 'early_project', 'development',
    array['favorable_land_use','nearby_employer','infrastructure_gap'],
    array[
      '104.7 acres with county Future Land Use designation Mixed Use, in a city that just landed a $450M employer and opened a 145-home subdivision',
      'Owner mailing address is out-of-town (Merriam, KS) -- often an easier first conversation than an owner-occupant',
      'Real constraint: sits 4.04 miles from the nearest county sewer-district boundary, the largest gap of any candidate in the search -- infrastructure-dependent, not shovel-ready',
      'Tonganoxie is actively investing in wastewater capacity ($6.35M contract, doubling treatment capacity), though no confirmed plan yet to extend toward this specific edge'
    ],
    array['a1000000-0000-4000-8000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000008'::uuid, 'a1000000-0000-4000-8000-000000000009'::uuid],
    '2026-08-19'
  );

-- --- partner_requests: backfill Dan Lynch's real, already-completed
-- client mandate (50-100 acres, KC-KS area, for single-lot subdivision)
-- as a Partner Desk history entry, so his dashboard reflects the actual
-- work already done rather than starting his history at zero.
insert into partner_requests (
  investor_profile_id, request_type, subject_type, subject_label, question, status,
  findings_summary, suggested_next_steps, source_links
) values (
  (select id from investor_profiles where full_name = 'Dan Lynch'),
  'research', 'custom', '50-100 acre KC, KS site search for a client',
  'Client needs 50-100 acres in the KC, KS area that could become single lots for subdivision -- find candidates.',
  'ready',
  'Full 10-candidate shortlist delivered (Groundbreakable_Development_Opportunities_Dan_Lynch_FINAL.pdf). Three finalists fall within Groundbreakable-tracked markets and are now live on the Opportunities feed: the 203-acre Basehor NW assemblage (score 80/100), the 82-acre Bonner Springs in-city tract (68/100), and the 104.7-acre Tonganoxie US-24/40 tract (68/100). Two additional strong finalists (a 214-acre Piper/Wyandotte County family land position and a 135.7-acre Lansing pair) fall outside currently tracked markets and are documented in the source report only.',
  'Confirm current mailing addresses/contact paths for the three in-market finalists before outreach; confirm Basehor''s actual municipal sewer boundary against the NW assemblage; confirm Bonner Springs zoning directly with the city for the in-city tract (county zoning layer doesn''t cover annexed land).',
  array['research/dan-lynch-site-search/report.md', 'research/dan-lynch-site-search/Groundbreakable_Development_Opportunities_Dan_Lynch_FINAL.pdf']
);
