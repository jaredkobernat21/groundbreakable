-- Backfills buyer-intelligence columns (added in
-- 20261004000000_potential_data_center_buyer_intelligence.sql) for the remaining 2 of the KC
-- metro's 3 `prospective_data_center_site` rows -- Bonner Springs Industrial Park was already
-- backfilled in 20261004010000. Real research pass (county GIS/assessor, FEMA flood maps,
-- utility/transmission data, pipeline maps, current commercial listings), not reorganization of
-- already-on-file facts like the Bonner Springs pass -- new citations added below. Same STRICT
-- RULE as every prior pass in this file set: nothing here is estimated or inferred from an
-- adjacent fact (e.g. transmission voltage is never inferred from a nearby substation, MW is
-- never inferred from acreage) -- genuinely unresearched facts stay null, logged in
-- unknowns_to_verify, not guessed. Does not touch potential_score/potential_score_components or
-- any pillar label on either row -- this is a buyer-intelligence backfill, not a rescoring pass.

insert into sources (agency, title, source_type, url, published_date) values
  ('ZoomProspector / KC SmartPort', 'Gary Carlson Business Center -- 1298 W Eisenhower Rd, Leavenworth, Kansas', 'other',
   'https://properties.zoomprospector.com/kcsmartport/property/1298-W-Eisenhower-Rd-Leavenworth-Kansas/44AD6096-9031-4E0C-9CC7-4623EB803DB3', null),
  ('CitizenPortal.ai', 'Planning Commission recommends approval for Epic Estates rezoning amid community concerns over traffic, notice, and consistency with the Comprehensive Plan', 'news',
   'https://citizenportal.ai/articles/6096985/kansas/leavenworth-county/lansing-city/planning-commission-recommends-approval-for-epic-estates-rezoning-amid-community-concerns-over-traffic-notice-and-consistency-with-the-comprehensive-plan', null),
  ('FEMA', 'National Flood Hazard Layer (NFHL) MapServer -- Flood Map Service Center', 'agency_gis',
   'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer', null);

-- ============================================================
-- Eisenhower Road Business Park Corridor (Leavenworth, KS)
-- ============================================================
update catalysts set
  serving_utility = 'Evergy (large-load power-service tariff territory, 75MW+) -- confirmed specifically for this park via the Gary Carlson Business Center commercial listing, not just countywide tariff eligibility. Kansas Gas Service is the confirmed natural-gas utility for the same park.',
  available_capacity_status = 'requires_verification',
  interconnection_notes = 'No substation or interconnection study specific to this site was located this pass -- Evergy''s published large-load tariff territory remains the only sourced power-delivery fact.',
  total_acreage = 102,
  available_acreage_status = 'Gary Carlson Business Center: 3 lots currently listed for sale, 5-9.41 acres each (confirmed, current as of this pass). Business and Technology Park (the other 80 acres): still marketed as "shovel-ready," but current vacant/available acreage not separately confirmed.',
  zoning_status = 'Industrial (operated/marketed as a business park -- existing tenants include Cereal Ingredients Inc., VA CMOP, MAPS Inc., Reeves Wiedemann, and Fastenal -- but no specific zoning district code was confirmed in any source found)',
  gas_pipeline_operator = 'Kansas Gas Service',
  owners = '[
    {"name":"Leavenworth County Port Authority","controlled_acreage":22,"parcel_count":3,"public_contact":{"phone":"913-727-6111","email":"lhaack@lvcountyed.org"},"ownership_complexity":"Low (single public authority)","last_verified":"2026-10-04","source":"https://properties.zoomprospector.com/kcsmartport/property/1298-W-Eisenhower-Rd-Leavenworth-Kansas/44AD6096-9031-4E0C-9CC7-4623EB803DB3","notes":"Owns/operates Gary Carlson Business Center -- the 3 currently-listed lots. Contact is Leavenworth County Development Corporation''s Lisa Haack."},
    {"name":"City of Leavenworth / Leavenworth County (joint)","entity":"Municipal/county government ownership","controlled_acreage":80,"last_verified":"2026-10-04","source":"https://www.leavenworthks.gov/ed/page/business-and-technology-park","notes":"Business and Technology Park -- a public joint-investment park, not a private landowner. Opened 2018 via $9.7M joint City/County investment (already on file)."}
  ]'::jsonb,
  primary_advantage = 'Two adjacent, shovel-ready, publicly-owned industrial parks (102 combined acres) with confirmed Evergy electric and Kansas Gas Service natural-gas utility already serving the park, plus an active Leavenworth County Development Corporation sales contact -- site control and seller willingness are effectively already resolved (public ownership, actively marketed).',
  primary_risk = 'No confirmed substation capacity, transmission voltage/distance, or floodplain status specific to this site was found this pass -- power deliverability and environmental risk, not site control or entitlement, are the two largest open questions.',
  unknowns_to_verify = array[
    'Confirmed substation capacity, transmission voltage, and distance specific to this site, as opposed to territory-wide large-load tariff eligibility',
    'Fiber carrier presence or dark-fiber availability at the park',
    'Water/sewer capacity figures for a large continuous industrial load',
    'Current vacant/available acreage at the Business and Technology Park specifically (Gary Carlson''s 3 listed lots are now confirmed available; the Park''s own vacancy is not)',
    'Floodplain/FEMA zone determination for this specific site (the city''s own FEMA Flood Maps page was not retrievable this pass)',
    'Total contiguous acreage and parcel count across both parks combined',
    'Natural gas pipeline distance/diameter for behind-the-meter generation potential'
  ],
  last_verified_at = now()
