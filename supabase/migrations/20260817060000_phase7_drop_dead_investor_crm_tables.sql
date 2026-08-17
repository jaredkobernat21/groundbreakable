-- Phase 7, Tier 1: drops the tables left over from this project's
-- original investor-dashboard/CRM concept (predating the Plans/Potential
-- restructure) that turned out to have zero references anywhere in the
-- current app -- not a single query, not even a comment -- and zero
-- rows, confirmed directly against production immediately before this
-- migration:
--
--   submarkets, market_events, market_metrics, competitors, properties
--
-- Unlike everything else the restructure touched, these were never
-- superseded by a new table -- they were simply never built on. Nothing
-- reads them, nothing writes them, and there's no data to lose.
--
-- Explicitly NOT included here (see the architecture review's Phase 7
-- scoping): `leads` is still queried by a live (if unlinked) page, so
-- keeping or retiring it is a product decision, not a cleanup one.
-- projects.category/status, opportunities.signals[], opportunity_zones,
-- and project_updates all *look* superseded by the new schema but are
-- still the only thing the admin forms actually write to -- dropping
-- any of those today would break live functionality. Those wait for the
-- admin forms to be rewired first.

drop table if exists submarkets;
drop table if exists market_events;
drop table if exists market_metrics;
drop table if exists competitors;
drop table if exists properties;
