-- Ohio Crossroads Industrial Center (Bucyrus, Crawford County, OH) -- full buyer-intelligence
-- promotion + public-record escalation pass, third of "the additional 4" sites outside KC metro.
-- The confirmed 2.7MW excess-capacity figure is a real, modest CONSTRAINT, not merely an unknown
-- -- well below typical large-load/hyperscale draw, and with 22 of the 44.8 acres already
-- earmarked for Food & Beverage manufacturing, this reads honestly as a smaller-load or phased
-- opportunity rather than a hyperscale candidate. Also explicitly ruled out several false-positive
-- "Crawford County moratorium" search hits that turned out to be Crawford County, GEORGIA and
-- Crawford County, IOWA, plus a real Ohio moratorium that's actually in neighboring Wyandot
-- County -- none apply here; Crawford County, OH itself still has no confirmed moratorium.
--
-- potential_score moves 41 -> 44 (small, honest bump): physical_environmental_risk resolved via a
-- direct FEMA query (+1), gas utility confirmed (+1 to power_grid, where BTM/gas evidence already
-- lives in this rubric), fiber presence upgraded from no-info to regional SUPPORTED (+1).

insert into sources (agency, title, source_type, url, published_date) values
  ('City of Bucyrus, OH', 'Columbia Gas Maintenance', 'agency_document',
   'https://www.cityofbucyrusoh.us/columbia-gas-maintenance', null);

