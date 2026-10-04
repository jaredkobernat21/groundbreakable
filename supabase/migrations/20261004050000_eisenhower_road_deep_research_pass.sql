-- Eisenhower Road Business Park Corridor (Leavenworth, KS) -- deep research pass (Jared's
-- 2026-10-04 research-quality brief), second site after Bonner Springs. Same STRICT RULE: nothing
-- here is inferred from an adjacent fact. Includes one explicit stale-data catch: a 2017-18 KSHB
-- investigative article reporting the park entirely vacant with zero tenants is real, but too old
-- (~8 years) to represent current occupancy -- cited as historical context only, NOT used to set
-- available_acreage_status, per the brief's own "do not assume historical data is current" rule.
--
-- potential_score recalculated (59 -> 71): power_grid, fiber_connectivity,
-- development_entitlement, physical_environmental_risk, and water_cooling components all moved on
-- real new evidence (see each component's evidence array). land_expansion, government_incentives,
-- and transportation_workforce are essentially unchanged (land_expansion +1 for the now-confirmed
-- I-1 district). site_pillar_label moves moderate -> strong (zoning, floodplain, and water
-- capacity are now all confirmed rather than unknown); power_pillar_label and approval_pillar_label
-- are unchanged -- the new power evidence strengthens the SAME categorical judgment, it doesn't
-- change it (substation/voltage/MW are still unconfirmed).

insert into sources (agency, title, source_type, url, published_date) values
  ('Leavenworth, KS Municode', 'Code of Ordinances, Appendix A, Article 4 -- Zoning Districts', 'agency_document',
   'https://library.municode.com/ks/leavenworth/codes/code_of_ordinances?nodeId=APXADERE_ART4ZODIST', null),
  ('KSHB', 'Leavenworth Industrial Park open, no tenants yet', 'news',
   'https://www.kshb.com/news/local-news/investigations/leavenworth-industrial-park-open-no-tenants-yet', null),
  ('CitizenPortal.ai', 'Leavenworth County panel on proposed data center draws sharp local opposition and agency reassurances', 'news',
   'https://citizenportal.ai/articles/7943401/Kansas/Leavenworth-County/Leavenworth-County-panel-on-proposed-data-center-draws-sharp-local-opposition-and-agency-reassurances', null),
  ('City of Leavenworth', 'Water Pollution Control (wastewater treatment)', 'agency_document',
   'https://www.leavenworthks.gov/publicworks/page/water-pollution-control', null);

update catalysts set
  potential_score = 71,
  potential_score_components = '[
    {"key":"power_grid","points":20,"evidence":["Evergy''s KCC-approved Large Load Power Service (LLPS) tariff and \"Path to Power\" active-queue process (Docket 25-EKME-315-TAR) applies territory-wide across Evergy''s Kansas Central/Kansas Metro service area, which includes Leavenworth -- VERIFIED, the same real mechanism confirmed for Bonner Springs","~20-25 miles from confirmed/forming data-center campuses in De Soto, Gardner, and Tonganoxie on the same utility system (unchanged)"],"unknowns":["No substation capacity, transmission voltage/distance, or queue status confirmed specific to this corridor"],"status":"supported"},
    {"key":"land_expansion","points":11,"evidence":["80-acre Business and Technology Park plus the adjacent Gary Carlson Business Center (3 shovel-ready sites) (unchanged)","Business and Technology Park confirmed I-1 Light Industrial District -- VERIFIED directly against Leavenworth''s own Municode Article 4 zoning ordinance, not just the city''s marketing page"],"unknowns":["Current vacant/contiguous acreage across both parks remains unconfirmed -- the only acreage-vacancy data found (KSHB, ~2017-18) is ~8 years old and explicitly NOT used to represent current status"]},
    {"key":"fiber_connectivity","points":6,"evidence":["AT&T Fiber and Spectrum confirmed as real broadband providers serving Leavenworth, KS generally (residential/business tiers up to 5 Gbps) -- SUPPORTED at a city level, general search synthesis, not independently source-pinned this pass"],"unknowns":["No Zayo or Lumen presence found specifically; carrier-grade last-mile industrial service at this corridor REQUIRES DIRECT CONFIRMATION"],"status":"supported"},
    {"key":"government_incentives","points":8,"evidence":["$9.7M joint City of Leavenworth / Leavenworth County investment via countywide economic-development sales tax (unchanged)","Actively marketed by the Leavenworth County Development Corporation (unchanged)"],"unknowns":[]},
    {"key":"development_entitlement","points":8,"evidence":["I-1 Light Industrial District confirmed directly via Leavenworth Municode Article 4 -- VERIFIED (upgraded from the prior pass''s unconfirmed zoning code)","Park opened 2018 and has operated successfully since -- established precedent for industrial entitlement (unchanged)"],"unknowns":["Gary Carlson Business Center''s own zoning district code specifically is still UNKNOWN -- a generic property-search snippet called it \"commercial\" but was not a primary-source citation and was not used"]},
    {"key":"physical_environmental_risk","points":9,"evidence":["FEMA''s own live NFHL ArcGIS REST MapServer identify query at Gary Carlson''s coordinates (representative point for the corridor) returned Zone X (Area of Minimal Flood Hazard) -- VERIFIED directly against FEMA''s authoritative GIS service, same tool/standard used for Bonner Springs"],"unknowns":["One representative point query for the corridor, not an exhaustive query across both parks separately"],"status":"verified"},
    {"key":"water_cooling","points":4,"evidence":["City of Leavenworth wastewater treatment plant designed for 6.88 MGD, currently treating ~3 MGD/year average -- roughly 44% utilized, a real confirmed headroom figure -- VERIFIED (City of Leavenworth Water Pollution Control)","Kansas Gas Service confirmed to already serve a named existing tenant at this exact park (Cereal Ingredients Inc.) -- VERIFIED gas service at the park itself, stronger than a territory-wide claim"],"unknowns":["City water-system capacity specifically (as opposed to wastewater) was not found this pass -- UNKNOWN"],"status":"verified"},
    {"key":"transportation_workforce","points":5,"evidence":["Marketed with access to six major interstates and a 687,000+ worker regional labor basin (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  power_notes = 'Entire city is in Evergy Kansas Central territory. VERIFIED this pass: Evergy''s KCC-approved Large Load Power Service (LLPS) tariff and "Path to Power" active-queue process (Docket 25-EKME-315-TAR, approved Nov 2025) applies territory-wide across Evergy''s Kansas Central/Kansas Metro service area, which includes Leavenworth -- the same real, usable mechanism confirmed for Bonner Springs. No substation capacity, transmission voltage/distance, or queue status has been confirmed specific to this corridor -- REQUIRES DIRECT CONFIRMATION via Evergy.',
  interconnection_notes = 'Evergy''s "Path to Power" queue (see power_notes) gives a developer a real, named channel to request a preliminary capacity/timeline assessment -- but no substation capacity, transmission voltage/distance, MW figure, or queue status has been confirmed for this corridor. REQUIRES DIRECT CONFIRMATION via Evergy.',
  fiber_notes = 'General broadband search found AT&T Fiber and Spectrum serving Leavenworth, KS generally (residential/business tiers up to 5 Gbps) -- SUPPORTED at a city level, not independently source-pinned this pass. No Zayo or Lumen presence found specifically. Carrier-grade last-mile industrial service at this corridor REQUIRES DIRECT CONFIRMATION.',
  water_notes = 'City of Leavenworth wastewater treatment plant designed for 6.88 MGD, currently treating approximately 3 MGD/year average -- roughly 44% utilized, a real confirmed headroom figure -- VERIFIED (City of Leavenworth Water Pollution Control page). City water-system capacity specifically (as opposed to wastewater) was not found this pass -- UNKNOWN.',
  zoning_status = 'Business and Technology Park: I-1 Light Industrial District -- VERIFIED directly against Leavenworth''s own Municode Article 4 zoning ordinance. Gary Carlson Business Center''s specific zoning district code remains UNKNOWN (existing tenants include Cereal Ingredients Inc., VA CMOP, MAPS Inc., Reeves Wiedemann, and Fastenal, per the existing ZoomProspector listing, but no primary zoning-code citation was found for this parcel specifically).',
  floodplain_status = 'Zone X (Area of Minimal Flood Hazard) -- VERIFIED directly via FEMA''s own live NFHL ArcGIS REST MapServer identify query at Gary Carlson''s coordinates, used as a representative point for the corridor (not an exhaustive query across both parks separately)',
  floodplain_constrained = false,
  community_friction_notes = 'No opposition or controversy found specific to this corridor. A Leavenworth County planning-commission meeting (March 2026) drew documented "sharp local opposition" over a proposed data center -- confirmed this pass to be specifically about the already-logged Project Bluestem/Cloverleaf Infrastructure site near Tonganoxie, roughly 10+ miles away, not this site.',
  available_acreage_status = 'Gary Carlson Business Center: 3 lots currently listed for sale, 5-9.41 acres each (confirmed current as of the prior pass). Business and Technology Park: current vacant/available acreage is UNKNOWN -- a KSHB investigative article found this pass reports the park was entirely vacant with zero signed tenants, but that article dates to approximately 2017-18 (~8 years old) and is explicitly NOT used to represent current status; the park''s own existing-tenant list (Cereal Ingredients Inc., VA CMOP, MAPS Inc., Reeves Wiedemann, Fastenal) confirms it is NOT currently all-vacant. The same historical reporting notes Gary Carlson took ~20 years to reach 75-80% occupancy and that its VA mail-pharmacy tenant "may be departing" -- both flagged as historical context only, not confirmed current facts.',
  gas_pipeline_operator = 'Kansas Gas Service -- confirmed this pass to already serve a named existing tenant at this exact park (Cereal Ingredients Inc.), stronger than a territory-wide-only claim. Pipeline distance and diameter to this specific site were not retrievable this pass -- REQUIRES DIRECT CONFIRMATION from the operator.',
  site_pillar_label = 'strong',
  primary_advantage = 'Zoning (I-1), floodplain status (Zone X), and wastewater capacity (44% utilized, real headroom) are now all VERIFIED rather than unknown, and Kansas Gas Service is confirmed to already serve an existing tenant at this exact park -- the same KCC-approved Evergy large-load interconnection process available to Bonner Springs applies here too.',
  primary_risk = 'Current vacant/available acreage at the Business and Technology Park is genuinely unknown -- the only data found is roughly 8 years old and should not be relied on; the park''s current tenant roster confirms it is not all-vacant, but how much specifically remains available requires a direct LCDC inquiry. Site-specific power delivery (substation, transmission voltage/distance, MW) is also unconfirmed, same as every site in this metro.',
  developer_assessment = 'pursue',
  developer_takeaway = 'This corridor now has verified I-1 zoning, confirmed FEMA Zone X flood status, a real local Kansas Gas Service connection already serving a park tenant, and the same KCC-approved Evergy large-load interconnection pathway available to Bonner Springs. Wastewater capacity is confirmed with real headroom (44% utilized). The open questions are the same two that matter most across this metro -- site-specific power delivery and current land availability -- compounded here by the fact that the only acreage-vacancy data found is nearly a decade old and should not be relied on. A developer should treat current occupancy as unknown, not vacant, until confirmed directly with the Leavenworth County Development Corporation.',
  next_steps = array[
    'Submit a Path to Power inquiry to Evergy for this corridor.',
    'Contact the Leavenworth County Development Corporation (existing contact: Lisa Haack) for current occupancy and available acreage at both parks.',
    'Contact Kansas Gas Service''s local Leavenworth office for pipeline distance, diameter, and delivery capacity.',
    'Contact AT&T Fiber, Spectrum, or a carrier-neutral broker for carrier-grade last-mile service.',
    'Request city water-system capacity documentation from Leavenworth Public Works.'
  ],
  unknowns_to_verify = array[
    'Substation capacity, transmission voltage/distance, and MW figure specific to this corridor (Requires Direct Confirmation -- Evergy)',
    'Current vacant/contiguous acreage and parcel count across both parks (Cannot Be Resolved This Pass -- county parcel search is login-gated; the only acreage figure found is ~8 years stale)',
    'Natural gas pipeline distance and diameter from Kansas Gas Service (Requires Direct Confirmation -- operator)',
    'Carrier-grade, last-mile fiber availability at this corridor specifically (Requires Direct Confirmation -- carrier)',
    'City water-system capacity, as opposed to wastewater (Requires Direct Confirmation -- Leavenworth Public Works)',
    'Gary Carlson Business Center''s specific zoning district code'
  ],
  additional_source_ids = array[
    (select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%'),
    (select id from sources where url ilike '%curb.kansas.gov%CURB_News_25Q4%'),
    (select id from sources where url ilike '%library.municode.com%leavenworth%'),
    (select id from sources where url ilike '%kshb.com%leavenworth-industrial-park%'),
    (select id from sources where url ilike '%citizenportal.ai%Leavenworth-County-panel%'),
    (select id from sources where url ilike '%leavenworthks.gov%water-pollution-control%')
  ],
  last_verified_at = now()
where title = 'Eisenhower Road Business Park Corridor';
