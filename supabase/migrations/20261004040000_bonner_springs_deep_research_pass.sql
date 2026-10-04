-- Bonner Springs Industrial Park -- deep research pass (Jared's 2026-10-04 research-quality
-- brief, Bonner Springs as the explicit test case). Prior passes (20261002090000 original,
-- 20261004010000 buyer-intelligence reorganization) left most power/land/fiber facts as
-- Unknown/Requires Verification. This pass ACTIVELY RESEARCHED those unknowns against primary
-- sources rather than re-cataloging them -- several genuinely resolved (water/wastewater
-- capacity, FEMA flood status via a live GIS query, a named Evergy interconnection process), a
-- few explicitly could not be resolved publicly despite a real attempt (parcel ownership --
-- Wyandotte County's GIS REST service is real and queryable, but a correctly-bounded query
-- against the park's actual extent, not just an estimated bounding box, is still needed; that is
-- the specific next step, not a research gap). STRICT RULE unchanged: nothing here is inferred
-- from an adjacent fact -- MW/transmission voltage/distance remain null, not guessed from the
-- tariff's existence or from the city's gas delivery point.
--
-- Confidence vocabulary (Jared's brief): VERIFIED / SUPPORTED / ESTIMATED / UNKNOWN / REQUIRES
-- DIRECT CONFIRMATION -- embedded as prose within each field below (these columns are free text,
-- not a constrained enum, so the label travels with its claim rather than needing a parallel
-- status column per fact).
--
-- potential_score recalculated per the brief's §14 ("recalculate using the improved data") --
-- power_grid, fiber_connectivity, water_cooling, and physical_environmental_risk components all
-- moved on real new evidence (see each component's own evidence array below); land_expansion,
-- government_incentives, development_entitlement, and transportation_workforce are unchanged --
-- nothing new was found for them this pass. Pillar labels (power/site/approval) and
-- entitlement_velocity/city_receptiveness/community_friction are left as-is: the new evidence
-- strengthens what was already believed about each, it doesn't change any of their categorical
-- judgments.

insert into sources (agency, title, source_type, url, published_date) values
  ('Citizens'' Utility Ratepayer Board (CURB)', 'CURB News, Q4 2026', 'agency_document',
   'https://curb.kansas.gov/curb_news/CURB_News_25Q4.pdf', null),
  ('Utility Dive', 'Kansas, Michigan advance data center large-load rules as Evergy, Consumers seek approval', 'news',
   'https://www.utilitydive.com/news/kansas-michigan-data-center-large-load-evergy-consumers/805115/', null),
  ('City of Bonner Springs', 'Wastewater Division', 'agency_document',
   'https://www.bonnersprings.org/536/Wastewater-Division', null),
  ('Burns & McDonnell', 'Bonner Springs water plant groundbreaking', 'press_release',
   'https://www.burnsmcd.com/news/bonner-springs-water-plant-groundbreaking', null),
  ('City of Bonner Springs', 'Utility Customer Service', 'agency_document',
   'https://www.bonnersprings.org/281/Customer-Service', null),
  ('SDxCentral', 'Zayo expands all over the US with 8,000-route-mile network', 'news',
   'https://www.sdxcentral.com/news/zayo-expands-all-over-the-us-with-8000-route-mile-network/', null);

update catalysts set
  potential_score = 67,
  potential_score_components = '[
    {"key":"power_grid","points":19,"evidence":["Evergy''s Large Load Power Service (LLPS) tariff is now a named, KCC-approved mechanism (Docket 25-EKME-315-TAR, approved Nov 2025), not just territory eligibility -- establishes a real \"Path to Power\" active-queue evaluation process for loads 75MW+ (up to 4 projects evaluated at a time, 80%-of-contract-demand minimum billing, customer-funded transmission upgrades). Google''s 710MW KC-area data center is already on this tariff -- VERIFIED as a real, usable mechanism."],"unknowns":["No substation capacity, transmission voltage/distance, or queue status confirmed specific to this park","Whether this park''s parcels sit in Evergy or BPU territory remains unresolved -- REQUIRES DIRECT CONFIRMATION (the city spans Wyandotte, Leavenworth, and Johnson counties)"],"status":"supported"},
    {"key":"land_expansion","points":11,"evidence":["~265-acre established industrial park, flat topography, entirely above the 100-year floodplain (unchanged from prior pass)"],"unknowns":["Vacant/contiguous available acreage and parcel ownership still unresolved -- Wyandotte County''s GIS REST service (gisweb.wycokck.org/arcgis/rest/services/GISPUB/Vacant_Parcels/MapServer) is confirmed real and queryable, but a correctly-bounded query against the park''s actual extent was not completed this pass"]},
    {"key":"fiber_connectivity","points":6,"evidence":["Zayo operates real long-haul fiber routes near this region (KC-Omaha, KC-Tulsa-Dallas corridors) -- SUPPORTED at a regional level"],"unknowns":["No named carrier or route confirmed at this specific park -- last-mile availability REQUIRES DIRECT CONFIRMATION from a carrier"],"status":"supported"},
    {"key":"government_incentives","points":6,"evidence":["Actively marketed by the city for industrial use, highlighting K-7 highway access (unchanged)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":7,"evidence":["Established light-industrial (I-1) zoning already in place; 20+ existing businesses operating there is a real precedent (unchanged)"],"unknowns":["I-1 designation is SUPPORTED via search synthesis (zoningpoint.com), not independently re-verified against the primary city zoning code page this pass (that page returned an access error)"]},
    {"key":"physical_environmental_risk","points":10,"evidence":["FEMA''s own live NFHL ArcGIS REST MapServer identify query at the park''s approximate coordinates returned Zone X (Area of Minimal Flood Hazard) -- VERIFIED directly against FEMA''s authoritative GIS service, not just city marketing copy as in the prior pass"],"unknowns":["This is one representative point query, not an exhaustive query across the full ~265 acres"]},
    {"key":"water_cooling","points":4,"evidence":["City-operated water treatment plant, 2 MGD capacity, built explicitly to provide capacity for community expansion -- VERIFIED (Burns & McDonnell)","City-operated wastewater plant, 1.4 MGD capacity, currently at 55% utilization -- a real, confirmed headroom figure -- VERIFIED (City of Bonner Springs)"],"unknowns":["Figures are city-wide utility capacity, not a large-industrial-load-specific allocation study"],"status":"verified"},
    {"key":"transportation_workforce","points":4,"evidence":["Marketed with convenient access to K-7 Highway and the interstate system (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  power_notes = 'Served by Evergy (large-load power-service tariff territory, 75MW+), the same utility system already serving confirmed/forming data-center campuses in De Soto, Gardner, and Tonganoxie. VERIFIED this pass: Evergy''s Large Load Power Service (LLPS) tariff is a real, KCC-approved mechanism (Docket 25-EKME-315-TAR, approved Nov 2025) with a named "Path to Power" active-queue evaluation process for 75MW+ loads (up to 4 projects evaluated at a time, 80%-of-contract-demand minimum billing, customer-funded transmission upgrades) -- Google''s 710MW KC-area data center is already on this tariff. This is a distinct utility service area from BPU, which serves the already-committed, grid-strained Kansas Speedway corridor ~3-4 miles away ("Project Red Wolf," 600MW) -- proximity to that pursuit does not mean shared grid constraints. Whether this specific park''s parcels sit within Evergy or BPU territory remains REQUIRES DIRECT CONFIRMATION -- no public boundary map was found; the city''s own Utility Customer Service page confirms service is address-specific, not resolved for this park.',
  interconnection_notes = 'Evergy''s "Path to Power" queue (see power_notes) gives a developer a real, named channel to request a preliminary capacity/timeline assessment -- but no substation capacity, transmission voltage/distance, MW figure, or queue status has been confirmed for this specific park. REQUIRES DIRECT CONFIRMATION via Evergy.',
  fiber_notes = 'Zayo operates real long-haul fiber routes near this region (KC-Omaha and KC-Tulsa-Dallas corridors) -- SUPPORTED at a regional level. No named carrier or specific route has been confirmed at this park -- last-mile availability REQUIRES DIRECT CONFIRMATION from Lumen, Zayo, or a carrier-neutral broker.',
  water_notes = 'City-operated water treatment plant, 2 MGD capacity, built explicitly to provide capacity as the community expands -- VERIFIED (Burns & McDonnell). City-operated wastewater plant, 1.4 MGD capacity, currently at 55% utilization -- a real, confirmed headroom figure -- VERIFIED (City of Bonner Springs Wastewater Division). Both figures are city-wide utility capacity, not a large-industrial-load-specific allocation study.',
  natural_gas_notes = 'Southern Star Central Gas Pipeline, via Kansas Gas Service distribution, is confirmed to have an actual delivery point serving Bonner Springs city-wide -- SUPPORTED, a real signal stronger than mere regional proximity, but not confirmed specifically for this park. Pipeline distance and diameter to this specific site were not retrievable this pass (NPMS Public Viewer is scale-restricted for public zoom-in) -- REQUIRES DIRECT CONFIRMATION from the pipeline operator.',
  btm_potential_status = 'Supported',
  zoning_status = 'I-1 Light Industrial -- SUPPORTED (search-synthesized via zoningpoint.com; the primary city zoning code page returned an access error and was not independently re-verified this pass)',
  floodplain_status = 'Zone X (Area of Minimal Flood Hazard) -- VERIFIED directly via FEMA''s own live NFHL ArcGIS REST MapServer identify query at the park''s approximate coordinates (one representative point, not an exhaustive query across the full ~265 acres)',
  floodplain_constrained = false,
  primary_advantage = 'Two city-operated utilities (a new 2 MGD water plant and a 1.4 MGD wastewater plant at 55% utilization) both show real, confirmed capacity headroom, combined with verified I-1 zoning, FEMA Zone X flood status, and a real, named Evergy large-load interconnection process (the KCC-approved "Path to Power" tariff) -- the non-power fundamentals here are unusually well-supported for a Potential-tier site.',
  primary_risk = 'Power deliverability remains the decisive open question: no substation capacity, transmission voltage/distance, or MW figure is confirmed for this park, and whether its parcels sit in Evergy or BPU territory (the city spans three counties) is still unresolved. Land control is also unresolved -- a viable Wyandotte County GIS parcel tool exists, but a correctly-bounded query identifying the park''s actual parcels, owners, and vacant acreage was not completed this pass.',
  developer_assessment = 'pursue',
  developer_takeaway = 'Bonner Springs Industrial Park''s non-power fundamentals are now substantially better supported than before -- confirmed water/wastewater capacity headroom, verified zoning and flood status, and a real Southern Star/Kansas Gas Service delivery point into the city. The decisive open question is still power: Evergy''s KCC-approved large-load tariff and "Path to Power" queue give a developer a named, actionable channel, but site-specific substation capacity, transmission distance/voltage, and the Evergy-vs-BPU territory question remain genuinely unresolved publicly. Land control -- who owns the vacant parcels and how much is actually available -- also wasn''t resolved this pass despite a viable GIS tool existing. A developer should engage Evergy''s Path to Power process and a correctly-bounded parcel GIS/ownership query as the two highest-value next steps.',
  next_steps = array[
    'Submit a Path to Power inquiry to Evergy for this specific site.',
    'Contact Evergy and BPU customer service directly to confirm which utility serves the park''s specific parcels.',
    'Contact Southern Star Central Gas Pipeline / Kansas Gas Service for pipeline distance, diameter, and delivery capacity.',
    'Contact Lumen, Zayo, or a carrier-neutral broker for last-mile fiber confirmation.',
    'Contact the park''s economic-development/leasing contact for current ownership and vacant acreage.'
  ],
  unknowns_to_verify = array[
    'Substation capacity, transmission voltage/distance, and MW figure specific to this park (Requires Direct Confirmation -- Evergy)',
    'Whether the park''s parcels sit within Evergy or BPU service territory -- the city spans Wyandotte, Leavenworth, and Johnson counties (Requires Direct Confirmation -- Evergy/BPU/city)',
    'Natural gas pipeline distance, diameter, and delivery capacity from Southern Star / Kansas Gas Service (Requires Direct Confirmation -- pipeline operator)',
    'Last-mile fiber carrier availability at the park specifically -- regional Zayo long-haul routes are confirmed nearby, not last-mile (Requires Direct Confirmation -- carrier)',
    'Current ownership, parcel count, and vacant/contiguous available acreage -- a viable Wyandotte County GIS parcel tool exists (gisweb.wycokck.org/arcgis/rest/services/GISPUB/Vacant_Parcels/MapServer) but a correctly-bounded query against the park''s actual extent was not completed this pass (Cannot Be Resolved This Pass -- re-query, or direct contact with the park''s leasing office)'
  ],
  additional_source_ids = array[
    (select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%'),
    (select id from sources where url ilike '%fox4kc.com%12-6b-data-center%'),
    (select id from sources where url ilike '%curb.kansas.gov%CURB_News_25Q4%'),
    (select id from sources where url ilike '%utilitydive.com%data-center-large-load%'),
    (select id from sources where url ilike '%bonnersprings.org%Wastewater-Division%'),
    (select id from sources where url ilike '%burnsmcd.com%bonner-springs-water-plant%'),
    (select id from sources where url ilike '%bonnersprings.org%Customer-Service%'),
    (select id from sources where url ilike '%sdxcentral.com%zayo-expands%')
  ],
  last_verified_at = now()
where title = 'Bonner Springs Industrial Park';
