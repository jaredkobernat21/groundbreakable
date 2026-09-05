-- Real, sourced Buildability data for Topeka -- 4 real zoning districts
-- (R-1, R-2, M-3, D-1), each a real polygon pulled live from the City of
-- Topeka's own zoning GIS layer (LandUsePlanning/ZoningDistrict,
-- maps.topeka.gov/arcgis/rest/services), paired with real dimensional
-- standards and use-permission facts from Topeka Municipal Code Title 18
-- (Development Code) Ch. 18.60 (use tables + density/dimensional
-- standards) and Ch. 18.240 (off-street parking).
--
-- IMPORTANT CONFIDENCE CAVEAT (why every row below is 'reported', not
-- 'verified'): the live code hosts (topeka.municipal.codes and
-- codepublishing.com) both sit behind Cloudflare bot-challenge pages that
-- blocked every automated fetch attempted for this research pass. The
-- text used here came from a web.archive.org snapshot of
-- codepublishing.com/KS/Topeka/html/Topeka18/Topeka1860.html captured
-- 2019-12-16 (citing Ord. 20062 § 17, 4-18-17, the ordinance that
-- established this use-matrix/dimensional-standards framework). A search
-- during this same pass surfaced a 2024 ordinance ("Ordinance 20529 --
-- Zoning; Density & Dimensional Standards") that may have amended figures
-- since -- so treat every number/permission below as a strong starting
-- point, not a substitute for confirming current rules with Topeka
-- Planning & Development before relying on it for a real decision.
-- ZONEDESC/geometry themselves ARE live/current (pulled directly from the
-- GIS service at research time), just not the ordinance text paired with
-- them.

with market as (
  select id from markets where slug = 'topeka-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('City of Topeka', 'Topeka Municipal Code Title 18, Ch. 18.60 (Use Tables; Density/Dimensional Standards)', 'agency_document',
     'https://www.codepublishing.com/KS/Topeka/html/Topeka18/Topeka1860.html', '2017-04-18'),
    ('City of Topeka', 'Topeka Municipal Code Title 18, Ch. 18.240 (Off-Street Parking Requirements)', 'agency_document',
     'https://www.codepublishing.com/KS/Topeka/html/Topeka18/Topeka18240.html', null),
    ('City of Topeka Planning Department', 'Zoning District Summary', 'agency_document',
     'https://s3.amazonaws.com/cot-wp-uploads/wp-content/uploads/planning/Zoning_District_Summary.pdf', null)
  returning id, url
),
dimensional_source as (
  select id from new_sources where url like '%Topeka1860%'
)

insert into zoning_land_use (
  market_id, layer_type, title, description, district_code, permitted_uses, regulatory_notes, geom,
  generally_allowed, may_require_approval, min_lot_size, height_limit, lot_coverage, parking_requirements, setbacks, code_considerations, buildability_summary,
  source_id, confidence
)
select
  market.id, 'current_zoning'::text, 'R-1 Single-Family Dwelling District', 'Provides for detached single-family dwellings together with specified accessory uses and other uses as may be approved.', 'R-1',
  'Detached single-family dwellings; specified accessory uses',
  'Topeka''s baseline single-family district. R-1/R-2/R-3 share the same use-permission column in TMC 18.60.010 -- differ only in dimensional standards.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.723025122709359,39.050589619471033],[-95.723025509428012,39.050686871335877],[-95.723025360019676,39.050691503591366],[-95.724564452922039,39.050682881278775],[-95.724566058031485,39.049922728194943],[-95.723450195585954,39.049941966856139],[-95.723449025567859,39.05059261073108],[-95.723025122709359,39.050589619471033]]]}')),
  'Detached single-family dwelling; customary accessory uses (private garage, home occupation, etc.) per TMC 18.60.010.',
  'Two-family/duplex, three-/four-family, and multi-family dwellings are not permitted in R-1 at all -- would need rezoning to an M-district, not just a variance. An accessory dwelling unit (secondary unit up to 600 sq ft) was NOT listed as a base-zoning-permitted use in the 2019 code snapshot used here -- may have since been legalized by amendment (a 2024 ordinance touched density/dimensional standards); confirm current ADU status with Topeka Planning. Any use outside the R-1 column of the TMC 18.60.010 matrix needs a Conditional Use Permit or rezoning.',
  '6,500 sq ft (new lots); minimum lot width 60 ft', '42 ft principal building; accessory buildings 15-20 ft depending on principal building''s story count', '45% maximum building coverage',
  '1 space per dwelling unit <=950 sq ft floor area; 2 spaces per unit >950 sq ft (TMC 18.240.020(a)(1))',
  'Principal building: front 30 ft, side 7 ft, rear 30 ft. Accessory buildings: front 30 ft, side 3 ft, rear 5 ft, 6 ft from other buildings.',
  'Garage entry setbacks: 20 ft front-entry, 10 ft rear-entry (alley), 5 ft side-entry (alley). Detached accessory building footprint capped at 90% of principal building coverage. Standard citywide requirements not independently re-verified for this pass: floodplain development (separate floodplain management chapter), stormwater/erosion control (city engineering standards), fire access and utility connections (adopted International Fire Code and city utility standards).',
  'R-1 is Topeka''s baseline single-family district: one detached house per lot, minimum 6,500 sq ft, 45% max coverage, 42 ft height cap. Anything denser than one house (duplex, triplex, apartments) is not allowed outright and needs a rezoning.',
  dimensional_source.id, 'reported'::text
