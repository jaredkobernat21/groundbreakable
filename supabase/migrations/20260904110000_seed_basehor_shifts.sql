-- Real, sourced Basehor, KS shifts (pilot batch) -- 7 shifts, 6
-- Development + 1 Infrastructure. Sourced entirely from the city's own
-- real, current agenda packets (cityofbasehor.org/AgendaCenter), which
-- WebFetch can't read as text (large, no clean text layer via that
-- tool's conversion) but PyMuPDF (`pip install pymupdf`, no system
-- poppler needed -- unlike the Read tool's own PDF path, which does
-- need poppler and wasn't available in this environment) extracts
-- perfectly. This is the first market where deliberately widening what
-- to look for in an agenda -- not just rezonings, but development
-- agreements, Industrial Revenue Bonds, and conditional use permits --
-- paid off: a single City Council agenda (2026-08-12) alone had 3 of
-- the 6 Development shifts below.
--
-- Two items (Sundance Villas, Grayhawk) are on the Sept 8, 2026
-- Planning Commission agenda -- 4 days after this migration's own
-- date, i.e. not yet decided. Worded as "scheduled for review" with
-- staff's recommendation, not as an approval, since no vote has
-- happened yet.
--
-- Distress, Compliance, Construction stay undone for Basehor this
-- pass -- not checked as thoroughly as Development this round; a
-- follow-up pass specifically for those categories (Leavenworth
-- County-level Distress sources are already known-broken per the
-- Tonganoxie batch) is the natural next step, not a claim that they
-- don't exist.

with market as (
  select id from markets where slug = 'basehor-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('City of Basehor', 'Planning Commission Agenda — September 8, 2026', 'agency_document',
     'https://www.cityofbasehor.org/AgendaCenter/ViewFile/Agenda/_09082026-533', '2026-09-03'),
    ('City of Basehor', 'City Council Agenda — August 26, 2026', 'agency_document',
     'https://www.cityofbasehor.org/AgendaCenter/ViewFile/Agenda/_08262026-519', '2026-08-24'),
    ('City of Basehor', 'City Council Agenda — August 12, 2026', 'agency_document',
     'https://www.cityofbasehor.org/AgendaCenter/ViewFile/Agenda/_08122026-518', '2026-08-06')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'development'::shift_category, 'site_plan',
  'Sundance Villas Final Development Plan', 'Proposed 55+ residential community on the east side of N. 155th St and Maple St: 5 buildings, 12 residential units, one community building, 2 acres, ~55% open space (exceeds the 20% PRD minimum).', '2026-09-08'::date, 'Scheduled for Sept 8 Planning Commission review -- staff recommends approval', 'medium'::shift_impact,
  array['developer', 'investor', 'contractor']::shift_audience[], 'N 155th St & Maple St, Basehor, KS', 39.139054151686, -94.938731148137, new_sources.id,
  '{"units": 12, "buildings": 5, "acres": 2}'::jsonb
from market, new_sources where new_sources.url like '%09082026%'
union all
select market.id, 'development'::shift_category, 'subdivision_plat_revision',
  'Grayhawk subdivision entrance relocation, Phases 8-9', 'Final Development Plan revision: a stormwater issue at the approved Phase 8/9 entrance (connecting to 166th St) requires relocating it ~300 ft north, with associated lot-line adjustments and added lots.', '2026-09-08'::date, 'Scheduled for Sept 8 Planning Commission review -- staff recommends approval', 'low'::shift_impact,
  array['developer', 'contractor']::shift_audience[], 'Grayhawk subdivision, Basehor, KS', null, null, new_sources.id,
  '{"phases": "8-9"}'::jsonb
