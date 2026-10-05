-- Collapses catalysts.readiness_stage from the original 5-stage set (discovery/qualified/
-- feasibility/controlled/de_risked, added in 20261003160000_potential_site_energy_timeline_risk_people.sql)
-- to a 4-stage set (discovery/screened/qualified/advanced_diligence), per Jared's 2026-10-05 Data
-- Center Potential master spec (docs/POTENTIAL_DATA_CENTER_RESEARCH_SPEC.md section 27/A19).
-- "qualified" moves from position 2 to position 3 in the real progression -- it now means "most
-- major PUBLIC diligence supports advancement," downstream of the new "screened" stage, not
-- upstream of feasibility conversations. No live row has ever had this column set to anything but
-- null (confirmed via a live query before writing this migration), so this is a safe rename/
-- reorder of the allowed-values constraint, not a data migration -- every existing row keeps
-- rendering via the null-defaults-to-discovery convention untouched.

alter table catalysts drop constraint catalysts_readiness_stage_check;
alter table catalysts add constraint catalysts_readiness_stage_check check (
  readiness_stage is null or readiness_stage in ('discovery', 'screened', 'qualified', 'advanced_diligence')
);