from market, dimensional_source
union all
select
  market.id, 'current_zoning'::text, 'R-2 Single-Family Dwelling District', 'Provides for detached single-family dwellings together with specified accessory uses. Maximum lot sizes and setbacks are less than in the R-1 District.', 'R-2',
  'Detached single-family dwellings; specified accessory uses (same use column as R-1/R-3)',
  'Same use permissions as R-1 (shared TMC 18.60.010 column) but smaller minimum lot / tighter setbacks -- a denser single-family district.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.669426169788949,39.07184488313267],[-95.669426056488547,39.071848314039556],[-95.669426010967641,39.071916376602204],[-95.669425942816218,39.071985124445256],[-95.669425703593944,39.072045715727619],[-95.669425149983653,39.072115827100383],[-95.669424818384016,39.072192552475229],[-95.669424941279729,39.072202167845887],[-95.669787732863185,39.072205927419347],[-95.669949314741913,39.072207624645621],[-95.669949286918637,39.07219509253099],[-95.669950264326019,39.072125504195263],[-95.669951379330925,39.072051713199535],[-95.66995254253159,39.071989767189784],[-95.669953449113805,39.071922323844817],[-95.669954687079468,39.071858148217778],[-95.669426169788949,39.07184488313267]]]}')),
  'Detached single-family dwelling; customary accessory uses -- identical use permissions to R-1 (same TMC 18.60.010 column).',
  'Same restrictions as R-1: duplex/multi-family not permitted without rezoning to an M-district; ADU status pre-2019-snapshot unclear, verify current rules; anything outside the matrix column needs a CUP or rezoning.',
  '5,000 sq ft (new lots); minimum lot width 40 ft', '42 ft principal building; accessory buildings 15-20 ft', '50% maximum building coverage',
  '1 space per dwelling unit <=950 sq ft floor area; 2 spaces per unit >950 sq ft (TMC 18.240.020(a)(1))',
  'Principal building: front 25 ft, side 5 ft, rear 25 ft. Accessory buildings: front 25 ft, side 3 ft, rear 5 ft, 6 ft from other buildings.',
  'Same garage-entry-setback and 90%-coverage-ratio rules as R-1. Same unverified-for-this-pass floodplain/stormwater/fire-access/utility caveats.',
  'R-2 is a denser version of R-1 with the same use permissions (single-family only, same use-matrix column) but a smaller 5,000 sq ft minimum lot, 50% max coverage, and tighter 25/5/25 ft setbacks.',
  dimensional_source.id, 'reported'::text
