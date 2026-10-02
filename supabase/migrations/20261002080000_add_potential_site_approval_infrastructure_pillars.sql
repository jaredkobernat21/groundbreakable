-- Restructures the Potential Data Center Site profile around 4 pillars
-- (Jared's clarification, 2026-10-02, same day as the type's creation):
-- POWER / SITE / APPROVAL / INFRASTRUCTURE. Explicit instruction: no new
-- top-level map categories for entitlement/community/approval/utility
-- timelines -- those become evaluation factors INSIDE every Potential
-- site's profile, not new map layers. The 3-stage map (Potential/Possible/
-- Planned) is unchanged by this migration.
--
-- Purely additive -- nothing from the prior migration
-- (20261002070000_add_potential_data_center_site_catalyst_type.sql) is
-- dropped or renamed. power_notes/fiber_notes/land_notes/risk_notes/
-- incentives_notes/development_environment_notes/potential_score/
-- potential_score_components all keep their existing meaning; this
-- migration only adds the genuinely new Approval/Infrastructure depth and
-- the two pillar-rollup labels (Power, Site) that had no home yet.
--
-- APPROVAL is explicitly "now a major factor" per Jared -- three
-- independently-evaluated sub-signals, each with its own label + evidence,
-- because a site can be High city-receptiveness and High community-
-- friction at the same time (conflicting signals a single rollup can't
-- capture on its own):
--   - entitlement_velocity: favorable/moderate/difficult/unknown -- based
--     on researching comparable major industrial/infrastructure/
--     manufacturing/warehouse/energy project timelines in that
--     jurisdiction (rezoning, CUP, planning commission, council,
--     annexation, development-agreement timelines; frequency of delays).
--   - city_receptiveness: high/moderate/low/unknown -- documented
--     evidence of city support for major investment (incentives offered,
--     public statements, infrastructure investment, industrial
--     recruitment, supportive planning policy).
--   - community_friction: low/moderate/high/unknown -- documented public
--     hearing opposition, petitions, organized resistance, lawsuits/
--     appeals, repeated controversy around comparable major development.
--     Never predicted without evidence -- 'unknown' is the honest default
--     when evidence is thin, not an assumption of support OR opposition.
-- approval_pillar_label is a SEPARATE holistic field (not a mechanical
-- rollup of the three) since a researcher may need to synthesize
-- conflicting sub-signals into one card-level word.
--
-- INFRASTRUCTURE is specifically about DELIVERY FEASIBILITY (utility
-- expansion requirements, interconnection process, published large-load
-- timelines, historical utility delivery timelines, transmission
-- upgrades, substation requirements, water/sewer extension, road
-- infrastructure, fiber extension, nearby infrastructure projects) --
-- distinct from POWER (does capacity/infrastructure exist at all) and
-- SITE (land/fiber/water characteristics of the parcel itself). Its
-- card-level pillar label IS utility_timeline directly (favorable/
-- moderate/long/unknown) -- Jared's spec names "Utility Timeline" as the
-- one headline metric for this whole pillar, so no separate rollup column
-- is needed.
--
-- Never invent a numeric MW figure, capacity figure, or delivery date --
-- every label here is a categorical, evidence-backed judgment, with
-- 'unknown' always available and expected when evidence is genuinely
-- thin (see each check constraint).

alter table catalysts
  -- Power/Site pillar rollups -- Approval's rollup is its own field below;
  -- Infrastructure's rollup is utility_timeline itself (see above).
  add column power_pillar_label text check (power_pillar_label is null or power_pillar_label in ('strong', 'moderate', 'weak', 'unknown')),
  add column site_pillar_label text check (site_pillar_label is null or site_pillar_label in ('strong', 'moderate', 'weak', 'unknown')),
  add column approval_pillar_label text check (approval_pillar_label is null or approval_pillar_label in ('favorable', 'moderate', 'difficult', 'unknown')),

  add column entitlement_velocity text check (entitlement_velocity is null or entitlement_velocity in ('favorable', 'moderate', 'difficult', 'unknown')),
  add column entitlement_velocity_notes text,

  add column city_receptiveness text check (city_receptiveness is null or city_receptiveness in ('high', 'moderate', 'low', 'unknown')),
  add column city_receptiveness_notes text,

  add column community_friction text check (community_friction is null or community_friction in ('low', 'moderate', 'high', 'unknown')),
  add column community_friction_notes text,

  add column utility_timeline text check (utility_timeline is null or utility_timeline in ('favorable', 'moderate', 'long', 'unknown')),
  add column utility_timeline_notes text;
