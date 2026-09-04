-- Real, sourced Tonganoxie, KS shifts (pilot batch) -- 3 shifts across 2
-- categories. Tonganoxie is a small town (~5,600 people) with genuinely
-- thinner public-data infrastructure than Topeka/Lawrence: no Cityworks
-- equivalent (PermitGrab has no data for it yet -- "updating our data
-- source"), Leavenworth County's sheriff-sales page 403s bot traffic and
-- its Tax Sale Book PDF fails TLS handshake entirely (both confirmed
-- broken, not just hard to parse), and there's no scheduled tax auction
-- right now to report ("Next Tax Sale Auction: NONE SCHEDULED AT THIS
-- TIME" per the county's own page, fetched live). Distress and
-- Construction are genuine gaps this pass, same discipline as every
-- other documented gap in this project -- not fabricated to fill a
-- category.
--
-- The one Development shift here is a big one for a town this size:
-- Project Bluestem, a 1,100+ acre hyperscale data center proposed just
-- south of town, cleared to proceed when Leavenworth County
-- commissioners let a development moratorium expire 3-2 on 2026-08-12 --
-- real, current, and contested (an opposition group is preparing
-- litigation).

with market as (
  select id from markets where slug = 'tonganoxie-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('KCTV5', 'Moratorium expires on Tonganoxie data center project; citizen group plans lawsuit', 'news',
     'https://www.kctv5.com/2026/08/13/leavenworth-county-zoning-meeting-draws-opposition-over-proposed-development/', '2026-08-12'),
    ('City of Tonganoxie', 'Notice of Street Improvements Project — Front St / Ridge St', 'agency_document',
     'https://www.tonganoxie.org/home/news/notice-street-improvements-project-front-st-ridge-st-tonganoxie-drive-portions-ridge-st', '2026-01-30'),
    ('The Tonganoxie Mirror', 'Tonganoxie City Council minutes from July 20, 2026', 'news',
     'https://www.tonganoxiemirror.com/news/local/2026/aug/05/tonganoxie-city-council-minutes-from-july-20-2026/', '2026-08-05')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'development'::shift_category, 'moratorium_expired',
  'Data center moratorium expires, clearing path for Project Bluestem', 'Leavenworth County commissioners voted 3-2 against extending a 90-day moratorium on data center development, letting it lapse. Project Bluestem is a proposed 1,100+ acre hyperscale data center just south of Tonganoxie by Cloverleaf Infrastructure (subsidiary Meadowlark). Opposition group Citizens Against Bluestem (25-30 members) has retained an attorney and is raising money for a legal challenge.', '2026-08-12'::date, 'Moratorium expired -- opposition preparing legal challenge', 'high'::shift_impact,
  array['developer', 'investor', 'agent', 'broker']::shift_audience[], 'South of Tonganoxie, KS (Leavenworth County)', null, null, new_sources.id,
  '{"project_name": "Project Bluestem", "acres": 1100, "developer": "Cloverleaf Infrastructure", "vote": "3-2 against extending moratorium"}'::jsonb
from market, new_sources where new_sources.url like '%kctv5%'
union all
select market.id, 'infrastructure'::shift_category, 'road_project',
  'Front St / Ridge St improvements under construction', 'Stormwater, street & curb improvements, and a pedestrian sidewalk along Front St (Ridge St to Tonganoxie Dr) plus portions of Ridge St south of Hwy 24/40. Construction began March 9, 2026, contractor Kansas Heavy Construction LLC; Change Order #2 (expanding scope) approved 2026-05-04.', '2026-05-04'::date, 'Under construction', 'medium'::shift_impact,
  array['contractor', 'developer']::shift_audience[], 'Front St & Ridge St, Tonganoxie, KS', 39.115946042761, -95.076329931019, new_sources.id,
  '{"contractor": "Kansas Heavy Construction, LLC", "started": "2026-03-09"}'::jsonb
from market, new_sources where new_sources.url like '%street-improvements%'
union all
select market.id, 'infrastructure'::shift_category, 'park_project',
  'Chieftain Park improvements design approved', 'City Council approved the Chieftain Park project design; installation expected November 2026 through March 2027.', '2026-08-05'::date, 'Design approved -- installation Nov 2026-Mar 2027', 'medium'::shift_impact,
  array['contractor', 'developer']::shift_audience[], '235 N Main St, Tonganoxie, KS', 39.115212737941, -95.084137586475, new_sources.id,
  '{}'::jsonb
from market, new_sources where new_sources.url like '%council-minutes-from-july-20%';
