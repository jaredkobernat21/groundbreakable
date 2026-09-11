-- Fills the market gap for Dan Lynch (Jared, 2026-09-07): adds the
-- remaining real markets from his documented footprint that
-- Groundbreakable didn't track yet -- Kansas City, KS (Piper), Lansing,
-- Gardner, Spring Hill (the emerging-area pick), and Perry (where he's
-- currently building, per Jared's texts) -- then seeds each with real,
-- sourced signals. Kansas City KS/Lansing/Gardner/Spring Hill draw on
-- the two prior Dan Lynch research engagements
-- (research/dan-lynch-site-search/report.md,
-- research/dan-lynch-emerging-area/report.md) plus fresh re-verification
-- searches run today to backfill concrete URLs. Perry has no prior
-- Groundbreakable research at all -- everything there is a fresh pass
-- run today.
--
-- One correction caught during that fresh pass worth recording: an
-- AI-search summary initially conflated a "$50M wastewater treatment
-- plant" story with Perry, KS -- that story is actually Perry, GEORGIA.
-- Verified and rejected before writing anything; Perry, KS's real
-- infrastructure signal is a $6.4M USDA loan for sewer/water
-- rehabilitation (a real, smaller, non-fabricated figure, confirmed via
-- koamnewsnow.com). Perry's population is roughly flat per available
-- data, not a growth story -- deliberately not seeding a growth_area
-- for it, unlike the other four markets, rather than manufacture
-- momentum that isn't there.

-- --- markets ---

insert into markets (slug, name, state, center_lat, center_lng, default_zoom) values
  ('kansas-city-ks', 'Kansas City', 'KS', 39.168, -94.856, 13),
  ('lansing-ks', 'Lansing', 'KS', 39.24778, -94.89694, 12),
  ('gardner-ks', 'Gardner', 'KS', 38.81139, -94.92806, 12),
  ('spring-hill-ks', 'Spring Hill', 'KS', 38.74306, -94.82556, 12),
  ('perry-ks', 'Perry', 'KS', 39.07556, -95.39194, 13);

-- --- grant Dan Lynch access + widen his target markets ---

insert into investor_markets (investor_id, market_id)
select (select id from investor_profiles where full_name = 'Dan Lynch'), id
from markets where slug in ('kansas-city-ks', 'lansing-ks', 'gardner-ks', 'spring-hill-ks', 'perry-ks');

update opportunity_profiles
set target_market_ids = target_market_ids || (
  select array_agg(id) from markets where slug in ('kansas-city-ks', 'lansing-ks', 'gardner-ks', 'spring-hill-ks', 'perry-ks')
)
where investor_profile_id = (select id from investor_profiles where full_name = 'Dan Lynch');

-- --- sources ---

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a2000000-0000-4000-8000-000000000001', 'Wyandotte County / Unified Government', 'GISPUB public ArcGIS REST services (parcels, CAMA, zoning)', 'agency_gis', 'https://gisweb.wycokck.org/arcgis/rest/services/GISPUB', null),
  ('a2000000-0000-4000-8000-000000000002', 'Kansas Reflector', 'Kansas City, Kansas, planning commission advances proposed $12.6B data center', 'news', 'https://kansasreflector.com/2025/05/29/kansas-city-kansas-planning-commission-advances-plans-for-12-6b-data-center/', '2025-05-29'),
  ('a2000000-0000-4000-8000-000000000003', 'Kansas Reflector', 'Lawsuit delays $12B data center in Kansas City as community, environmental group voice concerns', 'news', 'https://kansasreflector.com/2025/11/07/lawsuit-delays-12b-data-center-in-kansas-city-as-community-environmental-group-voice-concerns/', '2025-11-07'),
  ('a2000000-0000-4000-8000-000000000004', 'KSHB', 'American Royal ready to expand after Unified Government passes $155 million STAR Bond deal', 'news', 'https://www.kshb.com/news/local-news/american-royal-ready-to-expand-after-unified-government-passes-155-million-star-bond-deal', '2025-04-24'),
  ('a2000000-0000-4000-8000-000000000005', 'FOX4KC', 'Construction resumes on $375M American Royal campus in Kansas', 'news', 'https://fox4kc.com/news/construction-resumes-on-375m-american-royal-campus-in-kansas/', null),
  ('a2000000-0000-4000-8000-000000000006', 'City of Lansing Planning Commission', 'August 2025 Regular Meeting -- Case 2025-DEV-010 rezoning approval', 'agency_document', 'https://mccmeetingspublic.blob.core.usgovcloudapi.net/lansingks-meet-b5fd8168a2b6490f9e8b2c8f806817a0/ITEM-Attachment-001-e212b5913f3241978432aeaa17618f9d.pdf', '2025-08-01'),
  ('a2000000-0000-4000-8000-000000000007', 'City of Lansing', 'Development Plan of the City of Lansing, Kansas -- Riverbend Heights', 'agency_document', 'https://mccmeetingspublic.blob.core.usgovcloudapi.net/lansingks-meet-0a90782241774cc4b745b6bf5c070bcc/ITEM-Attachment-001-a4dcd66cf2aa4181afd4e1e25d3873f4.pdf', null),
  ('a2000000-0000-4000-8000-000000000008', 'Kansas Department of Commerce', 'Reinvestment Housing Incentive District (RHID) program', 'agency_document', 'https://www.kansascommerce.gov/program/community-programs/rhid/', null),
  ('a2000000-0000-4000-8000-000000000009', 'Drexel Technologies Online Planroom / City of Gardner', 'Cedar Niles Lift Station Project bid documents', 'agency_document', 'https://projectbids.drexeltech.com/projects/24/details/cedar-niles-lift-station-project-gardner-ks', null),
  ('a2000000-0000-4000-8000-000000000010', 'City of Gardner', 'Bid Detail T19-R31 (Cedar Niles Lift Station)', 'agency_document', 'https://www.gardnerkansas.gov/bid_detail_T19_R31.php', null),
  ('a2000000-0000-4000-8000-000000000011', 'City of Spring Hill', 'Council Minutes, February 12, 2026 (WWTP SRF financing hearing)', 'agency_document', 'https://www.springhillks.gov/AgendaCenter/ViewFile/Minutes/_02122026-1124', '2026-02-12'),
  ('a2000000-0000-4000-8000-000000000012', 'Kansas Department of Health and Environment', 'Public Notice, February 26, 2026 (Spring Hill WWTP SRF loan)', 'agency_document', 'https://www.kdhe.ks.gov/DocumentCenter/View/56696/Public-Notice-02-26-2026-PDF', '2026-02-26'),
  ('a2000000-0000-4000-8000-000000000013', 'Kansas Department of Transportation', '"Connect56" I-35/US-56/175th St Interchange Improvements study', 'agency_document', 'https://www.ksdot.gov/projects/northeast-kansas-projects/gardner-i-35-u-s-56-interchange-improvements', null),
  ('a2000000-0000-4000-8000-000000000014', 'Johnson County Post', 'Spring Hill development 2026 outlook (199th St extension, data-center bid withdrawal)', 'news', 'https://johnsoncountypost.com/2026/02/03/spring-hill-development-2026-278986/', '2026-02-03'),
  ('a2000000-0000-4000-8000-000000000015', 'KOAM News Now', 'USDA loans issued to help improve Kansas rural water systems (incl. Perry)', 'news', 'https://www.koamnewsnow.com/news/kansas-news/usda-loans-issued-to-help-improve-kansas-rural-water-systems/article_5c6a58d6-45c5-11ee-8f02-7faa3fdc44d8.html', null),
  ('a2000000-0000-4000-8000-000000000016', 'Coldwell Banker (MLS)', 'Brown Subdivision, Perry, KS -- Lot 13, 2nd Street (MLS# 2634942)', 'other', 'https://www.coldwellbanker.com/ks/perry/2nd-st-lot-13/lid-P00800000HF7x8nyTeFRQ7KoFXHmXrcur1VA7UJ4', null);

-- --- shifts ---

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  -- Kansas City, KS (Piper)
  (
    (select id from markets where slug = 'kansas-city-ks'), 'plans', 'data_center_rezoning',
    'Planning commission advances rezoning for proposed $12.6B, 600MW Redwolf DCD data center campus',
    '400 acres, six buildings totaling 1.8M sq ft, two on-site substations, bisected by Parallel Parkway near Kansas Speedway. Would be the largest single project in Wyandotte County history if completed.',
    '2025-05-29', 'high', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'), 'plans', 'contested_entitlement',
    'Lawsuit delays $12B Redwolf DCD data center after a failed zoning vote',
    'Community/environmental group litigation filed after a July 2025 zoning vote failed; north-side rezoning remains stalled by a protest petition as of Nov 2025. Worth tracking as an entitlement-risk precedent for this corridor, not just a growth signal.',
    '2025-11-07', 'medium', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000003', now()
  ),
  (
    (select id from markets where slug = 'kansas-city-ks'), 'business', 'institutional_relocation',
    'Unified Government approves $155M STAR Bond for $375M American Royal campus relocation',
    'American Royal relocating from the West Bottoms to Kansas Speedway-adjacent land (State Ave & 118th St), financed with $250M in Industrial Revenue Bonds plus the $155M STAR Bond. Main campus set to open Sept. 2026 after delays; full buildout by 2029.',
    '2025-04-24', 'high', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000004', now()
  ),
  -- Lansing
  (
    (select id from markets where slug = 'lansing-ks'), 'plans', 'recent_rezoning',
    'Planning Commission approves Case 2025-DEV-010: 112.8-acre rezoning enabling ~103 residential lots',
    'A concrete, recent precedent for rezoning a comparable-scale agricultural tract to several hundred residential lots -- directly relevant to any similar-scale acquisition in Lansing.',
    '2025-08-01', 'high', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000006', now()
  ),
  (
    (select id from markets where slug = 'lansing-ks'), 'plans', 'incentive_district',
    'Riverbend Heights proposed as a Reinvestment Housing Incentive District (RHID)',
    'Developer (Ad Astra Lansing Development, LLC) requesting a 20-year tax increment to reimburse an estimated $27M in infrastructure costs. Real community pushback on record (Change.org petition) over delayed city/school tax revenue -- a genuine entitlement-risk signal alongside the growth signal.',
    '2025-08-01', 'medium', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000007', now()
  ),
  -- Gardner
  (
    (select id from markets where slug = 'gardner-ks'), 'infrastructure', 'sewer_capacity_expansion',
    'Cedar Niles Lift Station + Gravity Sewer project funded ($8.6M, 2024-2027)',
    'City bid documents state the project exists to "create new space for residential and commercial development" -- Gardner has the highest projected population growth rate in Johnson County through 2030 and current wastewater capacity is near 90%.',
    '2024-01-01', 'high', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000009', now()
  ),
  (
    (select id from markets where slug = 'gardner-ks'), 'infrastructure', 'road_extension',
    '199th St extension (Ridgeview Rd to Renner Rd) construction begins',
    'Physically extends a road toward the Cedar Niles/Renner corridor at the same time KDOT is studying the I-35/US-56/175th St interchange that would serve it.',
    '2025-12-01', 'medium', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000014', now()
  ),
  (
    (select id from markets where slug = 'gardner-ks'), 'distress', 'entitlement_withdrawn',
    '316-acre data-center land assembly (Bullock Capital/Colossus Advisors) annexed then withdrawn',
    'Annexed Dec 2025 after community opposition, then withdrawn March 2026 with no end user ever named -- sophisticated land-scouting capital already tried to assemble a large parcel in this exact band and failed, which is itself a signal worth knowing.',
    '2026-03-01', 'medium', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000014', now()
  ),
  -- Spring Hill
  (
    (select id from markets where slug = 'spring-hill-ks'), 'infrastructure', 'wastewater_capacity_expansion',
    'New Spring Hill wastewater treatment plant funding advances (SRF hearings Feb 2026)',
    'Initial capacity 5 MGD, expandable to 30 MGD vs. today''s ~0.13 MGD plant -- a 38x-230x capacity multiplier. Public SRF financing hearings held Feb 12 and Feb 26, 2026.',
    '2026-02-26', 'high', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000012', now()
  ),
  (
    (select id from markets where slug = 'spring-hill-ks'), 'infrastructure', 'interchange_study',
    'KDOT "Connect56" I-35/US-56/175th St interchange study underway',
    'Explicitly framed around "anticipated growth" -- studying the interchange that would serve the Cedar Niles/Renner corridor shared with neighboring Gardner.',
    '2025-01-01', 'medium', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000013', now()
  ),
  -- Perry
  (
    (select id from markets where slug = 'perry-ks'), 'infrastructure', 'water_sewer_rehabilitation',
    'USDA approves $6.4M loan for Perry water/wastewater system rehabilitation',
    'Rehabilitates ~24,000 linear feet of the collection system, upgrades ~15,000 feet of lines/equipment, repairs lift stations, installs backup generators. Note: this reads as aging-infrastructure replacement, not growth-driven capacity expansion -- Perry''s population has been roughly flat in available data, unlike the growth-anticipation framing seen in Gardner/Spring Hill''s utility investments.',
    '2023-08-15', 'medium', array['developer','investor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000015', now()
  ),
  (
    (select id from markets where slug = 'perry-ks'), 'building', 'active_subdivision_lots',
    'Brown Subdivision: 5 residential lots actively listed on 2nd Street',
    'Dan Lynch''s own current Perry build project (per Jared, 2026-09). Walking distance to middle/high schools, minutes from Perry Lake, convenient to both Lawrence and Topeka.',
    '2026-01-01', 'low', array['developer','contractor']::shift_audience[],
    'a2000000-0000-4000-8000-000000000016', now()
  );

-- --- growth_areas (corridors) -- Perry deliberately excluded: the real
-- data there (flat population, infrastructure rehab not expansion)
-- doesn't support a momentum story. ---

insert into growth_areas (market_id, name, momentum_state, narrative, thesis, catalyst_timeline, geom) values
  (
    (select id from markets where slug = 'kansas-city-ks'),
    'Piper / Parallel Parkway Corridor',
    'accelerating',
    E'A single extended family (Knetter) holds 1,668+ acres across three contiguous blocks directly in this corridor''s path.\nA proposed $12.6B/600MW data center campus sits about a mile away (contested, litigation pending).\nThe $375M American Royal relocation (STAR-bond backed) is under construction nearby.\nUtility infrastructure (Piper Creek sewer, BPU water/electric) has been built specifically to serve growth here.',
    'This is the single strongest off-market land story found in Dan Lynch''s footprint: a quietly-held, multi-generational family land position sitting directly in the path of the hottest active development corridor in the KC metro -- a $12B data-center proposal, a $375M institutional relocation, and utility capacity already built ahead of demand, none of it reflected in any public listing.',
    '[
      {"year":"2025","label":"Planning commission advances rezoning for $12.6B Redwolf DCD data center","status":"occurred"},
      {"year":"2025","label":"Unified Government approves $155M STAR Bond for $375M American Royal campus","status":"occurred"},
      {"year":"2025","label":"Lawsuit delays Redwolf DCD data center after failed zoning vote","status":"occurred"},
      {"year":"2026","label":"American Royal main campus set to open (Sept.), after delays","status":"planned"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-94.868 39.158, -94.844 39.158, -94.844 39.178, -94.868 39.178, -94.868 39.158)))', 4326)
  ),
  (
    (select id from markets where slug = 'lansing-ks'),
    'Lansing SW Edge Corridor',
    'accelerating',
    E'City approved a 112.8-acre rezoning to ~103 residential lots in the last 18 months (Case 2025-DEV-010).\nRiverbend Heights (146 ac) is moving through a Reinvestment Housing Incentive District process, with a real annexation ordinance attached.\nBoth signal the city''s active willingness to entitle large-scale residential conversion at its edges.',
    'Lansing has proven twice in 18 months that it will approve large-scale ag-to-residential conversion at its city edge. Land near existing sewer/water infrastructure here carries a real, recent precedent rather than a hopeful one -- though the RHID''s 20-year tax-increment structure is drawing real community pushback worth tracking as a risk, not just a growth signal.',
    '[
      {"year":"2025","label":"Case 2025-DEV-010 approved: 112.8 ac rezoned for ~103 residential lots","status":"occurred"},
      {"year":"2025","label":"Riverbend Heights RHID proposed (146 ac, $27M infrastructure reimbursement)","status":"occurred"},
      {"year":"2025","label":"Community petition against the RHID structure surfaces","status":"occurred"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-94.908 39.173, -94.888 39.173, -94.888 39.193, -94.908 39.193, -94.908 39.173)))', 4326)
  ),
  (
    (select id from markets where slug = 'gardner-ks'),
    'Gardner Cedar Niles / I-35 Growth Corridor',
    'accelerating',
    E'City-funded sewer expansion sized explicitly to "create new space for residential and commercial development."\nKDOT is actively studying the I-35/US-56/175th St interchange that would serve this corridor.\nA 199th St road extension is physically reaching toward it.\nA sophisticated 316-acre data-center land assembly already tried (and failed) to assemble land in this exact band.',
    'Gardner is over-building sewer capacity, KDOT is studying the interchange that would serve it, and a road is being physically extended toward the corridor -- all in bid packages and council minutes, none of it framed publicly as a real-estate story yet. Sophisticated capital already tried and failed to assemble land here, which reads as early positioning, not a dead end.',
    '[
      {"year":"2024","label":"Cedar Niles Lift Station + Gravity Sewer funded ($8.6M)","status":"occurred"},
      {"year":"2025","label":"KDOT Connect56 interchange study begins","status":"occurred"},
      {"year":"2025","label":"316-ac data-center land assembly annexed nearby","status":"occurred"},
      {"year":"2025","label":"199th St extension (Ridgeview to Renner) construction begins","status":"occurred"},
      {"year":"2026","label":"Data-center land assembly withdrawn after community opposition","status":"occurred"},
      {"year":"2027","label":"Cedar Niles sewer project funding window closes","status":"planned"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-94.885 38.815, -94.855 38.815, -94.855 38.845, -94.885 38.845, -94.885 38.815)))', 4326)
  ),
  (
    (select id from markets where slug = 'spring-hill-ks'),
    'Spring Hill Renner Rd Growth Corridor',
    'emerging',
    E'A new wastewater treatment plant is funded at up to 230x current capacity -- explicit, extreme over-building relative to today''s demand.\nShares the same KDOT interchange study and 199th St extension as neighboring Gardner''s Cedar Niles corridor.\nSRF financing hearings held Feb 2026 -- genuinely fresh, not yet a public real-estate story.',
    'Spring Hill''s new plant is sized for 38-230x its current capacity -- one of the more extreme infrastructure-ahead-of-demand signals found anywhere in Dan Lynch''s footprint. Paired with Gardner''s parallel sewer/road/interchange investment one town over, this reads as two separately-governed cities preparing the same corridor simultaneously.',
    '[
      {"year":"2026","label":"Spring Hill WWTP SRF financing hearings held (Feb 12, Feb 26)","status":"occurred"},
      {"year":"2026","label":"KDHE public notice issued for SRF loan","status":"occurred"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-94.842 38.763, -94.818 38.763, -94.818 38.783, -94.842 38.783, -94.842 38.763)))', 4326)
  );

