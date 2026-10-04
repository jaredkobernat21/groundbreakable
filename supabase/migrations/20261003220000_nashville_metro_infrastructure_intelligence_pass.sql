-- Nashville metro Infrastructure intelligence pass (2026-10-03). Same
-- pattern as 20261003200000_kc_metro_infrastructure_intelligence_pass.sql
-- -- a classification/enrichment pass over the 3 existing
-- `infrastructure_project` rows across the Nashville metro market set
-- (Nashville, Franklin, Murfreesboro, TN), not new web research. Every
-- value traces directly to each row's own existing description/
-- why_it_matters text and cited source.
--
-- OPPORTUNITIES CREATED: checked all 3 rows against the one existing
-- Potential site in this metro ("Middle Tennessee Industrial Center,"
-- 315 S Rutherford Blvd, Murfreesboro, catalyst_type
-- prospective_data_center_site). No link -- all 3 infrastructure rows
-- are in Nashville or Franklin, a different city from the Murfreesboro
-- site, with no documented connection. related_catalyst_ids left empty
-- on all 3, same honest-zero-result discipline as the KC pass.
--
-- "TVA / NES Data-Center Capacity & Rate Framework" is the one row where
-- the impact-level call needed real judgment rather than a mechanical
-- "utility confirms large-load pipeline = high" reading: the SAME row's
-- own why_it_matters text already documents a real, current, restrictive
-- entitlement condition (Davidson County's July 2026 zoning caps data
-- centers at <500,000 sq ft/100MW, confines them to IG/IR districts via
-- BZA special exception, under a construction moratorium through
-- December 2026) alongside the strong power-readiness signal. Scored
-- 'moderate', not 'high' -- power/utility readiness is real, but the
-- brief's own "removal of a known development constraint" evidence
-- criterion cuts the OTHER way here (a constraint is actively in place,
-- not removed), and conflating utility readiness with overall
-- development impact would overstate what Davidson County's current
-- zoning posture actually allows.
--
-- "Cool Springs Business Corridor" genuinely names both power (two
-- facilities' specific MW figures) and fiber (named carriers/cloud
-- on-ramps) with equal specificity -- unlike Overland Park's analogous KC
-- row, where fiber was clearly the more distinguishing asset and power
-- was a generic regional figure repeated across many rows, here neither
-- asset is more "generic" than the other. Classified 'other' rather than
-- forcing a single-asset type, same resolution used for Spring Hill's
-- analogous dual-asset (gas + power) row in the KC pass.

update catalysts set
  infrastructure_type = 'transit',
  infrastructure_subtype = 'City-wide bus rapid transit plan on Dickerson Pike, Gallatin Pike, Murfreesboro Pike, and Nolensville Pike, plus new WeGo transit centers at Donelson (infrastructure starting mid-2026, building late 2026/early 2027, complete by end of 2027) and North Nashville (already 80% finished).',
  development_impact_types = '{}',
  development_impact_level = 'high',
  impact_area_notes = 'Affects four major Nashville corridors (Dickerson Pike, Gallatin Pike, Murfreesboro Pike, Nolensville Pike) simultaneously, plus the Donelson and North Nashville transit-center areas specifically -- no specific acreage or parcel-level impact area has been published (UNKNOWN). This is a citywide, multi-corridor access program, not a site-specific one; the specific development type any given parcel along these corridors might attract is not documented.',
  people = '{"government": {"municipality": "Metro Nashville", "decision_making_body": "WeGo (Nashville Metropolitan Transit Authority)"}}'::jsonb
where title = '"Choose How You Move" Transit Plan (BRT + Transit Centers)';

update catalysts set
  infrastructure_type = 'power',
  infrastructure_subtype = 'TVA Board-approved dedicated data-center rate class (Capacity Commitment Charge ~$1.5M/MW over 3-5 years, effective Oct. 1, 2026); NES large-load size classification system (small <5MW / medium 5-20MW / large 20-100MW, requiring a dedicated substation / campus >100MW).',
  development_impact_types = array['data_center'],
  development_impact_level = 'moderate',
  impact_area_notes = 'Utility-territory-wide signal (NES/TVA service area covering Davidson County and surrounding counties), not tied to a specific parcel or acreage. Davidson County''s own July 2026 zoning update restricts where within that territory a qualifying project could actually locate (IG/IR industrial districts only, via Board of Zoning Appeals special exception), under a construction moratorium through December 2026 -- UNKNOWN which specific areas, if any, would qualify once the moratorium lifts.',
  people = '{"utility": {"utility": "Nashville Electric Service (NES)"}, "government": {"decision_making_body": "Tennessee Valley Authority (TVA) Board; Davidson County Metro Council / Board of Zoning Appeals (data-center zoning)"}}'::jsonb
where title = 'TVA / NES Data-Center Capacity & Rate Framework (Nashville Service Territory)';

update catalysts set
  infrastructure_type = 'other',
  infrastructure_subtype = 'Two operating colocation data centers along Franklin''s Cool Springs/I-65 corridor: TierPoint Franklin (311 Eddy Lane, 5.0 MW, 52,000 sq ft, 26,000 sq ft raised floor) and Flexential Nashville-Cool Springs (425 Duke Drive, 3.15 MW, 74,679 sq ft, N+1 redundancy, carrier connectivity including Cogent/Windstream/AT&T with direct cloud on-ramps).',
  development_impact_types = array['data_center'],
  development_impact_level = 'high',
  impact_area_notes = 'Nearby undeveloped or underutilized parcels along the same Cool Springs/I-65 corridor could plausibly access similar power/fiber capacity; no specific additional parcel or acreage has been identified or confirmed (UNKNOWN). This describes standing capacity at two existing, named, operating facilities, not a new project opening new land.',
  people = '{"government": {"municipality": "City of Franklin, TN", "planning_department": "Franklin Board of Mayor & Aldermen / Municipal Planning Commission (June 2026 data-center policy workshop)"}, "development": {"notes": "TierPoint (311 Eddy Lane) and Flexential (425 Duke Drive) operate the two existing colocation facilities in this corridor."}}'::jsonb
where title = 'Cool Springs Business Corridor (Proven Power & Fiber Capacity)';
