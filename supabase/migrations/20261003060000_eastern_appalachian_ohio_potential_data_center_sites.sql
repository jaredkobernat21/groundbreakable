-- Eastern/Appalachian Ohio (market `eastern-appalachian-ohio`) "Potential
-- Data Center Site" pass (2026-10-03), #4 of this session's 14-market
-- queue. Same discipline as every prior pass this session.
--
-- ENERGIACRES UPDATE (the market's existing "Stargate Ohio" Possible-tier
-- row): still no confirmed site as of this research. EnergiAcres itself
-- states it remains "strictly in a preliminary, exploratory phase" (The
-- Times Leader, 2026-07, "EnergiAcres says its in 'exploratory phase' of
-- possible Belmont County AI data campus"). One real change since the
-- original pass: EnergiAcres' own website carried Belmont County-specific
-- language through late June 2026, then quietly removed it -- an
-- ambiguous signal (could mean the company moved on, paused, or is just
-- repositioning), not new site information. Net effect: Belmont County
-- still carries an active, unresolved, county-wide data-center signal --
-- EXACTLY the same "whole submarket too uncertain" logic already applied
-- to Olathe, KS in the second KC pass -- so no new Potential site is added
-- anywhere in Belmont County, even at a specific parcel with clean
-- fundamentals, since the broad EnergiAcres claim ("thousands of acres
-- somewhere in Belmont County") could describe any of them.
--
-- EXCLUDED, with reasons (real activity found, not Potential):
--   - Graham Farm Business Park, Frazeysburg, Muskingum County (The New
--     Albany Company -- the SAME developer behind the Columbus-area
--     hyperscale cluster researched earlier this session -- 664 acres,
--     AEP 138kV/765kV lines on-site, Columbia Gas high-pressure line):
--     Aligned Data Centers is CONFIRMED already building a hyperscale
--     campus here, with 50-200-acre shovel-ready sites still being
--     marketed around it (thereportingproject.org, "New Albany Company
--     moves east to develop industrial park in western Muskingum
--     County"; newalbanycompany.com's own Frazeysburg page; yourradio
--     place.com, "Graham Farm Business Park Being Developed On 664 Acres
--     In Frazeysburg"). Real, confirmed, not Potential.
--   - Former Muskingum River Power Plant site, Waterford, Washington
--     County (purchased 2021 by the Southeastern Ohio Port Authority +
--     Belpre-Parkersburg Industrial Railroad specifically for rail/water/
--     substation/gas-pipeline-equipped heavy industrial reuse -- otherwise
--     an exceptional "retired generation site with valuable electrical
--     infrastructure left behind" Potential candidate on paper): ACS
--     Digital & Energy (Spain-based) is in active, named, real
--     negotiation with Washington County Commissioners for a data center
--     there ("Project Riverbend") -- a signed NDA/letter of intent as of
--     January 2026, standing-room-only public meetings, real community
--     opposition already organized (WTAP, "Washington County residents
--     pack commissioners meeting over proposed data center"; Marietta
--     Times, multiple 2026 articles tracking the negotiation). Real,
--     named, active -- not Potential.
--   - East Central Ohio (ECO) Business Park, Frazeysburg (former
--     Longaberger campus, 700 acres): no DC-specific search hit, but
--     already has 1.7M sq ft under roof across 5 occupied light-
--     manufacturing/distribution buildings with no confirmed open
--     contiguous acreage figure found -- excluded on Land fundamentals
--     (same "looks big but is actually built out" pattern as Davenport's
--     Eastern Iowa Industrial Center and the Quad Cities pass generally),
--     not activity.
--
-- CONVERTED/ADDED: one new Potential site, National Road Business Park
-- (Zanesville, Muskingum County) -- see insert below. Genuinely clean on
-- the strict rule (no DC-specific search hit for this park by name, by
-- address, or combined with AEP/the Zanesville-Muskingum County Port
-- Authority), with real but moderate fundamentals -- scored accordingly,
-- not inflated to match stronger markets from earlier this session.
--
-- Not independently confirmed either way: whether Muskingum County itself
-- has any data-center-specific zoning action (moratorium or otherwise) --
-- extensive search surfaced Ohio's statewide count (138+ municipalities/
-- townships, Ohio Capital Journal, 2026-09-18) but no Muskingum-County-
-- specific result. Logged as a genuine unknown in unknowns_to_verify
-- rather than assumed clean.

insert into sources (agency, title, source_type, url, published_date) values
  ('Ohio Economic Development Association', 'Zanesville-Muskingum County Port Authority Announces Creation of National Road Business Park', 'press_release',
   'https://ohioeda.com/zanesville-muskingum-county-port-authority-announces-creation-of-national-road-business-park/', null),
  ('Zanesville-Muskingum County Port Authority', 'National Road Business Park (property listing/fact sheet)', 'other',
   'https://properties.zoomprospector.com/OHIO/property/admin/d759e797-82e7-4caa-b0e2-2aad02e3b9dd', null),
  ('AEP', 'AEP Ohio Partners to Bring $4.2B in New Electric Infrastructure in Appalachian Ohio Without Raising Customer Rates', 'press_release',
   'https://www.aep.com/news/stories/view/10823/', null);

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
) values (
  (select id from markets where slug = 'eastern-appalachian-ohio'),
  'National Road Business Park (Zanesville, Muskingum County)',
  'prospective_data_center_site',
  'A 203-acre, SiteOhio-certified, intergovernmentally-funded (Zanesville-Muskingum County Port Authority, Muskingum County, City of Zanesville) business park along US-40/East Pike east of Zanesville, with 121 contiguous developable acres. A $3.6M All-Ohio Future Fund grant (2025) created a ~75-acre graded, build-ready parcel capable of holding a ~1M sq ft facility. One tenant (Marker Development, a ~200,000 sq ft speculative building leased to Holder Construction) opened August 2025. No data-center-specific activity found for this park, by name or address, combined with AEP or the Port Authority.',
  'National Road Business Park, East Pike (US-40), Zanesville, OH (exact parcel within the 203-acre park not independently geocoded)',
  39.9428578, -81.9804910,
  1600, 'under_study', null, '203-acre park, 121 contiguous developable acres, one ~75-acre build-ready graded parcel',
  'reported', '{}', null, null,
  5, 'High-impact type (potential data center site) + 3 reinforcing cited context items, but no disclosed investment figure and real but modest current power capacity.',
  'The only genuinely clean Potential candidate found in this large, multi-county market this pass -- real intergovernmental investment and a graded build-ready parcel, in a region where every other promising retired/industrial site checked (Graham Farm, the former Muskingum River Power Plant) turned out to already have confirmed data-center activity.',
  'No confirmed timeline -- park has been open and marketing available parcels since its creation; the 75-acre graded parcel has been build-ready since the 2025 grant',
  array['SiteOhio-certified and USA BEST Sites-certified', '$3.6M All-Ohio Future Fund grant (2025) funded a 75-acre graded build-ready parcel', 'One tenant (Marker Development/Holder Construction) opened August 2025'],
  (select id from sources where url like '%ohioeda.com%national-road-business-park%'),
  array[(select id from sources where url like '%zoomprospector.com%d759e797%'), (select id from sources where url like '%aep.com%4.2B%' or url like '%aep.com/news/stories/view/10823%')],
  46,
  '[
    {"key":"power_grid","points":10,"evidence":["AEP Ohio territory; a 138kV transmission circuit 2.8 miles from the park, extendable via a newly-built AEP-owned station on request","AEP committed $4.2B in new Appalachian Ohio electric infrastructure investment (general grid buildout, not tied to any named data center)"],"unknowns":["Only 3MW of excess distribution capacity confirmed currently available at the park itself -- a real, modest, limiting figure, not an estimate of eventual large-load capacity"],"status":"indicated"},
    {"key":"land_expansion","points":12,"evidence":["203-acre SiteOhio-certified park, 121 contiguous developable acres","$3.6M-funded ~75-acre graded, build-ready parcel capable of a ~1M sq ft facility"],"unknowns":["Precise remaining uncommitted acreage beyond the one leased tenant building was not itemized in available sources"],"status":"verified"},
    {"key":"fiber_connectivity","points":2,"evidence":[],"unknowns":["No fiber carrier or long-haul route information found for this park"],"status":"unknown"},
    {"key":"government_incentives","points":7,"evidence":["Intergovernmentally funded and operated (Port Authority, county, city)","$3.6M All-Ohio Future Fund grant (2025)","SiteOhio and USA BEST Sites certifications"],"unknowns":[],"status":"verified"},
    {"key":"development_entitlement","points":7,"evidence":["SiteOhio certification implies pre-vetted entitlement/due-diligence status","One real tenant (Marker Development) already built and leased, Aug. 2025"],"unknowns":["Muskingum County-specific data-center zoning status (moratorium or otherwise) not confirmed either way"],"status":"indicated"},
    {"key":"physical_environmental_risk","points":4,"evidence":[],"unknowns":["No floodplain or environmental study specific to this park was found"],"status":"unknown"},
    {"key":"water_cooling","points":1,"evidence":[],"unknowns":["No water/sewer capacity figures found for this park"],"status":"unknown"},
    {"key":"transportation_workforce","points":3,"evidence":["Direct US-40/East Pike frontage, within the Zanesville/I-70 corridor labor market"],"unknowns":[]}
  ]'::jsonb,
  'National Road Business Park, East Pike (US-40), Zanesville, OH -- 203 acres total, 121 contiguous developable, including one ~75-acre graded build-ready parcel',
  'AEP Ohio territory. A 138kV transmission circuit sits 2.8 miles from the park; AEP would extend lines to a newly-built, AEP-owned station on request. Only 3MW of excess distribution capacity is currently confirmed available at the park itself -- a real, modest, limiting figure, distinct from AEP''s separate $4.2B general Appalachian Ohio grid investment (not tied to any named customer or project here).',
  null,
  '203-acre SiteOhio-certified park, 121 contiguous developable acres. A $3.6M All-Ohio Future Fund grant (2025) funded a ~75-acre graded, build-ready parcel capable of holding a ~1M sq ft facility. One tenant (Marker Development, ~200,000 sq ft speculative building leased to Holder Construction) opened August 2025.',
  'Intergovernmentally funded (Zanesville-Muskingum County Port Authority, Muskingum County, City of Zanesville); $3.6M All-Ohio Future Fund grant (2025); SiteOhio and USA BEST Sites certifications.',
  'SiteOhio certification implies a pre-vetted, expedited entitlement/due-diligence posture. One real building (Marker Development) already constructed and leased (Aug. 2025) -- a working precedent for industrial development at this park. Muskingum County''s own data-center-specific zoning status (if any) was not confirmed either way in available sources, despite Ohio''s intense statewide moratorium trend (138+ municipalities/townships as of Sept. 2026).',
  null,
  null,
  null,
  array[
    'Fiber carrier presence or dark-fiber availability at the park',
    'Confirmed substation upgrade cost/timeline beyond the current 3MW excess-capacity figure',
    'Floodplain or other environmental constraints specific to this park',
    'Water/sewer capacity for a large continuous industrial load',
    'Muskingum County''s own data-center-specific zoning status (moratorium or otherwise) -- not found either way in available sources, worth confirming directly given Ohio''s statewide trend'
  ],
  'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at National Road Business Park specifically -- unlike Graham Farm Business Park (Frazeysburg, confirmed Aligned Data Centers project) and the former Muskingum River Power Plant site (Waterford, active ACS Digital & Energy negotiation), both checked and excluded during this same pass.',
  'site',
  'moderate', 'moderate', 'favorable',
  'favorable', 'SiteOhio certification and one already-built, already-leased tenant (Marker Development, Aug. 2025) are a real precedent for industrial-use approval at this specific park.',
  'high', 'Three levels of government (Port Authority, county, city) co-fund and co-operate this park, and it has already drawn a real $3.6M state grant specifically to make a large parcel build-ready.',
  'unknown', 'No opposition or controversy found specific to this park. Statewide Ohio sentiment around data centers is contentious (138+ active municipal/township moratoriums as of Sept. 2026), but nothing documented is tied to this park itself.',
  'unknown', null
);
