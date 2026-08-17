-- Phase 7, Tier 3 (part 1): drops `project_updates`, now that Phase 6.5
-- rewired the admin intelligence form to write directly to project_events
-- (see actions.ts) instead. Confirmed zero remaining reads or writes
-- against project_updates anywhere in dashboard/src before writing this --
-- project_events already carries every historical row (backfilled in
-- Phase 1) and everything written since.
--
-- The mirror trigger/function exist only to keep project_events current
-- while project_updates was still the live write path; with nothing
-- inserting into project_updates anymore, both are dead along with the
-- table.
--
-- projects.category/status, opportunities.signals[], and
-- opportunity_zones stay out of scope here -- they're still what live
-- admin forms and pages read/write today (see Phase 7 Tier 1's
-- migration comment); nothing reads their new-schema counterparts yet.

drop trigger if exists project_updates_mirror_to_events on project_updates;
drop function if exists public.mirror_project_update_to_event();
drop table if exists project_updates;
