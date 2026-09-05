-- Expands Topeka Buildability with 2 more real districts: M-1 (Two-Family
-- Dwelling District) and M-2 (Multiple-Family Dwelling District), filling
-- the gap between R-2 (single-family only) and M-3 (up to 30 units/acre,
-- 160 ft). Same source (TMC Ch. 18.60/18.240, 2019 archive snapshot --
-- same 'reported' confidence caveat as the first 4 districts, see that
-- migration's header) and same real-GIS-polygon requirement.
--
-- R-3 (Single-Family Dwelling District) was also planned for this batch
-- but is a confirmed real gap, not a skipped one: a live query against
-- the city's own zoning GIS layer (ZONEDESC LIKE '%R3%') returned zero
-- features -- Topeka currently has no parcels zoned R-3 at all, so there
-- is no real polygon to seed without fabricating one.
--
-- Use-permission facts for M-1/M-2 read directly off the TMC 18.60.010
-- use matrix (same district-family reasoning documented for M-3): M-1
-- allows two-family/duplex but NOT 3-4 unit or 5+ unit buildings (matches
-- its "Two-Family Dwelling District" name); M-2 allows duplex, 3-4 unit,
-- and 5+ unit multi-family alike.

with market as (
  select id from markets where slug = 'topeka-ks'
),
dimensional_source as (
  select id from sources where url = 'https://www.codepublishing.com/KS/Topeka/html/Topeka18/Topeka1860.html'
)

insert into zoning_land_use (
  market_id, layer_type, title, description, district_code, permitted_uses, regulatory_notes, geom,
  generally_allowed, may_require_approval, min_lot_size, height_limit, lot_coverage, parking_requirements, setbacks, code_considerations, buildability_summary,
  source_id, confidence
)
select
  market.id, 'current_zoning'::text, 'M-1 Two-Family Dwelling District', 'Provides for the use of two-family and attached single-family dwellings. Provides a transitional use between the single-family detached dwelling districts and other, more intensive districts.', 'M-1',
  'Two-family (duplex) and attached single-family dwellings',
  'A transitional district between single-family and higher-density multifamily -- allows duplexes but not 3+ unit buildings.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.701557036638562,39.047761186499372],[-95.701557916675,39.047896470370631],[-95.701558364472632,39.04796385564849],[-95.701558843025495,39.048030296289646],[-95.701559174678977,39.048101284534191],[-95.701560041820727,39.048169277337635],[-95.701560454956947,39.048237691874704],[-95.701560903943331,39.0483050762723],[-95.701561657698889,39.048376587393783],[-95.701562045236869,39.048445859261527],[-95.701562920741239,39.048513595416708],[-95.701563220579629,39.048585525569138],[-95.701563838724411,39.048647678872648],[-95.701564255836459,39.048716006979845],[-95.701565049864982,39.048786316839234],[-95.701565827629949,39.048857055295592],[-95.701566186108977,39.048927184423263],[-95.701566349971344,39.04896272130496],[-95.701566651845837,39.048994054623911],[-95.70156718789498,39.049058694212619],[-95.701568228065923,39.04913493181531],[-95.701568668709754,39.049202572851819],[-95.701569157266817,39.049268671266788],[-95.701569709585485,39.049332882256017],[-95.701570301491302,39.049395806368807],[-95.70157068752286,39.049438042755241],[-95.702013959350865,39.049440980406779],[-95.702013416671392,39.049403548248513],[-95.702013102447481,39.049332045846484],[-95.702012205794773,39.049264910318911],[-95.702011767064675,39.049197268429751],[-95.702011300875668,39.049130399132892],[-95.70201061366501,39.049056829451906],[-95.702010141937876,39.048990130350603],[-95.702009557405717,39.048953984120317],[-95.702009686474099,39.04892300265125],[-95.702008885927654,39.048852950387861],[-95.70200847558371,39.048784365614708],[-95.702007746492015,39.048712082761298],[-95.702007258003221,39.048645898749868],[-95.702006626670311,39.048584174114872],[-95.702005936655894,39.048510690878452],[-95.702005566574258,39.048440904843631],[-95.702005118317544,39.048373520471642],[-95.702004269170445,39.048304926108727],[-95.702003924241453,39.048234367433729],[-95.702003206328044,39.048161741481131],[-95.702002596125439,39.04809933243142],[-95.702002217695309,39.048029803039178],[-95.702001800163529,39.047961474928265],[-95.70200141613627,39.047892117532591],[-95.702001036553611,39.047822588115849],[-95.702000205309119,39.047753479579704],[-95.701557036638562,39.047761186499372]]]}')),
  'Two-family (duplex) dwellings and attached single-family dwellings, per TMC 18.60.010.',
  'Three-/four-family and multi-family (5+ unit) buildings are NOT permitted in M-1 -- would need rezoning to M-1a or higher. Minimum lot area (4,500 sq ft) is "per unit," not per lot, per the code footnote.',
  '4,500 sq ft PER UNIT (not per lot); minimum lot width 50 ft', '42 ft', '50% maximum building coverage',
  '1 space per dwelling unit <=950 sq ft floor area; 2 spaces per unit >950 sq ft (TMC 18.240.020(a)(1))',
  'Front 25 ft, side 5 ft, rear 25 ft.',
  'Maximum density 6 dwelling units/acre. Same unverified-for-this-pass floodplain/stormwater/fire-access/utility caveats as the other residential districts.',
  'M-1 is a transitional district: duplexes and attached single-family homes are allowed by right, but nothing denser (3+ units) without rezoning up to M-1a or higher.',
  dimensional_source.id, 'reported'::text
