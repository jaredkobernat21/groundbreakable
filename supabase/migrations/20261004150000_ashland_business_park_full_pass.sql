-- Ashland Business Park (Ford Drive & Wells Road, Ashland County, OH) -- full buyer-intelligence
-- promotion + public-record escalation pass, fourth and final of "the additional 4" sites outside
-- KC metro. The priority question (whether Montgomery Township's 2-year data-center moratorium,
-- enacted June 2026, has any jurisdiction over this city-owned park) is NOT resolved this pass --
-- Ohio township zoning never applies inside a municipality's corporate limits, and a real,
-- repeated pattern of the City of Ashland annexing exactly this industrial corridor out of
-- Montgomery Township was found (2017, 2023, Feb/Mar 2025, Jan 2026 actions) -- SUPPORTED that the
-- actively developed footprint is being kept inside city limits, but no source confirms the full
-- 57+51-acre undeveloped corridor is itself annexed as of the moratorium's June 2026 date. That is
-- the single thing that should change this from Watch to Pursue, and it genuinely has not been
-- confirmed -- Requires Direct Confirmation via Ashland's planning department or a working County
-- Auditor GIS parcel query (auditor.ashlandcountyoh.us returned 403 this pass, not independently
-- queryable). nearest_substation_name deliberately left null -- no name was found for the new
-- FirstEnergy/Ohio Edison Milton Township substation despite independent confirmation that it
-- exists (FirstEnergy's own newsroom, T&D World) -- do not invent one.
--
-- potential_score moves 42 -> 47: physical_environmental_risk resolved via a direct FEMA query
-- (+3), power_grid +1 for confirmed gas utility, development_entitlement +1 for the real (if
-- still inconclusive) annexation-pattern evidence -- deliberately NOT a large jump, since the
-- decisive moratorium-boundary question remains open.

update catalysts set
  why_this_site = 'Actively growing, city-marketed industrial park with a nearby major transmission substation and no known data-center activity. A neighboring township''s data-center moratorium and this park''s exact municipal boundary are the principal items to confirm.',
  potential_score = 47,
  potential_score_components = '[
    {"key":"power_grid","points":13,"evidence":["FirstEnergy/Ohio Edison territory; a new $11.6M, 138kV/69kV transmission substation independently re-confirmed this pass (FirstEnergy''s own newsroom, T&D World) -- built specifically to serve \"Milton Township, Ashland and nearby communities\" (22,000+ customers), tying into existing 138kV lines via two new short lines","Columbia Gas of Ohio confirmed serving Ashland, OH -- SUPPORTED via the Ashland Area Chamber of Commerce member directory"],"unknowns":["No published name, MW, or available-capacity figure for the substation; no confirmed distance to this specific park -- do not infer a nearest-substation fact without a name"],"status":"supported"},
    {"key":"land_expansion","points":7,"evidence":["57 developable acres plus 51 further undeveloped acres opened by the Wells Road extension; 13 existing businesses, 600+ daily employees (unchanged)"],"unknowns":["Ashland County Auditor''s parcel GIS (auditor.ashlandcountyoh.us) returned a 403 this pass -- not independently queryable; current available acreage of the 57+51-acre corridor remains Unknown After Public-Record Search"]},
    {"key":"fiber_connectivity","points":2,"evidence":[],"unknowns":["No named carrier (Zayo/Lumen/AT&T) found for this corridor despite a real search this pass -- Unknown After Public-Record Search"]},
    {"key":"government_incentives","points":6,"evidence":["City-owned park; City of Ashland purchased additional industrial-park acreage in January 2026 (unchanged)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":7,"evidence":["Already zoned industrial with 13 operating businesses and multiple 2025-2026 construction approvals (unchanged)","A real, repeated pattern of the City of Ashland annexing this exact industrial corridor out of Montgomery Township was found this pass (2017, 2023, Feb/Mar 2025, Jan 2026 actions) -- SUPPORTED that the actively developed footprint is being kept inside city limits"],"unknowns":["Montgomery Township''s 2-year data-center moratorium (unanimous, June 2026) applies only within the township''s unincorporated territory -- whether the full 57+51-acre undeveloped corridor is itself annexed as of that date is NOT confirmed by any source found. This is the single most consequential open question for this site -- Requires Direct Confirmation via Ashland''s planning department or a working County Auditor GIS parcel query."]},
    {"key":"physical_environmental_risk","points":7,"evidence":["RESOLVED this pass: a direct FEMA NFHL ArcGIS REST query at the park''s geocoded coordinates returned Zone X, SFHA_TF=False -- VERIFIED"],"unknowns":[]},
    {"key":"water_cooling","points":1,"evidence":[],"unknowns":["No water/sewer capacity figures found for this park despite a search this pass"]},
    {"key":"transportation_workforce","points":4,"evidence":["Direct access to US-250 via the Wells Road extension; Ashland Railway short line serves the broader region; 600+ employees already commuting daily (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  development_environment_notes = 'Already zoned industrial with a real, active, growing tenant base (unchanged). RESOLVED PARTIALLY this pass: a real, repeated pattern of the City of Ashland annexing exactly this industrial corridor out of Montgomery Township was found (2017 -- 30 ac, partly ex-Montgomery Twp; 2023 -- 91 ac near US-250/I-71, explicitly "located in Montgomery Township" pre-annexation; Feb 2025 petition for 5.4 ac more "near the existing industrial park," confirmed annexed by June 2025; March 2025 special session on a 120-acre annexation; Jan 2026 council land purchase in the park) -- SUPPORTED that the city has been actively keeping this corridor''s developed footprint inside its own limits, specifically to accommodate this park''s growth. However, no source confirms the full 57+51-acre undeveloped corridor is itself annexed as of Montgomery Township''s June 2026 moratorium date -- Ohio township zoning never applies inside a municipality''s corporate limits, so this remains the decisive open question, not a formality. Requires Direct Confirmation via Ashland''s planning department or a working County Auditor GIS parcel query (auditor.ashlandcountyoh.us returned a 403 this pass).',
  risk_notes = 'RESOLVED this pass: a direct FEMA NFHL ArcGIS REST query at the park''s geocoded coordinates returned Zone X (Area of Minimal Flood Hazard, SFHA_TF=False) -- VERIFIED.',
  serving_utility = 'FirstEnergy / Ohio Edison — Verified',
  transmission_voltage_kv = 138,
  total_acreage = 108,
  zoning_status = 'Industrial',
  floodplain_status = 'Outside 100-Year Floodplain',
  floodplain_constrained = false,
  gas_pipeline_operator = 'Columbia Gas of Ohio',
  available_acreage_status = 'Partially Resolved',
  owners = '[
    {"name":"City of Ashland","entity":"Municipal ownership","last_verified":"2026-10-04","source":"https://www.ashlandsource.com/2025/06/12/crown-jewlz-eyes-property-at-ashlands-industrial-park-adjacent-to-amazon/"}
  ]'::jsonb,
  ownership_coverage = 'full',
  primary_advantage = 'Actively developing industrial park with direct access to a newly built 138kV-connected transmission substation and multiple recent industrial tenants.',
  primary_risk = 'An adjacent township''s 2-year data-center moratorium may or may not extend to this specific parcel — the park''s exact city-limits boundary has not been independently verified.',
  developer_assessment = 'watch',
  developer_takeaway = 'Ashland Business Park sits in a corridor the City of Ashland has been steadily annexing out of Montgomery Township specifically to accommodate this park''s growth, and a major FirstEnergy transmission substation now serves the area. However, Montgomery Township''s new 2-year data-center moratorium creates real uncertainty until this parcel''s exact municipal status is confirmed. Floodplain risk is verified as minimal. A developer should confirm annexation/zoning status directly with Ashland''s planning department before advancing.',
  next_steps = array[
    'Confirm with Ashland''s planning department whether this specific parcel is within city limits or Montgomery Township.',
    'Request a large-load capacity assessment from FirstEnergy/Ohio Edison.',
    'Confirm gas delivery capacity with Columbia Gas of Ohio.',
    'Confirm fiber carrier presence with a regional broker.'
  ],
  unknowns_to_verify = array[
    'Municipal jurisdiction (city vs. township)',
    'Available MW / substation capacity',
    'Current vacant acreage',
    'Fiber carrier presence'
  ],
  last_verified_at = now()
where title = 'Ashland Business Park (Ford Drive & Wells Road, Ashland, Ashland County)';
