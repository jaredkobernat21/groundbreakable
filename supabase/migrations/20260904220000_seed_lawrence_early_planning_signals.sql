-- Real, sourced "early planning signals" for Lawrence -- same rationale
-- as the Topeka companion migration. Two new Plans shifts (a major
-- annexation/rezoning recommendation and a deferred annexation request,
-- both real Planning Commission actions) plus 1 new pipeline Project
-- (Beacon Landing, proposed -- not yet before the City Commission for
-- final approval as of this research pass). Sourced from The Lawrence
-- Times, a well-established local outlet already used elsewhere in this
-- project.

with market as (
  select id from markets where slug = 'lawrence-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('The Lawrence Times', 'Lawrence planning commission votes to annex, rezone nearly 300 acres west of K-10', 'news',
     'https://lawrencekstimes.com/2026/07/20/planning-comm-oks-becaon-landing/', '2026-07-20'),
    ('The Lawrence Times', 'KU Endowment defers annexation request for land near airport', 'news',
     'https://lawrencekstimes.com/2026/08/24/ku-endowment-defers-annexation-request/', '2026-08-24')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'plans'::shift_category, 'annexation_rezoning',
  'Planning Commission recommends annexing and rezoning 288 acres for "Beacon Landing"', 'Landplan Engineering''s Beacon Landing proposal (reduced from an original 650-acre concept) would annex and rezone 288 acres west of K-10, south of 6th St/US-40, mostly north of Bob Billings Parkway/N 1500 Rd, extending west to E 800 Rd. Proposed mix: 111 acres residential (low/medium/high density), 126.7 acres commercial center district, 51 acres open space. A majority of commissioners voted in favor of all seven agenda items tied to the project, though not unanimously. Advances to the City Commission for final approval.', '2026-07-20'::date, 'Recommended for approval by Planning Commission -- City Commission vote pending', 'high'::shift_impact,
  array['developer', 'investor', 'broker', 'agent']::shift_audience[], 'West of K-10, south of 6th St/US-40, Lawrence, KS', 38.971550078483, -95.273618892341, new_sources.id,
  '{"project_name": "Beacon Landing", "developer": "Landplan Engineering", "acres": 288, "residential_acres": 111, "commercial_acres": 126.7, "open_space_acres": 51}'::jsonb
from market, new_sources where new_sources.url like '%becaon-landing%'
union all
select market.id, 'plans'::shift_category, 'annexation_deferred',
  'KU Endowment defers annexation request for 137 acres near the airport', 'KU Endowment sought to annex ~137 acres across two parcels at 1593 N 1900 Rd, near Lawrence Regional Airport, citing "speculative economic opportunities" and interest from groups wanting airport/research-university proximity. No specific project exists yet -- the organization asked to defer to revise the application; rezoning and site-development applications would still be required if annexation eventually succeeds.', '2026-08-24'::date, 'Deferred at applicant''s request -- no decision made', 'medium'::shift_impact,
  array['developer', 'investor']::shift_audience[], '1593 N 1900 Rd, Lawrence, KS', 39.01506177247, -95.221873003617, new_sources.id,
  '{"applicant": "KU Endowment", "acres": 137, "status": "deferred"}'::jsonb
from market, new_sources where new_sources.url like '%ku-endowment%';

with market as (
  select id from markets where slug = 'lawrence-ks'
),
beacon_source as (
  select id from sources where url = 'https://lawrencekstimes.com/2026/07/20/planning-comm-oks-becaon-landing/'
)
insert into projects (market_id, title, plan_category, project_type, stage, description, address, latitude, longitude, developer, acreage, date_announced, source_id)
select market.id, 'Beacon Landing', 'land_use'::text, 'mixed_use'::text, 'proposed'::text,
  '288-acre mixed-use annexation/development west of K-10 (reduced from an original 650-acre concept): 111 acres residential (low/medium/high density), 126.7 acres commercial center district, 51 acres open space. Planning Commission recommended approval of all seven related agenda items July 20, 2026; awaiting Lawrence City Commission final approval as of this research pass.',
  'West of K-10, south of 6th St/US-40, Lawrence, KS', 38.971550078483, -95.273618892341, 'Landplan Engineering', 288, '2026-07-20'::date, beacon_source.id
from market, beacon_source;
