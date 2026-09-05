-- Real, sourced Buildability data for Lawrence, KS -- 4 real zoning
-- districts (R-1, R-2, R-3, CD), each a real polygon pulled live from the
-- City of Lawrence's own zoning GIS layer
-- (gis.lawrenceks.org/server/rest/services/EPL/EPL_Operational_Layers/FeatureServer/20,
-- field ZoningDistrict), paired with real dimensional standards and use
-- permissions from the Lawrence Land Development Code (Title 20),
-- effective April 1, 2025.
--
-- Unlike Topeka's buildability data, confidence here is 'verified', not
-- 'reported': the full 535-page LDC PDF
-- (assets.lawrenceks.gov/pds/planning/documents/Land-Development-Code.pdf)
-- extracted cleanly with real, current, machine-readable text (verified
-- with PyMuPDF after WebFetch wrongly reported it as a scanned image) --
-- no Cloudflare block, no stale archive snapshot needed. This is Lawrence's
-- CURRENT code (adopted April 2025), a genuinely newer/cleaner source
-- than what could be obtained for Topeka.
--
-- Notable real finding worth calling out: per LDC 20-1204(a), new
-- residential development OUTSIDE existing neighborhoods (established
-- 10+ years before the LDC's effective date) is NOT subject to any
-- minimum parking requirement at all -- Lawrence's 2025 code eliminated
-- parking minimums for new residential development citywide, a
-- significant and fairly recent policy shift.

with market as (
  select id from markets where slug = 'lawrence-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('City of Lawrence', 'Land Development Code of the City of Lawrence, Kansas (Title 20), April 1, 2025 Edition', 'agency_document',
     'https://assets.lawrenceks.gov/pds/planning/documents/Land-Development-Code.pdf', '2025-04-01')
  returning id, url
)

insert into zoning_land_use (
  market_id, layer_type, title, description, district_code, permitted_uses, regulatory_notes, geom,
  generally_allowed, may_require_approval, min_lot_size, height_limit, lot_coverage, parking_requirements, setbacks, code_considerations, buildability_summary,
  source_id, confidence
)
select
  market.id, 'current_zoning'::text, 'R-1: Residential Low Density 1', 'Accommodates residential development on relatively large lots plus a limited number of related civic uses.', 'R-1',
  'Detached, attached, and two-unit (duplex) dwellings',
  'Unlike some cities, Lawrence allows a duplex by right in its lowest-density district -- no rezoning needed.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.27911,39.0042],[-95.27813,39.00421],[-95.27815,39.00481],[-95.2792,39.0048],[-95.27911,39.0042]]]}')),
  'Detached single-family dwelling, attached single-family dwelling, and two-unit (duplex) dwelling -- all "P" (permitted by right) per LDC Table 20-8-2/3. Net density up to 3 units per lot.',
  'Multiunit dwellings and Small Lot dwellings are "Not Allowed" in R-1 per the district''s own dimensional table -- would need rezoning to R-2/R-3. Manufactured Home Community is N/A here.',
  '5,000 SF per structure (detached/two-unit); 2,500 SF per unit (attached)', '35 FT principal building; accessory building limited to 25 FT or the principal building''s height, whichever is less',
  '40% max principal building coverage; 70% max impervious surface',
  '1 space per dwelling unit (LDC Table 20-12-1) -- BUT new residential development outside existing (10+ year) neighborhoods is exempt from this minimum entirely (LDC 20-1204(a)).',
  'Principal building: front 20 ft, street side 20 ft, interior side 10 ft, rear 20 ft. Accessory building: front 30 ft, street side 25 ft, interior side 5 ft, rear 5 ft (or 0 ft if abutting an alley).',
  'Minimum total lot width 70 ft. Environmentally Sensitive Lands standards (floodway, wetlands, stream corridors, mature tree stands, historic/archaeological sites -- LDC 20-303(e)) apply to all residential districts except pre-2020-platted single/duplex lots, capped at 20% of the development area. Standard citywide requirements not independently re-verified for this pass: stormwater, fire access, utility connections.',
  'R-1 allows detached homes, attached homes, AND duplexes by right on relatively large lots (5,000+ SF) -- notably more permissive on "missing middle" housing than a typical single-family-only district. Anything denser (multiunit apartments) needs rezoning.',
  new_sources.id, 'verified'::text
from market, new_sources
union all
select
  market.id, 'current_zoning'::text, 'R-2: Residential Low Density 2', 'Accommodates residential development on medium-sized lots in established neighborhoods; may serve as a transition between large-lot and small-lot residential development.', 'R-2',
  'Detached, attached, and two-unit (duplex) dwellings; small-lot dwellings',
  'Same core use permissions as R-1 (duplex by right) at a smaller minimum lot size and denser standards, plus Small Lot dwellings allowed here.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.25061,38.9915],[-95.24896,38.99175],[-95.24888,38.99267],[-95.25118,38.99232],[-95.25118,38.99149],[-95.25061,38.9915]]]}')),
  'Detached single-family, attached single-family, two-unit (duplex), and Small Lot dwellings -- all permitted by right per LDC Table 20-8-2/3. Net density 4-6 units/acre.',
  'Multiunit dwellings are "Not Allowed" in R-2 -- would need rezoning to R-3 or higher. Maximum lot size via consolidation is capped (14,000 SF generally, 11,700 SF within the Lawrence Original Townsite) to prevent over-large infill lots.',
  '5,000 SF (detached/two-unit); 2,000 SF per unit (attached); 2,500 SF (small lot)', '35 FT principal building',
  '60% max principal building coverage; 75% max impervious surface',
  '1 space per dwelling unit (LDC Table 20-12-1) -- exempt entirely for new residential development outside existing (10+ year) neighborhoods (LDC 20-1204(a)).',
  'Principal building: front 10 ft, street side 10 ft, interior side 5 ft, rear 15 ft.',
  'Minimum total lot width 40 ft. Same Environmentally Sensitive Lands and unverified-for-this-pass stormwater/fire-access/utility caveats as R-1.',
  'R-2 is a denser version of R-1 with the same by-right housing types (including duplexes) plus small-lot single-family, on lots as small as 2,000-5,000 SF.',
  new_sources.id, 'verified'::text
