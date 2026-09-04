-- Real, sourced Lawrence, KS shifts (pilot batch) -- 8 shifts across 4 of
-- 5 categories. Same "never fabricate missing information" discipline as
-- the Topeka batches. Compliance has zero rows: Lawrence's code-
-- compliance data lives inside "Citizen Connect", a JS-rendered Socrata
-- Connect app with no discoverable public API (unlike Topeka's plain
-- Cityworks REST services) -- see reference_topeka_public_data_sources
-- memory for the full source list, including the Colorado dcsheriff.net
-- false-positive caught and discarded during this research (Douglas
-- County, KS's real sheriff-sale source is dgcoks.gov, not dcsheriff.net
-- which is Douglas County, Colorado).
--
-- Each `insert into shifts` below joins its source via a CTE keyed to
-- the exact row just inserted (not a `sources.url like` pattern) --
-- the batch-2 Topeka migration cross-joined against unrelated
-- pre-existing sources sharing the same URL and had to be corrected
-- after the fact; this pattern makes that class of bug impossible.

with market as (
  select id from markets where slug = 'lawrence-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('The Lawrence Times', 'City Commission approves Beacon Landing annexation', 'news',
     'https://lawrencekstimes.com/2026/08/18/citycomm-oks-beacon-landing-annexation/', '2026-08-18'),
    ('The Lawrence Times', 'KU Endowment defers annexation request', 'news',
     'https://lawrencekstimes.com/2026/08/24/ku-endowment-defers-annexation-request/', '2026-08-24'),
    ('Douglas County Sheriff''s Office', 'Notice of Sheriff''s Sale, Case No. DG-2025-CV-000-258', 'public_record',
     'https://www.dgcoks.gov/sites/default/files/2026-07/2026-07-07%20Notice%20of%20Sheriff''s%20Sale.pdf', '2026-07-07'),
    ('The Lawrence Times', 'Work on Iowa Street continues', 'news',
     'https://lawrencekstimes.com/2026/07/17/iowa-st-27th-construction/', '2026-07-17'),
    ('Lawrence Journal-World', 'Lawrence receives $50,000 grant for Massachusetts Street bus stop improvements', 'news',
     'https://www2.ljworld.com/news/city-government/2026/sep/04/lawrence-receives-50000-grant-from-blue-cross-and-blue-shield-of-kansas-for-bus-stop-improvements-on-massachusetts-street/', '2026-09-04'),
    ('PermitGrab', 'Lawrence, KS building permits (free preview)', 'public_record',
     'https://permitgrab.com/permits/lawrence-ks', '2026-09-02')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'development'::shift_category, 'annexation_rezoning',
  'Beacon Landing: 288-acre annexation and rezoning approved', 'City Commission approved annexing and rezoning land west of K-10, south of 6th St -- called "probably the largest single annexation request in the last three decades" by the city planner. 70.1 ac low-density residential (R-2), 16.9 ac medium-density residential (R-3), 23.5 ac high-density residential (R-4), 126.7 ac commercial center, 51 ac open space.', '2026-08-18'::date, 'Approved by City Commission', 'high'::shift_impact,
  array['developer', 'investor', 'broker', 'agent']::shift_audience[], 'West of K-10, south of 6th St, Lawrence, KS', 38.971550078483, -95.273618892341, new_sources.id,
  '{"acres": 288, "applicant": "Landplan Engineering"}'::jsonb
from market, new_sources where new_sources.url like '%beacon-landing%'
union all
select market.id, 'development'::shift_category, 'annexation',
  'KU Endowment annexation request deferred', 'KU Endowment Association sought to defer its annexation request for ~137 acres near Lawrence Regional Airport to revise the application.', '2026-08-24'::date, 'Deferred at applicant''s request', 'medium'::shift_impact,
  array['developer', 'investor']::shift_audience[], '1593 N 1900 Rd, Lawrence, KS', 39.01506177247, -95.221873003617, new_sources.id,
  '{"acres": 137, "applicant": "KU Endowment Association"}'::jsonb
