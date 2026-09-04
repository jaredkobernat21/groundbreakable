-- Real, sourced Bonner Springs, KS shifts (pilot batch) -- 5 shifts,
-- Phase 1 categories only (Plans/Infrastructure). Bonner Springs
-- publishes an unusually good "Current Development Projects" page
-- directly on its own site (bonnersprings.org/1255) that names real
-- projects, addresses, developers, unit counts and funding mechanisms
-- -- but most entries describe an ongoing *status* ("well underway",
-- "quickly progressing") without a dated triggering event, so most of
-- that page's projects (The 120 on Oak, Sandstone Townhomes, Bonner
-- Springs Senior Villas, Range 23 Brewing) were NOT seeded as Building
-- shifts here: their only findable dated events (demolition May 2023,
-- MIH grant announced Sept 2023, LIHTC award July 2024) are too old to
-- represent a current shift, and no permit-issuance date was
-- discoverable for any of them (no Cityworks/permit-portal equivalent
-- found for Bonner Springs -- a real, confirmed gap, not skipped).
-- Building is a genuine empty category this pass, same discipline as
-- every other documented gap in this project.
--
-- The two Plans shifts are both March 17, 2026 Planning Commission
-- rezoning approvals (that meeting date matches the city's own
-- "3rd Tuesday of the month" schedule). Destination KCK is a
-- landmark-scale shift: a $539M, 180-acre entertainment district
-- anchored by a Mattel-branded amusement park (Barbie/Hot
-- Wheels/Thomas & Friends attractions), developer Epic Resort
-- Destinations. City Council review was scheduled for April 13, 2026
-- but no outcome could be confirmed from public sources as of this
-- research pass -- NOT seeded as a separate shift to avoid guessing
-- an unconfirmed vote result.

with market as (
  select id from markets where slug = 'bonner-springs-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('Ingram''s', 'Bonner Springs Planning Commissioners Approve Rezoning for $539M Destination KCK', 'news',
     'https://ingrams.com/article/bonner-springs-approve-rezoning-539m-destination-kck/', '2026-03-23'),
    ('City of Bonner Springs', 'Current Development Projects', 'agency_document',
     'https://www.bonnersprings.org/1255/Current-Development-Projects', '2026-09-04'),
    ('Rep. Sharice Davids', 'Davids Votes to Pass Bipartisan Funding Agreement, Securing Key Kansas Projects', 'press_release',
     'https://davids.house.gov/media/press-releases/davids-votes-pass-bipartisan-funding-agreement-securing-key-kansas-projects', '2026-01-08'),
    ('CitizenPortal.ai (Bonner Springs council coverage)', 'Council awards $535,829.85 contract for 2026 street resurfacing to McEnany Construction', 'news',
     'https://citizenportal.ai/articles/8761903/kansas/school-boards/bonner-springs/council-awards-53582985-contract-for-2026-street-resurfacing-to-mcenany-construction', '2026-07-28'),
    ('Straub Construction', 'Facebook post: Bonner Springs Centennial Park Expansion groundbreaking', 'news',
     'https://www.facebook.com/StraubCon/posts/we-broke-ground-on-the-bonner-springs-centennial-park-expansion-last-week-taking/1757062949027142/', '2026-06-22')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'plans'::shift_category, 'rezoning',
  'Planning Commission approves rezoning for $539M Destination KCK entertainment district', 'Approximately 180 acres at 118th Street & State Avenue (12301, 12215, 11801 State Ave and 720 N. 118th St.) rezoned for a Mattel-branded entertainment district anchored by a Mattel Adventure Park (Barbie, Hot Wheels, Thomas & Friends attractions), plus restaurants, lodging, and retail. Developer is Epic Resort Destinations (Glendale, AZ). City Council review was scheduled for April 13, 2026; developer has until 2027 to begin vertical construction, completion expected 2030.', '2026-03-17'::date, 'Rezoning approved by Planning Commission -- City Council review pending as of last check', 'high'::shift_impact,
  array['developer', 'investor', 'broker', 'agent']::shift_audience[], '118th St & State Ave, Bonner Springs, KS', 39.116180029762, -94.853723990425, new_sources.id,
  '{"project_name": "Destination KCK", "developer": "Epic Resort Destinations", "acres": 180, "value_usd": 539000000}'::jsonb
from market, new_sources where new_sources.url like '%539m-destination-kck%'
union all
select market.id, 'plans'::shift_category, 'rezoning',
  'Planning Commission approves rezoning for 184-unit Bungalows single-family rental community', 'Cavan Properties received rezoning approval for "The Bungalows at Bonner Springs," 184 single-family rental homes in northern Bonner Springs. No public incentives requested for this project.', '2026-03-17'::date, 'Rezoning approved by Planning Commission', 'medium'::shift_impact,
  array['developer', 'investor', 'broker', 'contractor']::shift_audience[], 'Northern Bonner Springs, KS', null, null, new_sources.id,
  '{"project_name": "The Bungalows at Bonner Springs", "developer": "Cavan Properties", "units": 184, "incentives": "none requested"}'::jsonb
from market, new_sources where new_sources.url like '%Current-Development-Projects%'
union all
select market.id, 'infrastructure'::shift_category, 'sewer_project',
  'Lonestar Interceptor sanitary sewer project secures $1.09M in federal funding', 'Community Project Funding secured by Rep. Sharice Davids for the Lonestar Interceptor Sanitary Sewer Project: replacement of ~2,300 linear feet of aging vitrified clay sanitary sewer main (plus ~175 ft cured-in-place pipe and ~13 manholes, ~45 service line portions) to relieve a system already at capacity and prevent overflows, serving ~3,500 residents and local businesses.', '2026-01-08'::date, 'Federal funding secured', 'medium'::shift_impact,
  array['contractor', 'developer']::shift_audience[], 'Bonner Springs, KS', null, null, new_sources.id,
  '{"project_name": "Lonestar Interceptor Sanitary Sewer Project", "funding_usd": 1092000, "funding_source": "Congressional Community Project Funding"}'::jsonb
from market, new_sources where new_sources.url like '%bipartisan-funding-agreement%'
union all
select market.id, 'infrastructure'::shift_category, 'street_resurfacing',
  'Council awards $535,830 contract for 2026 street resurfacing program', 'City Council awarded the annual mill-and-overlay street resurfacing contract to McEnany Construction (low bidder among 5 proposals) for the 2026 program season.', '2026-07-28'::date, 'Contract awarded', 'low'::shift_impact,
  array['contractor']::shift_audience[], 'Bonner Springs, KS', null, null, new_sources.id,
  '{"contractor": "McEnany Construction", "contract_usd": 535829.85, "program": "2026 street resurfacing (mill and overlay)"}'::jsonb
from market, new_sources where new_sources.url like '%mcenany-construction%'
union all
select market.id, 'infrastructure'::shift_category, 'park_project',
  'Centennial Park expansion breaks ground', 'Construction began on the Centennial Park expansion in historic downtown -- a splash pad, restrooms, and a mid-block pedestrian crossing, funded through the city''s Capital Improvement Fund. Construction window per the city is May-Fall 2026.', '2026-06-15'::date, 'Under construction', 'medium'::shift_impact,
  array['contractor', 'developer']::shift_audience[], '206 E Cedar St, Bonner Springs, KS', 39.056742141023, -94.882009964393, new_sources.id,
  '{"contractor": "Straub Construction", "funding_source": "Capital Improvement Fund", "features": ["splash pad", "restrooms", "mid-block crossing"]}'::jsonb
from market, new_sources where new_sources.url like '%StraubCon%';
