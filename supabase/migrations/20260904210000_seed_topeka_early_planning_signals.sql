-- Real, sourced "early planning signals" for Topeka -- per Jared's
-- direction that the dashboard should show "what is being built, what is
-- planning to be built, and what can be built." Adds 2 new Plans shifts
-- (dated Planning Commission actions, real case numbers/addresses) plus
-- 1 new pipeline Project (proposed, not yet under construction) that the
-- earlier shift/project passes hadn't captured. Sourced from a direct
-- Planning Commission meeting summary (week of 2026-06-16) and a local
-- news article on the pending Vail/Lyman duplex rezoning.

with market as (
  select id from markets where slug = 'topeka-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('Citizen Journal', 'Topeka Planning Commission Summary', 'news',
     'https://www.citizenjournal.us/topeka-planning-commission-summary-3/', '2026-06-16'),
    ('Yahoo News (local wire)', 'Topeka farm land could be home for up to 40 new duplexes', 'news',
     'https://www.yahoo.com/news/topeka-farm-land-could-home-142603023.html', '2026-07-13')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'plans'::shift_category, 'rezoning',
  'Planning Commission approves rezoning for 10-acre self-storage development', 'Valley Self Storage rezoned ~10 acres at 4212 and 4236 SW Burlingame Road from R-1 (single-family) to I-1 (light industrial) for a covered, temperature-controlled storage facility. Unanimous approval.', '2026-06-16'::date, 'Rezoning approved by Planning Commission', 'medium'::shift_impact,
  array['developer', 'investor', 'contractor']::shift_audience[], '4212-4236 SW Burlingame Rd, Topeka, KS', 38.992774360178, -95.705836803086, new_sources.id,
  '{"applicant": "Valley Self Storage", "acres": 10, "rezoning": "R-1 to I-1", "vote": "unanimous"}'::jsonb
from market, new_sources where new_sources.url like '%citizenjournal%'
union all
select market.id, 'plans'::shift_category, 'conditional_use_permit',
  'Conditional use permit approved for 20-vehicle garage supporting 250-unit apartment complex', 'Kanza OZ LLC received a conditional use permit for a 20-vehicle enclosed garage at the southwest corner of SE Madison and SE 11th, supporting an adjacent 250-unit apartment complex. Approved 5-1; the dissenting commissioner cited exterior-material concerns and proximity to the historic Hale Ritchie House. A related same-day case rezoned an adjacent 0.17-acre parcel at 1117 SE Madison from M-2 to D-1 for a stormwater retention system serving the same project.', '2026-06-16'::date, 'Conditional use permit approved', 'medium'::shift_impact,
  array['developer', 'investor', 'contractor']::shift_audience[], 'SE Madison St & SE 11th St, Topeka, KS', 39.043379089775, -95.672228779768, new_sources.id,
  '{"applicant": "Kanza OZ LLC", "supports": "250-unit apartment complex", "vote": "5-1"}'::jsonb
from market, new_sources where new_sources.url like '%citizenjournal%';

with market as (
  select id from markets where slug = 'topeka-ks'
),
duplex_source as (
  select id from sources where url = 'https://www.yahoo.com/news/topeka-farm-land-could-home-142603023.html'
)
insert into projects (market_id, title, plan_category, project_type, stage, description, address, latitude, longitude, developer, units, acreage, date_announced, source_id)
select market.id, 'Vail/Lyman Duplex Development', 'land_use'::text, 'residential'::text, 'proposed'::text,
  'Rezoning of 16 acres of vacant farm land from single-family to two-family (duplex) dwelling district, southeast of NW Lyman Road & NW Vail Avenue in north Topeka. Planning Commission forwarded a recommendation to approve; City Council was scheduled to vote on the rezoning ordinance July 15, 2026 -- outcome not confirmed as of this research pass. If approved, would allow up to 40 duplexes (80 housing units).',
  'SE of NW Lyman Rd & NW Vail Ave, Topeka, KS', 39.087632083706, -95.694269769655, null, 80, 16, '2026-07-13'::date, duplex_source.id
from market, duplex_source;
