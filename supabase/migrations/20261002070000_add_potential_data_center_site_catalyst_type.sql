-- Adds a third Data Center stage: POTENTIAL (Jared's full spec, 2026-10-02).
-- Purely additive -- no existing rows touched, no columns dropped.
--
-- NAMING COLLISION this migration resolves: the dashboard already had a
-- "Possible" concept (lib/catalysts/dcStage.ts, collapsed to 2 stages
-- earlier the same day) built on standing infrastructure capacity with NO
-- activity required -- which is almost word-for-word what Jared's new spec
-- calls POTENTIAL. Meanwhile the existing catalyst_type literally named
-- 'potential_data_center' is an *active, forming-signal* investigation
-- (land assembly, substations being built NOW, LLC land purchases, etc.) --
-- which is what Jared's new spec calls POSSIBLE. Renaming the
-- 'potential_data_center' enum value itself would be disruptive (15+ live
-- rows across 5 markets, referenced throughout score.ts/dataCenterSignal.ts/
-- dcStage.ts/CATALYST_SIGNAL_BIBLE.md) for zero functional benefit, so the
-- DB value keeps its name -- only the UI-facing label changes (app code,
-- not this migration) from "Potential Data Center (unconfirmed)" to
-- "Possible Data Center (unconfirmed signal)" to match the new 3-tier
-- vocabulary. The genuinely NEW thing gets its own, unambiguous enum value:
-- 'prospective_data_center_site' (DB name) / "Potential Data Center Site"
-- (UI label) / dcStage 'potential' (map/filter stage).
--
-- New columns are meaningful only for catalyst_type =
-- 'prospective_data_center_site' -- empty/null for every other type, same
-- convention as signal_categories/signal_confidence/power_load_mw already
-- established for 'potential_data_center'. potential_score and
-- potential_score_components are a SEPARATE scoring system from
-- catalyst_score (lib/catalysts/score.ts) -- different rubric entirely
-- (Power 30% / Land 15% / Fiber 15% / Government+Incentives 10% /
-- Development+Entitlement 10% / Physical+Environmental Risk 10% /
-- Water+Cooling 5% / Transportation+Workforce 5%, see
-- lib/catalysts/potentialSiteCriteria.ts), so it gets its own field rather
-- than overloading catalyst_score's existing meaning.
--
-- `status` has no vocabulary value that actually fits "a site with strong
-- fundamentals and zero known activity" (the whole 12-value pipeline
-- describes an actual project's lifecycle) -- 'under_study' is the closest
-- honest fit (Groundbreakable studying the site's fundamentals, not the
-- site having been "rumored"), used as this type's conventional default
-- rather than adding a 13th status value for one catalyst_type.

alter table catalysts drop constraint catalysts_catalyst_type_check;
alter table catalysts add constraint catalysts_catalyst_type_check check (
  catalyst_type in (
    'major_employer', 'infrastructure_project', 'institutional', 'public_facility',
    'mixed_use_anchor', 'data_center', 'potential_data_center', 'prospective_data_center_site',
    'housing_development', 'industrial_logistics', 'incentive_district', 'annexation_rezoning', 'other'
  )
);

alter table catalysts
  -- 0-100, human-assigned per the documented 8-factor weighted rubric --
  -- never computed from a formula the way catalyst_score mostly is,
  -- since factors like "terrain flatness" or "government attitude" aren't
  -- boolean columns this schema has. Nullable until an admin/researcher
  -- has actually scored it.
  add column potential_score int check (potential_score is null or (potential_score >= 0 and potential_score <= 100)),
  -- Array of {key, label, weight, maxPoints, points, evidence: string[],
  -- unknowns: string[]} per factor (see PotentialScoreComponent in
  -- lib/catalysts/potentialSiteCriteria.ts) -- keeps the score explainable
  -- and keeps "don't display false precision" enforceable (a factor with
  -- no real evidence should carry 0 points and a populated `unknowns`
  -- list, not a guessed number).
  add column potential_score_components jsonb,
  -- The specific parcel, industrial area, utility corridor, or approximate
  -- geographic zone within the market -- distinct from `address`, which
  -- continues to hold the city/county/state-level "Location."
  add column opportunity_area text,
  add column power_notes text,
  add column fiber_notes text,
  add column land_notes text,
  add column incentives_notes text,
  add column development_environment_notes text,
  add column risk_notes text,
  -- Explicit list of what still needs utility/fiber/engineering/
  -- environmental/jurisdictional confirmation -- an empty array here on a
  -- 'prospective_data_center_site' row is itself a red flag (every real
  -- Potential write-up should have unknowns; a site with none logged
  -- hasn't actually been researched yet).
  add column unknowns_to_verify text[] not null default '{}',
  -- The mandatory disclaimer statement every Potential row must carry --
  -- e.g. "No credible public evidence was identified indicating that a
  -- data center is currently proposed, planned, or being pursued at this
  -- location." Required in spirit (enforced by convention/review, not a
  -- NOT NULL constraint, to avoid a migration-time backfill problem for
  -- any future row created before this gets wired into the admin form).
  add column why_still_potential text;
