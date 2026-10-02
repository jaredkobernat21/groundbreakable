-- New market: Mansfield, OH (Jared, 2026-10-02 ask: North Central Ohio pass
-- -- the Mansfield / Ashland / Bucyrus / Richland-Ashland-Crawford county
-- corridor along the US-30 / I-71 corridor between Columbus and
-- Cleveland/Akron). Same shell-row pattern as Nashville/Tampa: market row +
-- hand-researched, sourced shifts, no fabricated data. Mansfield is the
-- anchor city (largest in the corridor, Richland County seat); the shifts
-- below are sourced to news/events across Richland, Ashland, and Crawford
-- counties along this corridor, not just Mansfield proper.
--
-- Honest finding: there is NO data center activity in this corridor.
-- Ohio's hyperscale/AEP-grid-investment data center boom (the $4.2B
-- Appalachian Ohio 765kV buildout, the Piketon 10GW campus) is
-- concentrated in central Ohio (Licking Co.) and Appalachian Ohio
-- (Piketon), both well south of this corridor -- not seeded here to avoid
-- implying local relevance it doesn't have. (If a separate Appalachian
-- Ohio market pass covers Piketon/AEP's 765kV buildout, that's where it
-- belongs.) The real signal here is modest manufacturing expansion in
-- Mansfield and Route 30 corridor infrastructure -- seeded as found,
-- without padding to match Tampa's shift count.
--
-- A $67M planned US-30/US-250 rehab project (Ashland/Wayne counties,
-- "Summer 2028" start per transportation.ohio.gov project #117004) was
-- found but excluded: the only source is an ODOT project-listing page with
-- no announcement date, same discipline as excluding Tampa's
-- aggregator-only Centersquare listing -- a future target date is not a
-- substitute for knowing when/whether this was actually announced.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('AshlandSource', 'Lincoln Highway to broadband internet: Contract signed for $20 million U.S. 30 high-speed connection across Ohio', 'news',
     'https://www.ashlandsource.com/2026/07/30/lincoln-highway-to-broadband-internet-contract-signed-for-20-million-u-s-30-high-speed-connection-across-ohio/', '2026-07-30'),
    ('Richland Source', 'ODOT cautions Crawford County drivers on road construction projects', 'news',
     'https://www.richlandsource.com/2026/09/10/odot-cautions-crawford-county-drivers-on-road-construction-projects/', '2026-09-10'),
    ('Richland Source', 'Newman Technology plans $74 million expansion on Mansfield''s north side', 'news',
     'https://www.richlandsource.com/2026/03/02/newman-technology-plans-74-million-expansion-on-mansfields-north-side/', '2026-03-02'),
    ('Richland Source', 'Double industrial growth: Mansfield lawmakers back expansion plans for Newman Tech, R.G. Smith', 'news',
     'https://www.richlandsource.com/2026/07/22/double-industrial-growth-mansfield-lawmakers-back-expansion-plans-for-newman-tech-r-g-smith/', '2026-07-22')
  returning id, url
),
new_market as (
  insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
  values ('mansfield-oh', 'Mansfield', 'OH', 40.7584, -82.5154, 11)
  on conflict (slug) do nothing
  returning id
),
market as (
  select id from new_market
  union all
  select id from markets where slug = 'mansfield-oh'
  limit 1
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'U.S. 30 broadband buildout: $20M contract signed for 257-mile fiber corridor across Richland, Ashland, Crawford counties',
  'A $20 million state contract was signed to build 257 miles of largely-underground fiber optic cable along the U.S. 30 corridor, delivering high-speed broadband to communities across Richland, Ashland, and Crawford counties.',
  '2026-07-30'::date, 'Contract signed, construction pending', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'U.S. Route 30 corridor, Richland/Ashland/Crawford Counties, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%lincoln-highway-to-broadband%'),
  '{"project_cost_usd": 20000000, "length_miles": 257, "counties": ["Richland", "Ashland", "Crawford"], "technology": "underground fiber optic"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'U.S. 30 bridge replacement over Norfolk Southern RR near SR 98 (Crawford County) under construction, ramp reopened Sept. 17',
  'ODOT''s U.S. 30 bridge replacement project (east and west bridges over the Norfolk Southern Railroad, just west of SR 98, Crawford County) has traffic reduced to one lane each direction; the eastbound exit ramp to SR 98 was closed 120 days for the work and reopened Sept. 17, 2026. Full project completion estimated August 2027.',
  '2026-09-10'::date, 'Under construction (ramp reopened 2026-09-17; completion est. Aug. 2027)', 'medium'::shift_impact, array['developer', 'contractor']::shift_audience[], 'U.S. 30 at SR 98, Crawford County, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%odot-cautions-crawford-county%'),
  '{"completion_target": "2027-08", "ramp_reopen_date": "2026-09-17", "scope": "bridge replacement over Norfolk Southern RR, east and west spans"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'business_expansion',
  'Newman Technology announces $74M expansion at its Mansfield plant (100 Cairns Road), 70 new jobs',
  'Newman Technology Inc. (Japan-based Tier 1 automotive supplier, ~40 years in Mansfield) announced a $74 million expansion of its plant at 100 Cairns Road: a new 24,500 sq ft building anchored by a 1,500-ton press, adding 70 jobs (half entry-level, half skilled trades/leadership, $25-35/hr) over the next two to three years and retaining its existing ~630-person workforce, adding an estimated $3.55 million in new annual local payroll. The State of Ohio approved a 1.225%, six-year Job Creation Tax Credit for the project.',
  '2026-03-02'::date, 'Announced', 'high'::shift_impact, array['investor', 'developer', 'contractor']::shift_audience[], '100 Cairns Road, Mansfield, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%newman-technology-plans-74-million%'),
  '{"project_cost_usd": 74000000, "jobs_created": 70, "jobs_retained": 630, "new_building_sf": 24500, "new_annual_payroll_usd": 3550000, "incentive": "State of Ohio Job Creation Tax Credit, 1.225% for 6 years"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'business_expansion',
  'R.G. Smith Co. (steel fabricator) expansion in Mansfield wins City Council tax-incentive approval',
  'R.G. Smith Co., a Mansfield steel fabricator, plans a roughly $1.8 million expansion adding 5,880 sq ft of workspace (near-doubling its facility) and 8-10 new jobs, generating an estimated $900,000-$1,000,000 in new annual payroll. Mansfield City Council approved a Community Reinvestment Area property-tax exemption agreement for the project alongside Newman Technology''s expansion.',
  '2026-07-22'::date, 'City Council incentive approved', 'medium'::shift_impact, array['investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%double-industrial-growth%'),
  '{"project_cost_usd": 1800000, "new_building_sf": 5880, "jobs_created_min": 8, "jobs_created_max": 10, "incentive": "Community Reinvestment Area (CRA) property tax exemption"}'::jsonb
from market;
