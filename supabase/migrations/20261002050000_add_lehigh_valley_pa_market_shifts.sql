-- New market: Lehigh Valley, PA (Jared, 2026-10-02 ask: "data center
-- (planned and possible) pass" for Allentown/Bethlehem/Easton, PA --
-- Lehigh + Northampton Counties). Same shell-row pattern as Tampa/
-- Columbus/Mansfield/Appalachian Ohio: market row + hand-researched,
-- sourced shifts, no fabricated data.
--
-- Unlike Tampa (regulatory backlash, almost no real construction), the
-- Lehigh Valley is a genuine, large, CONTESTED data center boom -- the
-- single biggest and most document-dense finding of this whole project.
-- The Lehigh Valley Planning Commission was tracking 7+ live proposals as
-- of January 2026 and 16 municipal ordinances by April 2026; 57 of the
-- region's 62 municipalities had adopted some form of data center
-- regulation. At least one major project (Air Products, 2.6M sq ft) was
-- formally rejected and dropped -- so this is a boom WITH real local
-- regulatory friction and at least one confirmed casualty, not a clean
-- story in either direction.
--
-- "Possible" (unconfirmed/no-named-project) signal: Lower Macungie
-- Township's own anticipatory data center zoning ordinance (explicitly
-- modeled on neighboring Upper Macungie's, with no named project behind
-- it) is the one genuine "Possible" signal found -- same
-- potential_data_center treatment as this DB's existing Fayetteville/
-- Lawrence "readiness signal, no project identified" rows. Everything
-- else below (Atlas Industrial, Lower Mount Bethel Tech Center, Prologis
-- Allen Township, the Allentown Emaus Ave conversion, TierPoint) is a
-- real, named, filed project -- not a rumor -- even where the outcome is
-- still contested or under revision.
--
-- Infrastructure that "can/does support" a build (the user's explicit
-- ask): PPL Electric Utilities shows up twice as the literal physical
-- infrastructure enabling two different data center projects -- a new
-- substation + 2-mile transmission corridor (the "Orefield Project")
-- built specifically toward the Atlas Industrial site, and a separate
-- substation/land purchase serving TierPoint's existing TekPark
-- expansion. PPL's 2026 rate settlement (the first PA utility to shield
-- residential ratepayers from data-center grid costs) is the Lehigh
-- Valley's version of the same utility-cost-allocation fight already
-- seeded for Tampa (TECO) and Columbus (AEP Ohio). Route 22's widening is
-- general infrastructure, not data-center-specific, included because the
-- user asked for both planned infrastructure expansion and existing
-- infrastructure broadly, not just data-center-adjacent items.
--
-- Excluded after verification:
--   - NP Landholdings' 55,000 sq ft Lower Macungie building (lvpnews,
--     2025-11-19): appeared on the same planning-commission agenda as a
--     data-center zoning discussion, but no source actually confirms this
--     project itself is a data center -- excluded rather than assumed.
--   - A Compute Atlas/Baxtel aggregator listing for a second TierPoint
--     facility ("Bethlehem") -- no independent dated news confirms a
--     distinct second facility beyond the Tek Park/Breinigsville campus
--     already seeded below; likely the same facility under an older
--     naming convention, not a separate asset.
--
-- Two event dates use the most specific real milestone available rather
-- than an exact day where none was reported: the TierPoint acquisition
-- (2025-10-23, confirmed via GlobeNewswire) and the PPL Orefield Project
-- disclosure (dated to the WFMZ article itself, no separate PPL
-- announcement date found).

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('GlobeNewswire (TierPoint)', 'TierPoint Completes $240 Million Securitization Financing and Acquisition of Pennsylvania Data Center and Campus', 'press_release',
     'https://www.globenewswire.com/news-release/2025/10/23/3172085/0/en/TierPoint-Completes-240-Million-Securitization-Financing-and-Acquisition-of-Pennsylvania-Data-Center-and-Campus.html', '2025-10-23'),
    ('Lehigh Valley News Briefs', 'Upper Macungie Supervisors to Vote on PPL''s Substation for Data-Center Operator TierPoint on Thursday', 'news',
     'https://lehigh-valley-news-briefs.media/2026/08/05/upper-macungie-supervisors-to-vote-on-ppls-substation-for-data-center-operator-tierpoint-on-thursday/', '2026-08-05'),
    ('Lehigh Valley News', '5.1 million-square-foot Atlas Industrial data center could be built across from Parkland High School', 'news',
     'https://www.lehighvalleynews.com/parkland/5-1-million-square-foot-atlas-industrial-data-center-could-be-built-across-from-parkland-high-school', '2026-02-01'),
    ('WFMZ', 'PPL proposes new electric lines, substation near possible S. Whitehall data center site', 'news',
     'https://www.wfmz.com/news/area/lehighvalley/ppl-proposes-new-electric-lines-substation-near-possible-s-whitehall-data-center-site/article_cf26e479-1e1e-49a2-b25f-d55cf8337ea2.html', '2026-04-02'),
    ('WFMZ', 'Air Products confirms plans for massive data center dead', 'news',
     'https://www.wfmz.com/news/area/lehighvalley/lehigh-county/air-products-confirms-plans-for-massive-data-center-are-dead/article_554d0b9c-62ce-45df-894e-3201f87704b4.html', '2026-07-06'),
    ('WFMZ / LVP News', 'Allen Township approves 1-million-square-foot data center at Prologis warehouse', 'news',
     'https://www.wfmz.com/news/area/lehighvalley/northampton-county/nazareth-northampton-area/allen-township-approves-1-million-square-foot-data-center-at-prologis-warehouse/article_25bc2b9d-396b-4b6c-9951-ea7d96204b8e.html', '2026-03-24'),
    ('WFMZ', 'Allentown City Council OKs data center ordinance in 4-2 vote', 'news',
     'https://www.wfmz.com/news/area/lehighvalley/lehigh-county/allentown-area/allentown-city-council-oks-data-center-ordinance-in-4-2-vote/article_e5bfb155-b713-42de-83c5-ee5a62fb4f3d.html', '2026-06-17'),
    ('citizenportal.ai', 'Chair introduces Bill 52 to tighten Allentown zoning rules for data centers', 'news',
     'https://citizenportal.ai/articles/9585532/Pennsylvania/Lehigh-County/Allentown-City/Chair-introduces-Bill-52-to-tighten-Allentown-zoning-rules-for-data-centers', '2026-06-24'),
    ('WFMZ', 'Allentown planning commission to review vacant warehouse conversion plans for data center', 'news',
     'https://www.wfmz.com/news/local_government/zoning_planning/allentown-planning-commission-to-review-vacant-warehouse-conversion-plans-for-data-center/article_6ae861d3-bcd2-4e26-95fe-94bd24191ffe.html', '2026-07-16'),
    ('WFMZ', 'Lower Macungie advances data center ordinance', 'news',
     'https://www.wfmz.com/news/area/lehighvalley/lehigh-county/western-lehigh-county/lower-macungie-advances-data-center-ordinance/article_2f278275-f6cb-4478-85ed-f90503ca6687.html', '2026-04-02'),
    ('The Cool Down', '''We will fight until the end'': Pennsylvania township erupts over $5 billion data center plan', 'news',
     'https://www.thecooldown.com/green-tech/residents-fight-rural-farm-takeover-proposal/', '2026-04-17'),
    ('Lehigh Valley Public Media', 'PPL rate settlement signals new cost divide between households and data centers', 'news',
     'https://www.lehighvalleypublicmedia.org/news/local/ppl-rate-settlement-signals-new-cost-divide-between-households-and-data-centers/', '2026-07-01'),
    ('LVP News', '$6 million secured for Route 22 widening project', 'news',
     'https://www.lvpnews.com/20260128/6-million-secured-for-route-22-widening-project/', '2026-01-28'),
    ('Lehigh Valley Business (LVB)', 'Planning needed for potential Lehigh Valley data center boom', 'news',
     'https://lvb.com/planning-needed-for-potential-lehigh-valley-data-center-boom/', '2026-01-14'),
    ('WFMZ', '16 and counting: More Lehigh Valley municipalities grappling with data center ordinances', 'news',
     'https://www.wfmz.com/news/area/lehighvalley/16-and-counting-more-lehigh-valley-municipalities-grappling-with-data-center-ordinances/article_0b0d4c90-bcb4-4719-9a40-8e251fbb318e.html', '2026-04-02')
  returning id, url
),
new_market as (
  insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
  values ('lehigh-valley-pa', 'Lehigh Valley', 'PA', 40.6022552, -75.4716115, 10)
  on conflict (slug) do nothing
  returning id
),
market as (
  select id from new_market
  union all
  select id from markets where slug = 'lehigh-valley-pa'
  limit 1
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'business'::shift_category, 'business_expansion',
  'TierPoint acquires Tek Park data center campus for $175M, launches 100MW expansion',
  'TierPoint completed a $240M securitization financing and $175M acquisition of its previously-leased Tek Park data center campus (137 acres, former AT&T Optoelectronics HQ) at 9999 Hamilton Blvd, Breinigsville, in Upper Macungie Township. The existing facility (122,000 sq ft, ~16MW) is undergoing a 100MW power expansion targeted for completion in the second half of 2026, adding ~100 jobs plus an estimated 350+ construction/engineering jobs during buildout.',
  '2025-10-23'::date, 'Acquired; 100MW expansion under construction', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], '9999 Hamilton Blvd, Breinigsville, PA (Upper Macungie Township)',
  40.5431431, -75.6598043, (select id from new_sources where url ilike '%globenewswire%tierpoint%'),
  '{"acquisition_price_usd": 175000000, "financing_usd": 240000000, "existing_sf": 122000, "existing_mw": 16, "expansion_mw": 100, "jobs_added": 100, "construction_jobs_est": 350, "campus_acres": 137}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'PPL substation request for TierPoint''s Tek Park expansion goes before Upper Macungie supervisors',
  'PPL Electric Utilities acquired Upper Macungie property for $1.75M (disclosed Aug. 2, 2026) to build a substation adding capacity for TierPoint''s Tek Park expansion. The substation (Resolution #2026-36) went before the Upper Macungie Township Board of Supervisors for a vote scheduled Aug. 6, 2026 -- the physical utility buildout directly enabling TierPoint''s 100MW expansion.',
  '2026-08-06'::date, 'Before township supervisors for vote', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'Near 9999 Hamilton Blvd, Upper Macungie Township, PA',
  40.5431431, -75.6598043, (select id from new_sources where url like '%upper-macungie-supervisors-to-vote%'),
  '{"land_cost_usd": 1750000, "resolution": "2026-36", "customer": "TierPoint (Tek Park)", "utility": "PPL Electric Utilities"}'::jsonb
from market
union all
select market.id, 'plans'::shift_category, 'development_proposed',
  '5.1M sq ft "Atlas Industrial" data center campus proposed across from Parkland High School, South Whitehall Township',
  'A data center campus (initially pitched at 5.1M sq ft across six buildings, now revised to three ~492,285 sq ft buildings plus a 40,680 sq ft accessory building, an electrical substation, and a cell tower -- ~1.5M sq ft total) proposed for a consolidated 410-acre site at 2493 N Cedar Crest Blvd, South Whitehall Township, directly across the street from Parkland High School (2700 N Cedar Crest Blvd). Site owned by the Jeras Corporation (3 consolidated parcels). Facing sustained community pushback and demands for a public hearing.',
  '2026-02-01'::date, 'Under township planning commission review', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], '2493 N Cedar Crest Blvd, South Whitehall Township, PA',
  40.5896083, -75.5250005, (select id from new_sources where url like '%5-1-million-square-foot-atlas-industrial%'),
  '{"site_acres": 410, "original_pitch_sf": 5100000, "revised_sf": 1500000, "buildings": 3, "landowner": "Jeras Corporation", "nearby_landmark": "Parkland High School"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'PPL''s "Orefield Project" substation and 2-mile transmission corridor proposed to serve undisclosed customer near Atlas Industrial site',
  'PPL Electric Utilities purchased 30+ acres near Huckleberry Rd & Herman Lane, South Whitehall Township, to build a new substation (adjacent to PPL''s existing Susquehanna-Wescosville line) and a 200-250-foot-wide, 2-mile transmission corridor running east toward a "new customer facility" PPL has not named -- the distance and location correspond to the Atlas Industrial data center site. Construction expected to start summer 2026 pending PUC approval, completion targeted summer 2028.',
  '2026-04-02'::date, 'Land acquired; pending PUC approval', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'Huckleberry Road & Herman Lane, South Whitehall Township, PA',
  40.6167805, -75.5920509, (select id from new_sources where url like '%ppl-proposes-new-electric-lines%'),
  '{"land_acres": 30, "corridor_length_miles": 2, "corridor_width_ft": "200-250", "disclosed_customer": false, "likely_customer": "Atlas Industrial site", "regulator": "Pennsylvania PUC", "construction_target": "summer 2026", "completion_target": "summer 2028"}'::jsonb
from market
union all
select market.id, 'plans'::shift_category, 'development_withdrawn',
  'Air Products'' 2.6M sq ft data center proposal formally dead after zoning board denial, no appeal filed',
  'Upper Macungie Township''s zoning hearing board unanimously denied Air Products and Chemicals'' request tied to a planned 2.6 million-square-foot data center campus on its former Trexlertown-area headquarters site. The board''s denial was issued July 6, 2026; Air Products let the 30-day appeal window lapse and confirmed it would not appeal, ending the project. The Lehigh Valley Planning Commission had previously found the application lacking basic information ("like spaghetti on the wall").',
  '2026-07-06'::date, 'Dead -- denied, no appeal filed', 'medium'::shift_impact, array['developer', 'investor']::shift_audience[], 'Former Air Products headquarters, Trexlertown, Upper Macungie Township, PA',
  null::double precision, null::double precision, (select id from new_sources where url like '%air-products-confirms-plans%'),
  '{"proposed_sf": 2600000, "outcome": "denied, no appeal", "appeal_window_days": 30, "note": "address ambiguous across sources (7200 vs 7201 Hamilton Blvd vs a separate Cetronia Rd parcel) -- left ungeocoded rather than guessed"}'::jsonb
from market
union all
select market.id, 'plans'::shift_category, 'development_approved',
  'Allen Township approves conversion of 1.01M sq ft Prologis warehouse into Lehigh Valley''s first hyperscale data center',
  'Allen Township Board of Supervisors voted unanimously (March 24, 2026) to approve Prologis''s request to convert its existing 1.01 million sq ft warehouse at 2500 Liberty Drive into what''s being called the Lehigh Valley''s first hyperscale data center. The retrofit will use a closed-loop cooling system (eliminating ongoing water consumption) and integrate onsite solar to offset grid demand. Planned completion year: 2028.',
  '2026-03-24'::date, 'Approved; conversion planned', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], '2500 Liberty Drive, Allen Township, PA',
  40.7017264, -75.4801064, (select id from new_sources where url like '%allen-township-approves-1-million%'),
  '{"existing_building_sf": 1010000, "cooling": "closed-loop (no ongoing water consumption)", "power": "onsite solar offset", "planned_year": 2028, "developer": "Prologis"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Allentown City Council passes data center zoning ordinance (Bill 20) in 4-2 vote',
  'Allentown City Council voted 4-2 (Napoli, Mota, Binder, Pungo in favor; Gerlach, Santos opposed) to pass Bill 20, permitting data centers in the General-Industrial and Industrial Manufacturing districts by special exception, requiring a zoning hearing board hearing, expanded setbacks, environmental review, and a planning board hearing.',
  '2026-06-17'::date, 'Passed', 'medium'::shift_impact, array['developer', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%allentown-city-council-oks-data-center-ordinance%'),
  '{"vote": "4-2", "scope": "citywide (Allentown)", "zoning_districts": ["General-Industrial", "Industrial Manufacturing (special exception)"]}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Allentown introduces Bill 52 to further tighten data center zoning days after passing Bill 20',
  'Allentown City Council held a special meeting (June 24, 2026) to introduce Bill 52, strengthening Bill 20 just one week after its passage: limiting Data Center Use to the Industrial Manufacturing district only (removing General-Industrial), increasing the sensitive-receptor setback to 500 feet, adding decommissioning requirements, and expanding public notice. Forwarded to committee, then the Allentown and Lehigh Valley Planning Commissions, before a future council vote.',
  '2026-06-24'::date, 'Introduced; under committee/planning commission review', 'medium'::shift_impact, array['developer', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url ilike '%chair-introduces-bill-52%'),
  '{"scope": "citywide (Allentown)", "setback_ft": 500, "removes_district": "Industrial General (IG)", "remaining_district": "Industrial Manufacturing (IM)"}'::jsonb
from market
union all
select market.id, 'plans'::shift_category, 'development_proposed',
  'Developer revises Allentown warehouse-to-data-center conversion proposal at 2401 W. Emaus Ave amid planning commission review',
  'A developer''s proposal to convert an existing 224,000 sq ft warehouse at 2401 W. Emaus Ave, Allentown, into a data center (with a 23,000+ sq ft addition) has gone through multiple rounds of Allentown Planning Commission review and revision following neighbor pushback, continuing even as the city finalized its own data center zoning ordinance (Bill 20) in parallel.',
  '2026-07-16'::date, 'Revised plan under planning commission review', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], '2401 W Emaus Ave, Allentown, PA',
  40.5678094, -75.4751235, (select id from new_sources where url like '%allentown-planning-commission-to-review%'),
  '{"existing_building_sf": 224000, "addition_sf": 23000, "status": "revised multiple times after community feedback"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Lower Macungie Township advances anticipatory data center zoning ordinance -- no named project behind it',
  'Lower Macungie Township''s Board of Commissioners approved advertising proposed data-center zoning amendments (permitting data centers as a conditional use in the Industrial, Highway Enterprise, and Office/Research/Light Industrial districts, with annual water/power usage reporting, noise/vibration studies, and emergency response plans), explicitly modeled on neighboring Upper Macungie''s ordinance. No specific data center project has been proposed in Lower Macungie itself -- purely anticipatory.',
  '2026-04-02'::date, 'Ordinance advertised; hearing pending', 'low'::shift_impact, array['developer', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%lower-macungie-advances-data-center-ordinance%'),
  '{"scope": "Lower Macungie Township", "project_identified": false, "modeled_on": "Upper Macungie Township ordinance", "conditional_use_districts": ["Industrial", "Highway Enterprise", "Office/Research/Light Industrial"]}'::jsonb
from market
union all
select market.id, 'plans'::shift_category, 'development_proposed',
  '"Lower Mount Bethel Tech Center" -- $5B+, 1.2GW data center proposal sparks fierce opposition, revised to 239-acre rezoning request',
  'A proposed $5+ billion, 1.2-gigawatt data center campus ("Lower Mount Bethel Tech Center"), originally pitched for 450 acres at Gravel Hill Rd & Martins Creek Belvidere Hwy, Lower Mount Bethel Township, Northampton County, sparked a packed town hall and sustained resident opposition ("We will fight until the end"). The development team later filed a revised map amendment application seeking to rezone ~239 acres to industrial use (~100 acres of farmland already envisioned for future electric-utility use, ~102 acres of existing quarry property, plus remaining undeveloped land), centered around Depues Ferry Road.',
  '2026-04-17'::date, 'Revised rezoning application under review amid opposition', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'Gravel Hill Rd & Martins Creek Belvidere Hwy, Lower Mount Bethel Township, PA',
  40.8398706, -75.1175513, (select id from new_sources where url like '%residents-fight-rural-farm-takeover%'),
  '{"estimated_value_usd": 5000000000, "capacity_gw": 1.2, "original_site_acres": 450, "revised_rezoning_acres": 239, "revised_breakdown": {"farmland_acres": 100, "quarry_acres": 102}, "community_response": "sustained organized opposition"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'utility_rate_filing',
  'PPL becomes first Pennsylvania utility to shield residential ratepayers from data center grid costs',
  'The Pennsylvania PUC approved a PPL rate settlement (reducing PPL''s original revenue request by $80M+ while still raising distribution rates, effective July 1, 2026) that creates a new "large-load" customer class aimed at data centers and other high-demand facilities: 10-year contracts required, and large-load customers paying $11M toward low-income rate relief. First time a Pennsylvania utility has formally agreed to shield average ratepayers from data center-driven costs. Typical Lehigh Valley household bill (1,000 kWh/month) rises from ~$176 to ~$184.',
  '2026-07-01'::date, 'Effective', 'high'::shift_impact, array['developer', 'investor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%ppl-rate-settlement-signals%'),
  '{"effective_date": "2026-07-01", "revenue_request_reduction_usd": 80000000, "large_load_contract_years": 10, "low_income_relief_fund_usd": 11000000, "typical_bill_increase_usd": 8}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'Route 22 widening from Fullerton Ave to Airport Rd secures $6M for engineering, land, and utility relocation',
  '$6 million was secured to begin engineering plans, land purchases, and utility relocation for widening U.S. Route 22 from the Fullerton Avenue interchange to Airport Road to three lanes. Route 22 at the Lehigh River Bridge carries ~110,000 vehicles/day, one of the region''s busiest and most hazardous corridors (13 serious injuries and 1 fatality in recent years).',
  '2026-01-28'::date, 'Engineering/land acquisition phase funded', 'medium'::shift_impact, array['developer', 'contractor']::shift_audience[], 'US Route 22, Fullerton Ave interchange to Airport Rd, Whitehall/Allentown, PA',
  40.6252346, -75.4681376, (select id from new_sources where url like '%6-million-secured-for-route-22%'),
  '{"funding_secured_usd": 6000000, "daily_traffic": 110000, "scope": "widen to 3 lanes", "safety_note": "13 serious injuries, 1 fatality in recent years on this segment"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Lehigh Valley Planning Commission tracking 7+ data center proposals; 57 of 62 municipalities adopt some regulation',
  'As of January 2026, the Lehigh Valley Planning Commission was tracking at least seven live data center proposals across the region, with 57 of the Lehigh Valley''s 62 municipalities having adopted at least some form of data center regulation -- a region-wide planning response to the emerging boom.',
  '2026-01-14'::date, 'Ongoing regional response', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%planning-needed-for-potential-lehigh-valley%'),
  '{"scope": "regionwide (Lehigh + Northampton Counties)", "tracked_proposals": 7, "municipalities_with_regulation": 57, "municipalities_total": 62}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  '"16 and counting": Lehigh Valley Planning Commission now reviewing 16 municipal data center ordinances',
  'By April 2026, the Lehigh Valley Planning Commission had reviewed or was reviewing 16 municipal data center ordinances across Lehigh and Northampton counties -- including Upper Mount Bethel, Palmer, South Whitehall, Upper Macungie, Upper Saucon, North Whitehall, Lower Saucon, Lowhill, Bushkill, Washington (Northampton), Plainfield, Allentown, Moore, Upper Nazareth, Lower Nazareth, and Chapman -- up from the 7 proposals tracked in January, showing the regulatory response accelerating alongside the development pressure.',
  '2026-04-02'::date, 'Ongoing regional response (accelerating)', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%16-and-counting%'),
  '{"scope": "regionwide (Lehigh + Northampton Counties)", "ordinances_count": 16, "municipalities": ["Upper Mount Bethel", "Palmer", "South Whitehall", "Upper Macungie", "Upper Saucon", "North Whitehall", "Lower Saucon", "Lowhill", "Bushkill", "Washington (Northampton)", "Plainfield", "Allentown", "Moore", "Upper Nazareth", "Lower Nazareth", "Chapman"]}'::jsonb
from market;