where title = 'Eisenhower Road Business Park Corridor';

-- ============================================================
-- K-7 / McIntyre Road Industrial Rezoning (Lansing, KS)
-- ============================================================
update catalysts set
  serving_utility = 'Evergy Kansas Central (large-load power-service tariff territory, 75MW+) -- already on file; no new site-specific substation or transmission finding this pass.',
  available_capacity_status = 'requires_verification',
  interconnection_notes = 'No interconnection study for this parcel was located this pass.',
  total_acreage = 145,
  available_acreage_status = 'No specific development plan was before the council -- the rezoning itself was framed purely as a marketability-improving entitlement, not tied to a disclosed buyer or development plan (already on file). The 145-acre total tract figure (staff report) and a ~170-acre figure (public commenters at the Planning Commission hearing) conflict -- not resolved this pass.',
  contiguous_acreage = 85.484,
  zoning_status = 'I-1 Light Industrial (verified directly against Ordinance 11-30 coverage -- already on file, re-confirmed)',
  floodplain_status = 'FEMA NFHL point query near 13877 McIntyre Rd returns Zone X (Area of Minimal Flood Hazard) -- an indicative nearby point, not a query against this specific parcel''s exact centroid.',
  floodplain_constrained = false,
  owners = '[
    {"name":"Jay Healy","entity":"Epic Estates 3 LLC","mailing_address":"13788 McIntyre Road, Lansing, KS","ownership_complexity":"Low (single applicant reported)","last_verified":"2026-10-04","source":"https://citizenportal.ai/articles/6096985/kansas/leavenworth-county/lansing-city/planning-commission-recommends-approval-for-epic-estates-rezoning-amid-community-concerns-over-traffic-notice-and-consistency-with-the-comprehensive-plan","notes":"Reported via Lansing Planning Commission Case 2025-DEV-002 staff-report coverage -- applicant/owner name has NOT been independently cross-checked against Kansas Secretary of State or county assessor records this pass. Treat as reported, not verified. The total tract acreage associated with this ownership is itself disputed (see available_acreage_status)."}
  ]'::jsonb,
  primary_advantage = 'Real, completed, unanimous-vote I-1 entitlement (85.484 of a 145-acre tract) directly implementing Lansing''s Comprehensive Plan growth corridor, in Evergy large-load (75MW+) tariff territory, with FEMA data indicating minimal flood risk nearby.',
  primary_risk = 'No site-specific power-delivery fact (substation distance, transmission voltage, MW, interconnection timeline) was found anywhere public -- deliverability, not entitlement, is the open question. Current ownership (reported as Jay Healy / Epic Estates 3 LLC) has not been independently verified, and the total tract acreage itself is disputed between sources.',
  unknowns_to_verify = array[
    'Confirmed Evergy substation capacity, transmission voltage, and distance specific to this parcel',
    'Fiber carrier presence along the K-7/US-73 corridor',
    'Water/sewer capacity for a large industrial user',
    'Independent verification of current ownership (Jay Healy / Epic Estates 3 LLC is reported via Planning Commission coverage only, not yet cross-checked against KS Secretary of State or county assessor records)',
    'Resolution of the disputed total tract acreage (~145 acres per staff report vs. ~170 acres per public commenters) and confirmed parcel count',
    'Floodplain/FEMA zone confirmation against the exact 85.484-acre parcel centroid (current finding is an indicative nearby point query, Zone X)',
    'Natural gas pipeline distance/diameter for behind-the-meter generation potential -- only general area-level gas infrastructure (Kansas Gas Service, Southern Star Central Gas Pipeline) was found, nothing site-specific'
  ],
  last_verified_at = now()
where title = 'K-7 / McIntyre Road Industrial Rezoning';
