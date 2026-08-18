-- Real, sourced Growth Areas and Potential Sites for Topeka -- the first
-- content in either table since Phase 1 added the schema (Phase 5 built
-- the map layer/admin tooling, but nobody had curated real data into it
-- yet). Not synthetic: every area below is built entirely from projects,
-- signals, and sourced facts already on file, reviewed with the user
-- before writing this migration -- see that review for the full
-- reasoning and the candidates deliberately left out (four
-- "major employer" projects/catalysts that share coordinates only
-- because their real addresses were never disclosed, not because
-- they're actually co-located; two already-flagged Opportunities cited
-- as supporting evidence but not duplicated as separate Potential
-- Sites).
--
-- Boundaries are hand-approximated rectangles around each area's
-- supporting evidence, not surveyed footprints -- refinable later via
-- the admin Growth Areas tool, same as any other admin-traced boundary
-- in this app.

insert into growth_areas (market_id, name, momentum_state, narrative, geom)
select
  m.id,
  'Downtown / Near-Downtown Core',
  'accelerating',
  'The most simultaneously active corridor in Topeka right now: the $239M I-70 Polk-Quincy Viaduct reconstruction runs right through it, 442 combined new housing units are under construction two blocks apart (Union at Tower District, 250 units; The Hutch, 192 units + retail), a two-tenant bioscience/agtech innovation hub just opened (Link Innovation Labs + Spore.Bio), the Historic Old Town Neighborhood Plan was just updated, and a stacked 4-signal opportunity (vacant, absentee-owned, underutilized, zoning upside) sits two blocks south at 625 SW Polk St. Five independent actors betting on the same few blocks at once.',
  ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.693,39.040],[-95.667,39.040],[-95.667,39.063],[-95.693,39.063],[-95.693,39.040]]]}'), 4326))
from markets m
where m.slug = 'topeka-ks';

insert into growth_areas (market_id, name, momentum_state, narrative, geom)
select
  m.id,
  'SW 6th & Wanamaker (Klausman Assembly)',
  'emerging',
  'The same investor, Jim Klausman, quietly assembled 40.94 acres across 11 parcels near SW 6th Ave and SW Wanamaker Road for $8.54M over 2022-23 (Klaton LLC), then came back in 2024 for the adjacent Menninger Clock Tower after its prior owner''s affordable-senior-housing plan fell through. Neither acquisition has an announced development plan. Real retail redevelopment is already underway nearby (Raising Cane''s West Topeka, former Steak ''n Shake site). No confirmed development yet, but capital and land control are already in place -- exactly the profile worth watching.',
  ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.782,39.038],[-95.752,39.038],[-95.752,39.066],[-95.782,39.066],[-95.782,39.038]]]}'), 4326))
from markets m
where m.slug = 'topeka-ks';

insert into growth_areas (market_id, name, momentum_state, narrative, geom)
select
  m.id,
  'SW Urish Road Corridor',
  'emerging',
  'A roughly 2.5-mile stretch of Urish Road with independent duplex/multifamily rezonings at both ends -- the Urish Road Rezoning (up to 40 duplexes, 80 units, PC-recommended) at the north end, SW Villa Drive Duplexes (10 duplexes, 20 units) to the south -- and a stack of flagged land right in the middle at SW Urish Rd & SW 21st St (zoning upside, underutilized land, and a separate tax-delinquent parcel at the same intersection). Nobody''s assembled this corridor yet, but three unrelated actors are already moving on pieces of it.',
  ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-95.786,39.010],[-95.762,39.010],[-95.762,39.050],[-95.786,39.050],[-95.786,39.010]]]}'), 4326))
from markets m
where m.slug = 'topeka-ks';

-- --- Potential Sites -------------------------------------------------------
-- Deliberately narrow: only sites with no distress signal attached
-- (nothing already represented as an Opportunity/signal) and a real,
-- named reason to watch them. Both reuse the same source citation as
-- their underlying Plans-side project record (Klaton LLC Land Assembly /
-- Menninger Clock Tower Acquisition), since the facts are the same.

insert into potential_sites (market_id, growth_area_id, title, address, latitude, longitude, tier, development_context, status, source_id, confidence)
select
  m.id,
  ga.id,
  'Former Hollywood Theaters & Klaton Assembly',
  '6200 SW 6th Ave, Topeka, KS',
  39.059322,
  -95.767244,
  'high',
  '41 contiguous acres under single ownership (Klaton LLC / Klaton Properties LLC), assembled across 11 separate purchases over two years for $8.5M -- a scale and deliberateness that reads as land-banking for something specific, even though nothing''s been announced. The anchor parcel is the former Hollywood Theaters site.',
  'active',
  p.source_id,
  'reported'
from markets m
join growth_areas ga on ga.market_id = m.id and ga.name = 'SW 6th & Wanamaker (Klausman Assembly)'
join projects p on p.id = 'adcd7220-b729-4274-9393-a3af7bdccabd'
where m.slug = 'topeka-ks';

insert into potential_sites (market_id, growth_area_id, title, address, latitude, longitude, tier, development_context, status, source_id, confidence)
select
  m.id,
  ga.id,
  'Menninger Clock Tower',
  '5800 SW 6th Ave, Topeka, KS',
  39.062708,
  -95.757873,
  'watch',
  'A landmark property acquired by the same investor behind the adjacent 41-acre assembly, after its prior owner''s affordable-senior-housing conversion plan collapsed. County-appraised at $464K; sale price undisclosed. Klausman is reportedly working with Schwerdt Design Group, but nothing''s been announced.',
  'active',
  p.source_id,
  'reported'
from markets m
join growth_areas ga on ga.market_id = m.id and ga.name = 'SW 6th & Wanamaker (Klausman Assembly)'
join projects p on p.id = 'ebee8cb2-e3d2-4873-9253-1602d817a5a2'
where m.slug = 'topeka-ks';
