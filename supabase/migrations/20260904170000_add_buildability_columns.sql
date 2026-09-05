-- Adds the "Buildability" layer, requested by Jared as a 4th dashboard
-- tab alongside Momentum/Projects/Permits: for an area/parcel, its
-- current zoning and what could be built there -- generally allowed uses,
-- uses that may require approval (conditional use/variance/rezoning),
-- basic dimensional standards (lot size, height, coverage, parking,
-- setbacks), common code considerations, and a short summary.
--
-- Reuses `zoning_land_use` (the dormant Potential-pillar table, already
-- has market_id/geom/district_code/source/RLS wired up, currently empty
-- for every market -- see project_roq_shift memory) rather than a new
-- table, same reuse pattern as the Projects tab. Adds the specific
-- structured fields Jared asked for as new nullable columns -- existing
-- rows (there are none yet) are unaffected.

alter table zoning_land_use
  add column generally_allowed text,       -- uses allowed by right, e.g. "single family, ADU"
  add column may_require_approval text,    -- duplex/townhome, conditional use, rezoning, variance
  add column min_lot_size text,
  add column height_limit text,
  add column lot_coverage text,
  add column parking_requirements text,
  add column setbacks text,
  add column code_considerations text,     -- fire access, stormwater, floodplain, utility, street/access
  add column buildability_summary text;    -- short plain-English summary
