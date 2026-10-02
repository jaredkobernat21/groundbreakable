-- New market: Tampa, FL (Jared, 2026-10-02 ask: add Tampa and fill it with
-- infrastructure and data-center signal). Same shell-row pattern as
-- Nashville/Wichita/Tulsa/St. Louis: market row + hand-researched, sourced
-- shifts, no fabricated data.
--
-- The real story researched here is NOT "Tampa is a data center boom
-- market" -- it's the opposite: both Hillsborough and Pinellas County are
-- actively moving to restrict/pause large-scale data center development in
-- 2026 (water, noise, grid-load concerns), one specific proposal
-- (American Tower, Pinellas Park) was filed and then withdrawn, and the
-- regional utility (TECO) is fighting to keep data center build-out costs
-- off residential bills. That's the accurate signal, so that's what's
-- seeded -- a backlash/regulatory-pause phase, not a construction boom.
-- Two unrelated general road-infrastructure megaprojects (Selmon,
-- I-275/I-4 downtown interchange) are included since "infrastructure" was
-- asked for separately from "data centers."
--
-- One real data center M&A event (H5 Data Centers / Novacap JV acquiring
-- the Tampa carrier hotel from 365 Data Centers) is included under
-- 'business' since it's an ownership change, not new construction.
--
-- A Centersquare/Cyxtera facility at 9310 Florida Palm Drive (Hillsborough
-- Co.) turned up in data-center-tracker aggregators (interconnection.fyi,
-- compute-atlas) but with no dated news announcement behind it --
-- excluded rather than seeded off an aggregator page with no clear
-- "when," same discipline as never geocoding off a guess.
--
-- One event date uses month-level precision because that's the precision
-- the source actually reports (2026-02-01 for a Feb-2026-dated legal-
-- advisory URL with no specific day) -- same convention as Nashville's
-- annual indicators using Jan 1 placeholders for year-only figures. The
-- Downtown Tampa Interchange shift's event_date (2023-10-01, reported
-- "Fall 2023" start) is a real reported fact from a news source; the FDOT
-- project factsheet cited alongside it is an undated status page, so its
-- source row's published_date is left null rather than borrowing the
-- event date as if it were the article's publish date.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('Tampa Bay Business Journal (tbbwmag)', '$362M Selmon rebuild starts Spring 2026, THEA says', 'news',
     'https://tbbwmag.com/2026/02/19/south-selmon-expressway-rebuild-spring-2026/', '2026-02-19'),
    ('FDOT Tampa Bay', 'I-275 at I-4 Downtown Tampa Interchange (DTI) Safety and Operational Improvements - 445057-1-52-01', 'agency_document',
     'https://www.fdottampabay.com/project/839/445057-1-52-01', null),
    ('Bay News 9', 'Tampa Electric files plan to protect customers from data center costs', 'news',
     'https://baynews9.com/fl/tampa/news/2026/10/01/tampa-electric-files-plan-to-protect-customers-from-data-center-costs', '2026-10-01'),
    ('Willkie Farr & Gallagher', 'Willkie Advises Novacap and H5 Data Centers', 'press_release',
     'https://www.willkie.com/news/2026/02/willkie-advises-novacap-and-h5-data-centers', '2026-02-01'),
    ('Bay News 9', 'Data center developer proposes building in Pinellas Park', 'news',
     'https://baynews9.com/fl/tampa/news/2026/06/18/data-center-developer-proposes-building-in-pinellas-park', '2026-06-18'),
    ('FOX 13 News', 'Boston developer files building permit for Pinellas Park data center', 'news',
     'https://www.fox13news.com/news/boston-developer-files-building-permit-pinellas-park-data-center', '2026-08-11'),
    ('Business Observer FL', 'Pinellas County closes the door on large-scale data centers', 'news',
     'https://www.businessobserverfl.com/news/2026/aug/29/pinellas-county-closes-door-data-centers/', '2026-08-29'),
    ('FOX 13 News', 'Hillsborough County commissioners vote to draft one-year data center pause', 'news',
     'https://www.fox13news.com/news/hillsborough-county-commissioners-vote-draft-one-year-data-center-pause', '2026-08-05')
  returning id, url
),
new_market as (
  insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
  values ('tampa-fl', 'Tampa', 'FL', 27.9506, -82.4572, 11)
  on conflict (slug) do nothing
  returning id
),
market as (
  select id from new_market
  union all
  select id from markets where slug = 'tampa-fl'
  limit 1
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'South Selmon Expressway Capacity Project ($362M) begins construction, Downtown Tampa to Gandy Blvd',
  'Tampa-Hillsborough Expressway Authority (THEA) began its $362 million South Selmon Expressway Capacity Project in spring 2026: widening the reversible expressway from two to three lanes in each direction across 4.5 miles between Downtown Tampa and Gandy Blvd, modernizing 26 bridges (including a signature Hillsborough River span), adding noise walls, redesigned underpasses, intelligent transportation systems, and a dog park/gathering space at Bay-to-Bay and MacDill. Funded via toll revenue. Completion targeted 2030.',
  '2026-02-19'::date, 'Under construction (started spring 2026, completion 2030)', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'Selmon Expressway (Lee Roy Selmon Expressway), Downtown Tampa to Gandy Blvd, Tampa, FL',
  null::double precision, null::double precision, (select id from new_sources where url like '%south-selmon%'),
  '{"project_cost_usd": 362000000, "funding": "toll revenue", "agency": "THEA", "length_miles": 4.5, "bridges_modernized": 26, "completion_target": 2030}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'Downtown Tampa Interchange (I-275/I-4) rebuild, $227.5M, more than halfway complete',
  'FDOT''s Downtown Tampa Interchange project (I-275 at I-4, project #445057-1-52-01) is a $227.5 million safety/operational rebuild handling ~200,000 vehicles/day: six new bridges, eight bridge widenings or modifications, four bridge recoatings, two bridge railing retrofits, plus trail connections and new community spaces. Contractor: The Lane Construction Corporation. Construction started fall 2023; as of late June 2026 the project was reported more than halfway complete, targeting spring 2027 completion.',
  '2023-10-01'::date, 'Under construction (>50% complete as of mid-2026, completion spring 2027)', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'I-275 at I-4 interchange, Downtown Tampa, FL',
  null::double precision, null::double precision, (select id from new_sources where url like '%fdottampabay%'),
  '{"project_cost_usd": 227500000, "contractor": "The Lane Construction Corporation", "daily_traffic": 200000, "new_bridges": 6, "bridge_modifications": 8, "completion_target": "Spring 2027"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'utility_rate_filing',
  'Tampa Electric (TECO) files data center/large-load rate tariff to shield residential customers from buildout costs',
  'Tampa Electric filed a new rate tariff with the Florida Public Service Commission creating a distinct class for large-load customers (data centers) averaging at least 50MW of monthly peak demand. Those customers must sign 20-year contracts and pay for the electric infrastructure built to serve them -- including power plant renovations at Big Bend (Apollo Beach) and added battery storage -- plus a share of broader system costs. Filing required by a state law (signed by Gov. DeSantis) mandating all Florida corporate utilities submit such plans by Oct. 1, 2026; the Florida PSC must still approve it.',
  '2026-10-01'::date, 'Filed, pending Florida PSC approval', 'high'::shift_impact, array['developer', 'investor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%tampa-electric-files-plan%'),
  '{"large_load_threshold_mw": 50, "contract_term_years": 20, "infra_cited": ["Big Bend power plant (Apollo Beach)", "battery storage"], "regulator": "Florida Public Service Commission", "statutory_deadline": "2026-10-01"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'ownership_change',
  'H5 Data Centers / Novacap joint venture acquires Tampa carrier hotel (Franklin Exchange) from 365 Data Centers',
  'The H5 Data Centers / Novacap joint venture acquired three carrier-hotel facilities from 365 Data Centers -- in Buffalo NY, Nashville TN, and Tampa FL -- anchoring a four-facility JV portfolio. The Tampa facility is the Franklin Exchange building at 655 N Franklin St, a carrier-dense colocation site. Willkie Farr & Gallagher advised on the deal. Reflects the broader private-equity push into data center real estate as buyers chase megawatts and dense power rather than legacy colocation.',
  '2026-02-01'::date, 'Closed', 'medium'::shift_impact, array['investor', 'developer']::shift_audience[], '655 N Franklin St, Tampa, FL',
  null::double precision, null::double precision, (select id from new_sources where url like '%willkie%'),
  '{"acquirer_jv": ["H5 Data Centers", "Novacap"], "seller": "365 Data Centers", "other_locations_in_deal": ["Buffalo, NY", "Nashville, TN"], "facility_name": "Franklin Exchange"}'::jsonb
from market
union all
select market.id, 'plans'::shift_category, 'development_withdrawn',
  'American Tower withdraws 4MW edge data center proposal in Pinellas Park after neighborhood/review pushback',
  'American Tower Corp. (Boston-based REIT) filed a permit in June 2026 to demolish a light-industrial building at 10700 76th Court N, Pinellas Park and replace it with a ~17,000 sq ft, 4MW edge data-processing facility on a half-acre of a 23-acre site with access to five fiber providers -- less than a quarter-mile from the nearest home. The proposal required conditional-use review. American Tower later withdrew the application amid the scrutiny; Pinellas Park City Council unanimously passed a one-year data center moratorium on Aug. 11, 2026.',
  '2026-06-18'::date, 'Withdrawn (moratorium followed Aug. 11, 2026)', 'medium'::shift_impact, array['developer', 'investor']::shift_audience[], '10700 76th Court N, Pinellas Park, FL',
  null::double precision, null::double precision, (select id from new_sources where url like '%proposes-building-in-pinellas-park%'),
  '{"applicant": "American Tower Corp.", "capacity_mw": 4, "building_sf": 17655, "site_acres": 23, "outcome": "withdrawn", "followed_by": "Pinellas Park 1-year data center moratorium, 2026-08-11"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Pinellas Park City Council unanimously approves one-year data center moratorium',
  'Following the withdrawn American Tower edge data center proposal, Pinellas Park City Council voted unanimously to approve a one-year moratorium on new data center development, effective Aug. 11, 2026.',
  '2026-08-11'::date, 'In effect (1 year)', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%boston-developer-files-building-permit%'),
  '{"scope": "citywide (Pinellas Park)", "duration": "1 year", "related_to": "American Tower 10700 76th Court N proposal withdrawal"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Pinellas County closes the door on large-scale data centers',
  'Pinellas County took regulatory action to restrict large-scale data center development countywide, joining Pinellas Park''s city-level moratorium as part of a broader regional pushback citing grid load, water, and noise concerns.',
  '2026-08-29'::date, 'In effect (countywide)', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%pinellas-county-closes-door%'),
  '{"scope": "countywide (Pinellas County)"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Hillsborough County commissioners vote 7-0 to study AI data center impacts, direct attorney to draft moratorium',
  'Hillsborough County commissioners voted unanimously (7-0, two motions) on Aug. 5, 2026 to commission a study of AI data centers'' water/land-use impacts and directed the county attorney to draft an ordinance imposing a moratorium on AI data center development in unincorporated parts of the county. The ordinance would take effect after Oct. 1, 2027 (when state law SB 180 is set to expire) or sooner if SB 180 is struck down in court. District 5 Commissioner Donna Cameron Cepeda originally sought a five-year moratorium before narrowing scope after a briefing on SB 180''s preemption.',
  '2026-08-05'::date, 'Ordinance drafting directed; takes effect after Oct. 2027 or SB 180 ruling', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%hillsborough-county-commissioners-vote%'),
  '{"scope": "unincorporated Hillsborough County", "vote": "7-0", "effective_after": "2027-10-01 or SB 180 struck down", "sponsor": "Commissioner Donna Cameron Cepeda (District 5)"}'::jsonb
from market;
