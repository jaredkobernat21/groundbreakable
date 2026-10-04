-- National Road Business Park (Zanesville, Muskingum County, OH) -- full buyer-intelligence
-- promotion + public-record escalation pass, first of "the additional 4" sites outside KC metro
-- (Nashville's Middle Tennessee Industrial Center and Mansfield OH's two sites are separate
-- migrations). This row had never received the buyer-intelligence structured-field pass or the
-- escalation-hierarchy research KC metro's 3 sites already got -- this migration does both in one
-- step, writing developer-facing fields directly in the clean presentation style (no research-
-- process language) while potential_score_components keeps its full explainable evidence detail
-- (that field isn't rendered to the developer panel directly, same architecture as the KC sites).
--
-- Notable finding: the FEMA NFHL REST query at this park's coordinates returned an EMPTY result
-- set, not a Zone X confirmation -- reported honestly as "No FEMA Flood Hazard Zone Identified"
-- (floodplain_constrained left null) rather than claiming "outside the floodplain," which would
-- overstate an inconclusive query as a clean result.
--
-- potential_score moves 46 -> 59 on real new evidence: a verified on-site fiber provider
-- (AT&T, 100 Gig) and verified water/sewer excess capacity, both independently corroborated via a
-- commercial-listing source with specific figures, plus a real AEP Ohio PUCO-approved data-center
-- tariff (effective July 2025) that didn't exist in the original research.

insert into sources (agency, title, source_type, url, published_date) values
  ('ZoomProspector', 'National Road Business Park -- Property Listing', 'other',
   'https://properties.zoomprospector.com/OHIO/property/admin/d759e797-82e7-4caa-b0e2-2aad02e3b9dd', null),
  ('Public Power (APPA)', 'Ohio regulators order utility to create data-center-specific tariff', 'news',
   'https://www.publicpower.org/periodical/article/ohio-regulators-order-utility-create-data-center-specific-tariff', null),
  ('KJK', 'Regulating the Surge: Legal Analysis of AEP Ohio''s Data Center Tariff and PUCO''s Approval', 'other',
   'https://kjk.com/2025/11/14/regulating-surge-legal-analysis-aep-ohios-data-center-tariff-and-pucos-approval/', '2025-11-14'),
  ('Muskingum County, OH', 'Muskingum County Zoning -- Purpose & Facts', 'agency_document',
   'https://www.muskingumcountyoh.gov/Media/Muskingum-County-Zoning-Purpose-Facts.pdf', null);

update catalysts set
  why_this_site = 'Intergovernmentally funded 203-acre industrial park with no zoning restrictions, verified fiber and water/sewer capacity, and access to AEP Ohio''s new data-center tariff program. Large-load power capacity beyond the site''s current 3 MW is the principal item remaining to confirm.',
  potential_score = 59,
  potential_score_components = '[
    {"key":"power_grid","points":13,"evidence":["AEP Ohio territory -- 12.47kV on-site distribution service, 138kV transmission circuit 2.8 miles away, extendable to a newly-built AEP-owned station -- independently re-confirmed this pass via a second source (ZoomProspector listing)","AEP Ohio''s PUCO-approved data-center-specific tariff (effective July 9, 2025) for new loads 25MW+ is now a real, named mechanism (85% minimum-billed capacity, 4-year ramp, 3-year minimum-charge exit fee) -- VERIFIED via Public Power (APPA) and independent KJK legal analysis"],"unknowns":["Only 3MW of excess distribution capacity confirmed on-site -- a real, modest, limiting figure, not an estimate of eventual large-load capacity","No named substation identified for the \"newly-built AEP-owned station\" referenced in the listing -- Unknown After Public-Record Search","Whether Muskingum County specifically falls within AEP''s new tariff''s practical service area is not separately confirmed"],"status":"verified"},
    {"key":"land_expansion","points":12,"evidence":["203-acre SiteOhio-certified park, 121 contiguous developable acres (unchanged, re-confirmed)","Zoning confirmed as unrestricted -- the park''s township is not among the only 3 of Muskingum County''s 26 townships that are zoned at all, corroborating the listing''s \"no zoning restrictions\" claim via the county''s own zoning-purpose document -- VERIFIED"],"unknowns":["Precise remaining uncommitted acreage beyond the one leased tenant building still not itemized"]},
    {"key":"fiber_connectivity","points":8,"evidence":["AT&T confirmed on-site, 100 Gig maximum bandwidth -- VERIFIED via ZoomProspector listing, a material upgrade from the original pass''s \"no fiber data found\""],"unknowns":["No Zayo or Lumen presence found; single-source (not independently cross-checked against a second carrier-facing source)"],"status":"verified"},
    {"key":"government_incentives","points":7,"evidence":["Intergovernmentally funded and operated (Port Authority, county, city); $3.6M All-Ohio Future Fund grant (2025); SiteOhio and USA BEST Sites certifications (unchanged)"],"unknowns":[]},
    {"key":"development_entitlement","points":8,"evidence":["SiteOhio certification plus one real built/leased tenant (unchanged)","No zoning restrictions independently corroborated via the county''s own zoning-purpose document -- VERIFIED, not just the listing''s own claim"],"unknowns":["No county- or township-level data-center moratorium found despite a direct search -- SUPPORTED absence, not formally confirmed to remain true going forward given Ohio''s statewide moratorium trend"]},
    {"key":"physical_environmental_risk","points":4,"evidence":[],"unknowns":["FEMA NFHL REST query at the park''s coordinates returned an EMPTY result set -- genuinely inconclusive, not a confirmation of minimal flood hazard. Report as \"No FEMA Flood Hazard Zone Identified,\" never as \"outside the floodplain.\""]},
    {"key":"water_cooling","points":4,"evidence":["Water: Muskingum County, 18\" lines, 1.5M GPD excess capacity -- VERIFIED","Sewer: Muskingum County, 16\" lines, 360,000 GPD excess capacity -- VERIFIED"],"unknowns":["Both figures from a single commercial-listing source, not independently cross-checked against a county utility page this pass"],"status":"verified"},
    {"key":"transportation_workforce","points":3,"evidence":["Direct US-40/East Pike frontage, Zanesville/I-70 corridor labor market (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  power_notes = 'AEP Ohio territory. 12.47kV on-site distribution service; a 138kV transmission circuit sits 2.8 miles from the park, extendable to a newly-built AEP-owned station on request. 3MW of excess distribution capacity is confirmed available on-site. AEP Ohio''s PUCO-approved data-center-specific tariff (effective July 9, 2025, for loads 25MW+) is a real, named large-load mechanism, independently confirmed via Public Power/APPA and KJK legal analysis. No named substation was identified for the referenced AEP-owned station.',
  natural_gas_notes = 'The Energy Cooperative confirmed on-site, 30 MCFH excess capacity -- VERIFIED via ZoomProspector listing.',
  land_notes = '203-acre SiteOhio-certified park, 121 contiguous developable acres. Zoning confirmed unrestricted -- independently corroborated via Muskingum County''s own zoning-purpose document (only 3 of 26 townships are zoned at all; this park''s township is not among them). Owned by the Zanesville-Muskingum County Port Authority (contact: Eric Reed, (740) 455-0742, eric@zmcport.com) -- VERIFIED via the county auditor''s indexed parcel data (51-70-03-13-000, 4700 East Pike) cross-confirming the same owner as the Port Authority''s own listing.',
  serving_utility = 'AEP Ohio — Verified',
  transmission_voltage_kv = 138,
  transmission_distance_miles = 2.8,
  potential_load_mw_low = 3,
  available_capacity_status = 'verified',
  total_acreage = 203,
  contiguous_acreage = 121,
  zoning_status = 'No Zoning Restrictions (Unzoned Township)',
  floodplain_status = 'No FEMA Flood Hazard Zone Identified',
  floodplain_constrained = null,
  gas_pipeline_operator = 'The Energy Cooperative',
  fiber_notes = 'AT&T — 100 Gig on-site',
  water_notes = 'Muskingum County',
  owners = '[
    {"name":"Zanesville-Muskingum County Port Authority","public_contact":{"phone":"(740) 455-0742","email":"eric@zmcport.com","website":"https://www.zmcport.com"},"last_verified":"2026-10-04","source":"https://properties.zoomprospector.com/OHIO/property/admin/d759e797-82e7-4caa-b0e2-2aad02e3b9dd"}
  ]'::jsonb,
  ownership_coverage = 'full',
  power_pillar_label = 'moderate',
  site_pillar_label = 'strong',
  primary_advantage = 'No zoning restrictions, on-site AT&T 100 Gig fiber, and verified water (1.5M GPD) and sewer (360,000 GPD) excess capacity at a publicly owned, SiteOhio-certified park.',
  primary_risk = 'Only 3 MW of electric capacity is currently available on-site; extending the 138kV transmission line 2.8 miles away would be required for a large continuous load, and that extension''s cost and timeline are unconfirmed.',
  developer_assessment = 'pursue',
  developer_takeaway = 'National Road Business Park offers a publicly owned, SiteOhio-certified industrial site with no zoning restrictions, on-site AT&T fiber, and verified water and sewer capacity. AEP Ohio''s new PUCO-approved data-center tariff gives large loads (25MW+) a defined path, but only 3 MW of distribution capacity exists on-site today -- extending the nearby 138kV transmission line is the real power question. Gas service (The Energy Cooperative) and entitlement conditions are both favorable. If large-load power delivery is confirmed, the site warrants deeper diligence.',
  next_steps = array[
    'Request a large-load capacity assessment from AEP Ohio under its new data-center tariff.',
    'Confirm transmission extension cost and timeline for the 138kV line 2.8 miles from the site.',
    'Confirm gas delivery capacity with The Energy Cooperative.',
    'Contact the Zanesville-Muskingum County Port Authority (Eric Reed) regarding site control and current availability.'
  ],
  unknowns_to_verify = array[
    'Available MW beyond current 3 MW distribution capacity',
    'Transmission extension cost and timeline',
    'Firm energization timeline',
    'Muskingum County data-center zoning posture'
  ],
  last_verified_at = now()
where title = 'National Road Business Park (Zanesville, Muskingum County)';
