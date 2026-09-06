-- Third Lawrence research pass (Jared, 2026-09-06, continuing the same
-- "planning, permits, contractors" ask): pulled real PDFs off Lawrence's
-- CivicWeb portal with PyMuPDF (plain WebFetch can't read them -- same
-- limitation noted in reference_topeka_public_data_sources) rather than
-- relying on search snippets alone. The 2026 Affordable Housing Trust
-- Fund applicant summaries document alone surfaced three real Lawrence
-- developments not previously tracked at all, plus -- notably -- the
-- first genuine contractor identification found across any Lawrence
-- project this session: Peaslee Tech, building the Tiny Homes on
-- Garfield project for the Housing Authority.
--
-- Floret Hill (121 apartments + 12 for-sale townhomes, ~$6.9M incentive
-- package -- the single largest item found) has no discoverable street
-- address anywhere, including its own funding/zoning coverage -- it's
-- only ever described by intersection (SE corner of K-10 & Bob Billings
-- Pkwy). `projects.latitude/longitude` are NOT NULL, unlike
-- `development_opportunities`' (deliberately nullable for this exact
-- "intersection-only, no fabricated pin" scenario -- see the
-- refine_development_opportunities_categories migration). Rather than
-- fabricate a coordinate, Floret Hill is added as a shift (lat/lng
-- nullable there too) instead of a projects row -- consistent with how
-- this database has already handled this exact situation once before.

with market as (
  select id from markets where slug = 'lawrence-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('The Lawrence Times', 'Lawrence school district will sell East Heights property for affordable housing project', 'news',
     'https://lawrencekstimes.com/2024/05/13/usd497-to-sell-east-heights/', '2024-05-13'),
    ('KSHB', 'More affordable housing to come to developing East Lawrence neighborhood', 'news',
     'https://www.kshb.com/news/local-news/kansas/douglas-county/more-affordable-housing-to-come-to-developing-east-lawrence-neighborhood', null),
    ('The Lawrence Times', 'Lawrence City Commission to consider selling parking lot at 7th and New Hampshire for housing', 'news',
     'https://lawrencekstimes.com/2026/06/04/citycomm-711-nh-pre/', '2026-06-04'),
    ('The Lawrence Times', 'Lawrence City Commission holds off on sale of downtown parking lot for affordable housing', 'news',
     'https://lawrencekstimes.com/2026/06/09/lawrence-city-comm-711-nh-deferred/', '2026-06-09'),
    ('City of Lawrence', '2026 Affordable Housing Trust Fund Applicant Project Summaries', 'agency_document',
     'https://lawrenceks.civicweb.net/document/452264/', '2025-11-17'),
    ('City of Lawrence', 'City announces nine recipients of 2026 Affordable Housing Trust Fund awards', 'press_release',
     'https://lawrenceks.gov/2025/12/city-announces-nine-recipients-of-2026-affordable-housing-trust-fund-awards/', '2025-12-10'),
    ('The Lawrence Times', 'City Commission pledges tax breaks for west Lawrence affordable housing project', 'news',
     'https://lawrencekstimes.com/2026/02/03/citycomm-pledge-floret-hill/', '2026-02-03')
  returning id, url
)

insert into projects (market_id, title, description, address, latitude, longitude, units, acreage, developer, contractor, date_announced, date_updated, source_id, plan_category, project_type, stage)
select market.id, 'East Heights',
  'Redevelopment of the former East Heights Elementary School site (~4 acres) into mixed-income housing -- single-family homes, duplexes, and tiny homes plus multifamily units, a community center, and a day care. Targets multigenerational, and to the extent fair housing law allows, immigrant and households of color, with onsite early childhood education, health screenings, and behavioral health support. Unit mix per the 2026 AHTF application: 5 units at 30% AMI, 9 at 40% AMI, 16 at 60% AMI, and 10 market-rate (40 total). Requesting $900,000 from the Affordable Housing Trust Fund as of the 2026 application cycle -- award outcome not confirmed in sourced reporting.',
  '1430 Haskell Ave, Lawrence, KS', 38.957779935883, -95.223451118735, 40, 4, 'Tony Krsnich (Flint Hills Holding Group, LLC)', null,
  '2024-05-13'::date, '2026-09-06'::date, new_sources.id, 'development', 'mixed_use', 'proposed'
