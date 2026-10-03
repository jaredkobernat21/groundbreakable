-- KC metro "Potential Housing Site" pass, round 1 (2026-10-03). First
-- Housing Potential research pass anywhere in the product since the
-- Potential/Planned split was built (20261003180000_housing_potential_subcategory.sql).
-- Covers the same 14-market KC-metro set as the same-day Infrastructure pass
-- (Basehor/Bonner Springs/De Soto/Gardner/Kansas City KS/Lansing/Leavenworth/
-- Lenexa/Olathe/Overland Park/Spring Hill/Tonganoxie, KS, plus Grain Valley
-- and Blue Springs, MO).
--
-- Before researching, queried the live DB directly: confirmed zero existing
-- `prospective_housing_site` rows anywhere (expected -- this is the first
-- pass), and exactly 2 existing `housing_development` (Planned-tier) rows
-- in this metro -- "Bonner Springs Downtown Revitalization" (Bonner
-- Springs, KS) and "Riverbend Heights RHID" (Lansing, KS). Neither is near
-- either candidate added below; no overlap risk.
--
-- =========================================================================
-- THE GRAIN VALLEY LEAD -- BOTH SITES CONVERTED
-- =========================================================================
--
-- The task's strong lead panned out, with real nuance. This pass
-- independently verified -- via Jackson County's and the City of Grain
-- Valley's own public ArcGIS REST services (Future Land Use, Zoning, City
-- Limits, and Annexations layers, queried directly by point/envelope, not
-- screen-read from a static map image) -- the actual current entitlement
-- status of both sewer-project service areas the Infrastructure pass
-- flagged earlier today:
--
--   - Both service areas are UNINCORPORATED Jackson County land today --
--     neither is inside current Grain Valley city limits or the city's own
--     Annexations layer. Annexation is a real, necessary step for both, not
--     assumed.
--   - They are NOT entitlement-equivalent, though. The Northeast
--     Interceptor's own origin point (Duncan & Seymore Rd) sits on a parcel
--     the city's Oct. 2023 Preferred Land Use Plan still designates
--     "Agriculture / Open Space" -- a comp-plan amendment may be needed
--     there specifically, even though ~280+ acres of Medium/High-Density
--     Residential-designated land already exists a short distance further
--     into the same corridor (toward Pink Hill Rd). The SW Grain Valley
--     Extension's service area, by contrast, sits entirely within a single,
--     large (~300+ acre) Low-Density Residential-designated area -- the
--     comp-plan question is already resolved there; only annexation,
--     standard zoning, and the sewer funding itself (currently absent from
--     the city's CIP) remain.
--   - A specific, named rezoning request WAS found near the Northeast
--     site's own intersection (DBL Architecture, C-1 to C-2/R-3, a gas
--     station plus two residential lots at Duncan & Buckner Tarsney Rd) --
--     but it was DENIED by the Planning & Zoning Commission in September
--     2025 after resident opposition, and it is a different, much smaller,
--     already-resolved parcel, not a live proposal covering any part of
--     either service area. Does not disqualify either site as Potential
--     (no live specific project exists at either), but is logged as real,
--     relevant local entitlement history, not swept under the rug.
--   - Real nearby demand evidence, not fabricated: Woodbury (an existing
--     subdivision literally at Duncan & Buckner Tarsney Rd, within the
--     Northeast site's own immediate area) recorded 15 home sales in the
--     trailing 180 days at $303,000-$538,000 per a regional brokerage's own
--     listing data (RE/MAX Midstates) -- real, recent, nearby absorption,
--     though it measures an adjacent built subdivision, not these specific
--     undeveloped service areas. Rosewood Hills (the subdivision the city's
--     own CIP names as the Northwest Interceptor's direct precedent) has
--     been in continuous, multi-phase development since 2002 (~500 families,
--     8th-9th phase underway per the same source), listed $350,000-$600,000.
--
-- Both sites clear the bar on their own facts -- real, city-acknowledged
-- infrastructure change; a real, named historical precedent for the same
-- growth pattern in the same city; real nearby absorption; and, critically,
-- no specific housing project/filing/plat exists at either site today (only
-- the unrelated, denied, much smaller DBL Architecture parcel). Both are
-- added at Discovery readiness (no owner/entitlement work on record), per
-- the brief's explicit instruction not to set a readiness_stage without
-- real evidence of outreach having started.
--
-- =========================================================================
-- OTHER NAMED INFRASTRUCTURE ROWS CHECKED FOR A HOUSING ANGLE -- NONE ADDED
-- =========================================================================
--
--   - Spring Hill Wastewater Treatment Plant Expansion: re-checked directly.
--     This is a citywide capacity story (existing plant at ~71% of
--     permitted capacity, 5-10 years of headroom at current growth) with no
--     specific NEW site or acreage figure tied to it anywhere in available
--     reporting -- unlike Grain Valley's interceptors, nothing publicly
--     names a parcel or corridor this plant specifically unlocks. Fails the
--     "real site, not just vacant land or general capacity" bar. Not added.
--   - Olathe $213M+ Water/Sewer Capital Program (Lone Elm Park sewer
--     extension specifically): re-checked directly against the city's own
--     bid document. The ~400-acre development claim in this metro's
--     existing infrastructure_project row's own description could not be
--     independently re-confirmed this pass -- the primary-source bid
--     document describes a short (~1,200 ft), modest ($1.45M) 18-inch line
--     built TO connect INTO Lone Elm Park itself (a 155-acre public park)
--     across a Cedar Creek tributary, reading as park-internal
--     infrastructure, not a residential land-opening project. No
--     residential-specific intent found. Not added; this is a genuine
--     re-check finding (the existing row's acreage claim may be
--     overstated), not a new Potential site either way.
--   - Centennial Bridge Replacement (Leavenworth): re-checked directly. A
--     real, large, multi-year river-crossing project, but no specific
--     riverfront parcel or residential proposal is tied to it in any
--     available source on either the Leavenworth, KS or Platte County, MO
--     side. Downtown Leavenworth does have real recent residential
--     activity (nearly 400 loft units cited in unrelated coverage), but
--     it's not connected to the bridge project in any source found. Too
--     diffuse for a site-specific Potential row. Not added.
--
-- =========================================================================
-- REMAINING 13 MARKETS -- INDEPENDENT SWEEP, ZERO ADDITIONAL CANDIDATES
-- =========================================================================
--
-- Checked each of the other 13 KC-metro markets directly for annexation,
-- rezoning, comp-plan, and infrastructure activity with a housing angle.
-- The consistent finding across nearly every market: real, active,
-- currently-growing housing markets, but every concrete signal found is
-- already a SPECIFIC, named project/filing/plat working through each
-- city's own process -- which is Planned-tier territory (a separate
-- research pass, not this one), not an undiscovered Potential site. Adding
-- any of these as "Potential" would misrepresent land that is not
-- undiscovered at all. Specific findings, all excluded on this basis:
--   - De Soto, KS: Flint Meadows West (240+ duplex units, approved) and an
--     80+/- acre, 200+ single-family-lot project already under grading for
--     Summer 2026 delivery, both tied to the Panasonic-corridor growth area.
--   - Gardner, KS: Horizon Point (78 annexed acres, Arise Homes, 246 homes)
--     and ~1,400 more homes already "in the works" per the city's own 2025
--     annual development report.
--   - Tonganoxie, KS: a named 140+-home State Avenue neighborhood already
--     working through city hall with a requested tax abatement.
--   - Basehor, KS: an active, contested R-1B rezoning proposal already in
--     front of the council (residents citing traffic/school/sewer strain).
--   - Lenexa, KS: multiple named, recently-approved projects (Enclave at
--     Twin Creeks, Hedge Lane, the Habitat for Humanity Clear Creek
--     subdivision, Solera) covering the obvious growth corridors.
--   - Olathe, KS: five newly-approved single-family subdivisions (138 lots)
--     concentrated in the Mur-Len/Black Bob/Ridgeview corridors per the
--     city's own Q4 2025 development report, plus a just-adopted 15-year
--     growth guide (Elevate Olathe, April 2026) that sets a Future Growth
--     Area but names no specific undeveloped site distinct from the above.
--   - Overland Park, KS: a named 167th Street project (343 apartments + 122
--     homes) already through Planning Commission, plus a citywide zoning-
--     code overhaul (eliminating single-family-only districts entirely,
--     targeting Dec. 2026 adoption) that is a real entitlement-environment
--     change but is citywide, not a specific site -- doesn't produce a
--     Potential SITE row on its own.
--   - Kansas City, KS (Wyandotte County): small, routine subdivision
--     rezonings (e.g. a 15-lot COZ on S. 53rd St) plus a new statewide
--     by-right ADU law driving a city zoning review -- real but citywide/
--     policy-level, not a specific site.
--   - Blue Springs, MO: a $65M water/sewer revenue bond (April 2026 voter
--     authorization) for citywide system renovation -- the WWTP is
--     described as "nearing capacity," a real growth-capacity signal, but
--     no specific newly-opened parcel or corridor was found tied to it.
--   - Leavenworth, KS: a 2026 Comprehensive Plan Update is in first-draft
--     review and explicitly asks "where should new housing go" -- a real
--     signal that the city itself hasn't yet decided, which is precisely
--     why no specific site can honestly be named from it yet. Worth
--     revisiting once the plan's land-use map is adopted.
-- Zero new candidates in these 13 markets this pass -- an honest result,
-- not a shortfall. This metro's housing growth is real and fast-moving
-- right now, which is exactly why most of its developable land is already
-- spoken for by named projects rather than sitting as undiscovered
-- opportunity.

insert into sources (agency, title, source_type, url, published_date) values
  ('Grain Valley News', 'Planning and Zoning denies application for rezoning; Board of Aldermen meeting recap', 'news',
   'https://www.grainvalleynews.com/news/planning-and-zoning-denies-application-for-rezoning-board-of-aldermen-meeting-recap', '2025-09-11'),
  ('City of Grain Valley', 'Preferred Land Use Plan (from October 2023 Comprehensive Plan)', 'agency_document',
   'https://www.cityofgrainvalley.org/images/general/preferred_land_use_plan_map_20220926_jpg_24014.jpg', '2023-10-06'),
  ('City of Grain Valley / Esri ArcGIS', 'Grain Valley Public Information Map (Future Land Use, Zoning, City Limits, Annexations, Parcels layers)', 'agency_document',
   'https://gvch.maps.arcgis.com/apps/webappviewer/index.html?id=37cac2b2f50044f9aeef43105969146c', null),
  ('Jackson County, Missouri', 'Jackson County Parcel Viewer', 'agency_document',
   'https://jcgis.jacksongov.org/parcelviewer/', null),
  ('RE/MAX Midstates', 'Woodbury Subdivision Real Estate - Homes For Sale in Woodbury Subdivision, Grain Valley, MO', 'other',
   'https://www.remax-midstates.com/kansascity/realestatehomesforsale/woodbury-grain-valley-mo', null),
  ('RE/MAX Midstates', 'Rosewood Hills Subdivision Real Estate - Homes For Sale in Rosewood Hills Subdivision, Grain Valley, MO', 'other',
   'https://www.remax-midstates.com/kansascity/realestatehomesforsale/rosewood-hills-grain-valley-mo', null);

insert into catalysts (
  market_id, title, catalyst_type, description, address, latitude, longitude,
  influence_radius_meters, status, estimated_value, estimated_scale_note,
  confidence, signal_categories, signal_confidence, power_load_mw,
  source_id, additional_source_ids,
  why_it_matters, unknowns_to_verify,
  housing_type, demand_notes, entitlement_status, entitlement_notes,
  sewer_notes, water_notes, site_notes, estimated_yield, economics_notes,
  opportunity_catalyst, people, readiness_stage, next_steps, why_this_site
) values
(
  (select id from markets where slug = 'grain-valley-mo'),
  'Northeast Growth Corridor (East of Buckner Tarsney Rd / North of Duncan Rd)',
  'prospective_housing_site',
  'Unincorporated Jackson County land east of Buckner Tarsney Road and north of Duncan Road, Grain Valley, MO, now reachable by the city''s Northeast Sewer Interceptor Phase 1 (~5,600 ft of 27-inch gravity main plus a new lift station at Duncan/Seymore Rd, partially funded 2024-2026, cost-shared between developers and the City). The city''s own 2025-2029 Capital Improvements Plan states sewer service has been "the main hold up" on development here, cites property owners'' "repeated requests about development potential," and explicitly names its own prior Northwest Interceptor as precedent -- that project preceded the real Rosewood Hills and Woodbury subdivisions nearby. No specific housing project, plat, or rezoning filing currently covers this corridor (a separate, much smaller rezoning request at the same general intersection -- a gas station plus two residential lots -- was denied in September 2025; it does not overlap this service area).',
  'East of Buckner Tarsney Road, north of Duncan Road, Grain Valley, MO (unincorporated Jackson County) -- geocoded to the Duncan Road & Seymore Road intersection, the interceptor''s own stated origin point; no parcel-level service-area boundary has been published by the city',
  39.018, -94.185,
  1600, 'under_study', null,
  '~180 acres of sewer-constrained land described by the city as newly developable (city''s own figure, not independently itemized by parcel); the interceptor''s own origin parcel is ~42 acres, with an estimated 280+ additional acres of Medium/High-Density Residential-designated land further into the same corridor per city GIS',
  'reported', '{}', null, null,
  (select id from sources where url = 'https://www.cityofgrainvalley.org/files/community_development/cip_2025_2029_77518.pdf'),
  array[
    (select id from sources where url = 'https://gvch.maps.arcgis.com/apps/webappviewer/index.html?id=37cac2b2f50044f9aeef43105969146c'),
    (select id from sources where url = 'https://www.cityofgrainvalley.org/images/general/preferred_land_use_plan_map_20220926_jpg_24014.jpg'),
    (select id from sources where url = 'https://jcgis.jacksongov.org/parcelviewer/'),
    (select id from sources where url = 'https://www.grainvalleynews.com/news/planning-and-zoning-denies-application-for-rezoning-board-of-aldermen-meeting-recap'),
    (select id from sources where url = 'https://www.remax-midstates.com/kansascity/realestatehomesforsale/woodbury-grain-valley-mo'),
    (select id from sources where url = 'https://www.remax-midstates.com/kansascity/realestatehomesforsale/rosewood-hills-grain-valley-mo')
  ],
  'The clearest Opportunity-Catalyst-driven Potential Housing candidate found anywhere in the KC metro this pass -- a city explicitly, publicly stating sewer was the blocker, funding a fix with the developers who benefit, and pointing to its own direct precedent (Rosewood Hills, Woodbury) for exactly this growth pattern.',
  array[
    'Whether the Preferred Land Use Plan''s "Agriculture / Open Space" designation at the interceptor''s own origin parcel will be amended to a residential category, versus whether the city intends the already-residential-designated land further into the corridor (toward Pink Hill Rd) to be the real development target',
    'Current ownership of the specific parcels within the ~180-acre service area, and whether any owner has engaged the city about annexation',
    'Whether Northeast Sewer Interceptor Phase 1 is now fully funded (the CIP lists it only as "partially funded 2024-2026")',
    'Exact parcel-level boundary of the ~180 acres the city describes as newly developable',
    'Whether the September 2025 DBL Architecture rezoning denial (a different, smaller, nearby parcel) reflects any broader resident sentiment toward new development in this corridor, or was specific to that proposal''s gas-station/fueling-station component'
  ],
  'mixed_residential',
  'No population/permit-level demand study specific to this corridor was found. The clearest available signal is nearby, not on-site: Woodbury, an existing subdivision at Duncan & Buckner Tarsney Rd within this same general area, recorded 15 home sales in the trailing 180 days at $303,000-$538,000 per a regional brokerage''s own listing data (RE/MAX Midstates, not independently cross-checked against MLS records) -- real, recent buyer demand in the immediate submarket, though this measures an adjacent, already-built subdivision, not this specific undeveloped service area.',
  'entitlement_required',
  'Confirmed directly via Jackson County/Grain Valley GIS (Zoning and City Limits layers, queried by point): the interceptor''s own origin point is unincorporated Jackson County land, outside current Grain Valley city limits, with no city zoning applied (status "Unincorporated"). Development would require annexation plus zoning -- likely R-1 or a planned-residential district, matching the pattern used for Rosewood Hills/Woodbury. The city''s own Preferred Land Use Plan designates this specific origin parcel "Agriculture / Open Space," not yet a residential category, so a comprehensive-plan amendment may also be needed there specifically, even though roughly 280+ acres of Medium- and High-Density Residential-designated land already exists a short distance further into the same corridor per the same GIS layer. A separate, smaller, already-resolved rezoning request near this same intersection (DBL Architecture, C-1 to C-2/R-3 for a gas station plus two residential lots) was denied by the Planning & Zoning Commission in September 2025 after resident opposition over traffic, lighting, and environmental concerns -- real, relevant local history, though a different, much smaller parcel, not a live proposal over any part of this service area.',
  'Northeast Sewer Interceptor Phase 1: ~5,600 ft of 27-inch gravity sewer main along Seymore Road plus a new lift station at Duncan/Seymore. Partially funded 2024-2026 per the city''s 2025-2029 CIP, cost shared between developers and the City, with the City recovering its outlay as development follows -- the same cost-recovery structure the city used for its prior Northwest Interceptor (the Rosewood Hills/Woodbury precedent).',
  'Jackson County GIS parcel data shows this general area split between City of Grain Valley municipal water and Public Water Supply District 16 -- water-service boundary status varies by parcel and was not resolved down to the specific service area in this pass.',
  'No parcel-level service-area boundary has been published by the city -- it describes this only as land "east of Buckner Tarsney Road and north of Duncan Road." Jackson County GIS confirms real, distinct platted parcels exist throughout this area (multiple parcel IDs, Grain Valley School District, Sni Valley/Central fire service). The interceptor''s own origin point sits on a single ~42-acre parcel currently zoned "Unincorporated" and designated "Agriculture / Open Space" on the city''s Future Land Use plan; roughly 280+ additional acres further into the corridor already carry Medium- and High-Density Residential future-land-use designations per the same GIS layer. No floodplain, topography, or wetlands assessment was independently found for this pass.',
  null,
  'No land-basis or per-acre asking-price data was found for this specific service area. For context only, not a land basis: finished homes in the adjacent, already-built Woodbury subdivision (Duncan & Buckner Tarsney Rd) sold in the $303,000-$538,000 range over the trailing 180 days, and finished homes in Rosewood Hills (the city''s own named precedent subdivision, still in its 8th-9th phase after starting in 2002) are priced $350,000-$600,000, both per RE/MAX Midstates'' own listing data.',
  'Funded (partially), developer-cost-shared Northeast Sewer Interceptor Phase 1 removes the single factor the city''s own Capital Improvements Plan calls "the main hold up" on this corridor, with the city explicitly naming its prior Northwest Interceptor as direct precedent for the real Rosewood Hills and Woodbury subdivisions nearby.',
  '{"government": {"municipality": "City of Grain Valley, MO"}}'::jsonb,
  null,
  array[
    'Confirm current funding status of Northeast Sewer Interceptor Phase 1 (CIP lists it as only partially funded as of the 2025-2029 cycle)',
    'Identify specific parcel owners within the service area and whether any have initiated or discussed annexation with the city',
    'Monitor Planning & Zoning Commission / Board of Aldermen agendas for any comprehensive-plan amendment or rezoning filing in this corridor',
    'Verify with city planning staff whether the Agriculture/Open Space designation at the interceptor''s own origin parcel is expected to be updated alongside the sewer project'
  ],
  'The Northeast Sewer Interceptor Phase 1 -- funded in part by the developers who will build here -- is removing the one constraint Grain Valley''s own Capital Improvements Plan calls "the main hold up" on this corridor, with the city explicitly naming its prior Northwest Interceptor as the direct precedent for Rosewood Hills and Woodbury, two real, actively-selling subdivisions nearby. The land itself remains unincorporated and largely unentitled today -- annexation, zoning, and in part a comprehensive-plan amendment are still ahead -- but the infrastructure catalyst and the city''s own stated rationale are unusually explicit for a Discovery-stage site.'
),
(
  (select id from markets where slug = 'grain-valley-mo'),
  'SW Growth Corridor (West of Grain Valley South Middle School)',
  'prospective_housing_site',
  'Unincorporated Jackson County land west of Grain Valley South Middle School, Grain Valley, MO, targeted by the city''s SW Grain Valley Sewer System Extension (~2,690 ft of 10-inch sewer main) -- currently UNFUNDED per the city''s 2025-2029 Capital Improvements Plan, targeted for the 2028/2029 cycle. The city cites the same rationale and precedent as the Northeast Interceptor (sewer-led growth following the Rosewood Hills/Woodbury pattern), but this is the earlier-stage, more conservative of the two Grain Valley candidates -- no construction timeline is committed. Unlike the Northeast site, this land already carries a Low-Density Residential designation on the city''s own Preferred Land Use Plan, so the comprehensive-plan question is already resolved in its favor; sewer funding and annexation are the remaining gates. No specific housing project, plat, or rezoning filing currently covers this corridor.',
  'West of Grain Valley South Middle School, Grain Valley, MO (unincorporated Jackson County) -- geocoded near the school; no parcel-level service-area boundary has been published by the city',
  38.990, -94.218,
  1600, 'under_study', null,
  'No acreage figure has been published by the city for this specific extension (its own CIP describes it only as opening "vacant land west of South Middle School to City growth"). City GIS shows the surrounding Low-Density Residential-designated area totals roughly 300+ contiguous acres (the largest single mapped polygon ~237.6 acres), though not all of it is necessarily within this specific 2,690 ft extension''s eventual service reach',
  'reported', '{}', null, null,
  (select id from sources where url = 'https://www.cityofgrainvalley.org/files/community_development/cip_2025_2029_77518.pdf'),
  array[
    (select id from sources where url = 'https://gvch.maps.arcgis.com/apps/webappviewer/index.html?id=37cac2b2f50044f9aeef43105969146c'),
    (select id from sources where url = 'https://www.cityofgrainvalley.org/images/general/preferred_land_use_plan_map_20220926_jpg_24014.jpg'),
    (select id from sources where url = 'https://jcgis.jacksongov.org/parcelviewer/'),
    (select id from sources where url = 'https://www.remax-midstates.com/kansascity/realestatehomesforsale/rosewood-hills-grain-valley-mo')
  ],
  'A cleaner but earlier-stage entitlement story than the Northeast site -- the comprehensive plan already designates this land for residential use, so sewer funding (currently absent from the city''s CIP) is the real gating item, worth tracking before it becomes a funded, competitive corridor.',
  array[
    'Whether and when the currently-unfunded sewer extension gets funded (city''s own CIP targets 2028/2029 with no firm commitment)',
    'Exact boundary/acreage of land the specific 2,690 ft, 10-inch extension would actually serve, versus the broader ~300+-acre Low-Density Residential-designated area found via city GIS',
    'Current ownership and annexation status of the specific parcels in the service area',
    'Water-service provider/boundary status for this specific corridor (not independently checked this pass)'
  ],
  'large_single_family',
  'No population/permit-level demand study specific to this corridor was found. Rosewood Hills -- the established subdivision the city''s own CIP names as the precedent for this sewer-led growth pattern -- has been in continuous, multi-phase development since 2002 (approximately 500 families, in its 8th-9th phase per the real-estate data reviewed this pass), priced $350,000-$600,000 per RE/MAX Midstates'' own listing data -- real, sustained, multi-phase absorption in the same city using the same growth mechanism, though not a direct measurement of demand for this specific unfunded extension''s own service area.',
  'entitlement_required',
  'Confirmed directly via Grain Valley GIS (Future Land Use, Zoning, City Limits, and Annexations layers, queried by point): this service area is unincorporated Jackson County land, outside current Grain Valley city limits and not covered by the city''s own Annexations layer. Development would require annexation. Unlike the Northeast Interceptor site, the Preferred Land Use Plan already designates this land Low-Density Residential -- the comprehensive-plan question is already resolved in favor of residential use, leaving annexation and standard R-1/planned-residential zoning (following the same path as the adjoining, already-zoned Cross Creek area) as the primary entitlement steps, alongside the sewer funding itself.',
  'SW Grain Valley Sewer System Extension: ~2,690 ft of 10-inch sewer main. UNFUNDED per the city''s 2025-2029 CIP, targeted 2028/2029 -- no construction timeline is committed.',
  null,
  'No parcel-level service-area boundary has been published by the city -- it describes this only as "vacant land west of South Middle School." City GIS shows this land sits within a contiguous Low-Density Residential-designated area of roughly 300+ acres (several adjoining parcels, the largest single polygon ~237.6 acres); current zoning in the same area is a mix of "Agricultural" (unzoned county land) and "R-1 Residential Single-Family" (already-zoned, likely the adjoining built Cross Creek-area subdivisions). No floodplain, topography, or wetlands assessment was independently found for this pass.',
  null,
  'No land-basis or per-acre asking-price data was found for this specific service area. For context only, not a land basis: finished homes in Rosewood Hills (the city''s own named precedent subdivision for this growth pattern) are priced $350,000-$600,000 per RE/MAX Midstates'' own listing data.',
  'A second, earlier-stage sewer extension targets land the city''s own Preferred Land Use Plan already designates Low-Density Residential -- the land''s eventual use is already settled by the comprehensive plan; sewer funding, not entitlement, is the limiting factor.',
  '{"government": {"municipality": "City of Grain Valley, MO"}}'::jsonb,
  null,
  array[
    'Monitor future CIP funding cycles for this extension (last targeted 2028/2029, currently unfunded)',
    'Identify current owners of unincorporated parcels directly served by the planned extension',
    'Confirm with city planning staff the specific boundary of parcels intended to be served once funded'
  ],
  'A second, smaller, earlier-stage sewer extension targets land immediately west of Grain Valley South Middle School and adjoining the established, still-growing Rosewood Hills subdivision -- land the city''s own Preferred Land Use Plan already designates Low-Density Residential. The entitlement question is effectively pre-answered by the comprehensive plan; sewer funding -- currently absent from the city''s CIP -- is the real gating item, which is exactly the kind of early, pre-funding signal worth tracking before it becomes competitive.'
);
