-- Fifth Lawrence research pass (Jared, 2026-09-06, continuing "keep
-- going" on permits): paged further into PermitGrab (pages 3-4 of 22).
-- Two standout finds beyond routine trade permits:
--   - 310 Florida St (2 buildings) -- a real new multi-family commercial
--     building permit, LMK Construction Inc, 2026-08-28.
--   - A 6-building "New Two Family Dwelling" (duplex) cluster on
--     Arkansas/Missouri St, Stewart Contracting LLC, filed 2026-09-02 --
--     the most recent permits found in the whole dataset. BuildZoom's
--     permit history for Stewart Contracting shows they previously built
--     "The Jayhawk Club" apartment complex at 1011 Missouri St
--     (2021-2024 permits) -- this 2026 cluster, a few doors down on the
--     same street, reads as a continuation/later phase of that same
--     builder's work in the area, not a coincidence of contractor name.
-- Also: 1420 Crescent Rd (permitted 2026-07-13 in the previous batch)
-- got a follow-up "New Structure commercial" permit from the same
-- contractor on 2026-08-31 -- a real stage progression at an address
-- already on file, not a new location.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('BuildZoom', 'Stewart Contracting LLC permit history', 'public_record',
     'https://www.buildzoom.com/contractor/stewart-contracting-llc', null)
  returning id, url
),
market as (
  select id from markets where slug = 'lawrence-ks'
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'building'::shift_category, 'permit_filed',
  'New multi-family commercial permit filed: 310 Florida St',
  'New multi-family commercial construction permit, two buildings (Bldg 1 and Bldg 2), contractor LMK Construction Inc.',
  '2026-08-28'::date, 'Filed', 'medium'::shift_impact, array['contractor', 'developer']::shift_audience[], '310 Florida St, Lawrence, KS',
  38.978567667406, -95.252209556545, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Multi-Family Commercial", "contractor": "LMK Construction Inc", "buildings": 2}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'New two-family dwelling permits filed: Arkansas/Missouri St duplex cluster',
  'Six "New Two Family Dwelling" (duplex) permits filed the same day across Arkansas St and Missouri St (613, 614, 618, 621, 622, and 626), contractor Stewart Contracting LLC -- the most recent permits found in this research pass. Per BuildZoom''s permit history for this contractor, Stewart Contracting previously built "The Jayhawk Club" apartment complex a few doors down at 1011 Missouri St (permits 2021-2024); this cluster reads as a continuation of that same builder''s work on the street rather than an unrelated project.',
  '2026-09-02'::date, 'Filed', 'medium'::shift_impact, array['contractor', 'developer']::shift_audience[], '621 Missouri St, Lawrence, KS',
  38.972729046351, -95.248846588155, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Two Family Dwelling", "contractor": "Stewart Contracting LLC", "buildings": 6, "addresses": ["613 Missouri St", "614 Arkansas St", "618 Arkansas St", "621 Missouri St", "622 Arkansas St", "626 Arkansas St"]}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'New single-family dwelling permits filed: 1521 Langston Way (multi-building)',
  'New Single Family Dwelling permits across seven numbered buildings (1, 3, 5, 7, 10, 11, 12) at one address, contractor Cerris Builders, Inc -- reads as a platted subdivision/townhome cluster under one builder. Langston Way is too new to resolve in the Census geocoder -- no fabricated coordinate.',
  '2025-12-05'::date, 'Filed', 'medium'::shift_impact, array['contractor', 'developer']::shift_audience[], '1521 Langston Way, Lawrence, KS',
  null, null, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Single Family Dwelling", "contractor": "Cerris Builders, Inc", "buildings": 7}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'New single-family dwelling permit filed: 2600 E 26th Ct', 'New single-family dwelling permit, contractor Drippe Homes, Inc -- a different location from the Cedar Grove subdivision (5100 Cedar Grove Way) seeded in the previous batch, same builder.',
  '2026-05-07'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '2600 E 26th Ct, Lawrence, KS',
  38.937007396328, -95.199216659367, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Single Family Dwelling", "contractor": "Drippe Homes, Inc"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'New single-family dwelling permit filed: 1305 Pennsylvania St', 'New single-family dwelling permit, contractor Crown Construction LLC.',
  '2026-04-20'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '1305 Pennsylvania St, Lawrence, KS',
  38.959867622617, -95.228989589468, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Single Family Dwelling", "contractor": "Crown Construction LLC"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'New commercial structure permit filed: 1420 Crescent Rd (follow-up)',
  'A "New Structure commercial" permit filed at the same address as the Class-2 (no excavation) permit seeded in the previous batch (2026-07-13, also Mar Lan Construction LLC) -- a real stage progression at an already-tracked address, not a new location.',
  '2026-08-31'::date, 'Filed', 'medium'::shift_impact, array['contractor', 'developer']::shift_audience[], '1420 Crescent Rd, Lawrence, KS',
  38.958927230445, -95.251361737851, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Structure Commercial", "contractor": "Mar Lan Construction LLC"}'::jsonb
from market;

-- --- Contractor identifications ------------------------------------

with market as (
  select id from markets where slug = 'lawrence-ks'
)
insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select market.id, null, 'LMK Construction Inc', 'contractor', 'shift',
  (select id from shifts where market_id = market.id and event like 'New multi-family commercial permit filed%'),
  '310 Florida St — Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2026-08-28'::date, 'confirmed', null
from market
union all
select market.id, null, 'Stewart Contracting LLC', 'contractor', 'shift',
  (select id from shifts where market_id = market.id and event like 'New two-family dwelling permits filed%'),
  'Arkansas/Missouri St duplex cluster — Lawrence, KS',
  (select id from sources where url like '%buildzoom.com/contractor/stewart-contracting%'), '2026-09-02'::date, 'confirmed',
  'BuildZoom shows this contractor previously built "The Jayhawk Club" apartment complex at 1011 Missouri St (2021-2024 permits) -- this 2026 cluster is a few doors down the same street.'
from market
union all
select market.id, null, 'Cerris Builders, Inc', 'contractor', 'shift',
  (select id from shifts where market_id = market.id and event like 'New single-family dwelling permits filed: 1521%'),
  '1521 Langston Way — Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2025-12-05'::date, 'confirmed', null
from market
union all
select market.id, null, 'Drippe Homes, Inc', 'contractor', 'shift',
  (select id from shifts where market_id = market.id and event like 'New single-family dwelling permit filed: 2600%'),
  '2600 E 26th Ct — Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2026-05-07'::date, 'confirmed', null
from market
union all
select market.id, null, 'Crown Construction LLC', 'contractor', 'shift',
  (select id from shifts where market_id = market.id and event like 'New single-family dwelling permit filed: 1305%'),
  '1305 Pennsylvania St — Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2026-04-20'::date, 'confirmed', null
from market;
