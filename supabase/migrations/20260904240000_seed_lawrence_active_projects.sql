-- Real, sourced active/pipeline projects for Lawrence -- Jared correctly
-- pointed out that Beacon Landing alone doesn't reflect what's actually
-- building/planned in a city this size. 5 more real projects, spanning
-- genuinely under-construction to early-proposal stage, from the
-- Lawrence Journal-World and The Lawrence Times.
--
-- Two addresses needed a jurisdiction check before use: "E 1000 Road & N
-- 1700 Road" geocodes to a same-named rural intersection in Baldwin
-- City, KS (a separate town ~10 miles south of Lawrence, wrong side of
-- town for a "northwest Lawrence"/Perry-Lecompton-district project) --
-- caught and discarded before use, same discipline as the dcsheriff.net
-- Colorado/Kansas mixup earlier in this project. Used a confirmed-in-
-- Lawrence nearby intersection (Peterson Rd & Monterey Way, in the same
-- northwest Lawrence area per news coverage) for both Queens Road and
-- Hunters Hills instead, since both are described as being in that same
-- vicinity without a single precise geocodable address.

with market as (
  select id from markets where slug = 'lawrence-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('Lawrence Journal-World (Town Talk)', 'Lawrence developer has trio of projects underway, ranging from $600K row houses in downtown to new neighborhoods on city''s edge', 'news',
     'https://www2.ljworld.com/weblogs/town_talk/2026/mar/09/lawrence-developer-has-trio-of-projects-underway-ranging-from-600k-row-houses-in-downtown-to-new-neighborhoods-on-citys-edge/', '2026-03-09'),
    ('Lawrence Journal-World', 'Developers seek sales tax exemption on construction materials for 341-unit apartment complex near KU Innovation Park', 'news',
     'https://www2.ljworld.com/news/city-government/2026/sep/04/developers-seek-sales-tax-exemption-on-construction-materials-for-341-unit-apartment-complex-near-ku-innovation-park/', '2026-09-04'),
    ('Lawrence Journal-World', 'Commissioners pledge $80,000 to assist loft project in East Lawrence on condition it has more affordable units', 'news',
     'https://www2.ljworld.com/news/city-government/2025/dec/17/commissioners-pledge-80000-to-assist-loft-project-in-east-lawrence-on-condition-it-has-more-affordable-units/', '2025-12-17')
  returning id, url
)

insert into projects (market_id, title, plan_category, project_type, stage, description, address, latitude, longitude, developer, units, acreage, project_value, date_announced, source_id)
select market.id, 'Urban Row', 'development'::text, 'residential'::text, 'construction'::text,
  '15 three-story row houses (~1,800 sq ft, 3 bed/3.5 bath, one-vehicle garage) on the former Borders bookstore parking lot at 7th & Rhode Island, downtown Lawrence. Starting prices in the low $600,000s. Under construction, expected completion August 2026.',
  '7th St & Rhode Island St, Lawrence, KS', 38.971253076203, -95.233555403018, 'Adam Williams', 15, null::numeric, null::numeric, '2026-03-09'::date, new_sources.id
from market, new_sources where new_sources.url like '%trio-of-projects%'
union all
select market.id, 'Queens Road', 'land_use'::text, 'residential'::text, 'review_planning'::text,
  '60-acre annexation request at the northeast corner of East 1000 Road and North 1700 Road (Peterson Road) in northwest Lawrence -- concept plan calls for 161 single-family home sites plus 14 duplex lots. Annexation recommended by the Planning Commission; awaiting City Commission approval. Groundbreaking targeted within four to six months of approval.',
  'E 1000 Rd & N 1700 Rd (Peterson Rd), Lawrence, KS', 38.986076076903, -95.288351887039, 'Adam Williams', 175, 60::numeric, null::numeric, '2026-03-09'::date, new_sources.id
from market, new_sources where new_sources.url like '%trio-of-projects%'
union all
select market.id, 'Hunters Hills', 'land_use'::text, 'residential'::text, 'proposed'::text,
  'Traditional single-family subdivision on 60 acres of vacant property south of the Kansas Turnpike, near Peterson Road/Monterey Way in the Perry-Lecompton school district (land also reserved for a potential future Perry-Lecompton school). Approximately 130 homes. Development plans recently refiled after a prior attempt; groundbreaking targeted within four to six months pending approvals.',
  'Near Peterson Rd & Monterey Way, Lawrence, KS', 38.986076076903, -95.288351887039, 'Adam Williams', 130, 60::numeric, null::numeric, '2026-03-09'::date, new_sources.id
from market, new_sources where new_sources.url like '%trio-of-projects%'
union all
select market.id, 'The Crossing', 'development'::text, 'multifamily'::text, 'proposed'::text,
  '341-unit market-rate apartment complex on unused land adjacent to the KU Innovation Park business incubator (The Crossing @ KU section of West Campus, near 23rd & Iowa), aimed at housing supporting KU''s research-expansion workforce. Total estimated project cost $104 million. Developer sought a $50 million industrial revenue bond issuance (construction-materials sales tax exemption); City Commission vote was scheduled for the week of this article. Construction had not yet begun as of this research pass.',
  'Near 23rd St & Iowa St (KU Innovation Park), Lawrence, KS', 38.943890159211, -95.260422755109, '23 Iowa Investors (affiliate of Block Real Estate Services)', 341, null::numeric, 104000000::numeric, '2026-09-04'::date, new_sources.id
from market, new_sources where new_sources.url like '%341-unit%'
union all
select market.id, '9 Del Lofts II', 'development'::text, 'multifamily'::text, 'approved'::text,
  'Second phase of a Low-Income Housing Tax Credit affordable-housing project at 716 E. 9th Street in the Warehouse Arts District, East Lawrence -- 36 units. Developer Krsnich Investment Group secured $850,000 in federal LIHTC allocation and requested $860,488 in HOME funding. City commissioners voted unanimously to pledge $80,000 toward a fee waiver, conditioned on restoring 3 affordable units that had been cut during planning.',
  '716 E 9th St, Lawrence, KS', 38.967575372178, -95.227675982439, 'Krsnich Investment Group', 36, null::numeric, null::numeric, '2025-12-17'::date, new_sources.id
from market, new_sources where new_sources.url like '%commissioners-pledge%';
