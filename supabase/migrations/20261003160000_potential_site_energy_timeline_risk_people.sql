-- Potential Data Center Site: Energy/Timeline/Risk/People restructure
-- (Jared's product brief, 2026-10-03). Purely additive -- no existing
-- column, constraint, or row touched. The product framing for
-- catalyst_type = 'prospective_data_center_site' moves from the prior
-- Power/Site/Approval/Infrastructure pillar language to four clearer
-- categories: ENERGY, TIMELINE, RISK, PEOPLE. That regroup is almost
-- entirely a presentation-layer change (app code only) -- the 8 existing
-- scored factors and 3 approval sub-signals already cover Energy/Timeline/
-- Risk in full; see lib/catalysts/potentialSiteCriteria.ts's new
-- POTENTIAL_SITE_CATEGORY_FACTORS mapping. This migration adds only the
-- handful of fields that genuinely have no existing home.
--
-- 1. PEOPLE is entirely new -- the schema had no concept of ownership,
--    utility contacts, government contacts, or development-side contacts
--    at all. Structured as jsonb with no fixed-shape constraint, same
--    convention as potential_score_components: a researcher populates only
--    the fields actually found (owner name/entity/contact/outreach status/
--    site-control status, utility econ-dev contact, government/planning
--    contacts, developer/broker/EPC contacts), and the app's TypeScript
--    PeopleInfo type (not a DB constraint) defines the expected shape. Null
--    for all 7 existing Potential rows -- ownership/utility-contact
--    research is a genuine, not-yet-done next step for every one of them,
--    not a gap to paper over with invented contacts.
--
-- 2. READINESS is a new 5-stage concept (Discovery -> Qualified ->
--    Feasibility -> Controlled -> De-Risked) describing how much of the
--    site-control/utility/entitlement/environmental picture has actually
--    been validated, as opposed to potential_score (which describes how
--    strong the underlying fundamentals look on paper). Per Jared's
--    explicit instruction, stages must depend on actual supporting
--    evidence and are never auto-advanced -- so this column is left NULL
--    for all 7 existing rows rather than backfilled to 'discovery': every
--    one of them genuinely IS at Discovery (zero owner/utility outreach on
--    record for any of them), and the app defaults a null value to the
--    "Discovery" display rather than writing that value into every row by
--    convention. A future row only gets a non-null value once a researcher
--    has actual evidence of outreach/control/study progress.
--
-- 3. NEXT_STEPS is the site-specific, prioritized action list Jared's brief
--    calls for ("intelligent and site-specific rather than generic
--    boilerplate"). Left empty ('{}') for all 7 existing rows rather than
--    backfilled -- the app computes a reasonable fallback list from each
--    row's own unknowns_to_verify (turning an already-logged "Confirm X"
--    fact into "Confirm X with [utility/owner/etc.]" action phrasing) when
--    this column is empty, which is a presentation transform of existing
--    verified research, not new research or invented content.
--
-- 4. WHY_THIS_SITE is a new, tighter 2-4 sentence intelligence summary,
--    distinct from the existing why_it_matters column (which the panel
--    already displays, labeled "Why This Is Surfacing," reusing the same
--    field every other catalyst type uses for that purpose). Left null for
--    existing rows -- the app falls back to a short synthesized line built
--    from already-verified fields (opportunity_area/power_pillar_label/
--    utility_timeline), then to why_it_matters, so no existing row loses
--    its summary; a future row gets a real why_this_site once a researcher
--    writes one.
--
-- Confidence/evidence vocabulary (Verified/Reported/Estimated/Unknown) is
-- NOT a new column -- potential_score_components' existing optional
-- `status` key (jsonb, unstructured) already carries this per-factor, and
-- the TypeScript union (lib/catalysts/potentialSiteCriteria.ts) is simply
-- widened app-side to accept "reported"/"estimated" alongside the existing
-- "verified"/"indicated"/"unknown" -- no migration needed for that part.

alter table catalysts
  add column people jsonb,
  add column readiness_stage text check (
    readiness_stage is null or readiness_stage in ('discovery', 'qualified', 'feasibility', 'controlled', 'de_risked')
  ),
  add column readiness_notes text,
  add column next_steps text[] not null default '{}',
  add column why_this_site text;
