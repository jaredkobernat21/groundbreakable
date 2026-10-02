-- Nashville, TN metro "Potential Data Center Site" pass (2026-10-02), same
-- exercise as the Kansas City pass (20261002090000). Per the strict rule
-- (actively search city/county/utility/parcel/landowner/nearby industrial
-- park/econ-dev org/relevant companies against data center/datacenter/
-- hyperscale/AI campus/compute campus/cloud campus/server farm/digital
-- infrastructure/rezoning/permit/utility request/land acquisition), 3
-- existing `infrastructure_project` rows already carrying signal_categories
-- (meaning they already render as "Possible" today, unlike KC's untagged
-- candidates) were evaluated as conversion candidates to the new
-- 'prospective_data_center_site' type. Only 1 cleared the bar. The honest
-- finding here is very different from KC's: Middle Tennessee is currently
-- in an active, real, REGION-WIDE data-center backlash, not a quiet
-- landscape -- this materially limited how many clean Potential candidates
-- actually exist right now, and is itself the most important finding of
-- this pass.
--
-- REGIONAL CONTEXT (why this pass is more conservative than KC's): Nashville/
-- Davidson County's Metro Council passed a hard data-center moratorium and
-- permanent zoning regulations on 2026-07-21 (>500,000 sq ft facilities
-- banned outright, closed-loop water required, special BZA exception +
-- public hearing required for any new proposal) -- triggered directly by
-- DC BLOX's 23-acre purchase next to the Nashville Zoo, the SAME pursuit
-- already logged as this market's "DC BLOX Data Center (unconfirmed /
-- evolving plans)" row. DC BLOX has since sued the Metro government over
-- it. Wilson County and Dickson County have each separately passed their
-- own data-center moratoriums; Williamson County has a resident formally
-- requesting one (not yet adopted); Rutherford County's planning staff
-- drafted one this same month, explicitly because "the county's
-- regulations were not developed with these specific types of high impact
-- computing uses in mind." No new INSERTs are added in this migration --
-- every county in this metro is now actively, publicly contending with
-- data centers, which is the opposite of the "no credible evidence of
-- activity" bar Potential requires at a REGIONAL level, even where one
-- specific parcel's own history is clean. Quality over quantity: a single
-- honestly-hedged conversion beats manufacturing speculative pins into a
-- region this contested.
--
-- CONVERTED to catalyst_type = 'prospective_data_center_site' (status
-- 'under_study'), signal_categories cleared to '{}' (only meaningful for
-- 'potential_data_center', not this type):
--   1. South Rutherford Boulevard / I-24 Industrial Corridor (Murfreesboro,
--      TN) -> renamed "Middle Tennessee Industrial Center (315 S Rutherford
--      Blvd)" for specificity. A real, existing 89-acre, 703,920 sq ft,
--      4-building Class A spec industrial park, HI/GI zoned, 0.6 miles to
--      I-24. Search found explicitly "no known data center projects
--      currently being proposed or waiting for approval in Murfreesboro"
--      -- a real negative-search result, not just an absence of positive
--      hits. HOWEVER: Rutherford County's own planning staff confirmed the
--      county's zoning code has no defined data-center use at all, and is
--      actively drafting a moratorium this same month. Scored and labeled
--      accordingly below -- real site fundamentals, but a genuinely
--      difficult, unsettled regulatory moment, not a clean favorable
--      story. This is the honest version of a Potential site, not a
--      flattering one.
--
-- LEFT UNCONVERTED, with reasons (none of these are touched by this
-- migration):
--   - "Cool Springs Business Corridor (Proven Power & Fiber Capacity)"
--     (Franklin, TN) -- this row's OWN existing source_id already documents
--     TierPoint's real, operating Nashville DC200 data center at 311 Eddy
--     Lane, which IS in the Cool Springs area. This is confirmed, named,
--     existing activity at the exact corridor this row describes -- not an
--     activity-free site. Converting it to Potential would misrepresent a
--     site with a real operating data center as having "no credible
--     evidence of activity." Likely should be re-scoped or merged with a
--     proper Planned/Possible row for TierPoint itself in a future pass --
--     not done here, since that wasn't asked for.
--   - "TVA / NES Data-Center Capacity & Rate Framework (Nashville Service
--     Territory)" -- correctly stays as a citywide utility/regulatory
--     signal with no address, not a point Potential site. It's the direct
--     downstream consequence of the DC BLOX pursuit (same market, already
--     logged separately) and Nashville's moratorium -- a signal about the
--     whole service territory's policy response, not a specific
--     unexplored opportunity area. No change made.
--
-- Also checked and excluded from any new INSERT: Wilson County (Mt.
-- Juliet/Lebanon, I-40 corridor, real TVA/Middle Tennessee Electric
-- territory with genuinely strong fundamentals) is not currently a
-- Groundbreakable market and was not added as one -- its own 6-month data-
-- center moratorium (passed amid real community concern) disqualifies it
-- from Potential on the same regional-backlash basis as everywhere else
-- checked, so there was no clean candidate to justify opening a new market
-- for. Williamson County broadly (beyond the already-disqualified Cool
-- Springs) was checked for other industrial corridors; found only the
-- same countywide resident moratorium pressure and no clean alternative
-- site with real fundamentals and an honestly quiet regulatory picture.
--
-- Scoring: South Rutherford's components use the standard 8-factor weights
-- (power_grid 30 / land_expansion 15 / fiber_connectivity 15 /
-- government_incentives 10 / development_entitlement 10 /
-- physical_environmental_risk 10 / water_cooling 5 /
-- transportation_workforce 5). Total score (41) is meaningfully lower than
-- KC's 55-59 range -- real land/transportation fundamentals, but no
-- confirmed large-load power program, no fiber data, and a genuinely
-- unsettled/difficult entitlement picture given the active moratorium
-- drafting, all honestly reflected rather than smoothed over.

