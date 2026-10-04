-- K-7 / McIntyre Road Industrial Rezoning (Lansing, KS) -- deep research pass (Jared's 2026-10-04
-- research-quality brief), third and final KC-metro site. Unlike Bonner Springs and Eisenhower
-- Road, this pass surfaces a genuine NEGATIVE finding that must not be smoothed over: FEMA data is
-- now CONFLICTING on floodplain status (an earlier pass's Zone X finding at one nearby point is
-- contradicted by this pass's Zone AE finding at a different nearby point within the same ~145-acre
-- tract -- likely a creek/drainage feature cutting through part of it). floodplain_constrained
-- moves from false to NULL (genuinely unresolved, not "clear") rather than picking whichever
-- result looks better. A second new finding -- Leavenworth County''s own (since-expired) data-
-- center moratorium debate -- also argues for a more cautious read of the entitlement/approval
-- picture than the original unanimous-vote framing suggested. Together these justify a WATCH
-- developer assessment, not Pursue -- the brief's own discipline ("do not raise confidence when
-- major claims remain assumptions") applies in the negative direction too: new evidence can argue
-- for LOWER confidence, not just higher.
--
-- potential_score moves 55 -> 58 -- a small net change, not a clean upgrade like the other two
-- sites: fiber/gas/land-precision evidence pushes some components up, the floodplain conflict and
-- entitlement-climate finding pull others down. See each component's evidence/unknowns for the
-- reasoning. approval_pillar_label moves favorable -> moderate; power/site pillar labels
-- unchanged (still moderate -- no site-specific power resolution, and site/land fundamentals are
-- a wash given the floodplain reopening offsetting the acreage-breakdown resolution).

insert into sources (agency, title, source_type, url, published_date) values
  ('Wikipedia', 'Southern Star Central Gas Pipeline', 'other',
   'https://en.wikipedia.org/wiki/Southern_Star_Central_Gas_Pipeline', null),
  ('CitizenPortal.ai', 'Leavenworth authorizes easement to Southern Star Gas for Centennial Bridge pipeline relocation', 'news',
   'https://citizenportal.ai/articles/9933643/Kansas/Leavenworth-County/Leavenworth-City/Leavenworth-authorizes-1-easement-to-Southern-Star-Gas-for-Centennial-Bridge-pipeline-relocation', null);

