-- Middle Tennessee Industrial Center (315 S Rutherford Blvd, Murfreesboro, TN) -- full
-- buyer-intelligence promotion + public-record escalation pass, second of "the additional 4"
-- sites outside KC metro. Genuinely mixed result: ownership and floodplain are now resolved
-- (institutional owner identified, FEMA Zone X confirmed directly), but Rutherford County's
-- data-center moratorium is still an ACTIVE, UNRESOLVED regulatory process (in drafting/review,
-- not yet adopted or rejected as of the most recent findable coverage) -- that live uncertainty,
-- not a settled risk, is why this lands on Watch rather than Pursue, same discipline as K-7/
-- McIntyre Road's floodplain-conflict downgrade in the KC-metro set.
--
-- potential_score moves 41 -> 52 on real new evidence (floodplain, water capacity, fiber,
-- power-program specifics) -- development_entitlement deliberately stays flat at 4/10 because the
-- moratorium risk hasn't resolved, it's just been confirmed still actively pending.

insert into sources (agency, title, source_type, url, published_date) values
  ('PR Newswire', 'DRG Acquires Middle Tennessee Land for New Industrial Development', 'press_release',
   'https://www.prnewswire.com/news-releases/drg-acquires-middle-tennessee-land-301879689.html', null);

update catalysts set
  title = 'Middle Tennessee Industrial Center (315 S Rutherford Blvd)',
  why_this_site = 'Institutionally owned Class A industrial park with confirmed zoning, ownership, and minimal flood risk. An active county-level data-center moratorium process is the principal item remaining to resolve.',
  potential_score = 52,
  potential_score_components = '[
    {"key":"power_grid","points":14,"evidence":["Served by Middle Tennessee Electric (MTE), the largest electric co-op in Tennessee, serving Rutherford/Williamson/Wilson/Cannon counties (unchanged)","MTE confirmed to operate a real \"Key Accounts\" large-load program (>300kW or 500kVA transformer threshold) with a General Manufacturing Credit rate option -- SUPPORTED, a genuine (if not data-center-specific) large-load mechanism not found in the original pass","Two named MTE substations (Gateway, Blackman) exist near I-24 in Murfreesboro"],"unknowns":["Neither Gateway nor Blackman substation''s exact distance to this specific park could be confirmed -- Unknown After Public-Record Search, not skipped","No MW figure or data-center-specific tariff found for MTE, unlike KC''s Evergy Path to Power"],"status":"supported"},
    {"key":"land_expansion","points":11,"evidence":["89-acre, 703,920 sq ft, 4-building Class A spec industrial park (36-foot clear height), HI & GI zoning already in place (unchanged)"],"unknowns":["Current vacancy/availability across the 4 buildings was not confirmed"]},
    {"key":"fiber_connectivity","points":5,"evidence":["Zayo confirmed a $90M fiber network investment across Tennessee, specifically described as covering the Nashville area -- SUPPORTED at a regional (Nashville MSA) level"],"unknowns":["Not confirmed as Murfreesboro- or park-specific; no last-mile carrier identified for this site"],"status":"supported"},
    {"key":"government_incentives","points":3,"evidence":["Generally marketed for industrial/warehouse tenants (unchanged)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":4,"evidence":["HI/GI zoning already supports general industrial use, and the park is built and operating (unchanged)"],"unknowns":["Rutherford County''s data-center moratorium remains in active drafting/review as of the most recent findable coverage (planning commission discussion Sept. 28, 2026; county commission public hearing still pending) -- NOT yet adopted, NOT rejected. This is a live, unresolved regulatory process, which is why this factor stays flat rather than improving despite other gains this pass. Residents have separately pushed for a 12-month version with a 2MW threshold."]},
    {"key":"physical_environmental_risk","points":8,"evidence":["RESOLVED this pass: a direct FEMA NFHL ArcGIS REST query at the geocoded address returned Zone X, Area of Minimal Flood Hazard, SFHA_TF=False -- VERIFIED"],"unknowns":[]},
    {"key":"water_cooling","points":3,"evidence":["City of Murfreesboro''s Water Resource Recovery Facility: 20 MGD treatment capacity -- VERIFIED"],"unknowns":["No current utilization/demand figure found, so a % headroom is not calculable"],"status":"verified"},
    {"key":"transportation_workforce","points":4,"evidence":["0.6 miles to I-24, within the Nashville MSA labor market (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  land_notes = '89 contiguous acres, 703,920 sq ft across 4 buildings, 36-foot clear height, first Class A spec industrial development in Murfreesboro. HI/GI zoning in place (unchanged). RESOLVED this pass: owned by Distribution Realty Group, LLC ("DRG"), in a joint venture with PCCP -- a 87.65-acre acquisition specifically for this development, VERIFIED via PR Newswire and Commercial Property Executive coverage.',
  risk_notes = 'RESOLVED this pass: a direct FEMA NFHL ArcGIS REST query at the geocoded address returned Zone X (Area of Minimal Flood Hazard, SFHA_TF=False) -- VERIFIED, not just "not flagged" as in the original pass.',
  development_environment_notes = 'General industrial zoning (HI/GI) already in place and the park is built/operating (unchanged). Rutherford County''s data-center moratorium remains in active drafting/review as of the most recent findable coverage -- a planning commission discussion occurred Sept. 28, 2026, with a county commission public hearing still pending before any adoption. This is a live, unresolved process, not a settled outcome either way.',
  serving_utility = 'Middle Tennessee Electric — Verified',
  total_acreage = 87.65,
  zoning_status = 'Heavy/General Industrial (HI/GI)',
  floodplain_status = 'Outside 100-Year Floodplain',
  floodplain_constrained = false,
  gas_pipeline_operator = 'Atmos Energy',
  fiber_notes = 'Zayo regional investment in Nashville-area fiber network',
  water_notes = 'City of Murfreesboro (20 MGD treatment capacity)',
  available_acreage_status = 'Partially Resolved',
  owners = '[
    {"name":"Distribution Realty Group, LLC","entity":"DRG / PCCP joint venture","controlled_acreage":87.65,"last_verified":"2026-10-04","source":"https://www.prnewswire.com/news-releases/drg-acquires-middle-tennessee-land-301879689.html"}
  ]'::jsonb,
  ownership_coverage = 'full',
  primary_advantage = 'Institutionally owned (DRG/PCCP) Class A industrial park with confirmed HI/GI zoning and minimal flood risk.',
  primary_risk = 'Rutherford County is actively drafting a data-center-specific moratorium, and no large-load power tariff or substation capacity has been confirmed for this site.',
  developer_assessment = 'watch',
  developer_takeaway = 'This Class A industrial park is institutionally owned (DRG/PCCP) with confirmed zoning and minimal flood risk, and sits within Middle Tennessee Electric''s service territory. No confirmed large-load tariff, substation capacity, or MW figure has been identified, and Rutherford County is actively drafting a data-center-specific moratorium that has not yet been adopted. The critical gating item is the outcome of that regulatory process, not site fundamentals. A developer should track the moratorium''s resolution and request a capacity assessment from Middle Tennessee Electric before advancing.',
  next_steps = array[
    'Request a large-load capacity assessment from Middle Tennessee Electric.',
    'Track Rutherford County''s pending data-center moratorium through adoption.',
    'Confirm current vacancy across the park''s 4 buildings with Distribution Realty Group.',
    'Confirm gas delivery capacity with Atmos Energy.'
  ],
  unknowns_to_verify = array[
    'Available MW / nearest substation',
    'Rutherford County moratorium outcome',
    'Current building vacancy',
    'Gas delivery capacity'
  ],
  last_verified_at = now()
where title = 'Middle Tennessee Industrial Center (315 S Rutherford Blvd)';