-- --- development_opportunities ---

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'kansas-city-ks'),
    'Piper community (far-NW Kansas City, KS), Parallel Parkway corridor, Wyandotte County',
    39.168, -94.856,
    'Family Land Position — 1,668+ Acre Off-Market Holding', 'high', 'early_project', 'development',
    array['parcel_assemblage','high_momentum','nearby_infrastructure'],
    array[
      '214.2 contiguous acres across 3 parcels verified by parcel-polygon geometry -- part of a much larger 1,668.6-acre Knetter-family holding across 31 parcels in three separate contiguous blocks countywide',
      'Sits within about a mile of both the proposed $12.6B Redwolf DCD data center campus and the $375M American Royal relocation',
      'Utility infrastructure has been built specifically to serve "rapid surrounding community development" in this corridor',
      'Zoned AG (rezoning required); currently active farmland with no listing or broker -- invisible to a conventional land search'
    ],
    array['a2000000-0000-4000-8000-000000000001'::uuid, 'a2000000-0000-4000-8000-000000000002'::uuid, 'a2000000-0000-4000-8000-000000000004'::uuid],
    '2026-08-19'
  ),
  (
    (select id from markets where slug = 'lansing-ks'),
    'Delaware Township, Leavenworth County, immediately SW of Lansing city limits',
    39.183, -94.898,
    'Family Land Assemblage — Zoning Precedent Nearby', 'high', 'early_project', 'development',
    array['favorable_land_use','recent_rezoning_precedent','nearby_infrastructure'],
    array[
      '135.7 contiguous acres across 2 parcels, single-family ownership across both -- a clean acquisition conversation, not a multi-owner assemblage',
      'City approved a comparable-scale 112.8-acre rezoning to ~103 residential lots in 2025 (Case 2025-DEV-010) -- a concrete, recent precedent',
      'Among the closest-to-service candidates found in the county: roughly a quarter mile from both city limits and the nearest sewer-district boundary',
      'County Future Land Use layer designates both parcels Mixed Residential'
    ],
    array['a1000000-0000-4000-8000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid, 'a2000000-0000-4000-8000-000000000006'::uuid],
    '2026-08-19'
  );
