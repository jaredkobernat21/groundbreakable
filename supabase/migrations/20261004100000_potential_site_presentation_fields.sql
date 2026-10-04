-- Developer-facing presentation update (Jared, 2026-10-04): two small, narrowly-scoped fields for
-- facts that currently only exist as prose buried inside research-process paragraphs
-- (power_notes), needed to render a clean one-line fact instead of parsing free text. This is the
-- ONLY schema change for the presentation update -- everything else is accomplished by shortening
-- the stored VALUES of already-existing text columns (serving_utility, zoning_status,
-- floodplain_status, gas_pipeline_operator, fiber_notes, water_notes, etc.) to be clean and
-- developer-facing rather than research-process narrative, done in a follow-up data migration.
-- The verbose, pass-by-pass research history is NOT deleted anywhere -- it remains permanently
-- in the prior migration files' SQL text and git history, which already serve as the durable
-- research audit trail; no separate admin-view schema/table was built for this, since one
-- effectively already exists in the repo.

alter table catalysts
  add column nearest_substation_name text,
  add column ownership_coverage text;

comment on column catalysts.nearest_substation_name is
  'Short clean fact for the POWER section, e.g. "Whippoorwill Substation (120 S. 110th St)" -- existence/type only, never implies capacity or distance (those are separate columns).';
comment on column catalysts.ownership_coverage is
  'full / partial / research_pending -- how much of the site''s ownership has been identified, distinct from ownership_complexity (how fragmented) and distinct from per-owner verification status (in owners[].notes).';