from market, new_sources where new_sources.url like '%09082026%'
union all
select market.id, 'development'::shift_category, 'development_agreement_amendment',
  'Residences on the Boulevard: development schedule extended', '1st Amendment to the Feb 25, 2026 Development Agreement between the City and Basehor Boulevard Holdings, LLC -- extends the deadline for Phase 1 commencement to June 30, 2027; all other terms unchanged.', '2026-08-26'::date, 'Approved by City Council', 'medium'::shift_impact,
  array['developer', 'investor']::shift_audience[], null, null, null, new_sources.id,
  '{"developer": "Basehor Boulevard Holdings, LLC", "project": "Residences on the Boulevard", "phase_1_deadline": "2027-06-30"}'::jsonb
from market, new_sources where new_sources.url like '%08262026%'
union all
select market.id, 'infrastructure'::shift_category, 'cip_adopted',
  'City adopts 5-year Capital Improvement Plan', 'Resolution 2026-19 accepts the FY2027 5-year CIP. Notable funded nonrecurring projects include Basehor Town Center, Coralberry Trail, 2620 N 155th St facility improvements, Basehor Town Center Trails, and an I-70 interchange feasibility study; $22.3M in grants/external funding secured for Basehor projects to date.', '2026-08-26'::date, 'Adopted', 'medium'::shift_impact,
  array['contractor', 'developer', 'investor']::shift_audience[], null, null, null, new_sources.id,
  '{"resolution": "2026-19", "grants_secured": 22269897}'::jsonb
from market, new_sources where new_sources.url like '%08262026%'
union all
select market.id, 'development'::shift_category, 'industrial_revenue_bond',
  'Industrial Revenue Bond application: UNJ Basehor, LLC', 'Resolution of intent for up to $2.85M in IRBs (sales-tax exemption, no ad valorem abatement requested) to support a commercial development including a Dunkin'' Donuts and possibly other food-service tenants. Developer''s stated capital investment: ~$2.71M.', '2026-08-12'::date, 'Resolution of intent approved by City Council', 'medium'::shift_impact,
  array['developer', 'investor', 'contractor']::shift_audience[], null, null, null, new_sources.id,
  '{"developer": "UNJ Basehor, LLC", "capital_investment": 2713370, "bond_cap": 2850000}'::jsonb
from market, new_sources where new_sources.url like '%08122026%'
union all
select market.id, 'development'::shift_category, 'rezoning',
  'Rezoning approved: Kansas Ave. Basehor Property (contested)', 'Ordinance 1008 (case PRZ-004-26) rezones a parcel on the north side of Kansas Ave, east of 158th St and Glenwood Ridge Elementary School, from R-0 to R-1b (Neighborhood Residential, up to 5.0 units/acre). Planning Commission recommended approval; a protest petition was submitted and discussed at the Council meeting.', '2026-08-12'::date, 'Approved by City Council over a protest petition', 'high'::shift_impact,
  array['developer', 'investor', 'agent', 'broker']::shift_audience[], 'Kansas Ave & 158th St, Basehor, KS', 39.087200039989, -94.945802968599, new_sources.id,
  '{"case_number": "PRZ-004-26", "applicant": "Kansas Ave. Basehor Property, LLC", "rezoning": "R-0 to R-1b", "protest_petition": true}'::jsonb
from market, new_sources where new_sources.url like '%08122026%'
union all
select market.id, 'development'::shift_category, 'conditional_use_permit',
  'Conditional use permit approved: Foley Construction equipment retail', 'Ordinance 1009 (case PCU-002-26) approves a CUP for a Construction Equipment Retail business at 15063 State Ave (CP-2 General Business), a site previously operated by Miles Excavating.', '2026-08-12'::date, 'Approved by City Council', 'low'::shift_impact,
  array['contractor', 'investor']::shift_audience[], '15063 State Ave, Basehor, KS', 39.116075174118, -94.928436016927, new_sources.id,
  '{"case_number": "PCU-002-26", "applicant": "Foley Construction", "prior_use": "Miles Excavating"}'::jsonb
from market, new_sources where new_sources.url like '%08122026%';
