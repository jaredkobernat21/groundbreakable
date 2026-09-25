-- Extends the existing `catalysts` table (created 2026-08-12, before the
-- Plans/Opportunities redesign) with the fields Jared's CATALYST spec adds
-- that don't exist yet, and links catalysts back to Plans (shifts /
-- entitlement_cases -- neither existed as a concept when this table was
-- built). Purely additive: the 5 real Topeka rows already in this table
-- (J.M. Smucker, Magellan Financial, Reser's, Security Benefit, Link
-- Innovation Labs) stay valid with no backfill required -- every new
-- column is nullable or default-empty.

alter table catalysts
  add column expected_timeline text,
  add column why_it_matters text,
  add column development_impact text,
  -- Non-dollar scale, e.g. "1,200 housing units" or "1.2M sq ft" --
  -- estimated_value stays the $-only figure, this is the qualitative one.
  add column estimated_scale_note text,
  -- Related infrastructure/zoning/incentive/public-decision bullets --
  -- same "text[] of short bullets" convention as reasons[]/signals[]/
  -- staff_concerns[] elsewhere in this schema.
  add column related_context text[] not null default '{}',
  add column additional_source_ids uuid[] not null default '{}',
  -- Nullable dual-FK, same pattern as
  -- development_friction_cases.related_project_id/related_entitlement_case_id --
  -- a catalyst may originate from a Plan (either kind) or from neither
  -- (e.g. a major employer announcement with no formal case filed yet).
  add column related_shift_id uuid references shifts(id) on delete set null,
  add column related_entitlement_case_id uuid references entitlement_cases(id) on delete set null;

-- Widen catalyst_type to cover Jared's examples not already representable
-- (data centers, master-planned housing, industrial/logistics campuses,
-- TIF/incentive districts, land-unlocking annexations/rezonings).
alter table catalysts drop constraint catalysts_catalyst_type_check;
alter table catalysts add constraint catalysts_catalyst_type_check check (
  catalyst_type in (
    'major_employer', 'infrastructure_project', 'institutional', 'public_facility',
    'mixed_use_anchor', 'data_center', 'housing_development', 'industrial_logistics',
    'incentive_district', 'annexation_rezoning', 'other'
  )
);

-- Widen status to cover pre-planned ("proposed") and fallen-through
-- ("cancelled") catalysts -- the original 4-value set only covered a
-- catalyst already committed and moving forward.
alter table catalysts drop constraint catalysts_status_check;
alter table catalysts add constraint catalysts_status_check check (
  status in ('proposed', 'planned', 'under_construction', 'operating', 'completed', 'cancelled')
);
