-- Second Lawrence research pass (Jared, 2026-09-06): "more information on
-- planning, permits, contractors." Existing-data check first (per
-- feedback_check_existing_data_before_research) found Lawrence had only
-- 10 shifts total, 2 building permits, and -- the real gap -- all 6
-- tracked projects with contractor = null. Fresh research found:
--   - two genuinely new, dated planning approvals (Hunters Hill's
--     preliminary plat, Queens Road's annexation/rezoning) that moved
--     both projects further along the pipeline than what was on file
--   - real entity corrections for two already-tracked developers
--   - no new building permits (PermitGrab's own page states it has no
--     data past 2026-09-02 -- a confirmed ceiling, not a search miss)
--   - no contractor/GC found for any of the 6 projects despite a real
--     search attempt per project -- small Kansas developers routinely
--     don't get contractor-level press before construction starts; this
--     stays a genuine, reported gap rather than a fabricated name.

with market as (
  select id from markets where slug = 'lawrence-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('The Lawrence Times', 'Plat for Hunters Hill subdivision in northwest Lawrence gets planning commission approval', 'news',
     'https://lawrencekstimes.com/2026/03/25/hunters-hill-plat-approved/', '2026-03-25'),
    ('The Lawrence Times', 'City Commission approves annexing, rezoning land in northwestern Lawrence', 'news',
     'https://lawrencekstimes.com/2026/04/07/citycomm-oks-annexation-nw-lawrence/', '2026-04-07'),
    ('Lawrence Journal-World (Town Talk)', 'From a $50M soccer complex to 700 acres of new housing, developer seeking to expand city past SLT', 'news',
     'https://www2.ljworld.com/weblogs/town_talk/2025/dec/03/from-a-50m-soccer-complex-to-700-acres-of-new-housing-developer-seeking-to-expand-city-past-slt/', '2025-12-03'),
    ('Lawrence Journal-World', 'City Commission to consider incentives for affordable housing loft project in East Lawrence', 'news',
     'https://www2.ljworld.com/news/2025/mar/14/city-commission-to-consider-incentives-for-affordable-housing-loft-project-in-east-lawrence/', '2025-03-14')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'plans'::shift_category, 'preliminary_plat_approved',
  'Hunters Hill: preliminary plat approved for 122-lot subdivision',
  'Planning Commission unanimously approved a preliminary plat for Hunters Hill -- 122 residential lots (including 20 two-unit/duplex lots) on ~45.5 acres, with 10.55 acres set aside as protected open space (steep slopes, mature trees). A rezoning request for additional low-density housing has also been submitted. City staff can administratively approve the final plat if it stays in substantial compliance with this preliminary plat; building permits still require the final plat and commission approval of easement/right-of-way dedications.',
  '2026-03-25'::date, 'Preliminary plat approved -- final plat and building permits not yet filed', 'high'::shift_impact,
  array['developer', 'investor', 'contractor']::shift_audience[], '1760 E 1100 Rd, Lawrence, KS', 38.994609622102, -95.297706661435, new_sources.id,
  '{"lots": 122, "duplex_lots": 20, "acres": 45.5, "open_space_acres": 10.55, "applicant": "Williams Management LLC (via Landplan Engineering)"}'::jsonb
from market, new_sources where new_sources.url like '%hunters-hill-plat-approved%'
union all
select market.id, 'plans'::shift_category, 'annexation_rezoning',
  'Queens Road: annexation and rezoning approved for ~168-lot subdivision',
  'City Commission unanimously approved annexing and rezoning 63.5 acres east of E 1000 Rd (Queens Road) and north of N 1700 Rd (Peterson Rd) -- about 44 acres low-density residential (R1/R2) and 19 acres open space (P2). Preliminary concept plan shows space for approximately 168 single-family lots, subject to change; no preliminary plat filed yet. The city estimated sewer extension to serve the site at approximately $3.5 million; the applicant had not requested tax incentives as of the vote.',
  '2026-04-07'::date, 'Annexation and rezoning approved -- preliminary plat not yet filed', 'high'::shift_impact,
  array['developer', 'investor', 'broker', 'agent']::shift_audience[], 'E 1000 Rd & N 1700 Rd (Peterson Rd), Lawrence, KS', 38.986076076903, -95.288351887039, new_sources.id,
  '{"acres": 63.5, "lots_concept": 168, "sewer_extension_estimate_usd": 3500000, "applicant": "Landplan Engineering", "owner": "Deane R. Holmes Jr."}'::jsonb
from market, new_sources where new_sources.url like '%citycomm-oks-annexation-nw-lawrence%';

-- --- Project stage/detail updates from the two approvals above ---------

update projects set
  address = '1760 E 1100 Rd, Lawrence, KS',
  latitude = 38.994609622102,
  longitude = -95.297706661435,
  acreage = 45.5,
  units = 122,
  stage = 'approved',
  date_updated = '2026-09-06'
where id = 'b032f55b-cf95-4ab2-a119-fc4c7946b3b0'; -- Hunters Hills

update projects set
  stage = 'approved',
  date_updated = '2026-09-06'
where id = 'eb0f124c-a8e1-4d26-98f8-fbc006321e71'; -- Queens Road

-- --- Developer entity corrections --------------------------------------
-- 9 Del Lofts II's developer was on file as "Krsnich Investment Group" --
-- a direct source (the March 2025 incentive-request article) names the
-- real applicant/developer as Tony Krsnich's Flint Hills Holding Group.
-- Same person/operation, more precise entity name -- corrected, not
-- treated as a second developer.

update projects set
  developer = 'Tony Krsnich (Flint Hills Holding Group)',
  date_updated = '2026-09-06'
where id = 'f614c204-9c20-4d46-a35b-8c46873b887f'; -- 9 Del Lofts II

update project_people set
  person_name = 'Tony Krsnich',
  company_name = 'Flint Hills Holding Group',
  evidence_note = 'Corrected from "Krsnich Investment Group" -- the 2025-03-14 LJWorld article on this project''s incentive request names the applicant/developer directly as Tony Krsnich''s Flint Hills Holding Group.'
where related_record_type = 'project'
  and related_record_id = 'f614c204-9c20-4d46-a35b-8c46873b887f'
  and role = 'developer';

-- Williams Management LLC -- Adam Williams' company, confirmed as the
-- applicant of record on the Hunters Hill preliminary plat. Enriches the
-- 3 existing person_name-keyed rows (Urban Row, Queens Road, Hunters
-- Hills) rather than adding a separate company-only row, so they still
-- group as one developer profile.

update project_people set
  company_name = 'Williams Management LLC'
where person_name = 'Adam Williams'
  and related_record_type = 'project'
  and related_record_id in (
    'be3077e2-01a0-4b30-9d63-73463d89fb38', -- Urban Row
    'eb0f124c-a8e1-4d26-98f8-fbc006321e71', -- Queens Road
    'b032f55b-cf95-4ab2-a119-fc4c7946b3b0'  -- Hunters Hills
  );

-- --- New, lower-confidence developer leads ------------------------------
-- Separate statement from the shifts insert above, so `market`/
-- `new_sources` are out of scope here (CTEs don't persist across
-- statement boundaries) -- both sources already exist as real rows by
-- this point, so they're looked up directly instead.

with market as (
  select id from markets where slug = 'lawrence-ks'
)
insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select market.id, 'Phil Bundy', null::text, 'developer', 'project', '29fb6565-e99f-445e-81e8-fc657cfd58c9'::uuid,
  'Beacon Landing — West of K-10, south of 6th St/US-40, Lawrence, KS',
  (select id from sources where url like '%50m-soccer-complex%'), '2025-12-03'::date, 'likely',
  'Named as "the developer" behind a reported $1B+ two-project push in Lawrence (including this annexation) in Town Talk coverage of a separate, larger proposal (a $50M soccer complex plus this housing tract). Landplan Engineering remains the filed applicant of record for the annexation itself -- the relationship between the two is not fully reconciled in sourced reporting.'
from market
union all
select market.id, 'Deane R. Holmes Jr.', null::text, 'developer', 'project', 'eb0f124c-a8e1-4d26-98f8-fbc006321e71'::uuid,
  'Queens Road — E 1000 Rd & N 1700 Rd (Peterson Rd), Lawrence, KS',
  (select id from sources where url like '%citycomm-oks-annexation-nw-lawrence%'), '2026-04-07'::date, 'likely',
  'Named as the property owner in the annexation/rezoning filing (Landplan Engineering was the filing applicant). Adam Williams/Williams Management LLC is separately reported (2026-03-09 Town Talk) as this project''s developer -- relationship between owner and developer not confirmed in sourced reporting.'
from market;

-- --- Refine the Beacon Landing Development Opportunity's developer note

update development_opportunities set
  related_developer = 'Landplan Engineering (applicant of record); Phil Bundy separately reported as the developer behind the project (Lawrence Journal-World Town Talk, 2025-12-03) -- relationship between the two not fully reconciled in sourced reporting'
where address = 'West of K-10, south of 6th St/US-40, Lawrence, KS';
