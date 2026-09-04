-- Real, sourced additions from a dedicated research pass for the
-- expanded signal-type checklist (BZA variances, business/licensing
-- signals for the new Business category, permit subtypes). Findings:
--
-- WORKED:
-- - Topeka's Cityworks org has a `Planning_Cases` layer (separate from
--   `BuildingPermits`) with a `BZA_Hearing_Date` field -- Board of
--   Zoning Appeals variance cases are real and queryable the same way
--   permits are. One real, recent (2026-08-10, within the 30-day
--   window) BZA case seeded below.
-- - The `BuildingPermits` layer's case_type values include
--   BLDC-ELEV/BLDR-ELEV (elevator permits) -- confirmed real, but the
--   only examples on file are from 2022/2023, too old to seed as a
--   current shift. Capability noted for a future pass if fresher data
--   shows up.
-- - maps.topeka.gov hosts 33 ArcGIS folders total, far more than the
--   3 (CityworksViews, and now-known ParcelPublishing/TaxAssessment)
--   explored so far -- HistoricProperty, FireServiceOperations,
--   LandUsePlanning, CityUtility, Utilities are unexplored and worth a
--   future pass for Business/Infrastructure/Distress signals.
-- - `ParcelPublishing/ParcelsWithCAMA` (Shawnee County-adjacent, city
--   GIS) gives real owner name + current assessed value (land/
--   building/total) per parcel -- genuinely useful for *enriching* a
--   shift once found some other way. NOT usable to *detect* a Property
--   shift on its own: its `recordeddate` field is identical across
--   every single row in the layer (a data-refresh timestamp, not a
--   per-parcel event date) -- using it as a per-parcel "changed on
--   this date" signal would misrepresent what the field actually
--   means, so it wasn't used that way here.
-- - One real Business-category shift: Spore.Bio (Paris biotech
--   startup) leasing lab space at Link Innovation Labs, sourced from a
--   GO Topeka press release already cited in `sources` from earlier
--   work on the old pillar tables (published_date already correct:
--   2026-08-05).
--
-- CONFIRMED DEAD ENDS (state-level Kansas portals, all ASP.NET
-- postback forms or 403 to non-browser traffic, no bulk/open-data
-- alternative found):
-- - Kansas Secretary of State Business Entity Search
--   (sos.ks.gov/eforms/BusinessEntity/Search.aspx) -- 403s WebFetch;
--   name-search only even in a browser, no "recent filings" list; no
--   bulk download found anywhere on sos.ks.gov or data.ks.gov.
-- - Kansas ABC liquor licensee search (kdor.ks.gov/apps/liquorlicensee)
--   -- real, government-run, city-searchable in principle, but a
--   classic ASP.NET WebForms postback page: query-string GET params
--   don't trigger real results, only form submission does, which
--   WebFetch can't perform.
-- - Kansas Dept of Agriculture food safety / lodging licensing -- no
--   public search URL found at all (agriculture.ks.gov only has
--   application forms, no license lookup).
-- This makes Business the hardest category to source at scale, same
-- shape of problem as the old Ownership category (paywalled/
-- postback-blocked state systems) -- individual real events (like
-- Spore.Bio) are findable via economic-development press releases
-- (GO Topeka, similar orgs in other markets), just not as a queryable
-- feed.

with market as (
  select id from markets where slug = 'topeka-ks'
),
new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('City of Topeka', 'Planning Cases (Cityworks GIS) — Board of Zoning Appeals', 'agency_gis',
     'https://maps.topeka.gov/arcgis/rest/services/CityworksViews/Planning_Cases/MapServer', '2026-09-04')
  returning id, url
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'plans'::shift_category, 'bza_variance',
  'Board of Zoning Appeals variance: James King / Greenbush of Topeka', 'BZA case BZA26V/02.', '2026-08-10'::date, 'Heard by Board of Zoning Appeals', 'low'::shift_impact,
  array['developer', 'contractor']::shift_audience[], '4101 SW 15th St, Topeka, KS', 39.040859275867639, -95.726135784885543, new_sources.id,
  '{"case_number": "BZA26V/02", "applicant": "James King / Greenbush of Topeka"}'::jsonb
from market, new_sources
union all
select market.id, 'business'::shift_category, 'business_relocation',
  'Spore.Bio leases lab space at Link Innovation Labs', 'Paris-based biotech startup Spore.Bio (AI-driven microbiology platform for real-time contamination monitoring, food/beverage/pharma/cosmetics industries; has raised $35M+ to date) is leasing flexible private lab suites at Link Innovation Labs in Topeka''s Innovation District.', '2026-08-05'::date, 'Lease signed', 'medium'::shift_impact,
  array['developer', 'investor']::shift_audience[], '220 SE 6th Ave, Topeka, KS', 39.051296345946, -95.671478017511,
  (select id from sources where url = 'https://www.gotopeka.com/2026/08/05/global-biotechnology-company-selects-topeka-to-support-regional-customer-access-and-continued-u-s-growth/' limit 1),
  '{"company": "Spore.Bio", "facility": "Link Innovation Labs"}'::jsonb
from market;
