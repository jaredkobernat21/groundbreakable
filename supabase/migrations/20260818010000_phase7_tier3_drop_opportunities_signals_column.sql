-- Phase 7, Tier 3 (part 7): drops opportunities.signals[], now that the
-- admin Opportunities form writes directly to the `signals` table
-- instead of the array (see admin/opportunities/actions.ts) and every
-- read path (map, AskBar, admin list) already hydrates live signals
-- from that table (Tier 3 part 4).
--
-- Confirmed the array and the signals table were in exact sync before
-- writing this: 34 total signal entries across 23 opportunities.signals
-- arrays, 34 matching rows in the signals table -- nothing unique in
-- the array, safe to drop outright, same reasoning as opportunity_zones.
--
-- Unlike opportunity_zones, this column carried a real guarantee (NOT
-- NULL, array_length >= 1) that a fully-resolved opportunity has no
-- equivalent for anymore -- discussed directly: once every signal on an
-- opportunity resolves, it should simply stop showing up as an
-- opportunity (it's no longer "worth a closer look"), so every read
-- path now filters those out instead of falling back to a frozen value.

drop trigger if exists opportunities_sync_signals on opportunities;
drop function if exists public.sync_opportunity_signals();
alter table opportunities drop constraint if exists opportunities_signals_not_empty;
alter table opportunities drop constraint if exists opportunities_signals_valid;
drop index if exists opportunities_market_signals_idx;
alter table opportunities drop column if exists signals;
