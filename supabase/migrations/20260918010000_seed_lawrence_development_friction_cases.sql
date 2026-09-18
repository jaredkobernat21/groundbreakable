-- Two real, fully-sourced Development Friction cases for Lawrence, KS,
-- mined from data already collected by the automated CivicWeb entitlement
-- pipeline (see entitlement_cases) plus one already-sourced news article --
-- no new research, no invented facts. IDs below were confirmed by direct
-- query against the live database on 2026-09-18 before writing this file.

-- --- Case 1: Sixth & Monterey Way PCD (PDP-22-00178) ------------------------
-- A real connectivity-variance denial: Planning Commission denied (6-3) a
-- variance that would have let the applicant skip connecting Morgan Lane
-- to Comet Lane per Subdivision Regulations Sec. 20-810(e)(2)(i); the
-- overall preliminary development plan was then approved unanimously
-- (9-0) with that street connection required as a condition. Reuses the
-- already-scraped entitlement_cases row and its source verbatim.
insert into development_friction_cases (
  market_id, project_name, address, developer_name, project_type,
  original_plan_summary,
  friction_type, concerns, decision_makers,
  response_summary,
  outcome, final_plan_summary,
  impact_added_conditions,
  severity,
  related_entitlement_case_id,
  source_id, confidence
) values (
  '068b61e6-d717-483c-9fa7-1e814b98d850',
  'Sixth & Monterey Way PCD',
  '800 Monterey Way, Lawrence, KS',
  'Allen Belot Architect (on behalf of Beverly G. & Robert J. Morgan, property owners)',
  'commercial',
  'Preliminary development plan (PDP-22-00178) for changes to approximately 1.7 acres at the southeast corner of Monterey Way and W. 6th Street, including a requested variance from Subdivision Regulations Sec. 20-810(e)(2)(i) to avoid connecting Morgan Lane to Comet Lane.',
  'infrastructure_concern',
  array['Subdivision Regulations Sec. 20-810(e)(2)(i) requires collector-street connectivity; the applicant sought a variance to skip connecting Morgan Lane to Comet Lane, which Planning Commission majority declined to grant.'],
  array['Lawrence-Douglas County Planning Commission'],
  'Applicant proceeded with the preliminary development plan and a separate parking-requirement modification after the connectivity variance was denied, rather than withdrawing or appealing.',
  'modified',
  'Preliminary development plan and parking-requirement modification approved unanimously (9-0), with the Morgan Lane-Comet Lane street connection required as a condition of approval.',
  array['Required street connection between Morgan Lane and Comet Lane'],
  'low',
  'a8d93761-d99c-46ec-b49a-9715c637beb2',
  '2c25f8db-a9a4-4ec5-bafb-8e4ef2364392', 'verified'
);

insert into development_friction_timeline_events (friction_case_id, event_date, description, source_id, confidence)
select id, '2022-12-21', 'Item deferred by Planning Commission.', '2c25f8db-a9a4-4ec5-bafb-8e4ef2364392', 'verified'
from development_friction_cases where related_entitlement_case_id = 'a8d93761-d99c-46ec-b49a-9715c637beb2';

insert into development_friction_timeline_events (friction_case_id, event_date, description, source_id, confidence)
select id, '2023-01-25', 'Continued from a Jan 25, 2023 meeting that was suspended before resolution.', '2c25f8db-a9a4-4ec5-bafb-8e4ef2364392', 'verified'
from development_friction_cases where related_entitlement_case_id = 'a8d93761-d99c-46ec-b49a-9715c637beb2';

insert into development_friction_timeline_events (friction_case_id, event_date, description, source_id, confidence)
select id, '2023-02-22', 'Planning Commission denied the Morgan Lane-Comet Lane connectivity variance 6-3 (Ayes: Carpenter, Carttar, Ashworth, Duvvur, Hayden, Munch; Nays: Rexroad, Kelso, Thomas), then approved the preliminary development plan and parking modification unanimously 9-0.', '2c25f8db-a9a4-4ec5-bafb-8e4ef2364392', 'verified'
from development_friction_cases where related_entitlement_case_id = 'a8d93761-d99c-46ec-b49a-9715c637beb2';

-- --- Case 2: K-10 & 6th Street / Bob Billings Pkwy Annexation (177 ac) ------
-- A real, still-unresolved recommend-denial: Planning Commission voted
-- 4-3 to recommend denial of a 177-acre annexation for housing, citing
-- conflict with the Plan 2040 comprehensive plan. Kansas law lets City
-- Commission override a Planning Commission recommendation, so this is
-- genuinely pending, not concluded -- reflected honestly as outcome
-- 'pending' with no final_plan_summary.
insert into development_friction_cases (
  market_id, project_name, address, developer_name, project_type,
  original_plan_summary,
  friction_type, concerns, decision_makers,
  response_summary,
  outcome,
  severity,
  related_entitlement_case_id,
  source_id, confidence
) values (
  '068b61e6-d717-483c-9fa7-1e814b98d850',
  'K-10 & 6th Street / Bob Billings Pkwy Annexation (177 acres)',
  'Southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway, Lawrence, KS',
  'Landplan Engineering (on behalf of D & S Land LLC, property owner)',
  'residential',
  'Landplan Engineering, on behalf of D & S Land LLC, sought to annex approximately 177 acres at the southwest corner of K-10 and W. 6th Street / Bob Billings Parkway for housing development.',
  'planning_commission',
  array['Planning Commission majority found the annexation conflicts with the city''s Plan 2040 comprehensive plan.'],
  array['Lawrence-Douglas County Planning Commission', 'Lawrence City Commission'],
  'No further applicant response documented as of this research pass; Kansas law allows the City Commission to override a Planning Commission recommend-denial vote, and City Commission action was expected but not yet confirmed.',
  'pending',
  'medium',
  '61a2aed1-32e5-443d-a71a-bea19be797e3',
  '2d67d287-bd37-4294-95f5-ac6371fac91a', 'reported'
);

