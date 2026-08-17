-- Phase 7, Tier 3 (part 3): stops deriving plan_category/stage from
-- category/status via trigger, and makes category/status nullable so the
-- admin write paths can stop supplying them.
--
-- Found while rewiring the admin form: the trigger's
-- `new.plan_category := case new.category ...` runs unconditionally in a
-- BEFORE INSERT trigger, which means it silently overwrites any explicit
-- plan_category an INSERT statement already set. review-queue/actions.ts
-- has been setting plan_category/project_type/stage explicitly from the
-- collection pipeline's own extraction since Phase 6 -- and the trigger
-- has been clobbering that explicit value back to its own category-based
-- guess on every single approval. It's gone unnoticed only because both
-- paths happen to agree today (every case reaching that pipeline is a
-- land-use action, and legacyCategory's mapping and the real
-- extracted_plan_category both land on 'land_use'). Rather than patch the
-- trigger to guard around this, every write path now sets
-- plan_category/project_type/stage explicitly and directly -- the
-- correct end state per the Phase 1 architecture review, and the
-- direction review-queue/actions.ts was already headed.
--
-- category/status stay as real, readable columns (existing rows keep
-- their values, nothing here touches existing data) -- just no longer
-- required for new rows, since the admin form is being rewired in this
-- same phase to stop collecting the old 6-value category in favor of
-- plan_category directly.

drop trigger if exists projects_derive_plan_category_and_stage on projects;
drop function if exists public.derive_project_plan_category_and_stage();

alter table projects alter column category drop not null;
alter table projects alter column status drop not null;
