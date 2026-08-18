-- Phase 7, Tier 3 (part 6): drops `opportunity_zones`, now that the admin
-- Opportunity Zones form writes directly to `zoning_land_use` instead
-- (see admin/opportunity-zones/actions.ts) and every read path (the
-- map's Favorable Zoning layer, the admin list) already switched over.
-- Confirmed zero remaining reads or writes against opportunity_zones
-- anywhere in dashboard/src before writing this.
--
-- Unlike projects.category/status (kept -- dropping those would discard
-- real distinguishing values the new schema can't fully reconstruct),
-- opportunity_zones is safe to drop outright: its 3 real Topeka rows are
-- already faithfully mirrored into zoning_land_use (titles/district
-- codes/geometry all match, confirmed directly against production
-- before writing this), so nothing unique is lost -- same reasoning
-- that justified dropping project_updates once project_events fully
-- absorbed it.
--
-- The sync trigger exists only to keep zoning_land_use current while
-- opportunity_zones was still the live write path; with nothing
-- inserting into opportunity_zones anymore, both it and the table are
-- dead.

drop trigger if exists opportunity_zones_sync_zoning_land_use on opportunity_zones;
drop function if exists public.sync_opportunity_zone_to_zoning_land_use();
drop table if exists opportunity_zones;