from market, dimensional_source
union all
select
  market.id, 'current_zoning'::text, 'M-3 Multiple-Family Dwelling District', 'Provides for the use of attached dwelling units containing three or more dwelling units. Provides a transitional use between districts of lesser and greater intensity.', 'M-3',
  'Multi-family dwellings (5+ units), duplexes, three-/four-family, single-family attached and detached',
  'One of Topeka''s least restrictive residential districts by unit count -- allows everything from a detached house to a large apartment building by right.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.67998685063516,39.051517062388022],[-95.679903370597316,39.051710137537682],[-95.680405737882509,39.051839675326214],[-95.680489911721338,39.051645037684771],[-95.67998685063516,39.051517062388022]]]}')),
  'Detached and attached single-family, duplex, three-/four-family, and multi-family (5+ unit) dwellings, per TMC 18.60.010.',
  'Dwelling units on the main floor of a mixed-use building require Special Use approval under Ch. 18.225 TMC in some cases; several group-living/community-living-facility subtypes are conditional rather than by-right -- check the specific use matrix row for the exact use proposed.',
  '7,500 sq ft (new lots) -- note: the code''s footnote for the analogous M-1/M-1a figure says that one is "per unit," not per lot; whether M-3''s 7,500 sq ft is per-lot or per-unit was not confirmed in this pass. Minimum lot width 50 ft.',
  '160 ft maximum', '60% maximum building coverage',
  '2 spaces/unit for the first 20 units, 1.5 spaces/unit thereafter (units <=800 sq ft); 2 spaces/unit if >800 sq ft (TMC 18.240.020(a)(2))',
  'Front 25 ft, side 5 ft, rear 25 ft.',
  'Maximum density 30 dwelling units/acre. Same unverified-for-this-pass floodplain/stormwater/fire-access/utility caveats as the residential districts above.',
  'M-3 is Topeka''s highest-density standard multifamily district: up to 30 units/acre and 160 ft height, allowing duplexes through large apartment buildings by right.',
  dimensional_source.id, 'reported'::text
from market, dimensional_source
union all
select
  market.id, 'current_zoning'::text, 'D-1 Downtown Mixed Use District', 'Facilitates a compatible mixed use activity center within the core area of downtown Topeka -- State offices, local/Federal facilities, commercial and retail uses, plus compatible residential, office, and civic uses.', 'D-1',
  'Office, institutional, commercial/retail, and compatible residential -- the broadest use mix in the code',
  'D-1 is the most permissive district in the code for use mix, with no minimum lot size and no parking requirement.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.676493550303121,39.053416134802148],[-95.676498322061946,39.053404899890374],[-95.676525953411542,39.053341337930938],[-95.676538356662206,39.0533123184833],[-95.676030456189466,39.053185253877317],[-95.676020924411958,39.053207293175639],[-95.675991877756644,39.053273744450145],[-95.675987101984475,39.053285063965582],[-95.675964715352933,39.053336457833325],[-95.675944864875049,39.053377687618401],[-95.675936630550353,39.053400438614517],[-95.675927583918877,39.053421114343692],[-95.675906145049581,39.053470466361141],[-95.676415258966173,39.053600817724892],[-95.676435805673577,39.053551876689681],[-95.676442571851325,39.053533558516222],[-95.676456873592969,39.053500371646123],[-95.676470199301107,39.053470082996284],[-95.676493550303121,39.053416134802148]]]}')),
  'Office, institutional, commercial/retail, and compatible residential uses per TMC 18.60.010. No off-street parking is required for any use in D-1 (TMC 18.240.010 exempts D-1 and D-3 entirely).',
  'Ground-floor residential and certain higher-intensity uses may trigger review under the Downtown Topeka Urban Design Guidelines in addition to the base use matrix (TMC 18.60.020 note 17) -- check those guidelines for any downtown project.',
  'None specified', 'No flat cap -- tied to street right-of-way width (roughly 3x the adjacent street width at the street line, with bonus height for additional building setback); a separate state-zoning-area exception allows up to 6 stories/75 ft at the street line with further setback bonuses. See TMC 18.60.020 note [16] for the full formula.', '100% maximum building coverage',
  'None required -- TMC 18.240.010 exempts D-1 (and D-3) from all off-street parking requirements.',
  '0 ft front/side/rear -- standard downtown build-to-the-property-line pattern.',
  'Refer to the Downtown Topeka Urban Design Guidelines for design standards beyond the base zoning code. Same unverified-for-this-pass floodplain/stormwater/fire-access/utility caveats as above.',
  'D-1 is downtown Topeka''s core mixed-use district: no minimum lot size, no parking requirement, build-to-the-lot-line setbacks, and height set by a street-width formula rather than a flat cap -- built for dense urban infill.',
  dimensional_source.id, 'reported'::text
from market, dimensional_source;
