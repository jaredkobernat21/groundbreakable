-- Enhances the existing Potential Data Center Site card (Jared, 2026-10-03
-- clarification) -- purely additive, no existing column/constraint/value
-- touched, no other catalyst_type affected. Extends two real gaps found
-- while reviewing the current implementation:
--
-- 1. `water_cooling` has been one of the 8 scored factors
--    (lib/catalysts/potentialSiteCriteria.ts) since this type was created,
--    but never had its own free-text notes column the way power_notes/
--    fiber_notes/land_notes/risk_notes/incentives_notes/
--    development_environment_notes do -- water/cooling findings had no
--    labeled home in the detail panel. Fixed with `water_notes`.
-- 2. Natural gas / behind-the-meter generation potential was only ever a
--    sub-bullet inside the Power factor's checklist, never its own
--    display section. Fixed with `natural_gas_notes`, shown alongside
--    Power.
--
-- `potential_site_type` distinguishes a broad geographic zone ("area")
-- from a specific parcel/assemblage ("site") -- nullable, no default, so
-- it never forces a value onto a future row created without this field
-- in mind. Backfilled below only for the 4 rows that already exist as of
-- this migration, since all 4 are genuinely parcel/address-specific
-- (Bonner Springs Industrial Park, Leavenworth's Business & Technology
-- Park, Lansing's 85.484-acre rezoning, Rutherford County's Middle
-- Tennessee Industrial Center) -- "default to Potential Area unless
-- already parcel-specific," per instruction, and all 4 already are.
--
-- No column was added for "evidence status" (Verified/Indicated/Unknown)
-- -- that's implemented as an optional `status` key inside each element
-- of the existing `potential_score_components` jsonb array (see
-- lib/catalysts/potentialSiteCriteria.ts's updated PotentialScoreComponent
-- type), not a new column. jsonb has no fixed shape, so this needs no
-- migration at all and the 4 existing rows' components (which predate
-- this field) keep rendering exactly as before -- they just don't show an
-- evidence-status badge until re-scored with it.
--
-- "Time to Power," "Why This Is Surfacing," and "What Still Needs
-- Verification" are NOT new columns either -- they reuse
-- utility_timeline/utility_timeline_notes, why_it_matters, and
-- unknowns_to_verify respectively, all of which already existed. Only the
-- app code's labeling/layout changes for those three.

alter table catalysts
  add column water_notes text,
  add column natural_gas_notes text,
  add column potential_site_type text check (potential_site_type is null or potential_site_type in ('area', 'site'));

update catalysts
set potential_site_type = 'site'
where catalyst_type = 'prospective_data_center_site' and potential_site_type is null;