from market, new_sources where new_sources.url like '%usd497-to-sell-east-heights%'
union all
select market.id, '711 New Hampshire',
  'Redevelopment of a downtown public parking lot into 94 units of new-construction affordable senior housing (studio/1BR/2BR), six stories, with underground parking. Selected by the City of Lawrence in 2024 in response to an RFI seeking redevelopment proposals for underutilized downtown parking lots; architect is Slattery Design. The developer''s exclusivity agreement was set to expire June 2026; the City Commission considered selling the lot on June 4, 2026 but deferred the decision on June 9, 2026 rather than approving the sale.',
  '711 New Hampshire St, Lawrence, KS', 38.971017371086, -95.234785598576, 94, null, 'Cohen-Esrey Development Group', null,
  '2026-06-04'::date, '2026-09-06'::date, new_sources.id, 'development', 'multifamily', 'review_planning'
from market, new_sources where new_sources.url like '%citycomm-711-nh-pre%'
union all
select market.id, 'Tiny Homes on Garfield',
  'Two fully furnished 240 sq ft studio tiny homes on a vacant Housing Authority-owned lot, added to LDCHA''s Expanded Housing portfolio and rented on a sliding scale by income. Peaslee Tech is constructing and furnishing the homes at a cost of no more than $90,000 each, with completion targeted for 2026. Funded by a $180,000 award from the City''s 2026 Affordable Housing Trust Fund, approved by the City Commission on 2025-12-09.',
  '800 Garfield St, Lawrence, KS', 38.959116019076, -95.227709062093, 2, null, 'Lawrence-Douglas County Housing Authority (in partnership with Peaslee Tech)', 'Peaslee Tech',
  '2025-12-09'::date, '2026-09-06'::date, new_sources.id, 'development', 'residential', 'approved'
from market, new_sources where new_sources.url like '%nine-recipients-of-2026%';

-- --- Floret Hill: no discoverable street address, so this stays a shift
-- (nullable lat/lng), not a projects row -- see comment at top of file.

with market as (
  select id from markets where slug = 'lawrence-ks'
)
insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'plans'::shift_category, 'incentive_commitment',
  'Floret Hill: City Commission commits to ~$6.9M incentive package for 133-unit affordable community',
  'City Commission voted 3-1 for a resolution committing to future tax incentives for Floret Hill -- 121 garden-style apartments (37 units at 40% AMI, 84 at 60% AMI) across 11 buildings plus 12 permanently affordable for-sale townhomes, on 14.5 donated acres at the southeast corner of K-10 and Bob Billings Pkwy. Zoning already unanimously approved by the City of Lawrence and Douglas County. Incentives: a 10-year 100% property tax abatement on the value increase (~$1.265M), a sales tax exemption on construction materials (~$2.81M), and other requests/waivers (~$2.8M) -- roughly $6.9M total. Construction anticipated to begin soon; units expected available mid-2027. Developer: Wheatland Investments Group, in partnership with nonprofit Tenants to Homeowners.',
  '2026-02-03'::date, 'Incentive package committed by resolution -- construction not yet started', 'high'::shift_impact,
  array['developer', 'investor']::shift_audience[], 'Southeast corner of K-10 and Bob Billings Pkwy, Lawrence, KS', null, null,
  (select id from sources where url like '%citycomm-pledge-floret-hill%'),
  '{"apartment_units": 121, "townhome_units": 12, "acres": 14.5, "incentive_package_usd": 6900000}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'rehab_grant_awarded',
  'Poehler Lofts awarded $20,000 rehab grant for HVAC, sewer, and masonry repairs',
  'Poehler Lofts (619 E 8th St), a 49-unit LIHTC/market-rate multifamily building placed in service in 2012, was awarded $20,000 from the City''s 2026 Affordable Housing Trust Fund toward replacing HVAC units, replacing the sewer line, and exterior masonry repairs (of $83,875 requested). Developer/owner (Flint Hills Holding Group, LLC) committed to funding 75% of the total repair cost. The building has averaged over 95% occupancy since opening.',
  '2025-12-09'::date, 'Rehab grant awarded -- work not yet reported started', 'low'::shift_impact,
  array['contractor', 'investor']::shift_audience[], '619 E 8th St, Lawrence, KS', 38.969323780546, -95.228699178401,
  (select id from sources where url like '%nine-recipients-of-2026%'),
  '{"grant_amount": 20000, "amount_requested": 83875, "building_units": 49, "in_service_year": 2012}'::jsonb
