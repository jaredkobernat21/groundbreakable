-- Fourth Lawrence research pass (Jared, 2026-09-06): "there have got to
-- be more Lawrence permits." Re-fetched PermitGrab directly (not just
-- its free-preview homepage sample) and paged through -- it actually
-- holds 1,062 indexed permits across 22 pages, not the 2 rows seeded
-- earlier. Pulled a curated batch spanning permit types not previously
-- represented (Mechanical, Electrical, Solar, Addition, and -- the
-- clearest "active build" signal in the whole dataset -- a genuine "New
-- Single Family Dwelling" permit) and 7 real contractors not previously
-- on file: M & A Drilling LLC, Westerhouse Inc, Freeman Concrete
-- Construction LLC, Randall Electric Inc, Good Energy Solutions (already
-- known, new address), BW Refrigeration LLC, Construction Specialties,
-- Mar Lan Construction LLC, Drippe Homes Inc, and Rylie Equipment &
-- Contracting.
--
-- Reused the existing PermitGrab source row (already cited in the first
-- Lawrence shifts migration) rather than re-inserting a duplicate --
-- see feedback_check_existing_data_before_research.
--
-- One permit search led to a much bigger, previously-untracked find:
-- Rylie Equipment's 2026-07-15 excavation permit was at 6200 Mercato Dr
-- -- the site of The Mercato of West Lawrence, a real 90-acre mixed-use
-- development (Costco anchor, 166,000 sq ft, opening fall 2026; plus
-- Braum's and Truity Credit Union) that wasn't tracked at all. Neither
-- 6200 Mercato Dr nor 5100 Cedar Grove Way (the Drippe Homes new-
-- dwelling permit's address, in a real but very new subdivision) resolve
-- in the Census geocoder -- both streets are too new for its TIGER
-- address ranges. Rather than fabricate coordinates, both are added as
-- shifts (nullable lat/lng) instead of projects (NOT NULL lat/lng) --
-- the same honest handling already used twice this session for Floret
-- Hill and the 177-acre annexation opportunity.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('The Lawrence Times', 'Lawrence Costco to open this fall as part of Mercato development', 'news',
     'https://lawrencekstimes.com/2026/02/24/costco-opening-fall-26/', '2026-02-24'),
    ('Ingram''s', 'New Costco will anchor 90-acre mixed-use development in West Lawrence', 'news',
     'https://ingrams.com/article/new-costco-will-anchor-90-acre-mixed-use-development-in-west-lawrence/', '2026-02-25'),
    ('Homes.com', 'Cedar Grove in Lawrence, KS by Drippe Homes Inc', 'other',
     'https://www.homes.com/new-homes/community/cedar-grove/qy24z6jmfzfyy/', null)
  returning id, url
),
market as (
  select id from markets where slug = 'lawrence-ks'
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'building'::shift_category, 'permit_filed',
  'Excavation permit filed: 400 W 23rd St', 'Class 3 excavation permit, contractor M & A Drilling, LLC.',
  '2026-08-25'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '400 W 23rd St, Lawrence, KS',
  38.942888377083, -95.240721070127, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "General Construction - Class 3 Excavation", "contractor": "M & A Drilling, LLC"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Excavation permit filed: 1116 W 23rd St', 'Class 3 excavation permit, contractor M & A Drilling, LLC.',
  '2026-08-25'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '1116 W 23rd St, Lawrence, KS',
  38.942835314004, -95.248478390517, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "General Construction - Class 3 Excavation", "contractor": "M & A Drilling, LLC"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Mechanical permit filed: 3008 Yellowstone Dr', 'Mechanical/HVAC permit, contractor Westerhouse Inc.',
  '2026-08-17'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '3008 Yellowstone Dr, Lawrence, KS',
  38.938586066068, -95.272367444809, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "HVAC/Mechanical", "contractor": "Westerhouse Inc"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Excavation permit filed: 802 W 28th Ter', 'Class 3 excavation permit, contractor Freeman Concrete Construction, LLC -- one of six same-day Temporary Traffic Control/excavation permits the same contractor filed on 2026-08-12 across nearby W 27th/28th/29th St addresses.',
  '2026-08-12'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '802 W 28th Ter, Lawrence, KS',
  38.932862051724, -95.244415198661, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "General Construction - Class 3 Excavation", "contractor": "Freeman Concrete Construction, LLC"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Electrical permit filed: 4833 W 26th St', 'Electrical permit, contractor Randall Electric Inc.',
  '2026-07-21'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '4833 W 26th St, Lawrence, KS',
  38.937330673637, -95.305931966467, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "Electrical", "contractor": "Randall Electric Inc"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Electrical permit filed: 1 Riverfront Plz', 'Electrical permit at Riverfront Plaza, contractor Randall Electric Inc -- the largest-scale (commercial) permit found in this batch.',
  '2026-06-25'::date, 'Filed', 'medium'::shift_impact, array['contractor', 'investor']::shift_audience[], '1 Riverfront Plz, Lawrence, KS',
  38.973140469748, -95.235127081135, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "Electrical", "contractor": "Randall Electric Inc"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Solar permit filed: 5700 W 6th St', 'Photovoltaic solar installation permit, contractor Good Energy Solutions.',
  '2026-06-23'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '5700 W 6th St, Lawrence, KS',
  38.97158037655, -95.314409685359, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "Solar (Photovoltaic)", "contractor": "Good Energy Solutions"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Mechanical permit filed: 1309 W 6th St', 'Mechanical/HVAC permit, contractor BW Refrigeration LLC.',
  '2026-06-17'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '1309 W 6th St, Lawrence, KS',
  38.973112781153, -95.250080543594, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "HVAC/Mechanical", "contractor": "BW Refrigeration LLC"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Addition permit filed: 800 Justin St', 'Building addition permit, contractor Construction Specialties.',
  '2026-07-08'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '800 Justin St, Lawrence, KS',
  38.968570829302, -95.300410192708, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "Addition", "contractor": "Construction Specialties"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Building permit filed: 1420 Crescent Rd', 'Class 2 (no excavation) general construction permit, contractor Mar Lan Construction LLC.',
  '2026-07-13'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '1420 Crescent Rd, Lawrence, KS',
  38.958927230445, -95.251361737851, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "General Construction - Class 2 (No Excavation)", "contractor": "Mar Lan Construction LLC"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'New single-family dwelling permit filed: 5100 Cedar Grove Way',
  'New single-family dwelling permit in Cedar Grove, a real Drippe Homes, Inc subdivision in west Lawrence (66049) -- the clearest active-construction signal found in this permit batch, as opposed to sitework/trade permits. Cedar Grove Way is too new to resolve in the Census geocoder -- no fabricated coordinate.',
  '2026-06-03'::date, 'Filed', 'medium'::shift_impact, array['contractor', 'developer']::shift_audience[], '5100 Cedar Grove Way, Lawrence, KS',
  null, null, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Single Family Dwelling", "contractor": "Drippe Homes, Inc"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'commercial_construction',
  'The Mercato of West Lawrence: Costco-anchored 90-acre development under construction',
  '90-acre mixed-use development at the NEC of 6th St and K-10 (Highway 10), west of LMH Health West Campus and Rock Chalk Park. Anchored by a 166,000 sq ft Costco Wholesale (site plan submitted Oct. 2025, opening fall 2026 -- "Costco''s most western store in Kansas along the I-70 corridor" per a company rep), plus Braum''s and Truity Credit Union alongside the existing Stone Hill Hotel. Developed by K-10/40 Development, L.C.; Lane4 Property Group facilitated the land sale. Construction was underway as of this Feb. 2026 reporting. A Rylie Equipment & Contracting excavation permit at this same address (6200 Mercato Dr) on 2026-07-15 is the earliest dated sitework activity found for this project. No street address resolves in the Census geocoder yet -- no fabricated coordinate.',
  '2026-02-25'::date, 'Under construction -- Costco opening fall 2026', 'high'::shift_impact,
  array['developer', 'investor', 'contractor', 'broker']::shift_audience[], 'NEC of 6th St and K-10, Lawrence, KS',
  null, null, (select id from new_sources where new_sources.url like '%90-acre-mixed-use%'),
  '{"acres": 90, "anchor_tenant": "Costco Wholesale", "anchor_sqft": 166000, "other_tenants": ["Braum''s", "Truity Credit Union"], "developer": "K-10/40 Development, L.C.", "facilitator": "Lane4 Property Group"}'::jsonb
from market;

-- --- Contractor/developer identifications for the new finds -----------

with market as (
  select id from markets where slug = 'lawrence-ks'
)
insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select market.id, null, 'K-10/40 Development, L.C.', 'developer', 'shift',
  (select id from shifts where market_id = market.id and event like 'The Mercato of West Lawrence:%'),
  'The Mercato of West Lawrence — NEC of 6th St and K-10, Lawrence, KS',
  (select id from sources where url like '%90-acre-mixed-use%'), '2026-02-25'::date, 'confirmed', null
from market
union all
select market.id, null, 'Rylie Equipment & Contracting', 'contractor', 'shift',
  (select id from shifts where market_id = market.id and event like 'The Mercato of West Lawrence:%'),
  'The Mercato of West Lawrence — NEC of 6th St and K-10, Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2026-07-15'::date, 'confirmed',
  'Filed a Class 3 excavation permit at 6200 Mercato Dr on 2026-07-15 -- the same address as this development.'
from market
union all
select market.id, null, 'Drippe Homes, Inc', 'contractor', 'shift',
  (select id from shifts where market_id = market.id and event like 'New single-family dwelling permit filed%'),
  'Cedar Grove (5100 Cedar Grove Way) — Lawrence, KS',
  (select id from sources where url like '%homes.com/new-homes/community/cedar-grove%'), '2026-06-03'::date, 'confirmed',
  'Cedar Grove is a real Drippe Homes subdivision in west Lawrence (confirmed via Homes.com community listing), not just a single-lot builder credit on this one permit.'
from market;
