-- Continues the market-by-market coverage audit (Jared, 2026-09-07):
-- Basehor, Bonner Springs, and Lawrence all already had at least one
-- development_opportunities row, but each also had real, addressed,
-- well-sourced shifts on file that were never promoted -- the same
-- pattern as the Topeka gap, just less total (these markets weren't
-- fully empty, only under-covered). All content below reuses existing
-- shifts' addresses, geocodes, and source_ids -- no new research.
--
-- Selection was deliberately not exhaustive: Lawrence alone has 38
-- shifts, most of them routine single-permit filings (an electrical
-- permit here, a plumbing permit there) that don't rise to the level
-- of a standalone "opportunity" -- only the handful of genuinely
-- notable, multi-signal stories were promoted (a 122-lot subdivision,
-- a city-backed affordable housing project, a funded multifamily
-- rehab, and the city's largest capital project). Same standard
-- applied to Basehor and Bonner Springs.

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'basehor-ks'),
    'N 155th St & Maple St, Basehor, KS',
    39.139054151686, -94.938731148137,
    'Approved 55+ Residential Development -- Pre-Construction', 'medium', 'early_project', 'contractor',
    array['approved_development_plan','pre_construction','no_gc_confirmed'],
    array[
      'Final Development Plan for Sundance Villas: 5 buildings, 12 units, one community building on 2 acres, with ~55% open space -- exceeds the city''s 20% PRD minimum, per the Planning Commission agenda',
      'Final Development Plan stage means entitlement work is essentially done -- vertical construction is the next real step',
      'No general contractor has been publicly identified yet for this project -- an open window for outreach'
    ],
    array['8a3f3743-9257-4018-a4b3-a4d8a5d54bef'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'basehor-ks'),
    'Kansas Ave & 158th St, Basehor, KS',
    39.087200039989, -94.945802968599,
    'Approved Rezoning (Contested) -- Neighborhood Residential', 'medium', 'zoning', 'development',
    array['recently_rezoned','contested_entitlement'],
    array[
      'Ordinance 1008 rezones the parcel from R-0 to R-1b (up to 5.0 units/acre) for neighborhood residential development, adjacent to Glenwood Ridge Elementary',
      'A protest petition was filed and discussed at the Council meeting -- approved despite opposition, which can mean a motivated seller/developer or continued friction ahead',
      'Confirm the protest petition''s current legal status directly with the city before treating this as fully settled'
    ],
    array['b4ff4ad6-2136-4631-90f7-a710a0cc1a23'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'bonner-springs-ks'),
    '118th St & State Ave, Bonner Springs, KS',
    39.116180029762, -94.853723990425,
    'Approved $539M Entertainment District Rezoning', 'high', 'early_project', 'development',
    array['major_rezoning_approved','national_developer','multi_year_buildout'],
    array[
      '~180 acres rezoned for a Mattel-branded entertainment district (Mattel Adventure Park, restaurants, lodging, retail) -- developer Epic Resort Destinations -- one of the largest projects in the metro',
      'Developer has until 2027 to begin vertical construction, with completion expected 2030 -- a multi-year buildout means surrounding land and ancillary opportunities keep opening up over time',
      'A project this size typically drives outsized nearby land appreciation well before completion'
    ],
    array['1075ed10-ae38-4b3c-a553-827228479a20'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'bonner-springs-ks'),
    '118th St & State Ave, Bonner Springs, KS',
    39.116180029762, -94.853723990425,
    'Approved $539M Entertainment District -- Multi-Year Construction Pipeline', 'high', 'early_project', 'contractor',
    array['major_rezoning_approved','multi_year_buildout','no_gc_confirmed'],
    array[
      'Same ~180-acre, $539M Destination KCK approval -- vertical construction must begin by 2027, running through a 2030 completion',
      'A project of this scale will need contractors across nearly every trade over several years, well before any single GC announcement covers the whole build',
      'Early positioning with the developer (Epic Resort Destinations) or its eventual local GC partners is worth pursuing now, well ahead of groundbreaking'
    ],
    array['1075ed10-ae38-4b3c-a553-827228479a20'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'bonner-springs-ks'),
    'Northern Bonner Springs, KS (exact address not yet published)',
    null, null,
    '184-Unit Single-Family Rental Community -- Approved, No Incentives Needed', 'medium', 'early_project', 'development',
    array['approved_development','build_to_rent','privately_funded'],
    array[
      'Cavan Properties received rezoning approval for "The Bungalows at Bonner Springs" -- 184 single-family rental homes, a build-to-rent asset class in high investor demand nationally',
      'No public incentives were requested for this project, meaning it''s privately funded and likely to move on its own timeline rather than waiting on city budget cycles',
      'Exact site address not yet published -- confirm via the City of Bonner Springs Current Development Projects page before treating this as actionable'
    ],
    array['5c255fb5-9f2c-4e92-8c57-b2e02d39cd9b'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'lawrence-ks'),
    '1760 E 1100 Rd, Lawrence, KS',
    38.994609622102, -95.297706661435,
    'Approved 122-Lot Subdivision Plat -- Pre-Construction', 'high', 'early_project', 'development',
    array['approved_plat','large_subdivision','open_space_set_aside'],
    array[
      'Preliminary plat unanimously approved for Hunters Hill -- 122 residential lots (including 20 duplex lots) on ~45.5 acres, with 10.55 acres of protected open space',
      'A rezoning request for additional low-density housing has also been submitted -- the project may still grow before it''s finalized',
      'City staff can administratively approve the final plat if it stays in substantial compliance -- a faster path to buildable lots than most subdivisions',
      'Building permits still require final plat approval and easement/right-of-way dedication -- not yet at the shovel-ready stage'
    ],
    array['7f016584-f48e-4b27-a08e-b2d17d94eee5'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'lawrence-ks'),
    'Southeast corner of K-10 and Bob Billings Pkwy, Lawrence, KS',
    null, null,
    '133-Unit Affordable Community -- City-Backed, Construction Imminent', 'high', 'early_project', 'development',
    array['city_incentive_backed','zoning_approved','construction_imminent'],
    array[
      'City Commission committed ~$6.9M in incentives (10-year 100% property tax abatement, sales tax exemption on materials, and other waivers) for Floret Hill -- 121 garden apartments plus 12 for-sale townhomes on 14.5 donated acres',
      'Zoning already unanimously approved by both the City of Lawrence and Douglas County -- construction is anticipated to begin soon, with units expected mid-2027',
      'Developer is Wheatland Investments Group, partnering with nonprofit Tenants to Homeowners -- a defined, active development team already in motion'
    ],
    array['8cdb26ec-182e-4cea-ac34-7f52988d745b'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'lawrence-ks'),
    '619 E 8th St, Lawrence, KS',
    38.969323780546, -95.228699178401,
    'Multifamily Rehab -- HVAC, Sewer & Masonry Repairs Funded', 'low', 'early_project', 'contractor',
    array['funded_rehab','hvac_scope','active_occupied_building'],
    array[
      'Poehler Lofts was awarded $20,000 from the City''s 2026 Affordable Housing Trust Fund specifically toward HVAC unit replacement, sewer line replacement, and exterior masonry repair',
      'Owner (Flint Hills Holding Group, LLC) is committing 75% of the total cost -- funding is real and largely already secured, not speculative',
      'A 49-unit building at 95%+ occupancy since 2012 -- an active, well-managed property doing a defined maintenance-scale project, not a distressed one'
    ],
    array['91430e9e-aacf-4099-b596-df009a410794'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'lawrence-ks'),
    'Near O''Connell Rd and Venture Park Dr, Lawrence, KS',
    null, null,
    '$130M Municipal Campus -- Phase 2 Under Construction ($57.5M GMP)', 'high', 'early_project', 'contractor',
    array['active_construction','large_municipal_project','gmp_approved'],
    array[
      'Phase 2 of the Municipal Services and Operations Campus (Solid Waste division + central vehicle maintenance garage) is under construction now on a $57.5M GMP approved Oct. 2025, targeting a fall 2027 finish',
      'The single largest item in the city''s entire 2026-2030 Capital Improvement Plan ($130M total across both phases) -- a long-running, well-funded pipeline of work',
      'Phase 1 is already complete and operational, confirming this is a real, executing project, not a proposal'
    ],
    array['1f8eea9b-a5f3-4c29-8826-9ff0522339ae'::uuid],
    '2026-09-07'
  );