from market, new_sources where new_sources.url like '%ku-endowment%'
union all
select market.id, 'distress'::shift_category, 'tax_foreclosure_auction',
  'Tax foreclosure sale: 2139 Pennsylvania St', 'Sold at Douglas County sheriff''s sale to satisfy delinquent taxes, special assessments, and costs. Case No. DG-2025-CV-000-258, Cause No. 7.', '2026-08-12'::date, 'Sold at sheriff''s sale', 'medium'::shift_impact,
  array['investor', 'contractor', 'agent']::shift_audience[], '2139 Pennsylvania St, Lawrence, KS', 38.944624941118, -95.229615818887, new_sources.id,
  '{"case_number": "DG-2025-CV-000-258", "cause_no": 7, "judgment": 31317.49, "quick_ref": "R23002"}'::jsonb
from market, new_sources where new_sources.url like '%dgcoks.gov%'
union all
select market.id, 'distress'::shift_category, 'tax_foreclosure_auction',
  'Tax foreclosure sale: 225 N 5th St', 'Sold at Douglas County sheriff''s sale to satisfy delinquent taxes, special assessments, and costs. Case No. DG-2025-CV-000-258, Cause No. 13.', '2026-08-12'::date, 'Sold at sheriff''s sale', 'low'::shift_impact,
  array['investor', 'contractor', 'agent']::shift_audience[], '225 N 5th St, Lawrence, KS', 38.975493616545, -95.228981797456, new_sources.id,
  '{"case_number": "DG-2025-CV-000-258", "cause_no": 13, "judgment": 14231.31, "quick_ref": "R15315"}'::jsonb
from market, new_sources where new_sources.url like '%dgcoks.gov%'
union all
select market.id, 'infrastructure'::shift_category, 'road_project',
  'Iowa Street mill and overlay nearing completion', 'Asphalt overlay between 6th St and Harvard Rd; one northbound and one southbound lane stayed open throughout. Started week of July 20, 2026, expected to wrap the week of Sept. 4, 2026.', '2026-09-04'::date, 'Nearing completion', 'medium'::shift_impact,
  array['contractor', 'developer']::shift_audience[], 'Iowa St between 6th St and Harvard Rd, Lawrence, KS', 38.951781204545, -95.260400318239, new_sources.id,
  '{"segment": "6th St to Harvard Rd", "started": "2026-07-20"}'::jsonb
from market, new_sources where new_sources.url like '%iowa-st-27th%'
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_grant',
  'Massachusetts Street bus stops awarded $50,000 grant', 'Blue Cross and Blue Shield of Kansas "Pathways to a Healthy Kansas" grant for bus stop improvements on the southern portion of Massachusetts St, part of the upcoming Mass St 14th-23rd multimodal reconfiguration. Specific projects not yet detailed by the city.', '2026-09-04'::date, 'Grant awarded', 'medium'::shift_impact,
  array['contractor', 'developer', 'investor']::shift_audience[], 'Massachusetts St, 14th to 23rd St, Lawrence, KS', 38.951840560453, -95.235826226711, new_sources.id,
  '{"grant_amount": 50000, "funder": "Blue Cross and Blue Shield of Kansas"}'::jsonb
from market, new_sources where new_sources.url like '%bus-stop-improvements%'
union all
select market.id, 'construction'::shift_category, 'permit_filed',
  'Excavation permit filed: 1626 W 23rd St', 'Class 3 excavation permit, contractor A&A Drilling.', '2026-09-02'::date, 'Filed', 'low'::shift_impact,
  array['contractor']::shift_audience[], '1626 W 23rd St, Lawrence, KS', 38.94277867501, -95.25480719597, new_sources.id,
  '{"permit_type": "General Construction - Class 3 Excavation", "contractor": "A&A Drilling"}'::jsonb
from market, new_sources where new_sources.url like '%permitgrab%'
union all
select market.id, 'construction'::shift_category, 'permit_filed',
  'Plumbing permit filed: 2617 Belle Crest Dr', 'Plumbing permit, contractor Good Energy Solutions.', '2026-09-01'::date, 'Filed', 'low'::shift_impact,
  array['contractor']::shift_audience[], '2617 Belle Crest Dr, Lawrence, KS', 38.936511574417, -95.24517242967, new_sources.id,
  '{"permit_type": "Plumbing", "contractor": "Good Energy Solutions"}'::jsonb
from market, new_sources where new_sources.url like '%permitgrab%';
