-- Real, sourced Topeka tax lien shifts -- rounds out Distress with the
-- "tax lien" sub-signal (an earlier-stage warning than the foreclosure
-- auctions already seeded: a lien recorded for unpaid taxes, well
-- before any sale is scheduled, many of which never reach auction at
-- all).
--
-- Source: Shawnee County Treasurer's 2025 delinquent real-estate tax
-- list (cdn.snco.gov, an .xlsx, 5,662 rows as of this pull). Same URL
-- already existed once in `sources` from earlier, unrelated work on
-- the old pillar tables (with no published_date recorded) -- this
-- migration adds its own row rather than reusing that one, consistent
-- with every other batch in this project, and fills in the real
-- published_date (the file's own creation timestamp) this time.
--
-- Picked the 4 largest-dollar delinquencies in the file (all >$100k,
-- all commercial) rather than an arbitrary sample -- real distress
-- signal scales with amount owed. Event date is the list's own
-- creation date (2026-07-28), not an invented lien-recording date --
-- the file is a snapshot of everything delinquent as of that date, not
-- a log of individual filing dates.
--
-- Probate (also a Distress sub-signal) stays undone for both Topeka
-- and Lawrence: the only public search is the statewide Kansas
-- CaseSearch portal (casesearch.kscourts.gov), which 403s non-browser
-- traffic and requires a party name to search -- there's no "browse
-- recent probate filings in this county" list to pull from. Lawrence's
-- own tax-lien list is similarly undone: Douglas County publishes its
-- delinquent list in the local newspaper under state statute, not as a
-- downloadable file anywhere on dgcoks.gov.

with market as (
  select id from markets where slug = 'topeka-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('Shawnee County Treasurer', '2025 Delinquent Real Estate Tax List', 'public_record',
     'https://cdn.snco.gov/treasurer/document/2025%20RE%20-%20Final%20-%20Online.xlsx', '2026-07-28')
  returning id
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'distress'::shift_category, 'tax_lien',
  'Delinquent property tax lien: Crown Point Apartments', 'Unpaid real estate taxes, parcel 1462402002008000.', '2026-07-28'::date, 'Delinquent -- unpaid', 'high'::shift_impact,
  array['investor', 'contractor', 'agent']::shift_audience[], '3711 SW Park South Ct, Topeka, KS', 38.999542971282, -95.702649615459, new_sources.id,
  '{"parcel": "1462402002008000", "owner": "CROWN POINT APARTMENTS LLC", "total_due": 188464.36}'::jsonb
from market, new_sources
union all
select market.id, 'distress'::shift_category, 'tax_lien',
  'Delinquent property tax lien: Genesis Health Clubs of Topeka', 'Unpaid real estate taxes, parcel 1462301003001000.', '2026-07-28'::date, 'Delinquent -- unpaid', 'high'::shift_impact,
  array['investor', 'contractor', 'agent']::shift_audience[], '2909 SW 37th St, Topeka, KS', 39.000464191474, -95.714162019203, new_sources.id,
  '{"parcel": "1462301003001000", "owner": "GENESIS HEALTH CLUBS OF TOPEKA LLC", "total_due": 160205.93}'::jsonb
from market, new_sources
union all
select market.id, 'distress'::shift_category, 'tax_lien',
  'Delinquent property tax lien: Horizon Edge Hospitality Topeka', 'Unpaid real estate taxes, parcel 1093202017001000.', '2026-07-28'::date, 'Delinquent -- unpaid', 'high'::shift_impact,
  array['investor', 'contractor', 'agent']::shift_audience[], '420 SE 6th Ave, Topeka, KS', 39.050565134402, -95.668674101836, new_sources.id,
  '{"parcel": "1093202017001000", "owner": "HORIZON EDGE HOSPITALITY TOPEKA LLC", "total_due": 135894.18}'::jsonb
from market, new_sources
union all
select market.id, 'distress'::shift_category, 'tax_lien',
  'Delinquent property tax lien: Timilon Corporation', 'Unpaid real estate taxes, parcel 0962304001005000.', '2026-07-28'::date, 'Delinquent -- unpaid', 'high'::shift_impact,
  array['investor', 'contractor', 'agent']::shift_audience[], '3602 NW 16th St, Topeka, KS', 39.079619347857, -95.713776870348, new_sources.id,
  '{"parcel": "0962304001005000", "owner": "TIMILON CORPORATION", "total_due": 124422.04}'::jsonb
from market, new_sources;
