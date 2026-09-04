-- Real, sourced "active projects" for Bonner Springs, KS -- reuses the
-- existing `projects` table from the pre-pivot Plans/Opportunities/
-- Potential model (Aug 2026 schema; see plan_category/project_type/stage
-- in dashboard/src/lib/types.ts) rather than a new table. Product
-- decision (Jared, 2026-09-04): shifts alone don't capture a
-- currently-active project's ongoing status when there's no single
-- dated event to hang it on -- e.g. "The 120 on Oak is under
-- construction, occupancy July 2026" isn't a point-in-time shift, it's a
-- persistent state. `projects` already models exactly this (title,
-- stage, developer, units, value) and already has a full read layer
-- (getProjectsWithParties etc. in planIntelligence.ts) -- reused rather
-- than duplicated.
--
-- 7 rows: the 5 real active developments from the city's own "Current
-- Development Projects" page that couldn't be dated precisely enough for
-- a shift (see 20260904150000's header comment for why), plus the two
-- March 17, 2026 rezonings that already exist as shifts (Destination KCK,
-- The Bungalows) -- included here too since they're also genuinely
-- ongoing projects with a current stage (rezoned, not yet under
-- construction), not just isolated past events. No double-counting risk:
-- shifts and projects are different tables serving different questions
-- ("what changed recently" vs "what's actively in the pipeline").

with market as (
  select id from markets where slug = 'bonner-springs-ks'
),
existing_source as (
  select id from sources where url = 'https://www.bonnersprings.org/1255/Current-Development-Projects'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('Ingram''s', 'Kansas City metro to add $100M logistics park', 'news',
     'https://ingrams.com/article/kc-metro-to-add-100m-logistics-park/', '2021-04-01')
  returning id, url
)

insert into projects (market_id, title, plan_category, project_type, stage, description, address, latitude, longitude, developer, units, project_value, acreage, date_announced, source_id)
select market.id, 'Destination KCK', 'land_use'::text, 'mixed_use'::text, 'approved'::text,
  '$539M entertainment district anchored by a Mattel Adventure Park (Barbie, Hot Wheels, Thomas & Friends attractions) plus restaurants, lodging, and retail. Planning Commission approved the rezoning March 17, 2026; City Council review was scheduled April 13, 2026 (outcome not confirmed as of this research pass). Developer has until 2027 to begin vertical construction, completion expected 2030.',
  '118th St & State Ave, Bonner Springs, KS', 39.116180029762, -94.853723990425, 'Epic Resort Destinations', null, 539000000, 180, '2026-03-17'::date, existing_source.id
from market, existing_source
union all
select market.id, 'The Bungalows at Bonner Springs', 'land_use'::text, 'residential'::text, 'approved'::text,
  '184 single-family rental homes in northern Bonner Springs. Planning Commission approved the rezoning March 17, 2026; no public incentives requested.',
  'Northern Bonner Springs, KS', 39.055295041621, -94.88142598884, 'Cavan Properties', 184, null, null, '2026-03-17'::date, existing_source.id
from market, existing_source
union all
select market.id, 'The 120 on Oak', 'development'::text, 'multifamily'::text, 'construction'::text,
  '42 market-rate + 50 moderate-income apartments in a 4-story downtown building (92 on-site parking spaces + 27 overflow). Funded via the Revitalization Housing Incentive Program (RHID). Exterior/interior construction "quickly progressing"; anticipated occupancy July 2026.',
  '112 Oak St, Bonner Springs, KS', 39.055378862109, -94.881684978577, null, 92, null, null, null, existing_source.id
from market, existing_source
union all
select market.id, 'Sandstone Townhomes', 'development'::text, 'multifamily'::text, 'construction'::text,
  '140 market-rate rental townhomes, funded via the Revitalization Housing Incentive Program (RHID). Well underway, with some units already finished and occupied.',
  '570 N 130th St, Bonner Springs, KS', 39.108468966947, -94.881663235812, 'River Bend Land Company', 140, null, null, null, existing_source.id
from market, existing_source
union all
select market.id, 'Bonner Springs Senior Villas', 'development'::text, 'multifamily'::text, 'construction'::text,
  '48 income-restricted apartments for seniors 55+, between the Westlake/Dollar Tree development and Deerfield along Kansas Ave and 132nd St. Awarded 2025-cycle Low-Income Housing Tax Credits by Kansas Housing Resources Corporation (announced 2024-07-19). Anticipated occupancy fall 2026.',
  '700 S 132nd St, Bonner Springs, KS', 39.08709203662, -94.88750548418, null, 48, null, null, '2024-07-19'::date, existing_source.id
from market, existing_source
union all
select market.id, 'Range 23 Brewing (new location)', 'development'::text, 'commercial'::text, 'construction'::text,
  'Brewery build-out at a new downtown location (existing tap room at 200 Oak opened 2023). Renovations underway, opening planned spring 2026.',
  '127 Oak St, Bonner Springs, KS', 39.055578841663, -94.881775746924, null, null, null, null, null, existing_source.id
from market, existing_source
union all
select market.id, 'Compass 70 Logistics Park', 'development'::text, 'industrial'::text, 'construction'::text,
  'Multi-phase Class A light industrial/logistics park, up to 2 million sq ft across up to 3 buildings once complete, financed in part through Industrial Revenue Bonds. First phase launched April 2021 on a 157-acre acquisition; the city''s current-projects page describes it as 100 acres / 2M sq ft in progress.',
  '110th St & Riverview Ave, Bonner Springs, KS', 39.101654031123, -94.835048996807, 'Scannell Properties', null, null, 100, null, new_sources.id
from market, new_sources where new_sources.url like '%100m-logistics-park%';
