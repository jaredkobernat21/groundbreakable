-- Real, sourced favorable-zoning areas for Topeka -- not
-- synthetic/placeholder data. Queried directly from the City of Topeka
-- Planning Department's own zoning GIS service
-- (LandUsePlanning/ZoningDistrict, maps.topeka.gov/arcgis/rest/services)
-- via its public REST API, boundary-simplified for display (Douglas-Peucker,
-- topology-preserving) but otherwise the city's real, current parcel
-- geometry. Two contiguous Downtown D3 (commercial core) blocks and one
-- real Planned Unit Development case, all with "Checked"/verified status
-- in the source system, hence confidence = 'verified' rather than
-- 'reported'.

insert into sources (agency, title, source_type, url, published_date)
values (
  'City of Topeka Planning Department',
  'City of Topeka Zoning Districts (Official GIS Layer)',
  'agency_gis',
  'https://www.arcgis.com/apps/webappviewer/index.html?id=b7452fa2680e42f08e41a998831b19eb',
  null
);

insert into opportunity_zones (market_id, title, description, zoning_district, rezoning_notes, boundary, source_id, confidence)
select
  m.id,
  'Downtown D3 Commercial Core -- North Block',
  'A contiguous ~15-acre block of D3-zoned downtown Topeka parcels, the city''s downtown commercial classification -- supports higher-density commercial and mixed-use development by right.',
  'D3',
  'D3 is Topeka''s downtown commercial zoning district. No rezoning needed for most commercial/mixed-use projects -- already entitled for it.',
  '{"type": "Polygon", "coordinates": [[[-95.674621, 39.062936], [-95.675156, 39.061647], [-95.674885, 39.061603], [-95.674871, 39.061634], [-95.674058, 39.06142], [-95.673952, 39.061683], [-95.673624, 39.061599], [-95.673732, 39.061334], [-95.66991, 39.060311], [-95.669611, 39.060997], [-95.669565, 39.060986], [-95.669356, 39.061492], [-95.669794, 39.061605], [-95.670949, 39.061755], [-95.671086, 39.061714], [-95.671125, 39.061802], [-95.673233, 39.062421], [-95.674621, 39.062936]]]}'::jsonb,
  s.id,
  'verified'
from markets m, sources s
where m.slug = 'topeka-ks' and s.url = 'https://www.arcgis.com/apps/webappviewer/index.html?id=b7452fa2680e42f08e41a998831b19eb'
order by s.created_at desc limit 1;

insert into opportunity_zones (market_id, title, description, zoning_district, rezoning_notes, boundary, source_id, confidence)
select
  m.id,
  'Downtown D3 Commercial Core -- South Block',
  'An adjacent ~8.6-acre block of D3-zoned downtown Topeka parcels, directly bordering the North Block district above.',
  'D3',
  'D3 is Topeka''s downtown commercial zoning district. No rezoning needed for most commercial/mixed-use projects -- already entitled for it.',
  '{"type": "Polygon", "coordinates": [[[-95.675759, 39.063462], [-95.676155, 39.063388], [-95.676424, 39.06305], [-95.676735, 39.062761], [-95.677058, 39.061996], [-95.676722, 39.061912], [-95.677193, 39.060782], [-95.677136, 39.060737], [-95.676119, 39.06048], [-95.675044, 39.063097], [-95.675759, 39.063462]]]}'::jsonb,
  s.id,
  'verified'
from markets m, sources s
where m.slug = 'topeka-ks' and s.url = 'https://www.arcgis.com/apps/webappviewer/index.html?id=b7452fa2680e42f08e41a998831b19eb'
order by s.created_at desc limit 1;

insert into opportunity_zones (market_id, title, description, zoning_district, rezoning_notes, boundary, source_id, confidence)
select
  m.id,
  'Mixed-Use PUD -- Case Z01/1',
  'A real ~59-acre Planned Unit Development covering a mix of Residential (R3), Industrial (M2), Office/Institutional (OI3), and Commercial (C2) uses -- explicitly designated by the city for coordinated, flexible development under one master plan.',
  'PUD (R3;M2;OI3;C2)',
  'PUD zoning already bundles multiple use types into one entitlement -- a developer can mix residential, office, and commercial within the same site without a separate rezoning case for each.',
  '{"type": "Polygon", "coordinates": [[[-95.716478, 39.104229], [-95.716403, 39.104251], [-95.71688, 39.105193], [-95.716695, 39.107354], [-95.716937, 39.108912], [-95.718184, 39.108851], [-95.718888, 39.108748], [-95.719435, 39.107901], [-95.719939, 39.106549], [-95.7198, 39.103892], [-95.718394, 39.10392], [-95.718367, 39.103175], [-95.719785, 39.103137], [-95.719731, 39.101595], [-95.719598, 39.101534], [-95.71955, 39.101421], [-95.719605, 39.101325], [-95.719719, 39.101272], [-95.719687, 39.100667], [-95.718622, 39.100789], [-95.717471, 39.100993], [-95.716793, 39.101155], [-95.716833, 39.101253], [-95.716511, 39.101336], [-95.716472, 39.101248], [-95.715888, 39.10145], [-95.715831, 39.101561], [-95.715783, 39.102908], [-95.716478, 39.104229]]]}'::jsonb,
  s.id,
  'verified'
from markets m, sources s
where m.slug = 'topeka-ks' and s.url = 'https://www.arcgis.com/apps/webappviewer/index.html?id=b7452fa2680e42f08e41a998831b19eb'
order by s.created_at desc limit 1;
