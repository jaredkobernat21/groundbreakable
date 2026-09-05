-- Evidence-based developer/contractor audit for every rezoning, plan,
-- proposal, project, and permit on file for Lawrence as of 2026-09-05
-- (reviewed with Jared; see project_people_schema migration for why this
-- is its own table). Every row traces to a specific source record --
-- funders (Blue Cross and Blue Shield's Mass St grant), the plain
-- Iowa St mill-and-overlay (no contractor named in the source), and the
-- two tax foreclosure sales are deliberately excluded: none of them name
-- a developer or contractor, and guessing one in would violate the
-- "evidence-based, not name-based" instruction this table exists to
-- satisfy.
--
-- Landplan Engineering is carried as Developer/Likely, not Confirmed --
-- per the note already on file in the 20260905010000 investments seed,
-- it's the applicant's civil engineering firm of record, not a confirmed
-- landowner/developer. Its role still qualifies as "Developer" under
-- Jared's own definition ("advancing, entitling" the project), just not
-- at Confirmed confidence.

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, 'Adam Williams', null, 'developer', 'project', p.id, 'Urban Row — 7th St & Rhode Island St, Lawrence, KS', p.source_id, '2026-03-09', 'confirmed',
  'Named "a Lawrence developer" behind this project in the source article; no company name given.'
from markets m
join projects p on p.market_id = m.id and p.title = 'Urban Row'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, 'Adam Williams', null, 'developer', 'project', p.id, 'Queens Road — E 1000 Rd & N 1700 Rd (Peterson Rd), Lawrence, KS', p.source_id, '2026-03-09', 'confirmed',
  'Named "a Lawrence developer" behind this project in the source article; no company name given.'
from markets m
join projects p on p.market_id = m.id and p.title = 'Queens Road'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, 'Adam Williams', null, 'developer', 'project', p.id, 'Hunters Hills — near Peterson Rd & Monterey Way, Lawrence, KS', p.source_id, '2026-03-09', 'confirmed',
  'Named "a Lawrence developer" behind this project in the source article; no company name given.'
from markets m
join projects p on p.market_id = m.id and p.title = 'Hunters Hills'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, '23 Iowa Investors (affiliate of Block Real Estate Services)', 'developer', 'project', p.id, 'The Crossing — near 23rd St & Iowa St (KU Innovation Park), Lawrence, KS', p.source_id, '2026-09-04', 'confirmed',
  'Named as the project''s developer, seeking the industrial revenue bond, in the source article.'
from markets m
join projects p on p.market_id = m.id and p.title = 'The Crossing'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, 'Krsnich Investment Group', 'developer', 'project', p.id, '9 Del Lofts II — 716 E 9th St, Lawrence, KS', p.source_id, '2025-12-17', 'confirmed',
  'Named "Developer Krsnich Investment Group" explicitly in the source article.'
from markets m
join projects p on p.market_id = m.id and p.title = '9 Del Lofts II'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, 'Landplan Engineering', 'developer', 'project', p.id, 'Beacon Landing — West of K-10, south of 6th St/US-40, Lawrence, KS', p.source_id, '2026-08-18', 'likely',
  'Named as the applicant/engineering firm of record on the annexation and rezoning filings. Not confirmed as the landowner or ultimate developer -- see the 20260905010000 investments seed note.'
from markets m
join projects p on p.market_id = m.id and p.title = 'Beacon Landing'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, 'KU Endowment Association', 'developer', 'shift', s.id, 'KU Endowment annexation request — 1593 N 1900 Rd, Lawrence, KS', s.source_id, '2026-08-24', 'confirmed',
  'Named as the applicant seeking the annexation in the source article -- an institutional landowner advancing its own entitlement request.'
from markets m
join shifts s on s.market_id = m.id and s.event = 'KU Endowment annexation request deferred'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, 'D & S Land LLC', 'developer', 'shift', s.id, '177-acre annexation (SW of K-10 & Bob Billings Pkwy), Lawrence, KS', s.source_id, '2026-08-24', 'confirmed',
  'Named as the property owner of the 177-acre annexation request in the sourced reporting.'
from markets m
join shifts s on s.market_id = m.id and s.event = 'Planning Commission recommends denial of 177-acre annexation west of K-10'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, 'Landplan Engineering', 'developer', 'shift', s.id, '177-acre annexation (SW of K-10 & Bob Billings Pkwy), Lawrence, KS', s.source_id, '2026-08-24', 'likely',
  'Named as the applicant on the same 177-acre annexation request, alongside property owner D & S Land LLC. Applicant/engineering firm of record, not confirmed as owner or ultimate developer.'
from markets m
join shifts s on s.market_id = m.id and s.event = 'Planning Commission recommends denial of 177-acre annexation west of K-10'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, 'A&A Drilling', 'contractor', 'shift', s.id, 'Excavation permit — 1626 W 23rd St, Lawrence, KS', s.source_id, '2026-09-02', 'confirmed',
  'Listed as the contractor of record on the excavation permit.'
from markets m
join shifts s on s.market_id = m.id and s.event = 'Excavation permit filed: 1626 W 23rd St'
where m.slug = 'lawrence-ks';

insert into project_people (market_id, person_name, company_name, role, related_record_type, related_record_id, related_label, source_id, event_date, confidence, evidence_note)
select m.id, null, 'Good Energy Solutions', 'contractor', 'shift', s.id, 'Plumbing permit — 2617 Belle Crest Dr, Lawrence, KS', s.source_id, '2026-09-01', 'confirmed',
  'Listed as the contractor of record on the plumbing permit.'
from markets m
join shifts s on s.market_id = m.id and s.event = 'Plumbing permit filed: 2617 Belle Crest Dr'
where m.slug = 'lawrence-ks';
