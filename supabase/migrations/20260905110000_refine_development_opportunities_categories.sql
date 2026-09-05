-- Refines Opportunities into 3 subcategories (Jared, 2026-09-05):
-- Distress, Zoning, Early Projects. Adds the columns the new display
-- spec needs -- category (the subcategory itself), status (plain-text
-- stage description), related_developer/related_contractor (denormalized
-- text, not a link to project_people -- these are authored once from
-- real facts already on file, same simplicity tradeoff as the rest of
-- this feature; "Keep the section simple" per Jared's own ask).
--
-- latitude/longitude become nullable: the new 177-acre annexation
-- opportunity is only ever described in sourced reporting by
-- intersection ("southwest corner of K-10 and W 6th St / Bob Billings
-- Pkwy"), never geocoded to a precise point in this app's data (its
-- underlying shift row has null lat/lng for the same reason) -- putting
-- a fabricated precise coordinate on it would be less honest than no pin
-- at all. OpportunityMap already needs to skip pin-less rows either way.
alter table development_opportunities
  alter column latitude drop not null,
  alter column longitude drop not null,
  add column category text not null default 'distress' check (category in ('distress', 'zoning', 'early_project')),
  add column status text,
  add column related_developer text,
  add column related_contractor text;

alter table development_opportunities alter column category drop default;

update development_opportunities
set category = 'distress',
    status = 'Sold at sheriff''s sale -- new ownership, no redevelopment plan filed yet',
    related_developer = null,
    related_contractor = null
where category = 'distress';

-- --- Zoning ---------------------------------------------------------

insert into development_opportunities (
  market_id, address, latitude, longitude, opportunity_type, strength, category, status,
  related_developer, related_contractor, signals, reasons, source_ids, date_identified
)
select
  m.id,
  'West of K-10, south of 6th St/US-40, Lawrence, KS',
  38.971550078483, -95.273618892341,
  'Recently Approved Rezoning -- Large-Scale Mixed-Density Tract',
  'high',
  'zoning',
  'Rezoning approved Aug 18, 2026 -- pre-construction, no permits filed yet',
  'Landplan Engineering (applicant; ultimate developer/owner not confirmed in sourced reporting)',
  null,
  array['recent_rezoning', 'favorable_zoning', 'high_momentum', 'nearby_project'],
  array[
    'City Commission approved annexing and rezoning 288 acres on Aug 18, 2026 -- "probably the largest single annexation request in the last three decades" per the city planner.',
    'Approved mix: 70.1 ac low-density residential (R-2), 16.9 ac medium-density (R-3), 23.5 ac high-density (R-4), 126.7 ac commercial center, 51 ac open space -- broad by-right development flexibility across the tract.',
    'Sits inside the West Lawrence / K-10 momentum area, alongside two more subdivisions already filed nearby (Queens Road, Hunters Hills -- 305 combined units).',
    'No vertical construction or building permits filed yet -- entitlement risk is cleared, but the site is still a blank slate for the next mover.'
  ],
  array[
    (select id from sources where url = 'https://lawrencekstimes.com/2026/08/18/citycomm-oks-beacon-landing-annexation/'),
    (select id from sources where url = 'https://lawrencekstimes.com/2026/07/20/planning-comm-oks-becaon-landing/')
  ],
  '2026-08-18'
from markets m
where m.slug = 'lawrence-ks';

insert into development_opportunities (
  market_id, address, latitude, longitude, opportunity_type, strength, category, status,
  related_developer, related_contractor, signals, reasons, source_ids, date_identified
)
select
  m.id,
  'Southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway, Lawrence, KS',
  null, null,
  'Contested Active Rezoning -- Large Residential Tract',
  'medium',
  'zoning',
  'Planning Commission recommended denial (4-3) Aug 24, 2026 -- City Commission review pending; outcome unresolved',
  'D & S Land LLC (property owner); Landplan Engineering (applicant)',
  null,
  array['recent_rezoning', 'high_momentum'],
  array[
    '~177-acre annexation request for a mix of homes and apartments (1,000+ units per reporting) at the SW corner of K-10 & 6th St/Bob Billings Pkwy.',
    'Planning Commission voted 4-3 to recommend denial, but Kansas annexation law lets the City Commission override that recommendation -- the outcome is still genuinely open.',
    'Directly adjacent to the just-approved 288-acre Beacon Landing annexation, reinforcing this as an active growth corridor regardless of this specific request''s outcome.'
  ],
  array[(select id from sources where url = 'https://www2.ljworld.com/news/city-government/2026/aug/25/plan-to-annex-land-west-of-slt-for-housing-hits-a-snag-at-planning-commission-ku-annexation-near-airport-delayed/')],
  '2026-08-24'
from markets m
where m.slug = 'lawrence-ks';

-- --- Early Projects ---------------------------------------------------

insert into development_opportunities (
  market_id, address, latitude, longitude, opportunity_type, strength, category, status,
  related_developer, related_contractor, signals, reasons, source_ids, date_identified
)
select
  m.id,
  'Near 23rd St & Iowa St (KU Innovation Park), Lawrence, KS',
  38.943890159211, -95.260422755109,
  'Early-Stage Project -- Developer Known, GC Not Yet Selected',
  'high',
  'early_project',
  'Proposed -- City Commission vote on an industrial revenue bond was pending as of this research pass; construction not yet started',
  '23 Iowa Investors (affiliate of Block Real Estate Services)',
  null,
  array['nearby_infrastructure', 'high_momentum', 'nearby_permit'],
  array[
    '$104 million, 341-unit market-rate apartment complex proposed near KU Innovation Park to house KU''s research-expansion workforce.',
    'Developer (23 Iowa Investors, a Block Real Estate Services affiliate) is confirmed; no general contractor has been named yet.',
    'Developer is seeking a $50 million industrial revenue bond / sales-tax exemption on construction materials -- City Commission review pending as of this research pass.',
    'Sits inside the 23rd & Iowa / KU Innovation Park momentum area, with real permit activity (excavation, plumbing) already occurring nearby.'
  ],
  array[(select id from sources where url = 'https://www2.ljworld.com/news/city-government/2026/sep/04/developers-seek-sales-tax-exemption-on-construction-materials-for-341-unit-apartment-complex-near-ku-innovation-park/')],
  '2026-09-04'
from markets m
where m.slug = 'lawrence-ks';

insert into development_opportunities (
  market_id, address, latitude, longitude, opportunity_type, strength, category, status,
  related_developer, related_contractor, signals, reasons, source_ids, date_identified
)
select
  m.id,
  'E 1000 Rd & N 1700 Rd (Peterson Rd), Lawrence, KS',
  38.986076076903, -95.288351887039,
  'Early-Stage Project -- Developer Known, GC Not Yet Selected',
  'medium',
  'early_project',
  'Annexation recommended by Planning Commission -- awaiting City Commission approval; groundbreaking targeted 4-6 months post-approval',
  'Adam Williams',
  null,
  array['recent_rezoning', 'high_momentum'],
  array[
    '60-acre annexation request for a concept plan of 161 single-family lots plus 14 duplex lots (175 total) at E 1000 Rd & N 1700 Rd (Peterson Rd).',
    'Developer (Adam Williams) is confirmed and already has two other active Lawrence projects (Urban Row, Hunters Hills); no general contractor named yet.',
    'Sits inside the West Lawrence / K-10 momentum area, alongside the newly-approved Beacon Landing annexation.'
  ],
  array[(select id from sources where url = 'https://www2.ljworld.com/weblogs/town_talk/2026/mar/09/lawrence-developer-has-trio-of-projects-underway-ranging-from-600k-row-houses-in-downtown-to-new-neighborhoods-on-citys-edge/')],
  '2026-03-09'
from markets m
where m.slug = 'lawrence-ks';

insert into development_opportunities (
  market_id, address, latitude, longitude, opportunity_type, strength, category, status,
  related_developer, related_contractor, signals, reasons, source_ids, date_identified
)
select
  m.id,
  'Near Peterson Rd & Monterey Way, Lawrence, KS',
  38.986076076903, -95.288351887039,
  'Early-Stage Project -- Developer Known, GC Not Yet Selected',
  'low',
  'early_project',
  'Proposed -- development plans recently refiled after a prior attempt; groundbreaking targeted 4-6 months pending approvals',
  'Adam Williams',
  null,
  array['recent_rezoning', 'high_momentum'],
  array[
    '130-home traditional single-family subdivision on 60 acres near Peterson Rd/Monterey Way, in the Perry-Lecompton school district.',
    'Development plans were recently refiled after a prior attempt didn''t proceed -- a real but not-yet-certain signal, hence Low rather than Medium strength.',
    'Same developer (Adam Williams) as Urban Row (already under construction) and Queens Road, and sits in the same West Lawrence momentum corridor as Beacon Landing.'
  ],
  array[(select id from sources where url = 'https://www2.ljworld.com/weblogs/town_talk/2026/mar/09/lawrence-developer-has-trio-of-projects-underway-ranging-from-600k-row-houses-in-downtown-to-new-neighborhoods-on-citys-edge/')],
  '2026-03-09'
from markets m
where m.slug = 'lawrence-ks';
