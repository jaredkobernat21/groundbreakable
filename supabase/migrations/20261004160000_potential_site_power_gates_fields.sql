-- Power-as-a-gate + Development Gates + richer Location/Fiber/Water fields (Jared, 2026-10-04
-- "Bonner Springs refinement pass" brief). Core idea: a strong Potential Score should never imply
-- power is solved -- large-load power capacity functions as a GATE, not just another weighted
-- factor, so a holistic qualification status and a per-category gate screen need their own
-- columns, distinct from the existing 0-100 score and the existing per-fact columns. All nullable,
-- additive, same convention as every prior Potential-tier migration -- existing rows render
-- exactly as before until a researcher populates these.

alter table catalysts
  -- POWER QUALIFICATION -- a holistic status distinct from available_capacity_status (which is
  -- about a single fact's evidence confidence) and from power_pillar_label (a vaguer
  -- strong/moderate/weak word). This is specifically about whether a large-load PATH has been
  -- established, never auto-derived from potential_score.
  add column power_qualification text,
  -- Distinguishes "a substation exists nearby" from "that substation can actually serve a
  -- large continuous load" -- existence and type only, never implies capacity.
  add column nearest_substation_type text,
  add column utility_expansion_signals text,
  -- TARGET LOAD PROFILE -- the DEMAND side (what a buyer needs), deliberately separate from
  -- potential_load_mw_low/high (the SUPPLY side -- what research has confirmed the site/utility
  -- can deliver). Comparing the two is what prevents a small verified MW figure from reading as
  -- sufficient for a hyperscale target. Null means "use the Potential-tier default of 50-100+ MW,"
  -- not "no target" -- the default lives in application code, not duplicated per row.
  add column target_load_mw_low numeric,
  add column target_load_mw_high numeric,
  add column expansion_requirement text,
  -- BTM GAS -- gas_pipeline_operator (existing column) has always meant the LOCAL distribution
  -- utility (Atmos Energy, Kansas Gas Service, etc); this is the separate upstream TRANSMISSION
  -- pipeline company (e.g. Southern Star), a genuinely different entity the brief wants tracked
  -- distinctly rather than conflated.
  add column gas_transmission_operator text,
  -- FIBER -- known_carriers is the structured list "Serving Utility"-style fields already use
  -- elsewhere; fiber_notes (existing column) keeps the one-line summary/assessment.
  add column fiber_carriers text[] not null default '{}',
  -- WATER -- the field the brief's own §10 flags as a real contradiction risk: narrative
  -- (water_notes, developer_takeaway) must never claim more than this structured status supports.
  add column water_capacity_status text,
  -- LOCATION + ACCESS -- one jsonb object (distance/drive-time facts don't need individual
  -- columns and historically compound facts like this live in jsonb on this table, e.g. `owners`,
  -- `people`).
  add column location_access jsonb,
  -- DEVELOPMENT GATES -- the decision screen per §14: one jsonb object keyed by gate name
  -- (power/land/site_control/entitlement/btm_gas/fiber/water/environmental), each value one of
  -- green/yellow/red/gray. A presentation-layer screen, not a replacement for the detailed fields
  -- underneath it.
  add column development_gates jsonb;

comment on column catalysts.power_qualification is
  'unqualified / infrastructure_indicated / utility_path_indicated / capacity_indicated / capacity_confirmed -- whether a large-load power PATH has been established. Never auto-derived from potential_score or power_pillar_label.';
comment on column catalysts.development_gates is
  'jsonb object {power, land, site_control, entitlement, btm_gas, fiber, water, environmental} -> green/yellow/red/gray. A decision screen, not a replacement for the detailed category sections.';
comment on column catalysts.location_access is
  'jsonb object: {kc_metro_position, interstate_name, interstate_distance_miles, k7_distance_miles, airport_distance_miles, airport_drive_minutes, rail, industrial_context, residential_buffer_miles}. Informational only -- never overweighted in scoring relative to power/land.';
