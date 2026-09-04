-- Real, sourced Topeka shifts (pilot batch, Construction + Development
-- categories) -- ROQ Shift's first live market content. Same "never
-- fabricate missing information" discipline as
-- 20260814020000_seed_real_topeka_zoning.sql: every row traces to a real
-- public record, every field left blank where the source didn't have it
-- rather than guessed (e.g. no parcel_id -- these sources don't expose
-- one, and no address/lat/lng for Z26/08, whose case file doesn't publish
-- a site address).
--
-- Construction (8 rows): City of Topeka Cityworks building-permit GIS
-- layer (maps.topeka.gov/.../CityworksViews/BuildingPermits/MapServer),
-- most recent commercial + new-residential permits as of 2026-09-04.
-- Development (2 rows): Topeka Planning Commission's Aug 17, 2026 agenda
-- via topekaspeaks.org, the two site-specific rezoning cases on it
-- (Z26/08, Z26/09) -- the other three items that meeting (an annexation,
-- a comprehensive plan amendment, and a citywide zoning-code text
-- amendment) aren't tied to a single parcel/address, so they're left out
-- of this pilot batch rather than force-fit.

insert into sources (agency, title, source_type, url, published_date) values
  ('City of Topeka', 'Cityworks Building Permits (GIS)', 'agency_gis',
   'https://maps.topeka.gov/arcgis/rest/services/CityworksViews/BuildingPermits/MapServer', '2026-09-04'),
  ('City of Topeka Planning Commission', 'Planning Commission Agenda — August 17, 2026', 'agency_document',
   'https://topekaspeaks.org/bodies/planning-commission', '2026-08-17');

-- Construction

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: Bartlett & West interior remodel', 'Commercial interior alteration.', '2026-09-02', 'Issued', 'low',
  array['contractor']::shift_audience[], '1200 SW EXECUTIVE DR', 39.044885179549588, -95.768967484612247, s.id,
  '{"case_number": "202607214690", "case_type_desc": "DSP Com Building Interior Alteration"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: Walmart fuel station and canopy', 'New commercial footing and foundation for a fuel station with canopy and signage.', '2026-08-31', 'Issued', 'medium',
  array['contractor', 'developer']::shift_audience[], '2620 SE CALIFORNIA AVE', 39.019967595775888, -95.650871090563982, s.id,
  '{"case_number": "202608315563", "case_type_desc": "Commercial Footing and Foundation"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: Catholic Charities grocery pantry renovation', 'Commercial interior alteration for the Let''s Help grocery pantry.', '2026-08-28', 'Issued', 'low',
  array['contractor']::shift_audience[], '245 SW MACVICAR AVE', 39.061014492267276, -95.707300561070639, s.id,
  '{"case_number": "202607214676", "case_type_desc": "DSP Com Building Interior Alteration"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: Washburn University Petro Center HVAC/mechanical yard', 'Commercial footing and foundation work for exterior mechanical yard and interior HVAC.', '2026-08-20', 'Issued', 'low',
  array['contractor']::shift_audience[], '1901 SW MULVANE ST', 39.033346906392836, -95.701574790651975, s.id,
  '{"case_number": "202608205360", "case_type_desc": "Commercial Footing and Foundation"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: new metal building addition, 1800 Brickyard LLC storage', 'New commercial building addition next to an existing structure.', '2026-08-18', 'Issued', 'medium',
  array['contractor', 'developer', 'investor']::shift_audience[], '3805 NW 25TH ST', 39.092897264457427, -95.721694482618702, s.id,
  '{"case_number": "202605042687", "case_type_desc": "DSP Com Building New"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: new single-family residence', 'New residential building permit.', '2026-09-03', 'Issued', 'medium',
  array['contractor', 'developer']::shift_audience[], '204 NE GRATTAN ST', 39.056085520960849, -95.648974151442999, s.id,
  '{"case_number": "202607234735", "case_type_desc": "DSP Res Building New"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: new duplex, 2940/2942 SW Villa West Dr', 'New residential building permit.', '2026-09-03', 'Issued', 'medium',
  array['contractor', 'developer', 'investor']::shift_audience[], '2940/2942 SW VILLA WEST DR', 39.013173224415596, -95.767231095408675, s.id,
  '{"case_number": "202606223967", "case_type_desc": "DSP Res Building New"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'construction', 'permit_issued',
  'Permit issued: new residential home, 537 SW Watson Ave', 'New residential building permit, Lots 173 & 175.', '2026-09-04', 'Issued', 'medium',
  array['contractor', 'developer']::shift_audience[], '537 SW WATSON AVE', 39.059271581610801, -95.717252054866961, s.id,
  '{"case_number": "202605012670", "case_type_desc": "DSP Res Building New"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url like '%CityworksViews%';

-- Development

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'development', 'rezoning',
  'Rezoning application: SENT Holdings, LLC', 'Filed by Jay Rice for SENT Holdings, LLC. SENT Topeka has a separate, publicly reported ~200-unit affordable-housing project underway in southeast Topeka -- this case''s site address wasn''t published in the agenda packet, so it isn''t confirmed to be the same site.', '2026-08-17', 'Pending Planning Commission review (case Z26/08)', 'high',
  array['developer', 'investor', 'broker']::shift_audience[], null, null, null, s.id,
  '{"case_number": "Z26/08", "applicant": "Jay Rice for SENT Holdings, LLC"}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url = 'https://topekaspeaks.org/bodies/planning-commission';

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select m.id, 'development', 'rezoning',
  'Rezoning application: Watson Real Estate Development', 'Requests amending the District Zoning Map on a 0.3-acre property from "C-2" Commercial District to "M-1" Two-Family Dwelling District; applicant intends to build a single-family home.', '2026-08-17', 'Pending Planning Commission review (case Z26/09)', 'low',
  array['developer', 'agent', 'broker']::shift_audience[], '2016 SW 10TH AVE', 39.051437385924, -95.702727179877, s.id,
  '{"case_number": "Z26/09", "applicant": "Watson Real Estate Development, Inc.", "rezoning": "C-2 to M-1", "acreage": 0.3}'::jsonb
from markets m, sources s where m.slug = 'topeka-ks' and s.url = 'https://topekaspeaks.org/bodies/planning-commission';
