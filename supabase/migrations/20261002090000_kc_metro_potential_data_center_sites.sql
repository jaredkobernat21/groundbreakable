-- Kansas City metro "Potential Data Center Site" pass (2026-10-02). Per the
-- strict rule (actively search before classifying -- city/county/utility/
-- parcel/landowner/nearby industrial park/econ-dev org/relevant companies,
-- against data center/datacenter/hyperscale/AI campus/compute campus/cloud
-- campus/server farm/digital infrastructure/rezoning/permit/utility
-- request/land acquisition), 7 existing `infrastructure_project` rows with
-- status 'rumored' were evaluated as conversion candidates. Only 3
-- genuinely cleared the bar -- no known data-center activity at THAT
-- SPECIFIC site. The other 4 are left untouched, each for a real,
-- evidence-based reason (see below). No new INSERTs in this migration --
-- every other area checked in the broader metro (both KS and MO sides)
-- turned out to already have real, named, active pursuits, confirming the
-- "quality over quantity" instruction: a handful of real conversions beats
-- forcing new speculative pins into an already-saturated metro.
--
-- CONVERTED to catalyst_type = 'prospective_data_center_site' (status
-- 'under_study'):
--   1. Eisenhower Road Business Park Corridor (Leavenworth, KS) -- an
--      established, shovel-ready public-private industrial park. Search
--      confirms Leavenworth COUNTY has real DC activity (Project
--      Bluestem/Cloverleaf Infrastructure, already logged separately in
--      Tonganoxie, 10+ miles away) but nothing specific to this site.
--   2. Bonner Springs Industrial Park (Bonner Springs, KS) -- a real,
--      established 265-acre park, flood-safe, flat. Search surfaced the
--      $12.6B "Project Red Wolf" site ~3-4 miles away near the Kansas
--      Speedway (already logged separately) -- a different utility
--      service area (BPU, not Evergy) and a different specific site, not
--      evidence of activity at this park.
--   3. K-7 / McIntyre Road Industrial Rezoning (Lansing, KS) -- a real,
--      completed 85.484-acre A-1-to-I-1 rezoning (unanimous 8-0 council
--      vote) with no named end user. No DC-specific search hits for this
--      site at all.
--
-- LEFT UNCONVERTED, with reasons (none of these are touched by this
-- migration):
--   - "Lenexa South Lake Campus Data Center Corridor (Lakeview Avenue)" --
--     its own description already names operating data centers (Prime
--     Data Centers, DataBank) at this exact address, which is also
--     already logged separately as the Planned/operating "DataBank South
--     Lake Campus" row. This is real, confirmed activity, not an
--     activity-free site -- converting it to Potential would be wrong.
--     Likely a stale/redundant corridor-level duplicate of that Planned
--     row; flagged here rather than deleted, since deleting wasn't asked for.
--   - "Overland Park College Boulevard Telecom & Data Center Corridor" --
--     same issue: its own description names QTS's own operating
--     headquarters/founding facility at this address, already logged
--     separately as the Planned/operating "QTS Overland Park 1 (DC1)" row.
--   - "Olathe K-10/I-35 Industrial Corridor (Cedar Creek, Corporate Ridge,
--     College West)" -- search confirmed real, under-construction data
--     centers specifically in the Cedar Creek area of northwest Olathe
--     (Oppidan/T5, approved 2024), one of this row's own three named
--     sub-parks, and Cedar Creek already has its own separate Planned-
--     adjacent "Cedar Creek 62.5-Acre Rezoning" row logged. Converting the
--     whole bundled corridor would misrepresent a site with confirmed
--     activity as activity-free. (Corporate Ridge and College West
--     specifically might still be clean Potential candidates on their
--     own -- not split out here since the existing row bundles all three;
--     worth a future narrower pass if wanted.)
--   - "Spring Hill US-169/Webster Street Industrial Growth Corridor" --
--     search surfaced a real, named prior data-center rezoning attempt in
--     Spring Hill itself (316 acres near 191st & Renner Rd, R-R to M-1,
--     later withdrawn by the developer) plus documented resident concern
--     explicitly framed around "industrial/data-center-scale uses" near
--     this corridor. Too much real, DC-specific history in the same
--     jurisdiction for the "zero known activity" bar to cleanly apply,
--     even though the withdrawn project was a different specific parcel.
--
-- Also checked and explicitly excluded from any new INSERT, because real
-- activity was found: Edgerton/BNSF Logistics Park, KS (DAMAC Digital's
-- $860M data center conversion -- denied, now in active litigation over a
-- citizen-petition ban; far too active to be Potential). No new MO-side
-- market was added -- Clay County, MO alone already hosts Google's
-- ~$10B/700MW "Project Mica," Meta's operating $1B Northland facility, and
-- Metrobloks Liberty ($1.4B); neighboring Platte County is independently
-- scored "high risk" for DC proximity by third-party trackers. The
-- Missouri side of this metro is already deep in Possible/Planned
-- territory, not a gap worth populating with Potential pins.
--
-- Scoring: potential_score_components use the standard 8-factor weights
-- (power_grid 30 / land_expansion 15 / fiber_connectivity 15 /
-- government_incentives 10 / development_entitlement 10 /
-- physical_environmental_risk 10 / water_cooling 5 / transportation_workforce 5).
-- All three sites score in the moderate 55-60 range -- real, documented
-- land/entitlement/transportation fundamentals, but fiber and water/sewer
-- capacity are genuine unknowns at this research depth (logged in
-- unknowns_to_verify, not guessed). signal_categories/signal_confidence/
-- power_load_mw are left as-is (empty/null) -- those are the Possible-tier
-- fields, not Potential's.
--
-- Sourcing (added on review -- the first draft of this migration left
-- every claim implicitly attached to whatever source_id each row already
-- had, which under-cited genuinely new claims added during this pass).
-- Each of the 3 rows already had a real, on-point source from an earlier
-- session (Leavenworth's own Business & Technology Park page; Bonner
-- Springs' own Industrial Park page; CitizenPortal.ai's coverage of the
-- Lansing rezoning vote) -- all three were re-verified this pass via fresh
-- search rather than assumed, and all three are kept as each row's primary
-- source_id. Two NEW sources below cover claims added during THIS pass
-- that weren't covered by those originals:
--   - Kansas Reflector's coverage of the state's large-load utility rules
--     is the real citation behind "Evergy large-load tariff, 75MW+
--     facilities" -- repeated on all three rows, but never actually
--     sourced by any of the three rows' original citations (those are
--     city economic-development pages, not utility-regulation coverage).
--   - fox4kc's coverage of the Wyandotte County rezoning is the real
--     citation behind Bonner Springs' "$12.6B Project Red Wolf, ~3-4 miles
--     away" claim -- confirmed this pass to actually BE Project Red Wolf
--     DCD Properties (550 acres, 600MW, west of the Kansas Speedway), not
--     a different, unnamed project as initially drafted more cautiously.
-- The $9.7M Leavenworth figure and the 85.484-acre/8-0-vote Lansing
-- figures were independently re-confirmed this pass as actually appearing
-- on each row's existing primary source -- no new citation needed for
-- those specific numbers.

