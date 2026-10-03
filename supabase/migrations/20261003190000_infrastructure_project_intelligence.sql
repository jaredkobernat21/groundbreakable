-- Infrastructure category: Project/Status/Timeline/Development Impact/
-- Impact Area/People/Opportunities (Jared's product brief, 2026-10-03).
-- Purely additive -- no existing column, constraint, or row touched. All
-- 37 existing catalyst_type = 'infrastructure_project' rows (confirmed
-- live before writing this migration) keep their exact current data;
-- every new column below is null/empty on all of them.
--
-- This category needed fewer new columns than the Data Center or Housing
-- Potential work earlier this session -- a direct read of all 37 existing
-- rows found every one already has a rich, specific `why_it_matters` and
-- `expected_timeline` written in exactly the voice this brief asks for
-- (e.g. "City's own CIP states sewer service has been 'the main hold up'
-- on development here..."). Those two existing generic columns are reused
-- directly for this brief's WHY IT MATTERS and TIMELINE sections -- no
-- fallback-synthesis function needed, unlike the two Potential tiers
-- (which had no existing prose to fall back on).
--
-- Also already built, zero new code needed: the IMPACT AREA map
-- visualization. `boundary` (admin-traced polygon) falling back to a
-- circle from `influence_radius_meters` (lib/geo.ts circlePolygon) is
-- already drawn on the national map for the selected catalyst via
-- NationalCatalystMap.tsx's existing CATALYST_AREA_SOURCE_ID fill/line
-- layers -- this migration only adds a short descriptive notes field for
-- the human-written "what land does this plausibly affect" narrative.
--
-- GENUINELY NEW:
--
-- 1. `infrastructure_type` + `infrastructure_subtype` -- the brief's TYPE
--    filter (Sewer/Water/Power/Natural Gas/Roads/Fiber/Transit/Airport/
--    Other) has no existing home: catalyst_type itself doesn't split
--    infrastructure into these sub-types today (every infrastructure
--    project, regardless of kind, is just 'infrastructure_project').
--    infrastructure_type is the enum driving the TYPE filter;
--    infrastructure_subtype is free prose for the finer technical detail
--    the brief's PROJECT section wants (e.g. "36-inch gravity sewer
--    interceptor, new lift station") -- never fabricate a technical
--    figure that isn't documented.
--
-- 2. `design` -- one new value added to the existing, shared
--    catalysts_status_check (status pipeline used by every catalyst
--    type). The brief's 7-stage infrastructure lifecycle (Conceptual/
--    Proposed/Funded/Design/Permitted-Bid/Under Construction/Complete) is
--    implemented as an app-only grouping of the existing 12(+1)-value
--    status column (lib/catalysts/infrastructureCriteria.ts
--    infrastructureStatusGroup -- mirrors catalystTypeColors.ts's
--    existing CATALYST_STAGE_GROUP, which does the identical kind of
--    lossy regroup for the Data Center Planned-stage filter), EXCEPT for
--    one genuine gap: nothing in the original 12 values represents
--    "engineering/environmental review/design work underway" -- every
--    other bucket already had a reasonable existing value to draw from.
--    Dropped and recreated the same way 20260930010000_refine_catalysts.sql
--    did when it last widened this list -- purely additive, no existing
--    row uses a value outside the old list, so none needs remapping.
--
-- 3. `development_impact_types` (text[], Housing/Data Center/Industrial/
--    Commercial/Mixed Use/Logistics/Other, multiple allowed) -- the
--    brief's structured classification of what KIND of development an
--    infrastructure project could unlock. Deliberately a NEW column, not
--    a repurposing of the existing `development_impact` free-text column
--    (which the generic admin form already uses, across every catalyst
--    type, for open-ended "Potential Development Impact" prose) -- reusing
--    it would silently change its meaning for every other category.
--    No DB-level CHECK constraint, matching the existing precedent for
--    this table's other array-valued columns (signal_categories,
--    related_context both have none either -- enforced in TypeScript,
--    not Postgres).
--
-- 4. `development_impact_level` (high/moderate/low/unknown) -- the
--    brief's companion evidence-based impact-level call. 'unknown' is the
--    honest default, matching every other confidence-style enum this
--    session (never predicted without evidence).
--
-- 5. `impact_area_notes` -- the human-written Impact Area narrative (e.g.
--    "Estimated 1,850 acres potentially affected"), with confidence
--    (VERIFIED/ESTIMATED/INFERRED) conveyed in-sentence, same convention
--    as every other notes field this session -- no separate structured
--    confidence column, since there's no scored-factor array here to
--    attach a badge to.
--
-- 6. `related_catalyst_ids` (uuid[]) + `opportunities_created_notes` --
--    the brief's OPPORTUNITIES CREATED section: a forward-compatible link
--    from an infrastructure project to the downstream Potential catalyst
--    rows (prospective_housing_site / prospective_data_center_site / a
--    future industrial-potential type) it helped create. Deliberately
--    just an array of IDs, resolved live against whatever catalyst rows
--    are already loaded in the app for category/name, rather than a
--    denormalized {id, category, name} blob that could go stale if the
--    linked site's title or category ever changes. Left empty on every
--    row -- per the brief's own explicit instruction, Groundbreakable
--    does NOT automatically generate or link Potential sites yet; this
--    is schema-only, for a future curated research pass to populate.
--
-- PEOPLE reuses the existing shared `people` jsonb column (already
-- generic across both Potential tiers) with no schema change -- jsonb has
-- no fixed shape, so widening the app-side `development` sub-object with
-- one new optional `contractor` field (a genuine infrastructure-world role
-- with no existing slot) needs no migration at all.

alter table catalysts drop constraint catalysts_status_check;
alter table catalysts add constraint catalysts_status_check check (
  status in (
    'rumored', 'under_study', 'site_selection', 'funding_incentives', 'land_acquired',
    'planning_entitlement', 'design', 'approved', 'construction_pending', 'under_construction',
    'operating', 'completed', 'cancelled'
  )
);

alter table catalysts
  add column infrastructure_type text check (
    infrastructure_type is null or infrastructure_type in
    ('sewer', 'water', 'power', 'natural_gas', 'roads', 'fiber', 'transit', 'airport', 'other')
  ),
  add column infrastructure_subtype text,
  add column development_impact_types text[] not null default '{}',
  add column development_impact_level text check (
    development_impact_level is null or development_impact_level in ('high', 'moderate', 'low', 'unknown')
  ),
  add column impact_area_notes text,
  add column related_catalyst_ids uuid[] not null default '{}',
  add column opportunities_created_notes text;
