-- Sixth Lawrence research pass (Jared, 2026-09-06, continuing "keep
-- going" on permits): paged into PermitGrab pages 5-6 of 22. Three new
-- real-construction permits worth tracking, plus one notable identity
-- connection: CT Design & Development -- already on file as 9 Del Lofts
-- II's architect (per the 9del2.pdf presentation deck read earlier this
-- session) -- also shows up here as a residential contractor building a
-- new single-family dwelling at 512 Lake St. Same firm, a different role
-- on a different job; recorded as a contractor here since that's this
-- permit's actual role, not a correction to the architect credit.
--
-- Also found more Missouri St activity (a 623 Missouri St demolition by
-- Stewart Contracting, an excavation permit at 601 Missouri St) --
-- folded into the existing Arkansas/Missouri St duplex cluster shift's
-- description as corroborating detail rather than a new row, since it's
-- the same corridor/story already on file.

with market as (
  select id from markets where slug = 'lawrence-ks'
)
insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'building'::shift_category, 'permit_filed',
  'New single-family dwelling permit filed: 1218 Mississippi St', 'New single-family dwelling permit, contractor Centric Projects LLC.',
  '2026-08-24'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '1218 Mississippi St, Lawrence, KS',
  38.961719917529, -95.244005178857, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Single Family Dwelling", "contractor": "Centric Projects LLC"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'New single-family dwelling permit filed: 512 Lake St', 'New single-family dwelling permit, contractor CT Design & Development -- the same firm already on file as 9 Del Lofts II''s architect, here in a builder role on a separate job.',
  '2026-08-18'::date, 'Filed', 'low'::shift_impact, array['contractor']::shift_audience[], '512 Lake St, Lawrence, KS',
  38.984180971445, -95.228202998474, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "New Single Family Dwelling", "contractor": "CT Design & Development"}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'permit_filed',
  'Addition permit filed: 325 Maine St', 'Building addition permit, contractor McCownGordon Construction LLC -- a larger regional general contractor, notable relative to the mostly small-shop contractors seen elsewhere in this permit set.',
  '2026-08-25'::date, 'Filed', 'medium'::shift_impact, array['contractor']::shift_audience[], '325 Maine St, Lawrence, KS',
  38.979415033937, -95.247675465623, (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'),
  '{"permit_type": "Addition", "contractor": "McCownGordon Construction LLC"}'::jsonb
from market;

update shifts set
  description = description || ' Further corroborating activity on the same corridor: a demolition permit at 623 Missouri St (Stewart Contracting LLC, 2026-08-18) and an excavation/traffic-control permit at 601 Missouri St (Sunflower Paving, 2026-08-20).'
where market_id = (select id from markets where slug = 'lawrence-ks')
  and event = 'New two-family dwelling permits filed: Arkansas/Missouri St duplex cluster';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select id, null, 'Centric Projects LLC', 'contractor', 'shift',
  (select id from shifts where market_id = markets.id and event = 'New single-family dwelling permit filed: 1218 Mississippi St'),
  '1218 Mississippi St — Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2026-08-24'::date, 'confirmed', null
from markets where slug = 'lawrence-ks'
union all
select id, null, 'CT Design & Development', 'contractor', 'shift',
  (select id from shifts where market_id = markets.id and event = 'New single-family dwelling permit filed: 512 Lake St'),
  '512 Lake St — Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2026-08-18'::date, 'confirmed',
  'Same firm already on file as 9 Del Lofts II''s architect (CT DESIGN + DEVELOPMENT, per that project''s presentation deck) -- a builder role here, on an unrelated job.'
from markets where slug = 'lawrence-ks'
union all
select id, null, 'McCownGordon Construction LLC', 'contractor', 'shift',
  (select id from shifts where market_id = markets.id and event = 'Addition permit filed: 325 Maine St'),
  '325 Maine St — Lawrence, KS',
  (select id from sources where url = 'https://permitgrab.com/permits/lawrence-ks'), '2026-08-25'::date, 'confirmed', null
from markets where slug = 'lawrence-ks';
