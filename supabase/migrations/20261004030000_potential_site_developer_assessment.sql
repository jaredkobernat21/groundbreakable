-- Final Developer Assessment (Jared, 2026-10-04 research-quality brief): the one genuinely new
-- concept from this brief with no existing field -- a bottom-line go/no-go recommendation tier,
-- distinct from everything already on the row:
--   * potential_score -- how suitable the site LOOKS on paper
--   * readiness_stage -- how much diligence has actually been VALIDATED through real work
--   * developer_assessment (this migration) -- Groundbreakable's own bottom-line call on whether
--     a developer should pursue this site right now, given everything above
-- Nullable, never auto-computed from potential_score -- a researcher's own synthesis, same
-- human-curated-judgment convention as readiness_stage/why_still_potential. Meaningful only for
-- 'prospective_data_center_site' rows (and reusable by 'prospective_housing_site' later if
-- wanted -- no type-specific constraint added here, matching how readiness_stage/next_steps are
-- already shared generic columns).

alter table catalysts
  add column developer_assessment text,
  add column developer_takeaway text;

comment on column catalysts.developer_assessment is
  'Strong Pursuit / Pursue / Watch / Weak / Disqualified -- Groundbreakable''s own bottom-line recommendation, synthesized from Power/Land/Site Control/Entitlement/BTM Energy/Fiber/Water/Physical Constraints. Never auto-derived from potential_score.';
comment on column catalysts.developer_takeaway is
  '3-5 sentence plain-language summary: why it could work, what is verified vs. only indicated, what could kill it, who controls the land, who serves the infrastructure, what a developer should do next.';