insert into sources (agency, title, source_type, url, published_date) values
  ('CitizenPortal.ai', 'Planning commission reviews draft data-center moratorium to buy time for regulation', 'news',
   'https://citizenportal.ai/articles/9956069/Tennessee/Rutherford-County/Planning-commission-reviews-draft-datacenter-moratorium-to-buy-time-for-regulation', null),
  ('TVA (Tennessee Valley Authority)', 'Middle Tennessee Electric Membership Corporation -- Local Power Company Profile', 'agency_document',
   'https://www.tva.com/energy/public-power-partnerships/local-power-companies/lpc/middle-tennessee-electric-membership-corporation', null);

update catalysts set
  title = 'Middle Tennessee Industrial Center (315 S Rutherford Blvd)',
  catalyst_type = 'prospective_data_center_site',
  status = 'under_study',
  signal_categories = '{}',
  potential_score = 41,
  potential_score_components = '[
    {"key":"power_grid","points":12,"evidence":["Served by Middle Tennessee Electric Membership Corporation (TVA local power company), the largest electric co-op in Tennessee, serving Rutherford/Williamson/Wilson/Cannon counties"],"unknowns":["No confirmed large-load tariff program, substation capacity, or interconnection study specific to this park -- unlike KC''s Evergy large-load tariff, no equivalent documented program was found here"]},
    {"key":"land_expansion","points":11,"evidence":["89-acre, 703,920 sq ft, 4-building Class A spec industrial park (36'' clear height), HI & GI (Heavy/General Industrial) zoning already in place"],"unknowns":["Current vacancy/availability across the 4 buildings was not confirmed"]},
    {"key":"fiber_connectivity","points":2,"evidence":[],"unknowns":["No fiber carrier or long-haul route information found for this park"]},
    {"key":"government_incentives","points":3,"evidence":["Generally marketed for industrial/warehouse tenants (NNN lease, 24-hour access, dedicated turn lane)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":4,"evidence":["HI/GI zoning already supports general industrial use, and the park is built and operating"],"unknowns":["Rutherford County''s planning staff confirmed the zoning code has no defined data-center use at all and is actively drafting a moratorium (Sept. 2026) -- whether an existing warehouse could even be converted to a data center without triggering new zoning review is itself an open question commissioners were actively debating"]},
    {"key":"physical_environmental_risk","points":4,"evidence":[],"unknowns":["No floodplain or other environmental study specific to this park was found"]},
    {"key":"water_cooling","points":1,"evidence":[],"unknowns":["No water/sewer capacity information found"]},
    {"key":"transportation_workforce","points":4,"evidence":["0.6 miles to I-24, within the Nashville MSA labor market"],"unknowns":[]}
  ]'::jsonb,
  opportunity_area = 'Middle Tennessee Industrial Center, 315 S Rutherford Boulevard, Murfreesboro, TN -- 89 acres across 4 buildings (703,920 sq ft total)',
  power_notes = 'Served by Middle Tennessee Electric Membership Corporation, a TVA local power company and the largest electric cooperative in Tennessee, covering Rutherford, Williamson, Wilson, and Cannon counties. No confirmed large-load tariff program or substation capacity study specific to this park has been found -- unlike some other markets checked this session, no documented large-load rate program for this utility turned up.',
  fiber_notes = null,
  land_notes = '89 contiguous acres, 703,920 sq ft across 4 buildings (the largest divisible into 58,000-234,588 sq ft), 36-foot clear height, described as the first Class A spec industrial development in Murfreesboro. HI (Heavy Industrial) and GI (General Industrial) zoning already in place.',
  incentives_notes = 'Marketed generally as a spec industrial/warehouse park (NNN lease terms, 24-hour access, dedicated turn lane, signage) -- no data-center-specific incentive program identified.',
  development_environment_notes = 'General industrial zoning (HI/GI) is already in place and the park is built and operating as warehouse/distribution space. However, Rutherford County''s planning department has explicitly stated its zoning ordinance does not currently define "data center" as a use at all, and as of September 2026 was actively drafting a temporary moratorium (modeled on Coffee County''s) specifically to study energy, noise, and land-use impacts before any such use could be clearly permitted -- commissioners were still debating basic questions like whether converting an existing warehouse (like this one) to a data center would even trigger zoning review.',
  risk_notes = 'No floodplain, wetlands, or other environmental constraint specific to this park was found in available sources -- not confirmed clean, just not flagged either way.',
  unknowns_to_verify = array[
    'Whether Middle Tennessee Electric has any large-load/data-center-specific rate program or substation capacity near this site',
    'Fiber carrier presence or dark-fiber availability at the park',
    'Water/sewer capacity for a large continuous industrial load',
    'Current vacancy/availability across the park''s 4 buildings',
    'Outcome of Rutherford County''s draft data-center moratorium and whether/how a converted warehouse would be treated under any resulting ordinance'
  ],
  why_still_potential = 'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at the Middle Tennessee Industrial Center specifically -- search confirmed no known data-center projects are currently proposed or awaiting approval anywhere in Murfreesboro. The real fundamentals here (acreage, existing industrial zoning, I-24 access) are genuine, but so is the regulatory uncertainty: Rutherford County has no data-center use defined in its zoning code and is actively drafting a moratorium as of this research, which is why Approval is scored Difficult rather than Favorable.',
  power_pillar_label = 'moderate',
  site_pillar_label = 'moderate',
  approval_pillar_label = 'difficult',
  entitlement_velocity = 'difficult',
  entitlement_velocity_notes = 'Rutherford County''s zoning ordinance has no defined data-center use, and planning staff are actively drafting a temporary moratorium (Sept. 2026) specifically because existing regulations "were not developed with these specific types of high impact computing uses in mind." Commissioners were still debating whether converting an existing warehouse to a data center would even trigger zoning review.',
  city_receptiveness = 'low',
  city_receptiveness_notes = 'The county is moving toward restricting, not recruiting, data-center development right now -- planning staff proposed the moratorium specifically to buy time before any such use could be approved, and residents have separately pushed for an even longer (12-month) moratorium.',
  community_friction = 'moderate',
  community_friction_notes = 'Documented resident pressure for a yearlong moratorium exists at the countywide level; no opposition specific to this park has been found, but the county-level climate is real and directly relevant to any large-load industrial conversion here.',
  utility_timeline = 'unknown',
  utility_timeline_notes = null,
  related_context = array[
    '89-acre, 703,920 sq ft Class A spec industrial park, 0.6 miles to I-24',
    'Rutherford County has no data-center use defined in its zoning code as of Sept. 2026',
    'County planning staff drafting a temporary data-center moratorium the same month'
  ],
  catalyst_score = 5,
  reason_for_catalyst_classification = 'High-impact type (potential data center site) + 3 reinforcing cited context items, but no disclosed investment figure and a specific-site (not regional) footprint.',
  source_id = (select id from sources where url = 'https://www.commercialsearch.com/commercial-property/us/tn/murfreesboro/315-south-rutherford-boulevard/'),
  additional_source_ids = array[
    (select id from sources where url ilike '%citizenportal.ai%datacenter-moratorium-to-buy-time%'),
    (select id from sources where url ilike '%tva.com%middle-tennessee-electric%')
  ],
  last_verified_at = now()
where title = 'South Rutherford Boulevard / I-24 Industrial Corridor';