from market, dimensional_source
union all
select
  market.id, 'current_zoning'::text, 'M-2 Multiple-Family Dwelling District', 'Provides for the use of attached dwelling units containing three or more dwelling units, including townhouse, condominium or cooperative division of ownership. Provides a transitional use between districts of lesser and greater intensity.', 'M-2',
  'Multi-family dwellings (5+ units), duplexes, three-/four-family, single-family attached and detached',
  'Full multi-family permissions (duplex through large apartment building) at a lower height/density cap than M-3.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.686994754943186,39.04612678790641],[-95.687069409579479,39.046146041163674],[-95.687222664681642,39.046185056857141],[-95.68742478292971,39.04623774837426],[-95.68750515750061,39.046257116179781],[-95.68751701387356,39.046231174614576],[-95.687516577273072,39.046190739182499],[-95.68751626927714,39.046119495162536],[-95.687515670229686,39.046043695715028],[-95.68751518356359,39.045964465332396],[-95.687109570991382,39.045860857901722],[-95.687079080148223,39.045931489277805],[-95.687051427506077,39.045996082179549],[-95.687023334312755,39.04606075280374],[-95.686994754943186,39.04612678790641]]]}')),
  'Detached and attached single-family, duplex, three-/four-family, and multi-family (5+ unit) dwellings, per TMC 18.60.010.',
  'Dwelling units on the main floor of a mixed-use building require Special Use approval under Ch. 18.225 TMC in some cases; several group-living/community-living-facility subtypes are conditional rather than by-right.',
  '7,500 sq ft (new lots); minimum lot width 50 ft', '50 ft maximum', '60% maximum building coverage',
  '2 spaces/unit for the first 20 units, 1.5 spaces/unit thereafter (units <=800 sq ft); 2 spaces/unit if >800 sq ft (TMC 18.240.020(a)(2))',
  'Front 25 ft, side 5 ft, rear 25 ft.',
  'Maximum density 15 dwelling units/acre. Same unverified-for-this-pass floodplain/stormwater/fire-access/utility caveats as the other residential districts.',
  'M-2 allows the full range of housing types (duplex through apartment building) at a mid-tier height (50 ft) and density (15 units/acre) -- denser than M-1, capped lower than M-3''s 160 ft/30 units-per-acre.',
  dimensional_source.id, 'reported'::text
from market, dimensional_source;
