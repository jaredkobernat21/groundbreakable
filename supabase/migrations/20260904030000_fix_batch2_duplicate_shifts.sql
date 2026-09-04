-- Fixes a bug in 20260904020000_seed_real_topeka_shifts_batch2.sql: its
-- `insert into shifts ... from markets m, sources s where s.url like
-- '%pattern%'` joined against every row in `sources` matching that URL
-- pattern, not just the two rows the migration itself just inserted --
-- `sources` is shared across projects/opportunities/catalysts/shifts,
-- and already had pre-existing rows citing the exact same canonical
-- public URLs (the Shawnee County civilview foreclosure portal, the
-- city's street-projects page) from earlier, unrelated work on the old
-- pillar tables. The implicit cross join duplicated every batch-2
-- distress/infrastructure row once per matching source (5 rows -> 10,
-- 2 rows -> 8).
--
-- Fix here is data-only (delete the 11 duplicate rows, keep the ones
-- attached to the source rows batch 2 actually created), not a rewrite
-- of the already-applied migration -- migration history stays
-- append-only/immutable per project convention.

delete from shifts
where source_id in (
  '8f3dbf9f-70ab-4be6-b1f0-98a1c09baa53', -- pre-existing civilview source (unrelated to batch 2)
  'a552f334-ac52-4324-9d94-8d6d2a1985ee', -- pre-existing street_projects source #1
  '8f165f2d-5f5a-47e4-bdc3-bdfa48e07443', -- pre-existing street_projects source #2
  '446dec48-5227-477b-ae7c-5b6e0f47181e'  -- pre-existing street_projects source #3
);
