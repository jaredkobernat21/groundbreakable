-- First real entitlement_cases rows, at zero new-research cost: converts
-- entitlement-flavored `shifts` rows already on file (Beacon Landing,
-- the D&S Land LLC/K-10&6th St annexation and its two companion
-- rezonings, KU Endowment's deferred airport-area annexation) plus one
-- already-sourced Douglas County precedent from
-- research/dan-lynch-emerging-area/report.md (Turformance rezoning) into
-- structured case records. Every fact below is copied from an existing
-- sourced row or the cited research report -- nothing here is estimated.
-- Numbers the source didn't state precisely (e.g. "1,000+ units per
-- reporting", exact annexation application dates) are deliberately left
-- null rather than rounded or guessed, matching the same principle
-- development_friction_signals and phase1_projects_stage_and_events were
-- built on.

-- New source: Turformance rezoning wasn't previously in `sources` --
-- it's new research-report material, not a Lawrence `shifts` row.
insert into sources (agency, title, source_type, url, published_date)
values (
  'Lawrence Journal-World',
  'Douglas County commissioners approve rezoning along Kansas Turnpike for landscaping business',
  'news',
  'https://www2.ljworld.com/news/county-government/2025/apr/02/douglas-county-commissioners-approve-rezoning-along-kansas-turnpike-for-landscaping-business/',
  '2025-04-02'
)
on conflict do nothing;

-- --- Case 1: Beacon Landing annexation/rezoning (288 ac, approved) --------
with target_market as (
  select id from markets where name = 'Lawrence' and state = 'KS'
),
pc_shift as (
  select id, source_id from shifts where market_id = (select id from target_market) and shift_type = 'annexation_rezoning' and event_date = '2026-07-20'
),
new_case as (
  insert into entitlement_cases (
    market_id, project_id, summary, address, acreage, latitude, longitude, planning_area,
    approval_type_id, requested_zoning, proposed_use,
    planning_commission_hearing_date, city_commission_hearing_date, final_decision_date,
    status, source_id, confidence
  )
  select
    tm.id,
    (select id from projects where market_id = tm.id and title = 'Beacon Landing'),
    'Landplan Engineering''s Beacon Landing proposal (reduced from an original 650-acre concept) annexed and rezoned 288 acres west of K-10, south of 6th St/US-40, mostly north of Bob Billings Parkway -- called "probably the largest single annexation request in the last three decades" by the city planner.',
    'West of K-10, south of 6th St, Lawrence, KS', 288, 38.971550078483, -95.273618892341, 'West Lawrence growth corridor (K-10 / Bob Billings Parkway)',
    (select id from entitlement_approval_types where market_id = tm.id and key = 'annexation'),
    '111 acres residential (density mix unspecified at request stage) + 126.7 acres Commercial Center District + 51 acres open space',
    'Mixed-use: residential (low/medium/high density) + commercial center + open space',
    '2026-07-20', '2026-08-18', '2026-08-18',
    'approved', '66188a9e-8a75-4242-867f-ef45be965d14', 'reported'
  from target_market tm
  returning id, market_id
),
ev_pc as (
  insert into entitlement_case_events (case_id, event_type, decision_body, event_date, outcome, note, source_id)
  select nc.id, 'planning_commission_hearing', 'planning_commission', '2026-07-20', 'recommended_approval',
    'Majority of commissioners voted in favor of all seven agenda items tied to the project, though not unanimously. Advanced to the City Commission for final approval.',
    (select source_id from pc_shift)
  from new_case nc
  returning id
),
ev_cc as (
  insert into entitlement_case_events (case_id, event_type, decision_body, event_date, outcome, note, source_id)
  select nc.id, 'city_commission_hearing', 'city_commission', '2026-08-18', 'approved',
    'Final mix: 70.1 acres low-density residential (R-2), 16.9 acres medium-density residential (R-3), 23.5 acres high-density residential (R-4), 126.7 acres commercial center, 51 acres open space.',
    '66188a9e-8a75-4242-867f-ef45be965d14'
  from new_case nc
  returning id
),
chg as (
  insert into entitlement_case_changes (case_id, dimension, requested_value, approved_value, change_summary, source_id)
  select nc.id, 'land_use_mix',
    '111 acres residential (density mix unspecified) + 126.7 acres commercial center + 51 acres open space',
    '70.1 ac low-density residential (R-2) + 16.9 ac medium-density residential (R-3) + 23.5 ac high-density residential (R-4) + 126.7 ac commercial center + 51 ac open space',
    'Residential acreage total shifted slightly (111 to 110.5 acres) and was split into specific R-2/R-3/R-4 zoning districts between Planning Commission recommendation (7/20) and City Commission approval (8/18); commercial and open-space acreage held steady.',
    '66188a9e-8a75-4242-867f-ef45be965d14'
  from new_case nc
),
party as (
  insert into entitlement_case_parties (case_id, role, company_name, source_id)
  select nc.id, 'engineer', 'Landplan Engineering', (select source_id from pc_shift)
  from new_case nc
  -- Note: reporting names Landplan Engineering as the applicant's engineer, not confirmed as developer/owner -- see investments row note.
)
select 1;

-- --- Case 2: D&S Land LLC annexation, K-10 & 6th St (177 ac, PC recommends denial, CC pending) ---
with target_market as (
  select id from markets where name = 'Lawrence' and state = 'KS'
),
src as (
  select id from sources where url = 'https://www2.ljworld.com/news/city-government/2026/aug/25/plan-to-annex-land-west-of-slt-for-housing-hits-a-snag-at-planning-commission-ku-annexation-near-airport-delayed/'
),
new_case as (
  insert into entitlement_cases (
    market_id, summary, address, acreage, planning_area,
    approval_type_id, existing_zoning, requested_zoning, proposed_use,
    planning_commission_hearing_date, status, source_id, confidence
  )
  select
    tm.id,
    'D & S Land LLC / Landplan Engineering request to annex ~177 acres at the southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway for a mix of homes and apartments (1,000+ units per reporting). Companion rezoning requests Z-26-0038 (76 ac AG-1 to R-3) and Z-26-0039 (38 ac AG-1 to R-5) were on the same Aug 24, 2026 Planning Commission agenda; their individual votes were not independently confirmed by news coverage. Kansas annexation law lets the City Commission override a Planning Commission recommendation, and coverage anticipated exactly that -- not yet resolved as of this research pass.',
    'Southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway, Lawrence, KS', 177, 'West Lawrence growth corridor (K-10 / Bob Billings Parkway), immediately adjacent to Beacon Landing',
    (select id from entitlement_approval_types where market_id = tm.id and key = 'annexation'),
    'AG-1 (per companion rezoning requests Z-26-0038/Z-26-0039; not all 177 acres independently confirmed as AG-1)',
    'Mix of R-3 and R-5 per companion rezoning requests (together covering 114 of the 177 annexation acres)',
    'Mix of homes and apartments (reported at 1,000+ units; not an exact figure)',
    '2026-08-24', 'pending', (select id from src), 'reported'
  from target_market tm
  returning id, market_id
),
ev as (
  insert into entitlement_case_events (case_id, event_type, decision_body, event_date, outcome, motion_text, vote_yes, vote_no, note, source_id)
  select nc.id, 'planning_commission_hearing', 'planning_commission', '2026-08-24', 'recommended_denial',
    'Motion to recommend denial of the annexation, citing conflict with the city''s Plan 2040 comprehensive plan.',
    4, 3,
    'Kansas annexation law lets the City Commission override a Planning Commission recommendation; coverage anticipated exactly that request. Not yet resolved as of this research pass -- watch the City Commission agenda.',
    (select id from src)
  from new_case nc
),
party1 as (
  insert into entitlement_case_parties (case_id, role, company_name, source_id)
  select nc.id, 'landowner', 'D & S Land LLC', (select id from src) from new_case nc
),
party2 as (
  insert into entitlement_case_parties (case_id, role, company_name, source_id)
  select nc.id, 'applicant', 'Landplan Engineering', (select id from src) from new_case nc
)
select 1;

-- --- Cases 3 & 4: companion rezonings on the same Aug 24, 2026 agenda -----
-- Real, confirmed case numbers (Z-26-0038, Z-26-0039) and requested zoning
-- change; individual vote outcome intentionally left unrecorded -- news
-- coverage confirmed the annexation's 4-3 vote but explicitly did not
-- confirm these two rezoning items' individual votes.
with target_market as (
  select id from markets where name = 'Lawrence' and state = 'KS'
),
src as (
  select id from sources where url = 'https://www2.ljworld.com/news/city-government/2026/aug/25/plan-to-annex-land-west-of-slt-for-housing-hits-a-snag-at-planning-commission-ku-annexation-near-airport-delayed/'
)
insert into entitlement_cases (
  market_id, case_number, summary, address, acreage, planning_area,
  approval_type_id, existing_zoning, requested_zoning, proposed_use,
  planning_commission_hearing_date, status, source_id, confidence
)
select tm.id, v.case_number, v.summary,
  'Southwest corner of K-10 and W 6th St / K-10 and Bob Billings Parkway, Lawrence, KS', v.acreage,
  'West Lawrence growth corridor (K-10 / Bob Billings Parkway)',
  (select id from entitlement_approval_types where market_id = tm.id and key = 'rezoning'),
  'AG-1', v.requested_zoning, 'Residential (part of the companion D & S Land LLC annexation)',
  '2026-08-24', 'pending', (select id from src), 'reported'
from target_market tm
cross join (values
  ('Z-26-0038', 76, 'R-3', 'Companion rezoning to the D & S Land LLC / Landplan Engineering 177-acre annexation request (K-10 & 6th St): 76 acres from AG-1 to R-3. On the same Aug 24, 2026 Planning Commission agenda as the annexation''s 4-3 recommend-denial vote; this item''s individual outcome was not independently confirmed by news coverage.'),
  ('Z-26-0039', 38, 'R-5', 'Companion rezoning to the D & S Land LLC / Landplan Engineering 177-acre annexation request (K-10 & 6th St): 38 acres from AG-1 to R-5. On the same Aug 24, 2026 Planning Commission agenda as the annexation''s 4-3 recommend-denial vote; this item''s individual outcome was not independently confirmed by news coverage.')
) as v(case_number, acreage, requested_zoning, summary)
on conflict (market_id, case_number) where case_number is not null do nothing;

-- --- Case 5: KU Endowment annexation near the airport (137 ac, deferred) --
with target_market as (
  select id from markets where name = 'Lawrence' and state = 'KS'
),
ku_shift as (
  select id, source_id from shifts where market_id = (select id from target_market) and shift_type = 'annexation_deferred'
),
new_case as (
  insert into entitlement_cases (
    market_id, summary, address, acreage, planning_area,
    approval_type_id, planning_commission_hearing_date, status, source_id, confidence
  )
  select
    tm.id,
    'KU Endowment sought to annex ~137 acres across two parcels at 1593 N 1900 Rd, near Lawrence Regional Airport, citing "speculative economic opportunities" and interest from groups wanting airport/research-university proximity. No specific project exists yet -- the organization asked to defer to revise the application. Rezoning and site-development applications would still be required if annexation eventually succeeds.',
    '1593 N 1900 Rd, Lawrence, KS', 137, 'Near Lawrence Regional Airport',
    (select id from entitlement_approval_types where market_id = tm.id and key = 'annexation'),
    '2026-08-24', 'deferred', (select source_id from ku_shift), 'reported'
  from target_market tm
  returning id
),
ev as (
  insert into entitlement_case_events (case_id, event_type, decision_body, event_date, outcome, note, source_id)
  select nc.id, 'planning_commission_deferral', 'planning_commission', '2026-08-24', 'deferred',
    'Deferred at the applicant''s request; no decision made.',
    (select source_id from ku_shift)
  from new_case nc
),
party as (
  insert into entitlement_case_parties (case_id, role, company_name, source_id)
  select nc.id, 'applicant', 'KU Endowment', (select source_id from ku_shift) from new_case nc
)
select 1;

-- --- Case 6: Turformance Lawn Services rezoning (Douglas County, approved) ----
-- Unincorporated Douglas County, not City of Lawrence -- included per the
-- product brief's explicit instruction to incorporate Douglas County
-- records that affect annexation/fringe development for this market, and
-- consistent with this market already carrying county-adjacent growth-
-- corridor items (see the Beacon Landing / D&S Land investments notes).
with target_market as (
  select id from markets where name = 'Lawrence' and state = 'KS'
),
src as (
  select id from sources where url = 'https://www2.ljworld.com/news/county-government/2025/apr/02/douglas-county-commissioners-approve-rezoning-along-kansas-turnpike-for-landscaping-business/'
),
new_case as (
  insert into entitlement_cases (
    market_id, summary, address, acreage, planning_area,
    approval_type_id, proposed_use, final_decision_date, status, source_id, confidence
  )
  select
    tm.id,
    'Approved rezoning of 18 acres at the K-10/Kansas Turnpike interchange (unincorporated Douglas County) for Turformance Lawn Services, a landscaping business. County commissioners approved despite voicing their own concern it "opens the door" to more county-side industrial rezoning outside city control -- a site the 2022 K-10 & Farmers Turnpike Area Plan had already flagged for eventual industrial/commercial use anticipating annexation.',
    'K-10 / Kansas Turnpike interchange, unincorporated Douglas County, KS', 18, 'K-10 / Farmers Turnpike interchange (unincorporated Douglas County)',
    (select id from entitlement_approval_types where market_id = tm.id and key = 'rezoning'),
    'Landscaping business (Turformance Lawn Services)', '2025-04-02', 'approved', (select id from src), 'reported'
  from target_market tm
  returning id
)
insert into entitlement_case_events (case_id, event_type, decision_body, event_date, outcome, note, source_id)
select nc.id, 'county_commission_hearing', 'county_commission', '2025-04-02', 'approved',
  'Approved despite commissioners'' own stated concern it "opens the door" to more county-side industrial rezoning outside city control.',
  (select id from src)
from new_case nc;