from market;

-- --- Developer/contractor identifications for the 3 new projects and
-- Floret Hill's shift.

with market as (
  select id from markets where slug = 'lawrence-ks'
)
insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select market.id, 'Tony Krsnich', 'Flint Hills Holding Group, LLC', 'developer', 'project',
  (select id from projects where market_id = market.id and title = 'East Heights'),
  'East Heights — 1430 Haskell Ave, Lawrence, KS',
  (select id from sources where url like '%more-affordable-housing-to-come%'), null, 'confirmed',
  'Same developer/entity already on file for 9 Del Lofts II and Poehler Lofts.'
from market
union all
select market.id, null, 'Cohen-Esrey Development Group', 'developer', 'project',
  (select id from projects where market_id = market.id and title = '711 New Hampshire'),
  '711 New Hampshire — 711 New Hampshire St, Lawrence, KS',
  (select id from sources where url like '%citycomm-711-nh-pre%'), '2026-06-04'::date, 'confirmed', null
from market
union all
select market.id, null, 'Lawrence-Douglas County Housing Authority', 'developer', 'project',
  (select id from projects where market_id = market.id and title = 'Tiny Homes on Garfield'),
  'Tiny Homes on Garfield — 800 Garfield St, Lawrence, KS',
  (select id from sources where url like '%nine-recipients-of-2026%'), '2025-12-09'::date, 'confirmed', null
from market
union all
select market.id, null, 'Peaslee Tech', 'contractor', 'project',
  (select id from projects where market_id = market.id and title = 'Tiny Homes on Garfield'),
  'Tiny Homes on Garfield — 800 Garfield St, Lawrence, KS',
  (select id from sources where url like '%nine-recipients-of-2026%'), '2025-12-09'::date, 'confirmed',
  'Named directly as the entity constructing and furnishing both homes, at a cost of no more than $90,000 each.'
from market
union all
select market.id, null, 'Wheatland Investments Group (in partnership with Tenants to Homeowners)', 'developer', 'shift',
  (select id from shifts where market_id = market.id and event like 'Floret Hill:%'),
  'Floret Hill — Southeast corner of K-10 and Bob Billings Pkwy, Lawrence, KS',
  (select id from sources where url like '%citycomm-pledge-floret-hill%'), '2026-02-03'::date, 'confirmed', null
from market;

-- --- Minor consistency polish: match the ", LLC" suffix already used on
-- the two new Flint Hills rows above.

update projects set developer = 'Tony Krsnich (Flint Hills Holding Group, LLC)'
where market_id = (select id from markets where slug = 'lawrence-ks') and title = '9 Del Lofts II';

update project_people set company_name = 'Flint Hills Holding Group, LLC'
where market_id = (select id from markets where slug = 'lawrence-ks')
  and company_name = 'Flint Hills Holding Group'
  and person_name = 'Tony Krsnich';
