-- Real, sourced Topeka shifts batch 2 -- Distress, Compliance,
-- Infrastructure categories (Ownership deliberately not included, see
-- below). Same "never fabricate missing information" discipline as
-- batch 1 (20260904010000_seed_real_topeka_shifts.sql).
--
-- Distress (5 rows): Shawnee County Sheriff's Office foreclosure sale
-- listing (via the county's CivilView sales portal), current as of
-- 2026-09-04. event_date is the date the listing was observed active
-- (2026-09-04, the one date the source itself states as current) --
-- the actual scheduled auction date is real but in the future, so it's
-- captured in stage/raw_data instead of forced into event_date.
--
-- Compliance (3 rows): City of Topeka's public 311/Cityworks service-
-- request layer (SCF_E311_Requests), filtered to reqcategory='CODE'.
-- These are citizen complaints, not confirmed violations -- shift_type
-- and event wording says "complaint filed", not "violation", to avoid
-- overstating their legal status.
--
-- Infrastructure (2 rows): City of Topeka's Street & Related Projects
-- page. event_date is the most recent real, specific date each project
-- actually publishes (a public meeting date, or a stated construction-
-- start date) -- not an invented one.
--
-- Ownership: researched (Shawnee County Register of Deeds, County
-- Appraiser's parcel layer, Shawnee County GIS parcels FeatureServer,
-- local business-press coverage) and came up empty for anything both
-- real and current. Deed/sale records live behind the Register of
-- Deeds' paywalled Tapestry/Laredo search tools; the county's public
-- GIS parcel layer carries no owner/sale-date/sale-price fields; the
-- only concrete LLC-acquisition news coverage found (Topeka 77 LLC /
-- Heartland Motorsports Park, Klaton LLC / SW 6th Ave) is from 2024,
-- too old to represent as a current shift. Zero rows added rather than
-- forcing stale or paywalled-inaccessible data in -- a follow-up task
-- with Register of Deeds portal access (or a paid data source) is the
-- real way to close this category.

insert into sources (agency, title, source_type, url, published_date) values
  ('Shawnee County Sheriff''s Office', 'Foreclosure Sale Listing (CivilView)', 'public_record',
   'https://salesweb.civilview.com/Sales/SalesSearch?countyId=56', '2026-09-04'),
  ('City of Topeka', '311 Service Requests (Cityworks GIS)', 'agency_gis',
   'https://maps.topeka.gov/arcgis/rest/services/CityworksViews/SCF_E311_Requests/MapServer', '2026-09-04'),
  ('City of Topeka', 'Street & Related Projects', 'agency_document',
   'https://topeka.gov/community/projects_plans/street_projects/index.php', '2026-09-04');

-- Distress

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'distress', 'foreclosure_auction',
  'Foreclosure sale scheduled: 2131 SW Van Buren St', 'Sheriff sale listing, plaintiff Towd Point Mortgage Trust 2022-SJ1.', '2026-09-04', 'Sale scheduled for 2026-09-08', 'medium',
  array['investor', 'contractor', 'agent']::shift_audience[], '2131 SW VAN BUREN ST', 39.029376630668, -95.681001424671, s.id,
  '{"case_number": "26018615", "plaintiff": "Towd Point Mortgage Trust 2022-SJ1", "sale_date": "2026-09-08"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%civilview%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'distress', 'foreclosure_auction',
  'Foreclosure sale scheduled: 5455 SW 17th St', 'Sheriff sale listing, plaintiff Select Portfolio Servicing Inc.', '2026-09-04', 'Sale scheduled for 2026-09-08', 'medium',
  array['investor', 'contractor', 'agent']::shift_audience[], '5455 SW 17TH ST', 39.036418799676, -95.747792610055, s.id,
  '{"case_number": "26018617", "plaintiff": "Select Portfolio Servicing Inc", "sale_date": "2026-09-08"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%civilview%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'distress', 'foreclosure_auction',
  'Foreclosure sale scheduled: 1700 SW Shunga Dr', 'Sheriff sale listing, plaintiff PennyMac Loan Services LLC.', '2026-09-04', 'Sale scheduled for 2026-09-15', 'medium',
  array['investor', 'contractor', 'agent']::shift_audience[], '1700 SW SHUNGA DR', 39.024872292659, -95.701412761339, s.id,
  '{"case_number": "26018080", "plaintiff": "PennyMac Loan Services LLC", "sale_date": "2026-09-15"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%civilview%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'distress', 'foreclosure_auction',
  'Foreclosure sale scheduled: 3005 SW Huntoon St', 'Sheriff sale listing, plaintiff NewRez LLC.', '2026-09-04', 'Sale scheduled for 2026-09-29', 'medium',
  array['investor', 'contractor', 'agent']::shift_audience[], '3005 SW HUNTOON ST', 39.043977885862, -95.714384799504, s.id,
  '{"case_number": "26016673", "plaintiff": "NewRez LLC", "sale_date": "2026-09-29"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%civilview%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'distress', 'foreclosure_auction',
  'Foreclosure sale scheduled: 411 SW Roosevelt St', 'Sheriff sale listing, plaintiff Envista Federal Credit Union.', '2026-09-04', 'Sale scheduled for 2026-09-29', 'medium',
  array['investor', 'contractor', 'agent']::shift_audience[], '411 SW ROOSEVELT ST', 39.059705880316, -95.702903578899, s.id,
  '{"case_number": "26020252", "plaintiff": "Envista Federal Credit Union", "sale_date": "2026-09-29"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%civilview%';

-- Compliance

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'compliance', 'code_complaint',
  'Code compliance complaint filed: property in disrepair', 'Citizen complaint: exterior walls have holes, plywood nailed over openings.', '2026-09-03', 'Open — pending city response', 'medium',
  array['investor', 'contractor']::shift_audience[], '3612 SW KIOWA ST', 39.001, -95.727, s.id,
  '{"request_id": "217961", "problem_code": "Complaints-Nuisance"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%SCF_E311_Requests%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'compliance', 'code_complaint',
  'Code compliance complaint filed: abandoned vehicle', 'Citizen complaint: inoperable vehicle sitting in yard.', '2026-09-04', 'In progress — city response underway', 'low',
  array['contractor']::shift_audience[], '1735 NW LYMAN RD', 39.085, -95.688, s.id,
  '{"request_id": "217985", "problem_code": "Abandoned Veh PMU"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%SCF_E311_Requests%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'compliance', 'code_complaint',
  'Code compliance complaint filed: property neglect', 'Citizen complaint: unmowed lawn, broken furniture on front deck, overgrown shrubs.', '2026-09-04', 'Open — pending city response', 'low',
  array['investor', 'contractor']::shift_audience[], '2520 SW 30TH ST', 39.013, -95.709, s.id,
  '{"request_id": "217996", "problem_code": "Complaints-Nuisance"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%SCF_E311_Requests%';

-- Infrastructure

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'infrastructure', 'road_project',
  'Public meeting held: SW Topeka Blvd (29th–37th St) rehabilitation', 'Pavement rehabilitation, intersection reconstruction, signal replacement, and utility work. Project #701038.00, contractor Bettis Asphalt & Construction, budget $6,196,939.', '2026-08-24', 'Construction begins fall 2026', 'high',
  array['contractor', 'developer', 'investor']::shift_audience[], 'SW Topeka Blvd (29th to 37th St)', 39.007280096695, -95.687645779174, s.id,
  '{"project_id": "701038.00", "budget": 6196939, "contractor": "Bettis Asphalt & Construction"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%street_projects%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'infrastructure', 'road_project',
  'Construction began: SE 29th St bridge and utility work', 'Bridge modifications, pavement, and utility work between Kansas Ave and Adams St. Project #701039.00.', '2026-06-22', 'Under construction', 'medium',
  array['contractor', 'developer']::shift_audience[], 'SE 29th St (Kansas Ave to Adams St)', 39.015191094354, -95.670221783019, s.id,
  '{"project_id": "701039.00"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%street_projects%';