insert into development_friction_timeline_events (friction_case_id, event_date, description, source_id, confidence)
select id, '2026-08-24', 'Planning Commission voted 4-3 to recommend denial of the annexation, citing conflict with the Plan 2040 comprehensive plan.', '2d67d287-bd37-4294-95f5-ac6371fac91a', 'reported'
from development_friction_cases where related_entitlement_case_id = '61a2aed1-32e5-443d-a71a-bea19be797e3';

-- --- Case 3: Maine's 11th Street Addition (MS-23-00165) ---------------------
-- A real, fully-documented right-of-way variance denial: the applicant
-- sought a reduced 50-foot right-of-way width for Fambrough Drive (vs.
-- the Sec. 20-810(e)(5) minimum collector-street standard); Planning
-- Commission denied the variance unanimously, which per the record's own
-- text meant the property owner had to dedicate the additional 5 feet of
-- right-of-way to meet the standard.
insert into development_friction_cases (
  market_id, project_name, address, project_type,
  original_plan_summary,
  friction_type, concerns, decision_makers,
  outcome, final_plan_summary,
  impact_added_conditions,
  severity,
  related_entitlement_case_id,
  source_id, confidence
) values (
  '068b61e6-d717-483c-9fa7-1e814b98d850',
  'Maine''s 11th Street Addition',
  '1030 Maine Street, Lawrence, KS',
  'residential',
  'Minor subdivision (MS-23-00165) including a requested variance from Subdivision Regulations Sec. 20-810(e)(5) to allow a reduced 50-foot right-of-way width for Fambrough Drive, instead of the standard minimum for collector streets.',
  'infrastructure_concern',
  array['Minimum right-of-way width standard for collector streets (Subdivision Regulations Sec. 20-810(e)(5)) was not waived; a reduced 50-foot width was sought instead of the standard requirement.'],
  array['Lawrence-Douglas County Planning Commission'],
  'denied',
  'Variance denied unanimously (7-0); per the record, denial meant the property owner was required to dedicate an additional 5 feet of right-of-way along Fambrough Drive to meet the minimum standard.',
  array['Required dedication of 5 additional feet of right-of-way along Fambrough Drive'],
  'low',
  'ad28ee31-5fe8-4c3b-96bd-b9ffdbb13a98',
  'bf2f5cb4-c216-4710-b4d0-f9be66a0256e', 'verified'
);

insert into development_friction_timeline_events (friction_case_id, event_date, description, source_id, confidence)
select id, '2023-07-26', 'Planning Commission denied the right-of-way width variance unanimously (7-0), requiring the additional right-of-way dedication.', 'bf2f5cb4-c216-4710-b4d0-f9be66a0256e', 'verified'
from development_friction_cases where related_entitlement_case_id = 'ad28ee31-5fe8-4c3b-96bd-b9ffdbb13a98';

-- --- Case 4: Jayhawk Club Lot 5 (DP-25-0005) --------------------------------
-- A real, outright denial: City Commission voted 4-1 to accept the
-- Planning Commission's recommendation to deny this preliminary
-- development plan. Included deliberately with a caveat rather than a
-- guessed reason -- the scraped minutes record captures the vote itself
-- but not the underlying planning objection, and that gap is stated
-- honestly in `concerns` rather than invented.
insert into development_friction_cases (
  market_id, project_name, address, developer_name, project_type,
  original_plan_summary,
  friction_type, concerns, decision_makers,
  response_summary,
  outcome, final_plan_summary,
  impact_project_failed,
  severity,
  related_entitlement_case_id,
  source_id, confidence
) values (
  '068b61e6-d717-483c-9fa7-1e814b98d850',
  'Jayhawk Club Lot 5',
  '1840 Crossgate Dr, Lawrence, KS',
  'Adams Architects, LLC (on behalf of Eagle 1968 LC, property owner)',
  'multifamily',
  'Preliminary development plan (DP-25-0005) for a proposed multiunit dwelling residential development at 1840 Crossgate Dr.',
  'planning_commission',
  array['The scraped minutes record captures the City Commission''s vote to deny (accepting the Planning Commission''s recommendation) but does not state the underlying planning objection in the text collected here.'],
  array['Lawrence-Douglas County Planning Commission', 'Lawrence City Commission'],
  'City Commission accepted the Planning Commission''s recommendation to deny rather than sending the plan back for revision.',
  'denied',
  'Application denied; no revised or resubmitted plan documented as of this research pass.',
  false,
  'medium',
  '7a43e456-2afa-46d8-97e2-6f55057f664b',
  'ae4f931e-f354-4ef3-9745-09fc29a3bba2', 'verified'
);

insert into development_friction_timeline_events (friction_case_id, event_date, description, source_id, confidence)
select id, '2025-12-09', 'City Commission voted 4-1 to accept the Planning Commission''s recommendation to deny the preliminary development plan.', 'ae4f931e-f354-4ef3-9745-09fc29a3bba2', 'verified'
from development_friction_cases where related_entitlement_case_id = '7a43e456-2afa-46d8-97e2-6f55057f664b';
