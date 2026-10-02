-- New market: Eastern / Appalachian Ohio (Jared, 2026-10-02 ask: same
-- market-addition pass as Tampa, for the Belmont/Guernsey/Muskingum/
-- Washington/Athens county corridor). Same shell-row pattern as Nashville/
-- Tampa: market row + hand-researched, sourced shifts, no fabricated data.
--
-- Centered on Cambridge, OH (Guernsey County) rather than Zanesville --
-- Cambridge sits on I-70 roughly between the two real anchors this pass
-- turned up: Zanesville (infrastructure, business) to the west and
-- Belmont County/the Ohio Valley (the data center story) to the east.
-- default_zoom is lower (9, vs. Tampa's 11) since this market is a
-- dispersed multi-county rural corridor, not one city.
--
-- The headline finding: EnergiAcres' proposed 2-3GW "Stargate Ohio" AI
-- data center campus in Belmont County -- real, but still genuinely
-- exploratory (no site chosen, Belmont County's own commissioners hadn't
-- been briefed and first heard about it from a resident at a public
-- meeting). Seeded as 'plans'/development_proposed, not as a done deal.
--
-- Two items that looked promising on first search were deliberately
-- EXCLUDED after verification turned up a date problem:
--   - Guernsey Power Station (1.8GW gas plant, Valley Township): several
--     aggregator pages describe it as "under construction," but
--     power-technology.com and Wikipedia confirm construction began 2019
--     and the plant has been operational since June 2023. Not a 2026
--     shift -- excluded rather than reported as current.
--   - The $31.6M OMEGA Appalachian Community Grant Program funds for
--     downtown Zanesville improvements, per a June 2026 Business In Focus
--     Magazine feature: traced back, the actual ACGP award was the
--     state's final funding round announced May 2024. The 2026 piece is a
--     retrospective feature, not news of a new grant -- excluded rather
--     than re-dated as a 2026 event.
-- Also out of scope: Silicon Foundation Energy's Warwood
-- manufacturing/data-campus project in the same news cycle as EnergiAcres
-- -- that's Wheeling, WEST VIRGINIA, not Ohio.
--
-- The I-70 Zanesville reconstruction shift's event_date (2024-08-13) uses
-- the most detailed dated source found for the project's cost/scope
-- (Construction Equipment Guide, targeting an October 2027 completion --
-- i.e. still an active, multi-year project today) -- same "real but not
-- within-window" date discipline as Tampa's Downtown Interchange shift.
-- A March 2026 local-news item (Muskingum County's own 2026 road/bridge
-- program) also referenced this project in passing, but is excluded as
-- its own source row since it added no new facts about the I-70 project
-- itself beyond confirming it was still ongoing.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('River News Network', 'Questions Remain After Proposed AI Data Center Surfaces in Belmont County', 'news',
     'https://rivernews.org/2026/06/25/questions-remain-after-proposed-ai-data-center-surfaces-in-belmont-county/', '2026-06-25'),
    ('Construction Equipment Guide', 'Shelly & Sands Continues Work On Zanesville''s I-70', 'news',
     'https://www.constructionequipmentguide.com/shelly-and-sands-continues-work-on-zanesvilles-i-70/65575', '2024-08-13'),
    ('Highland County Press', 'Sterling Teal International Inc. announces expansion in Zanesville', 'news',
     'https://highlandcountypress.com/headlines/sterling-teal-international-inc-announces-expansion-zanesville', '2025-07-10')
  returning id, url
),
new_market as (
  insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
  values ('eastern-appalachian-ohio', 'Eastern/Appalachian Ohio', 'OH', 40.0298, -81.5859, 9)
  on conflict (slug) do nothing
  returning id
),
market as (
  select id from new_market
  union all
  select id from markets where slug = 'eastern-appalachian-ohio'
  limit 1
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'plans'::shift_category, 'development_proposed',
  'EnergiAcres proposes 2-3GW "Stargate Ohio" AI data center campus in Belmont County -- no site chosen, county caught off guard',
  'EnergiAcres has floated a 2-3 gigawatt AI data center campus (branded "Stargate Ohio") on thousands of acres somewhere in Belmont County, targeting commercial operation by Q2 2029, citing the county''s gas infrastructure and transmission access. The proposal first became public at a June 25, 2026 Belmont County commissioners'' meeting, raised by St. Clairsville resident Paul Cameron -- commissioners Jerry Echemann, Vince Gianangeli, and J.P. Dutton said it was news to them and the county had received no advance information. The project remains in a preliminary, exploratory phase: no site has been finalized, and the company is not actively developing or constructing anything in Belmont County yet.',
  '2026-06-25'::date, 'Exploratory -- no site selected, no application filed', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'Belmont County, OH (no specific site identified)',
  null::double precision, null::double precision, (select id from new_sources where url like '%rivernews.org%'),
  '{"company": "EnergiAcres", "project_name": "Stargate Ohio", "capacity_gw": [2, 3], "target_cod": "2029-Q2", "disclosed_by": "county resident at public meeting, not the company", "site_selected": false}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'I-70 reconstruction through Zanesville ($90M, 16 bridges) remains active multi-year project, targeting October 2027 completion',
  'ODOT''s reconstruction of I-70 through the city of Zanesville -- resurfacing between US-40 and SR-93 and affecting 16 bridges, including crossings of the Licking and Muskingum rivers -- is a roughly $90 million, multi-phase project (contractor: Shelly & Sands) targeting full completion by October 2027.',
  '2024-08-13'::date, 'Under construction, targeting October 2027 completion', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'I-70 through Zanesville, OH (US-40 to SR-93)',
  null::double precision, null::double precision, (select id from new_sources where url like '%constructionequipmentguide%'),
  '{"project_cost_usd": 90000000, "contractor": "Shelly & Sands", "bridges_affected": 16, "completion_target": "2027-10"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'business_expansion',
  'Sterling Teal International Inc. expands into Zanesville, repurposing former Cardinal Health facility, 30 new jobs',
  'Sterling Teal International Inc. announced an expansion into Muskingum County on July 10, 2025, repurposing the former Cardinal Health facility in Zanesville and creating 30 new jobs. The project was supported by JobsOhio, Ohio Southeast Economic Development (OhioSE), and the Zanesville-Muskingum County Port Authority, including a $75,000 JobsOhio Revitalization Grant.',
  '2025-07-10'::date, 'Announced', 'medium'::shift_impact, array['investor', 'contractor']::shift_audience[], 'Former Cardinal Health facility, Zanesville, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%highlandcountypress%'),
  '{"jobs_created": 30, "grant_usd": 75000, "grant_source": "JobsOhio Revitalization Grant", "repurposed_facility": "former Cardinal Health", "partners": ["JobsOhio", "OhioSE", "Zanesville-Muskingum County Port Authority"]}'::jsonb
from market;