insert into sources (agency, title, source_type, url, published_date) values
  ('Kansas Reflector', 'New Kansas rules set guidelines for data centers, big power users to protect smaller customers', 'news',
   'https://kansasreflector.com/2025/11/06/new-kansas-rules-set-guidelines-for-data-centers-big-power-users-to-protect-smaller-customers/', '2025-11-06'),
  ('FOX4KC', 'KCK planning commission to consider $12.6B data center near Kansas Speedway', 'news',
   'https://fox4kc.com/news/kck-planning-commission-to-consider-12-6b-data-center-near-kansas-speedway/', null);

update catalysts set
  catalyst_type = 'prospective_data_center_site',
  status = 'under_study',
  potential_score = 59,
  potential_score_components = '[
    {"key":"power_grid","points":18,"evidence":["Evergy Kansas Central territory, large-load power-service rate plan approved for facilities over 75MW","~20-25 miles from confirmed/forming data-center campuses in De Soto, Gardner, and Tonganoxie on the same utility system"],"unknowns":["No confirmed substation or interconnection study specific to this site"]},
    {"key":"land_expansion","points":10,"evidence":["80-acre Business and Technology Park plus the adjacent Gary Carlson Business Center (3 shovel-ready sites)","Shovel-ready: grading, storm water detention, internal road, sidewalks/trails, lighting, utilities already in place"],"unknowns":["Combined acreage across both parks is on the smaller side for a single hyperscale campus footprint"]},
    {"key":"fiber_connectivity","points":3,"evidence":[],"unknowns":["No fiber carrier or long-haul route information found for this specific park"]},
    {"key":"government_incentives","points":8,"evidence":["$9.7M joint City of Leavenworth / Leavenworth County investment via countywide economic-development sales tax","Actively marketed by the Leavenworth County Development Corporation"],"unknowns":[]},
    {"key":"development_entitlement","points":7,"evidence":["Park opened 2018 and has operated successfully since -- an established precedent for industrial entitlement in this corridor"],"unknowns":[]},
    {"key":"physical_environmental_risk","points":6,"evidence":[],"unknowns":["No specific floodplain/environmental study found for this site"]},
    {"key":"water_cooling","points":2,"evidence":["Utilities described as already in place for the shovel-ready sites"],"unknowns":["No specific water/sewer capacity figures found"]},
    {"key":"transportation_workforce","points":5,"evidence":["Marketed with access to six major interstates and a 687,000+ worker regional labor basin"],"unknowns":[]}
  ]'::jsonb,
  opportunity_area = 'Leavenworth Business and Technology Park (80 acres) and the adjacent Gary Carlson Business Center (3 shovel-ready sites), Eisenhower Rd & 14th St, Leavenworth, KS',
  power_notes = 'Entire city is in Evergy Kansas Central territory, the utility Kansas regulators approved for a large-load power-service rate plan covering facilities over 75MW -- the same system already serving confirmed/forming data-center campuses in De Soto, Gardner, and Tonganoxie. No confirmed substation capacity study specific to this park has been found.',
  fiber_notes = null,
  land_notes = 'Two adjacent shovel-ready industrial parks totaling roughly 80-161 acres: the city/county Business and Technology Park (opened 2018, $9.7M joint investment) and the Gary Carlson Business Center (3 shovel-ready sites). Grading, storm water detention, internal roads, sidewalks, lighting, and utilities already in place.',
  incentives_notes = 'Developed and actively marketed via a joint City of Leavenworth / Leavenworth County economic-development sales-tax investment ($9.7M); Leavenworth County Development Corporation markets the corridor directly to prospective industrial users.',
  development_environment_notes = 'Successfully opened and operating since 2018 -- an established precedent for industrial-use entitlement in this corridor, marketed for manufacturing/light industrial uses generally, not data centers specifically.',
  risk_notes = 'No specific floodplain, wetlands, or other environmental constraint identified for this site in available sources -- not confirmed clean, just not flagged.',
  unknowns_to_verify = array[
    'Confirmed substation capacity/interconnection study specific to this site, as opposed to territory-wide large-load tariff eligibility',
    'Fiber carrier presence or dark-fiber availability at the park',
    'Water/sewer capacity figures for a large continuous industrial load',
    'Current availability status of remaining shovel-ready acreage at both parks'
  ],
  why_still_potential = 'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at the Eisenhower Road Business and Technology Park or Gary Carlson Business Center specifically. Leavenworth County''s one confirmed data-center pursuit ("Project Bluestem," Cloverleaf Infrastructure) is a separate, already-logged site in Tonganoxie, roughly 10+ miles away.',
  power_pillar_label = 'moderate',
  site_pillar_label = 'moderate',
  approval_pillar_label = 'favorable',
  entitlement_velocity = 'favorable',
  entitlement_velocity_notes = 'Park opened in 2018 following successful joint city/county investment and has operated without reported issue since -- real precedent for industrial-use approval in this corridor.',
  city_receptiveness = 'high',
  city_receptiveness_notes = 'Direct $9.7M public investment plus active marketing by the Leavenworth County Development Corporation specifically for this use case.',
  community_friction = 'unknown',
  community_friction_notes = 'No opposition or controversy found specific to this park. (Leavenworth County farmers have raised concerns about a different, already-logged data-center proposal in Tonganoxie -- not this site.)',
  utility_timeline = 'unknown',
  utility_timeline_notes = null,
  related_context = array[
    'Opened 2018 via $9.7M joint City of Leavenworth / Leavenworth County investment',
    'Evergy Kansas Central large-load tariff territory (75MW+ facilities)',
    '~20-25 miles from confirmed De Soto/Gardner/Tonganoxie data-center activity'
  ],
  catalyst_score = 5,
  reason_for_catalyst_classification = 'High-impact type (potential data center site) + 3 reinforcing cited context items, but no disclosed investment figure and a specific-site (not regional) footprint.',
  source_id = (select id from sources where url = 'https://www.leavenworthks.gov/ed/page/business-and-technology-park'),
  additional_source_ids = array[(select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%')],
  last_verified_at = now()
where title = 'Eisenhower Road Business Park Corridor';

update catalysts set
  catalyst_type = 'prospective_data_center_site',
  status = 'under_study',
  potential_score = 58,
  potential_score_components = '[
    {"key":"power_grid","points":16,"evidence":["Evergy large-load power-service rate plan territory (75MW+ facilities)","Distinct from BPU (Board of Public Utilities), which serves the nearby, already-strained Kansas Speedway/Wyandotte County corridor"],"unknowns":["No confirmed substation capacity study specific to this park"]},
    {"key":"land_expansion","points":11,"evidence":["~265-acre established industrial park, flat topography, entirely above the 100-year floodplain"],"unknowns":["20+ existing businesses already occupy part of the park -- true vacant contiguous acreage not confirmed"]},
    {"key":"fiber_connectivity","points":3,"evidence":[],"unknowns":["No fiber carrier or route information found"]},
    {"key":"government_incentives","points":6,"evidence":["Actively marketed by the city for industrial use, highlighting K-7 highway access"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":7,"evidence":["Established light-industrial zoning already in place; 20+ existing businesses operating there is a real precedent"],"unknowns":[]},
    {"key":"physical_environmental_risk","points":9,"evidence":["Explicitly documented as sited entirely above the 100-year floodplain, on flat topography"],"unknowns":[]},
    {"key":"water_cooling","points":2,"evidence":[],"unknowns":["No specific water/sewer capacity figures found"]},
    {"key":"transportation_workforce","points":4,"evidence":["Marketed with convenient access to K-7 Highway and the interstate system"],"unknowns":[]}
  ]'::jsonb,
  opportunity_area = 'Bonner Springs Industrial Park, east of K-7 Highway and north of 43rd Street, Bonner Springs, KS',
  power_notes = 'Served by Evergy (large-load power-service tariff territory, 75MW+), the same utility system already serving confirmed/forming data-center campuses in De Soto, Gardner, and Tonganoxie. This is a distinct utility service area from BPU, which serves the already-committed, grid-strained Kansas Speedway corridor ~3-4 miles away ("Project Red Wolf," 600MW, already logged separately) -- proximity to that pursuit does not mean shared grid constraints.',
  fiber_notes = null,
  land_notes = '~265 contiguous acres, flat topography, light industrial zoning, home to 20+ existing businesses. Entirely above the 100-year floodplain per city marketing materials.',
  incentives_notes = 'Actively marketed by the city for industrial use with emphasis on K-7 highway access; no data-center-specific incentive program identified.',
  development_environment_notes = 'Established light-industrial park with 20+ operating businesses -- a real, proven entitlement precedent for similar industrial uses in this location. Distinct from the separately-logged Compass 70 Logistics Park (Scannell Properties) in the same market.',
  risk_notes = 'Explicitly documented by the city as sited entirely above the 100-year floodplain on flat topography -- a real, favorable environmental risk profile.',
  unknowns_to_verify = array[
    'How much of the ~265 acres remains vacant/available versus already occupied by the 20+ existing businesses',
    'Confirmed Evergy substation capacity or interconnection timeline for a large continuous load at this specific site',
    'Fiber carrier presence',
    'Whether any portion of this park falls within BPU rather than Evergy service territory, given Bonner Springs spans Wyandotte, Leavenworth, and Johnson counties'
  ],
  why_still_potential = 'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at the Bonner Springs Industrial Park specifically. A separate, much larger pursuit ($12.6B, 600MW "Project Red Wolf") is already logged roughly 3-4 miles away near the Kansas Speedway, in a different utility service area (BPU, not Evergy) -- proximity to that pursuit is not evidence of activity at this site.',
  power_pillar_label = 'moderate',
  site_pillar_label = 'strong',
  approval_pillar_label = 'favorable',
  entitlement_velocity = 'favorable',
  entitlement_velocity_notes = 'Established light-industrial zoning with 20+ operating businesses already in place -- real precedent for similar-use approvals.',
  city_receptiveness = 'moderate',
  city_receptiveness_notes = 'General industrial marketing by the city highlighting highway access; no evidence of active data-center-specific recruitment found.',
  community_friction = 'unknown',
  community_friction_notes = 'No opposition or controversy found specific to this park. Other Kansas communities (e.g. Edgerton) have seen real data-center opposition and litigation, but nothing documented here.',
  utility_timeline = 'unknown',
  utility_timeline_notes = null,
  related_context = array[
    '~265 contiguous acres, flat, entirely above the 100-year floodplain',
    '20+ existing businesses already operating in the park',
    'Evergy large-load tariff territory, distinct from BPU''s grid-strained Kansas Speedway corridor ~3-4 miles away'
  ],
  catalyst_score = 5,
  reason_for_catalyst_classification = 'High-impact type (potential data center site) + 3 reinforcing cited context items, but no disclosed investment figure and a specific-site (not regional) footprint.',
  source_id = (select id from sources where url = 'https://www.bonnersprings.org/148/Industrial-Park'),
  additional_source_ids = array[
    (select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%'),
    (select id from sources where url ilike '%fox4kc.com%12-6b-data-center%')
  ],
  last_verified_at = now()
where title = 'Bonner Springs Industrial Park';

update catalysts set
  catalyst_type = 'prospective_data_center_site',
  status = 'under_study',
  potential_score = 55,
  potential_score_components = '[
    {"key":"power_grid","points":15,"evidence":["Evergy Kansas Central large-load tariff territory (75MW+ facilities)"],"unknowns":["No confirmed substation or interconnection study specific to this parcel"]},
    {"key":"land_expansion","points":12,"evidence":["85.484 contiguous acres rezoned specifically to I-1 Light Industrial as part of a 145-acre total rezoning, unanimous 8-0 council vote"],"unknowns":["Current ownership/availability status of the rezoned parcel"]},
    {"key":"fiber_connectivity","points":3,"evidence":[],"unknowns":["No fiber carrier or route information found for this corridor"]},
    {"key":"government_incentives","points":5,"evidence":[],"unknowns":["No specific incentive program identified beyond the rezoning itself"]},
    {"key":"development_entitlement","points":9,"evidence":["Unanimous 8-0 Lansing City Council vote (Ordinance 11-30) completed a real agricultural-to-industrial rezoning","Lansing''s Comprehensive Plan explicitly designates this K-7/US-73 corridor for growth"],"unknowns":[]},
    {"key":"physical_environmental_risk","points":5,"evidence":[],"unknowns":["No specific floodplain/environmental study found for this parcel"]},
    {"key":"water_cooling","points":2,"evidence":[],"unknowns":["No specific water/sewer capacity figures found"]},
    {"key":"transportation_workforce","points":4,"evidence":["Direct K-7 Highway and US-73 corridor access"],"unknowns":[]}
  ]'::jsonb,
  opportunity_area = '85.484 acres of I-1 Light Industrial (part of a 145-acre rezoning under Ordinance 11-30), K-7 Highway & McIntyre Road, Lansing, KS',
  power_notes = 'City is in Evergy Kansas Central large-load tariff territory (75MW+ facilities), the same system serving confirmed/forming data-center campuses in De Soto, Gardner, and Tonganoxie. No substation or interconnection study specific to this parcel has been found.',
  fiber_notes = null,
  land_notes = '85.484 contiguous acres rezoned to I-1 Light Industrial as part of a larger 145-acre rezoning (remainder split across two other districts) -- a real, single, recently completed rezoning with no named end user.',
  incentives_notes = null,
  development_environment_notes = 'Lansing''s own Comprehensive Plan explicitly designates the K-7/US-73 corridor as a direction for the city to grow development east and west from -- this rezoning is a direct implementation of that plan, not a one-off.',
  risk_notes = 'No specific floodplain or other environmental constraint identified in available sources.',
  unknowns_to_verify = array[
    'Confirmed Evergy substation capacity or interconnection timeline for a large continuous load at this parcel',
    'Fiber carrier presence along the K-7/US-73 corridor',
    'Water/sewer capacity for a large industrial user',
    'Current ownership and availability status of the rezoned 85.484-acre parcel'
  ],
  why_still_potential = 'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at this K-7 & McIntyre Road site -- the rezoning itself was a general agricultural-to-industrial conversion with no named end user disclosed.',
  power_pillar_label = 'moderate',
  site_pillar_label = 'moderate',
  approval_pillar_label = 'favorable',
  entitlement_velocity = 'favorable',
  entitlement_velocity_notes = 'Unanimous 8-0 council vote completed this rezoning (Ordinance 11-30), and it directly implements the city''s own Comprehensive Plan growth direction for this corridor.',
  city_receptiveness = 'moderate',
  city_receptiveness_notes = 'Comprehensive Plan designates this corridor for growth, but no evidence found of active data-center-specific recruitment.',
  community_friction = 'moderate',
  community_friction_notes = 'City council''s own vote record describes the rezoning as passing "over resident objections" -- real, documented friction already present for a general industrial rezoning, which could be a relevant precedent (positive or negative) for a future large-scale use.',
  utility_timeline = 'unknown',
  utility_timeline_notes = null,
  related_context = array[
    'Unanimous 8-0 council vote (Ordinance 11-30) rezoned 85.484 acres to I-1 Light Industrial',
    'Directly implements Lansing''s Comprehensive Plan growth direction for the K-7/US-73 corridor',
    'Evergy Kansas Central large-load tariff territory'
  ],
  catalyst_score = 5,
  reason_for_catalyst_classification = 'High-impact type (potential data center site) + 3 reinforcing cited context items, but no disclosed investment figure and a specific-site (not regional) footprint.',
  source_id = (select id from sources where url ilike '%citizenportal.ai%Lansing-council-approves-rezoning%'),
  additional_source_ids = array[(select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%')],
  last_verified_at = now()
where title = 'K-7 / McIntyre Road Industrial Rezoning';
