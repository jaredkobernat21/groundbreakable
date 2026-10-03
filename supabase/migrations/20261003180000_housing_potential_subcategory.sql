-- Housing category: Potential/Planned subcategory split (Jared's product
-- brief, 2026-10-03). Purely additive -- no existing column, constraint,
-- or row touched. All 11 existing `housing_development` rows (confirmed
-- live before writing this migration) keep their exact current meaning:
-- a specific, identified housing project/filing/entitlement. They become
-- "Planned" purely via app-code logic (lib/catalysts/housingStage.ts), not
-- a data change -- this migration adds zero backfill statements.
--
-- NEW catalyst_type: 'prospective_housing_site' -- a site/area
-- Groundbreakable has flagged as a promising future housing-development
-- opportunity based on demand/entitlement/infrastructure/site/economics
-- signals, with NO specific project yet. Mirrors the relationship between
-- 'housing_development' and this new type exactly the way
-- 'prospective_data_center_site' relates to 'data_center' -- see
-- 20261002070000_add_potential_data_center_site_catalyst_type.sql's
-- comment for the original version of this pattern.
--
-- REUSED AS-IS, zero new columns (already generic/catalyst-agnostic as of
-- 20261003160000_potential_site_energy_timeline_risk_people.sql):
--   - `people` (jsonb: owner/utility/government/development) -- Housing's
--     own People brief (Property/Government/Infrastructure/Development)
--     maps onto this exact same shape; "Infrastructure" contacts (water/
--     sewer/electric providers) are the same real-world role as the
--     existing `utility` sub-object.
--   - `readiness_stage`/`readiness_notes` -- Housing's 5-stage Discovery->
--     Qualified->Feasibility->Controlled->De-Risked framework is verbatim
--     identical to the Data Center one already stored here.
--   - `next_steps` (text[]) and `why_this_site` (text) -- same concepts,
--     same fallback-to-derived-list/fallback-to-why_it_matters behavior
--     (lib/catalysts/potentialSiteCriteria.ts's computeNextSteps/
--     computeWhySiteSummary already operate on generic shapes with no
--     Data-Center-specific assumption baked in).
--   - `water_notes`, `fiber_notes`, `natural_gas_notes` -- Housing's
--     Infrastructure category reuses these directly for its Water and
--     "other infrastructure" (electric/gas/fiber/stormwater) bullets
--     rather than adding near-duplicate columns.
--
-- GENUINELY NEW, Housing-specific (no existing column fits):
--   - `housing_type`: the simple classification the brief asks for
--     (large_single_family/multifamily/build_to_rent/townhome_attached/
--     infill_redevelopment/mixed_residential). Nullable, no default.
--   - `demand_notes`: single-family or multifamily absorption/demand
--     signals, always prose per the brief's "do not create false
--     precision" instruction -- never a fabricated vacancy/absorption
--     number.
--   - `entitlement_status` + `entitlement_notes`: the brief's explicit
--     3-way classification (by_right/entitlement_required/
--     high_entitlement_risk) plus 'unknown' as the honest default --
--     mirrors prospective_data_center_site's approval_pillar_label
--     pattern, but Housing's brief asked for these specific category
--     names rather than strong/moderate/weak, so a dedicated enum.
--   - `sewer_notes`, `road_notes`: the two Infrastructure sub-topics with
--     no existing column home (Water/Gas/Fiber are covered by the reused
--     columns above).
--   - `site_notes`: physical site characteristics (acreage, shape,
--     topography, floodplain, easements, rail/pipeline crossings) --
--     distinct from prospective_data_center_site's land_notes/risk_notes,
--     which are tightly coupled to that type's own weighted-factor
--     scoring UI; Housing has no scoring system, so this is a fresh,
--     unscored prose field.
--   - `estimated_yield`: the preliminary lot/unit yield estimate. Always
--     prose, not a numeric min/max pair -- the brief requires every such
--     estimate to state its own assumptions and be clearly marked
--     preliminary (e.g. "Estimated 180-230 single-family lots based on
--     ~110 usable acres..."), which a bare numeric range can't carry on
--     its own without inviting fake precision later.
--   - `economics_notes`: land basis per lot/unit, nearby comps/rents.
--     Explicitly NOT a pro forma or ROI field per the brief -- the UI
--     labels this "Preliminary Economics." The headline $ ask and scale
--     figure reuse the catalysts table's existing generic `estimated_value`
--     and `estimated_scale_note` columns rather than new ones.
--   - `opportunity_catalyst`: the "what changed to make this land
--     developable" callout (e.g. "Funded sewer expansion scheduled
--     through this growth corridor") -- the one concept with no
--     Data-Center-era equivalent at all; Data Centers never had a
--     dedicated "what changed" field.
--
-- No numeric Potential score/weighted-factor array was added for Housing
-- (unlike prospective_data_center_site's potential_score/
-- potential_score_components) -- the brief never asked for one, and
-- inventing a weighted rubric nobody requested would be unnecessary
-- complexity per Jared's own "do not overcomplicate" instruction.

alter table catalysts drop constraint catalysts_catalyst_type_check;
alter table catalysts add constraint catalysts_catalyst_type_check check (
  catalyst_type in (
    'major_employer', 'infrastructure_project', 'institutional', 'public_facility',
    'mixed_use_anchor', 'data_center', 'potential_data_center', 'prospective_data_center_site',
    'housing_development', 'prospective_housing_site', 'industrial_logistics', 'incentive_district',
    'annexation_rezoning', 'other'
  )
);

alter table catalysts
  add column housing_type text check (
    housing_type is null or housing_type in
    ('large_single_family', 'multifamily', 'build_to_rent', 'townhome_attached', 'infill_redevelopment', 'mixed_residential')
  ),
  add column demand_notes text,
  add column entitlement_status text check (
    entitlement_status is null or entitlement_status in ('by_right', 'entitlement_required', 'high_entitlement_risk', 'unknown')
  ),
  add column entitlement_notes text,
  add column sewer_notes text,
  add column road_notes text,
  add column site_notes text,
  add column estimated_yield text,
  add column economics_notes text,
  add column opportunity_catalyst text;

comment on column catalysts.people is 'Owner/utility/government/development contacts (jsonb, see lib/catalysts/potentialSiteCriteria.ts PotentialSitePeople / lib/types.ts PotentialSitePeople) -- meaningful for any Potential-tier catalyst type (prospective_data_center_site, prospective_housing_site), null otherwise.';
comment on column catalysts.readiness_stage is 'Discovery/Qualified/Feasibility/Controlled/De-Risked -- meaningful for any Potential-tier catalyst type, null otherwise. Never auto-advanced; see lib/catalysts/potentialSiteCriteria.ts computeReadinessStage.';
comment on column catalysts.readiness_notes is 'Free-text support for readiness_stage -- meaningful for any Potential-tier catalyst type.';
comment on column catalysts.next_steps is 'Site-specific prioritized action list -- meaningful for any Potential-tier catalyst type; falls back to a derived list from unknowns_to_verify when empty (see computeNextSteps).';
comment on column catalysts.why_this_site is 'Tight 2-4 sentence top-of-card summary -- meaningful for any Potential-tier catalyst type; falls back to a synthesized summary, then why_it_matters, when null.';
comment on column catalysts.water_notes is 'Water availability/source notes -- meaningful for any Potential-tier catalyst type (data-center cooling/capacity, or housing residential water service).';
comment on column catalysts.fiber_notes is 'Fiber/connectivity notes -- meaningful for any Potential-tier catalyst type.';
comment on column catalysts.natural_gas_notes is 'Natural gas infrastructure notes -- meaningful for any Potential-tier catalyst type (data-center behind-the-meter generation, or general utility service).';
