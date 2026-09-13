-- Topeka has had 28 real, sourced shifts on file since earlier sessions
-- (building permits, foreclosures, tax liens, rezonings) but zero rows
-- in development_opportunities -- meaning both Jacob Yohn and Alexander
-- Vaught's "Opportunities" feeds were empty for their home/target
-- market even though the underlying signal data was rich. This
-- converts the strongest already-sourced Topeka shifts into addressed
-- opportunities, reusing their existing source_ids and geocodes rather
-- than doing fresh research -- no new facts, just surfacing what was
-- already on file in the right table.
--
-- Four investor-facing (distress) rows for Jacob (realtor/investor,
-- property_types include redevelopment/infill): two tax-delinquent
-- income properties, two active sheriff-sale addresses. Three
-- contractor-facing (early_project) rows for Alexander and any future
-- Topeka-area GC/trade contractor: two entitled-but-not-yet-built
-- commercial projects and one just-permitted ground-up build.

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'topeka-ks'),
    '3711 SW Park South Ct, Topeka, KS',
    38.999542971282, -95.702649615459,
    'Tax-Delinquent Apartment Complex', 'high', 'distress', 'development',
    array['tax_delinquent','multifamily_income_property'],
    array[
      'Real estate taxes delinquent per Shawnee County Treasurer records (parcel 1462402002008000) -- Crown Point Apartments',
      'Multifamily owners rarely go tax-delinquent without broader financial strain -- worth checking occupancy and deferred-maintenance condition before a value-add approach',
      'Confirm current lien balance and ownership structure directly with the County Treasurer before outreach'
    ],
    array['25ef068e-11ed-4d94-9c71-97fc80edddc6'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'topeka-ks'),
    '2909 SW 37th St, Topeka, KS',
    39.000464191474, -95.714162019203,
    'Tax-Delinquent Big-Box Commercial -- Adaptive Reuse Candidate', 'medium', 'distress', 'development',
    array['tax_delinquent','large_flexible_footprint'],
    array[
      'Real estate taxes delinquent per Shawnee County Treasurer records (parcel 1462301003001000) -- Genesis Health Clubs of Topeka',
      'Large-format fitness/health-club buildings are common adaptive-reuse candidates (self-storage, indoor rec, medical, church) once a tenant vacates or an owner exits',
      'Worth monitoring for a lease termination or ownership change alongside the tax situation'
    ],
    array['25ef068e-11ed-4d94-9c71-97fc80edddc6'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'topeka-ks'),
    '2131 SW Van Buren St, Topeka, KS',
    39.029376630668, -95.681001424671,
    'Scheduled Sheriff Sale -- Single-Family', 'medium', 'distress', 'development',
    array['pre_foreclosure','sheriff_sale_scheduled'],
    array[
      'Active Shawnee County sheriff sale listing (plaintiff Towd Point Mortgage Trust 2022-SJ1) -- a confirmed, dated foreclosure event, not speculation',
      'Pre-sale contact with the owner, ahead of the auction date, is typically the highest-leverage window for a negotiated purchase',
      'Verify exact sale date and case number on the CivilView portal before reaching out -- listings can be postponed or cancelled'
    ],
    array['89bb1e2e-13b1-4506-8f44-7ec5a4058d3e'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'topeka-ks'),
    '5455 SW 17th St, Topeka, KS',
    39.036418799676, -95.747792610055,
    'Scheduled Sheriff Sale -- Single-Family', 'medium', 'distress', 'development',
    array['pre_foreclosure','sheriff_sale_scheduled'],
    array[
      'Active Shawnee County sheriff sale listing (plaintiff Select Portfolio Servicing Inc.) -- a confirmed, dated foreclosure event, not speculation',
      'Pre-sale contact with the owner, ahead of the auction date, is typically the highest-leverage window for a negotiated purchase',
      'Verify exact sale date and case number on the CivilView portal before reaching out -- listings can be postponed or cancelled'
    ],
    array['89bb1e2e-13b1-4506-8f44-7ec5a4058d3e'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'topeka-ks'),
    '4212-4236 SW Burlingame Rd, Topeka, KS',
    38.992774360178, -95.705836803086,
    'Newly Rezoned Commercial Site -- Pre-Construction', 'medium', 'early_project', 'contractor',
    array['recently_rezoned','pre_construction','no_gc_confirmed'],
    array[
      'Planning Commission unanimously approved rezoning ~10 acres from R-1 to I-1 for Valley Self Storage''s covered, temperature-controlled facility -- entitled but not yet under construction',
      'No general contractor has been publicly identified for this project yet -- an open window for outreach before the developer locks one in',
      'Site work and vertical construction typically follow within months of a unanimous rezoning approval like this one'
    ],
    array['d05164ad-668e-4640-a103-418064e20dd1'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'topeka-ks'),
    'SE Madison St & SE 11th St, Topeka, KS',
    39.043379089775, -95.672228779768,
    'Under-Construction 250-Unit Apartment Complex -- Ancillary Garage Approved', 'high', 'early_project', 'contractor',
    array['large_multifamily','active_construction','ancillary_approval'],
    array[
      'Kanza OZ LLC received a conditional use permit for a 20-vehicle enclosed garage supporting an adjacent 250-unit apartment complex -- confirms the larger project is active and moving through approvals',
      'A project of this scale typically carries ongoing subcontractor needs across multiple trades as construction proceeds',
      'The ancillary garage approval itself is a fresh, small-scope scope-of-work opening worth inquiring about directly'
    ],
    array['d05164ad-668e-4640-a103-418064e20dd1'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'topeka-ks'),
    '2620 SE California Ave, Topeka, KS',
    39.0199675957759, -95.650871090564,
    'New Commercial Construction -- Fuel Station & Canopy', 'medium', 'early_project', 'contractor',
    array['new_commercial_permit','footing_foundation_stage'],
    array[
      'Footing and foundation permit just issued for a new Walmart fuel station with canopy and signage -- ground-up construction beginning now',
      'Early-stage commercial permits like this are a reliable, low-competition lead source before a project is publicly known to be underway',
      'National retailers typically use regional GCs with local subs already lined up -- worth confirming the assigned GC before assuming an open slot'
    ],
    array['340255fa-3c14-47db-969c-e9e54b888b3a'::uuid],
    '2026-09-07'
  );