update catalysts set
  why_this_site = 'Shovel-ready industrial park with confirmed utility and gas service, below-market pricing, and no competing data-center activity in the county. Available power capacity and formal site control are the principal items remaining to confirm.',
  potential_score = 44,
  potential_score_components = '[
    {"key":"power_grid","points":11,"evidence":["AEP Ohio territory; substation 1.2 miles from the park, single feed; 2.7MW of confirmed excess electric capacity (unchanged)","A real, named nearby AEP transmission asset identified: Bucyrus Center Substation (Quaker Road, Bucyrus), tied to a 69kV line via AEP''s Sycamore-Bucyrus Area Improvements project -- SUPPORTED, not confirmed as the specific substation the original 1.2-mile figure referred to","Columbia Gas of Ohio (NiSource) confirmed as the natural-gas distribution utility serving Bucyrus -- VERIFIED via the city''s own page"],"unknowns":["2.7MW remains a real, modest, confirmed CEILING -- well below typical large-load/hyperscale draw, not merely an unresolved unknown","Pipeline distance/diameter to this specific park not found"],"status":"verified"},
    {"key":"land_expansion","points":4,"evidence":["44.8 contiguous acres, zoned industrial, within Bucyrus city limits (unchanged)"],"unknowns":["22 of the 44.8 acres remain separately certified for Food & Beverage manufacturing -- a real, named competing-use designation, leaving roughly 22.8 acres effectively open for other purposes","Parcel ownership (Crawford County Development Board) could not be independently re-verified this pass -- the county auditor''s Beacon GIS system requires interactive use, not a scriptable query; a separate Real Estate Search tool was unreachable"]},
    {"key":"fiber_connectivity","points":3,"evidence":["Brightspeed (fiber reported \"100% complete\" in Bucyrus) and Omni Fiber both confirmed serving Bucyrus generally -- SUPPORTED at a city level"],"unknowns":["Both are residential/business-tier regional ISPs, not confirmed as carrier-grade/hyperscale infrastructure -- last-mile industrial availability still Requires Direct Confirmation"],"status":"supported"},
    {"key":"government_incentives","points":6,"evidence":["Owned and directly marketed by the Crawford County Development Board at $10,000/acre (unchanged)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":7,"evidence":["SiteOhio-authenticated shovel-ready status with due-diligence studies reportedly completed (unchanged)"],"unknowns":["RE-CONFIRMED this pass, with false positives explicitly ruled out: searches surfaced apparent \"Crawford County moratorium\" hits that are actually Crawford County, Georgia and Crawford County, Iowa, plus a real Ohio moratorium (Upper Sandusky) that is actually in neighboring Wyandot County -- none apply here. No Bucyrus- or Crawford County, OH-specific data-center ordinance found despite a dedicated, multi-angle search -- a genuine confirmed absence."]},
    {"key":"physical_environmental_risk","points":6,"evidence":["RESOLVED this pass: a direct FEMA NFHL ArcGIS REST query at the park''s exact geocoded coordinates returned Zone X, SFHA_TF=False -- VERIFIED against the real site, not a nearby point"],"unknowns":[]},
    {"key":"water_cooling","points":3,"evidence":["Excess water/sewer capacity of 2.3 MGD / 1.4 MGD confirmed at the park (unchanged)"],"unknowns":["No confirmation of what large continuous industrial draw this excess capacity could actually support"]},
    {"key":"transportation_workforce","points":4,"evidence":["Adjacent to a four-lane divided highway connecting to I-71 and I-75 (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  power_notes = 'AEP Ohio territory. A substation sits 1.2 miles from the park with a single feed; the SiteOhio/JobsOhio listing confirms 2.7MW of currently available excess electric capacity -- a real, modest, limiting figure. A named nearby AEP transmission asset was identified this pass: Bucyrus Center Substation (Quaker Road), tied to a 69kV line via AEP''s Sycamore-Bucyrus Area Improvements project -- SUPPORTED, not confirmed as the specific substation referenced by the original 1.2-mile figure. AEP''s outreach contact (614-933-2998 / AEPOhio_Outreach@aep.com) is the right channel for a precise confirmation.',
  natural_gas_notes = 'Columbia Gas of Ohio (NiSource) confirmed as the natural-gas distribution utility serving Bucyrus -- VERIFIED via the City of Bucyrus''s own page. Pipeline distance/diameter to this specific park not found.',
  risk_notes = 'RESOLVED this pass: a direct FEMA NFHL ArcGIS REST query at the park''s exact geocoded coordinates (40.8292886, -82.9659437) returned Zone X, SFHA_TF=False -- VERIFIED, not just "not flagged" as in the original pass.',
  serving_utility = 'AEP Ohio — Verified',
  nearest_substation_name = 'Bucyrus Center Substation (distance to park unconfirmed)',
  transmission_voltage_kv = 69,
  potential_load_mw_low = 2.7,
  available_capacity_status = 'verified',
  total_acreage = 44.8,
  contiguous_acreage = 22.8,
  zoning_status = 'Industrial',
  floodplain_status = 'Outside 100-Year Floodplain',
  floodplain_constrained = false,
  gas_pipeline_operator = 'Columbia Gas of Ohio',
  fiber_notes = 'Brightspeed and Omni Fiber present regionally',
  water_notes = 'Crawford County Development Board (2.3 MGD water / 1.4 MGD sewer excess capacity)',
  available_acreage_status = '22.8 acres effectively open — 22 of the 44.8 total acres are separately certified for Food & Beverage manufacturing use',
  ownership_coverage = 'research_pending',
  primary_advantage = 'Shovel-ready, publicly owned industrial park with confirmed AEP electric and Columbia Gas service, priced below market at $10,000/acre.',
  primary_risk = 'Only 2.7MW of confirmed excess power capacity is currently available — a real, modest constraint, not just an unknown — and 22 of the 44.8 acres are already committed to a Food & Beverage manufacturing designation.',
  developer_assessment = 'weak',
  developer_takeaway = 'Ohio Crossroads Industrial Center offers a shovel-ready, publicly owned 44.8-acre park with confirmed AEP electric and Columbia Gas of Ohio service, outside the FEMA floodplain, and no competing data-center activity or moratorium found in Crawford County. The constraint is capacity, not just confirmation: only 2.7MW of excess power is currently available, and nearly half the site is already earmarked for Food & Beverage use, leaving roughly 22.8 acres for other purposes. A developer should treat this as a smaller-load or phased opportunity rather than a hyperscale campus candidate unless AEP confirms a substantially larger capacity upgrade path.',
  next_steps = array[
    'Request a large-load capacity and substation upgrade assessment from AEP Ohio.',
    'Confirm parcel ownership and acreage directly with the Crawford County Auditor''s office (419-562-7941) or Crawford County Development Board.',
    'Confirm gas delivery capacity with Columbia Gas of Ohio.',
    'Confirm carrier-grade fiber availability with Brightspeed or Omni Fiber.'
  ],
  unknowns_to_verify = array[
    'Available MW beyond the confirmed 2.7MW',
    'Substation name/voltage confirmation',
    'Parcel ownership verification',
    'Carrier-grade fiber availability',
    'Gas pipeline distance/capacity'
  ],
  last_verified_at = now()
where title = 'Ohio Crossroads Industrial Center (Bucyrus, Crawford County)';