from market, new_sources
union all
select
  market.id, 'current_zoning'::text, 'R-3: Residential Medium Density', 'Accommodates neighborhoods with a flexible mix of compact detached, attached, and multiunit housing plus civic and small-to-medium commercial uses; a transition district toward urban-scale development.', 'R-3',
  'Detached, attached, two-unit, multiunit, and small-lot dwellings -- the broadest by-right housing mix of Lawrence''s "low-number" residential districts',
  'Multi-family apartments are allowed by right here with no minimum lot size floor, at up to 4 stories.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.2791,38.9933],[-95.2791,38.9949],[-95.2871,38.9969],[-95.2871,38.9945],[-95.2855,38.9944],[-95.2861,38.9931],[-95.2791,38.9922],[-95.2791,38.9933]]]}')),
  'Detached, attached, two-unit, multiunit (apartment), and small-lot dwellings, all permitted by right per LDC Table 20-8-2/3. Multiunit dwellings have no minimum lot area requirement at all. Net density 7-15 units/acre.',
  'Manufactured Home Community requires a minimum 3,000 SF -- check the specific use standards. Any nonresidential/commercial use beyond what''s use-table-permitted for R-3 needs a Special Use Permit or use-specific standards review.',
  '3,000 SF (detached/two-unit); 1,800 SF per unit (attached); 2,000 SF (small lot); no minimum for multiunit', '45 FT / 4 stories maximum',
  '70% max principal building coverage; 75% max impervious surface',
  '1 space per dwelling unit (LDC Table 20-12-1) -- exempt entirely for new residential development outside existing (10+ year) neighborhoods (LDC 20-1204(a)).',
  'Principal building: front 10 ft, street side 10 ft, interior side 5 ft, rear 10 ft (on corner lots, the rear or interior side setback may be reduced to zero, with the other adjusted to match).',
  'Minimum total lot width 40 ft; max lot size via consolidation capped at 6,000 SF generally (11,700 SF within the Original Townsite). Same Environmentally Sensitive Lands and unverified-for-this-pass stormwater/fire-access/utility caveats as R-1/R-2.',
  'R-3 is Lawrence''s "missing middle" district: everything from a single detached house to a multiunit apartment building is allowed by right, up to 4 stories and 15 units/acre, with genuinely small minimum lot sizes.',
  new_sources.id, 'verified'::text
from market, new_sources
union all
select
  market.id, 'current_zoning'::text, 'CD: Downtown Commercial', 'Establishes standards consistent with the Downtown Master Plan for a compact, walkable, higher-intensity mix of office, commercial, civic, and residential uses.', 'CD',
  'Office, commercial, civic, and residential (with placement conditions) -- Lawrence''s most permissive use-mix district',
  'Dwelling units are generally permitted, but ground-floor residential along Massachusetts Street or certain named streets can trigger Special Use Permit review -- this is a placement rule, not a density limit.',
  ST_Multi(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.2352,38.9731],[-95.2383,38.9732],[-95.2371,38.9722],[-95.2377,38.9638],[-95.2365,38.9638],[-95.2365,38.9631],[-95.2342,38.9638],[-95.2341,38.9662],[-95.2353,38.966],[-95.2353,38.9675],[-95.2347,38.9667],[-95.2336,38.9675],[-95.2336,38.9713],[-95.234,38.9728],[-95.2352,38.9731]],[[-95.2365,38.9639],[-95.2359,38.9643],[-95.2359,38.9639],[-95.2365,38.9639]]]}')),
  'Office, commercial, civic, and residential uses per LDC Table 20-8-2/3. Dwelling units above the ground floor are permitted outright everywhere in the district.',
  'Ground-floor residential requires a Special Use Permit when proposed along numbered streets, Vermont Street, or New Hampshire Street (permitted outright above the ground floor on Massachusetts Street). Maximum building footprint for a single principal use is 25,000 gross sq ft. Building height varies by named subarea (as low as 1 story near the Union Pacific Depot, up to 4-6 stories on parts of Massachusetts/New Hampshire/6th & Mass) -- subject to the separate Downtown Design Guidelines.',
  'None specified', '90 FT general maximum, but effectively governed by a per-subarea story-count limit (1 to 6 stories depending on location) plus the Downtown Design Guidelines/Standards -- check which named subarea the parcel falls in.',
  '100% maximum building and impervious surface coverage',
  'The citywide Table 20-12-1 minimum (1/DU) applies unless the parcel qualifies for the new-development-outside-existing-neighborhoods exemption; no CD-specific downtown parking reduction was independently confirmed in this pass.',
  'Front 0-5 ft, street side 0 ft minimum (no max), interior side (adjacent to residential) 20 ft minimum, interior side (adjacent to non-residential) 0 ft minimum, rear 0 ft minimum -- classic build-to-the-lot-line downtown pattern.',
  'Related residential district for standalone (non-mixed-use) residential development is R-4. Same unverified-for-this-pass stormwater/fire-access/utility caveats as the residential districts.',
  'CD is downtown Lawrence''s core mixed-use district: no minimum lot size, build-to-the-lot-line setbacks, and height governed by a subarea-specific story count (not a flat citywide number) rather than one universal cap.',
  new_sources.id, 'verified'::text
from market, new_sources;
