-- Real, sourced Momentum Areas for Lawrence -- reuses the `growth_areas`
-- table from the old Plans/Opportunities/Potential model (Phase 1,
-- 2026-08-17; first populated for Topeka in the 20260818020000
-- migration). That table has no foreign-key dependency on the old
-- projects/potential_sites schema (market_id -> markets is its only FK),
-- so it works unmodified as the polygon layer behind the new ROQ Shift
-- dashboard's Momentum tab -- no new table needed, and the momentum
-- vocabulary (emerging/accelerating/established) already matches what
-- Jared asked for.
--
-- Boundaries are hand-approximated rectangles around each area's
-- supporting evidence (shifts + projects already on file for Lawrence,
-- reviewed 2026-09-05), same convention as the Topeka seed -- not
-- surveyed footprints. Each area's contained shifts/projects are
-- computed client-side from lat/lng (pointInPolygon in lib/geo.ts), not
-- a join table, so there's nothing else to backfill here.

insert into growth_areas (market_id, name, momentum_state, narrative, geom)
select
  m.id,
  'Downtown / Near-Downtown Core',
  'accelerating',
  'Lawrence''s downtown core has three independent signals converging at once: Urban Row (15 units, 7th & Rhode Island) is under construction right now, 9 Del Lofts II (36 units, 716 E 9th St) was just approved, and Massachusetts Street just landed a $50,000 Blue Cross and Blue Shield of Kansas grant for new bus stops along the 14th-to-23rd-St stretch. Two tax foreclosure sales nearby (225 N 5th St, 2139 Pennsylvania St) round out the picture -- a mature, still-building core with some distressed inventory turning over alongside it.',
  ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.238,38.938],[-95.220,38.938],[-95.220,38.982],[-95.238,38.982],[-95.238,38.938]]]}'), 4326))
from markets m
where m.slug = 'lawrence-ks';

insert into growth_areas (market_id, name, momentum_state, narrative, geom)
select
  m.id,
  '23rd & Iowa / KU Innovation Park Corridor',
  'accelerating',
  'A $104M, 341-unit apartment complex (The Crossing, near 23rd St & Iowa St by KU Innovation Park) is proposed just as the city finishes a mill-and-overlay on Iowa St between 6th St and Harvard Rd -- public infrastructure and a nine-figure private proposal landing in the same corridor at the same time. An excavation permit at 1626 W 23rd St (contractor A&A Drilling) and a plumbing permit a few blocks south at 2617 Belle Crest Dr add real, filed permit activity on top of the proposal. Developer on The Crossing is 23 Iowa Investors, an affiliate of Block Real Estate Services.',
  ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.266,38.930],[-95.242,38.930],[-95.242,38.958],[-95.266,38.958],[-95.266,38.930]]]}'), 4326))
from markets m
where m.slug = 'lawrence-ks';

insert into growth_areas (market_id, name, momentum_state, narrative, geom)
select
  m.id,
  'West Lawrence / K-10 Corridor (Beacon Landing)',
  'emerging',
  'The 288-acre Beacon Landing annexation and rezoning (west of K-10, south of 6th St/US-40; 111 residential acres, 126.7 commercial, 51 open space) was approved after a Planning Commission recommendation, with Landplan Engineering as applicant. Two more subdivisions are already lined up nearby at Peterson Rd & Monterey Way -- Queens Road (175 units, in review) and Hunters Hills (130 units, proposed), both developer Adam Williams -- putting 305 more units behind Beacon Landing''s entitlement before a shovel has broken ground. A separate 177-acre annexation at the same K-10/6th St/Bob Billings Pkwy corner was recently recommended for denial, underscoring how contested this growth frontier already is. Pure entitlement-stage land positioning -- no permits or construction yet.',
  ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.300,38.960],[-95.260,38.960],[-95.260,38.998],[-95.300,38.998],[-95.300,38.960]]]}'), 4326))
from markets m
where m.slug = 'lawrence-ks';