update catalysts set
  potential_score = 58,
  potential_score_components = '[
    {"key":"power_grid","points":17,"evidence":["Evergy''s KCC-approved Large Load Power Service (LLPS) tariff and \"Path to Power\" active-queue process (Docket 25-EKME-315-TAR) confirmed to apply territory-wide across Leavenworth County -- VERIFIED, the same mechanism confirmed for Bonner Springs and Eisenhower Road"],"unknowns":["No substation, transmission line, voltage, or MW figure found for this corridor specifically"],"status":"supported"},
    {"key":"land_expansion","points":13,"evidence":["The disputed 145-vs-170-acre question is RESOLVED this pass: Ordinance 11-30 rezoned exactly ~145 acres into three districts -- R-4 Multifamily (~39 ac), I-1 Light Industrial (~85.5 ac, this site), and B-3 Regional Business (~21.5 ac) -- VERIFIED with a precise breakdown, not just a headline total"],"unknowns":["Current ownership and actual marketing/availability status of the 85.5-acre I-1 parcel remain unresolved"]},
    {"key":"fiber_connectivity","points":6,"evidence":["AT&T Fiber and Spectrum confirmed as real broadband providers in the broader Leavenworth area -- SUPPORTED at a regional level, same finding as Eisenhower Road"],"unknowns":["Nothing Lansing- or K-7/McIntyre-corridor-specific found; last-mile availability REQUIRES DIRECT CONFIRMATION"],"status":"supported"},
    {"key":"government_incentives","points":5,"evidence":[],"unknowns":["No specific incentive program identified beyond the rezoning itself (unchanged)"]},
    {"key":"development_entitlement","points":7,"evidence":["Unanimous 8-0 Lansing City Council vote (Ordinance 11-30) completed a real agricultural-to-industrial rezoning, handily exceeding the 6-member supermajority a valid protest petition required -- VERIFIED","Directly implements Lansing''s Comprehensive Plan growth direction for this corridor (unchanged)"],"unknowns":["NEW this pass: Leavenworth County (not Lansing city) passed a since-expired 90-day data-center-application moratorium in May 2026 amid organized opposition to a different, already-logged proposal -- whether this county-level climate has any bearing on this already-rezoned, city-zoned parcel is unconfirmed, and argues for somewhat more caution than the unanimous vote alone suggested"]},
    {"key":"physical_environmental_risk","points":3,"evidence":[],"unknowns":["CONFLICTING FEMA data this pass: a live NFHL ArcGIS REST query at one representative point within the tract returned Zone AE (within the 100-year floodplain), contradicting an earlier pass''s Zone X finding at a different nearby point -- likely a creek/drainage feature cutting through part of the ~145-acre tract. Do NOT treat this site as floodplain-clear. REQUIRES DIRECT CONFIRMATION via a parcel-boundary-specific query, not a nearby point."]},
    {"key":"water_cooling","points":3,"evidence":["Lansing''s wastewater plant treats approximately 850,000 GPD of city flow plus approximately 450,000 GPD from the Lansing Correctional Facility (~1.3 MGD combined current flow) -- VERIFIED current flow"],"unknowns":["The plant''s design/rated capacity -- needed to compute real headroom, unlike Bonner Springs/Eisenhower Road -- was not found this pass","Lansing appears to receive wholesale potable water from Kansas City, KS rather than operating its own treatment plant -- SUPPORTED, not pinned to one specific source"]},
    {"key":"transportation_workforce","points":4,"evidence":["Direct K-7 Highway and US-73 corridor access (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  zoning_status = 'I-1 Light Industrial -- VERIFIED directly against Ordinance 11-30''s detailed breakdown: the full ~145-acre tract was rezoned into three districts -- R-4 Multifamily (~39 acres), I-1 Light Industrial (~85.5 acres, this site), and B-3 Regional Business (~21.5 acres). The ~170-acre figure some public commenters cited at the hearing appears to simply be inaccurate, not a second valid interpretation.',
  available_acreage_status = 'RESOLVED this pass: the disputed 145-vs-170-acre question is settled -- Ordinance 11-30 rezoned exactly ~145 acres into R-4 (~39 ac), I-1 (~85.5 ac, this site), and B-3 (~21.5 ac); the ~170-acre figure was inaccurate. Current ownership and actual development/marketing status of the 85.5-acre I-1 parcel remain unresolved.',
  floodplain_status = 'CONFLICTING this pass: a live FEMA NFHL ArcGIS REST query at one representative point within the broader ~145-acre tract returned Zone AE (within the 100-year floodplain), contradicting an earlier pass''s Zone X finding at a different nearby point (13877 McIntyre Rd). Both are representative points, not an exhaustive query against the actual 85.484-acre I-1 parcel boundary -- likely explained by a creek or drainage feature cutting through part of the tract. Do NOT treat this site as floodplain-clear. Requires Direct Confirmation via a proper parcel-boundary query.',
  floodplain_constrained = null,
  natural_gas_notes = 'Southern Star Central Gas Pipeline confirmed to physically operate an 8-inch interstate pipeline within Leavenworth County (easement granted 1959, pipeline installed 1959-60), and Kansas Gas Service confirmed to receive deliveries from Southern Star for the Leavenworth market -- VERIFIED at a county level. Distance and specific delivery capacity to this parcel are unconfirmed -- Requires Direct Confirmation.',
  fiber_notes = 'General broadband search found AT&T Fiber and Spectrum serving the broader Leavenworth area generally -- SUPPORTED at a regional level, not independently source-pinned this pass. Nothing Lansing- or K-7/McIntyre-corridor-specific found. Last-mile availability Requires Direct Confirmation.',
  water_notes = 'Lansing''s wastewater plant treats approximately 850,000 GPD of city flow plus approximately 450,000 GPD from the Lansing Correctional Facility (~1.3 MGD combined current flow) -- VERIFIED current flow. The plant''s design/rated capacity (needed to compute real headroom, unlike Bonner Springs/Eisenhower Road) was not found this pass -- UNKNOWN. Water: Lansing appears to receive wholesale potable water from Kansas City, KS rather than operating its own treatment plant -- SUPPORTED, not pinned to one specific source this pass.',
  community_friction_notes = 'City council''s own vote record describes the rezoning as passing "over resident objections." Confirmed this pass: a valid protest petition was filed, requiring a 6-member supermajority to pass -- the council nonetheless passed it 8-0, handily exceeding that threshold. Separately, Leavenworth County (not Lansing city specifically) passed a since-expired 90-day data-center-application moratorium in May 2026 amid organized opposition to a different, already-logged proposal (Tonganoxie''s Project Bluestem) -- whether this county-level climate has any bearing on this already-rezoned, city-zoned parcel is unconfirmed. Requires Direct Confirmation with Lansing''s own planning department.',
  approval_pillar_label = 'moderate',
  primary_advantage = 'The disputed total tract acreage is now resolved (145 acres across three confirmed zoning districts, 85.5 of them I-1 industrial), and the same KCC-approved Evergy large-load interconnection pathway available elsewhere in this metro applies here too. Southern Star Central Gas Pipeline is confirmed to physically operate within Leavenworth County.',
  primary_risk = 'Two new findings warrant real caution: FEMA data is now CONFLICTING on whether part of this tract sits within the 100-year floodplain -- this site should not be treated as floodplain-clear until a proper parcel-boundary query is run. Separately, current ownership (reported only as Jay Healy / Epic Estates 3 LLC via a single news article) could not be independently verified this pass, and Leavenworth County''s own recent data-center moratorium debate signals a more contentious regional political climate than the unanimous 2026 rezoning vote alone suggested.',
  developer_assessment = 'watch',
  developer_takeaway = 'The acreage picture is now fully resolved (85.5 of 145 rezoned acres are I-1 industrial), and gas infrastructure is confirmed at the county level, but two things should give a developer real pause before advancing: FEMA data is now conflicting on whether part of this tract sits in the 100-year floodplain, and Leavenworth County''s recent data-center moratorium debate signals a more contentious regulatory climate than the unanimous 2026 rezoning vote implied. Ownership also remains unverified beyond a single news report. A developer should resolve the floodplain conflict and confirm current ownership before investing further diligence here.',
  next_steps = array[
    'Request a parcel-specific floodplain determination from Leavenworth County or FEMA -- not a nearby-point estimate.',
    'Directly query Leavenworth County''s GIS department or the county Appraiser''s office for parcel ID and current ownership -- their public data is static downloads, not self-serve queryable.',
    'Confirm with Lansing''s planning department whether Leavenworth County''s data-center moratorium activity affects this city-zoned parcel.',
    'Submit a Path to Power inquiry to Evergy for this parcel.',
    'Contact Southern Star Central Gas Pipeline / Kansas Gas Service for distance and delivery capacity to this specific parcel.'
  ],
  unknowns_to_verify = array[
    'Floodplain status -- FEMA data is conflicting (Zone X at one nearby point, Zone AE at another); requires a proper parcel-boundary query (Requires Direct Confirmation)',
    'Current ownership of the 85.5-acre I-1 parcel -- reported only as Jay Healy / Epic Estates 3 LLC via a single news article, not independently verified against KS Secretary of State or county assessor records (Cannot Be Resolved This Pass -- KS SOS search requires an interactive form, county GIS is static downloads only)',
    'Substation capacity, transmission voltage/distance, and MW figure specific to this parcel (Requires Direct Confirmation -- Evergy)',
    'Natural gas pipeline distance to this specific parcel -- Southern Star''s 8-inch interstate pipeline is confirmed somewhere in Leavenworth County, not pinned to this site (Requires Direct Confirmation -- operator)',
    'Wastewater plant design/rated capacity for Lansing, as opposed to current flow only (Requires Direct Confirmation -- Lansing Public Works)',
    'Whether Leavenworth County''s data-center moratorium debate has any bearing on this already-rezoned, city-zoned parcel (Requires Direct Confirmation -- Lansing Planning Department)'
  ],
  additional_source_ids = array[
    (select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%'),
    (select id from sources where url ilike '%curb.kansas.gov%CURB_News_25Q4%'),
    (select id from sources where url ilike '%wikipedia.org%Southern_Star_Central_Gas_Pipeline%'),
    (select id from sources where url ilike '%citizenportal.ai%Centennial-Bridge-pipeline-relocation%')
  ],
  last_verified_at = now()
where title = 'K-7 / McIntyre Road Industrial Rezoning';
