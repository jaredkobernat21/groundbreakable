-- Adds Bettendorf, IA as a market and seeds real Scott County tax-
-- delinquency signals for Joel Kobernat's refined criteria (Jared,
-- 2026-09-07): "probate/estate homes, tax liens, pre-foreclosure
-- distress homes in Davenport and Bettendorf, IA with estimated long
-- ownership/high equity if possible."
--
-- Source data is the Scott County Treasurer's live 2026 tax sale list
-- (298 rows, downloaded and parsed directly -- see
-- 20260616_Tax_Sale_List.xlsx). Two real findings drove what's below:
--
--   1. Parcel G0013-10 (713 W 15th St, Davenport) has been on the tax
--      delinquency rolls for 14 consecutive years (2011-2024), owned by
--      Homecomings Financial LLC -- a corporate/REO owner, not a named
--      individual, so it's safe to cite directly and is an unusually
--      strong "long-standing distress" signal.
--   2. Davenport/Bettendorf-district parcels split cleanly: Davenport
--      has real single-family and small-commercial parcels (including
--      one more LLC-owned one, 808 E 6th St); Bettendorf's district
--      rows (11 total) are almost entirely manufactured-home lot liens
--      across three parks (Glendale MHP, Hillside MHP, Valley Mfg
--      Housing Community) -- personal property, not site-built homes,
--      and individually owned, so seeded here only as an aggregate
--      park-level count, never by lot/owner.
--
-- What is deliberately NOT included, per the project's standing privacy
-- and no-fabrication rules: no private individual is named (one
-- Bettendorf row, a living trust, is excluded entirely for this
-- reason); no probate-specific data is seeded because no real,
-- non-identifying probate statistic or case list was found (Scott
-- County's probate page describes the filing process only, no
-- aggregate figures) -- this is a real gap, not represented as
-- covered; no pre-foreclosure addresses are seeded because Scott
-- County's Sheriff Sale search (salesweb.civilview.com) is a live,
-- interactive, address-searchable portal with no crawlable listing
-- page -- confirmed real upcoming sale dates (09/08/2026-11/03/2026)
-- are cited as a "check this directly" signal instead of stale/guessed
-- addresses; no coordinates are set for either new development
-- opportunity below since no geocode for either address was
-- independently verified.

insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
values ('bettendorf-ia', 'Bettendorf', 'IA', 41.5245, -90.5157, 12);

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a7000000-0000-4000-8000-000000000001', 'Scott County Treasurer', '2026 Tax Sale List', 'agency_document', 'https://www3.scottcountyiowa.gov/treasurer/pub/tax_sale/2026/20260616_Tax_Sale_List.xlsx', '2026-06-16'),
  ('a7000000-0000-4000-8000-000000000002', 'Scott County Sheriff''s Office', 'Sheriff''s Sales', 'agency_document', 'https://www.scottcountyiowa.gov/sheriff/sales', null);

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'davenport-ia'), 'distress', 'tax_lien_long_term',
    '713 W 15th St -- 14 straight years of tax delinquency (2011-2024), corporate/REO-owned',
    'Parcel G0013-10 (FORREST & DILLON''S ADD) carries both Tax and Special assessment delinquencies going back to 2011 -- the longest-running case found anywhere in Scott County''s current tax sale list. Owner of record is Homecomings Financial LLC, a mortgage-servicing/REO entity, not an occupant -- consistent with a zombie-title parcel nobody has actively managed in over a decade. That length of neglect, paired with a corporate owner unlikely to fight a reasonable offer, makes this a strong direct-outreach candidate; a title search is recommended before contact since exact equity position isn''t independently verified from this data alone.',
    '2026-06-16', 'high', array['investor']::shift_audience[],
    'a7000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'davenport-ia'), 'distress', 'tax_lien_llc_owned',
    '808 E 6th St -- newly tax-delinquent, LLC-owned',
    'Parcel F0044-17 was added to the 2026 tax sale list for the current year only (owner: 810 E 6th St Dav LLC). Earlier-stage than the 15th St case, but an LLC that lets a single small holding go delinquent is often signaling it wants the asset off its books before penalties/interest compound -- worth an early, low-pressure outreach before it becomes a competitive tax-sale bid.',
    '2026-06-16', 'medium', array['investor']::shift_audience[],
    'a7000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'bettendorf-ia'), 'distress', 'manufactured_housing_tax_delinquency_cluster',
    '10 manufactured-home lots across 3 Bettendorf parks on the 2026 tax sale list',
    'Bettendorf-district parcels on the current tax sale list are concentrated in three manufactured-housing communities: Glendale MHP (4 lots), Hillside MHP/Devils Glenn (3 lots), and Valley Manufactured Housing Community (3 lots). These are personal-property (mobile home) tax liens, not site-built single-family homes, and each lot is individually owned, so this is reported here only as a park-level count -- not a lead list. Flagged for awareness since it shows real distress concentration in Bettendorf, even though it falls outside "homes" in the strict sense.',
    '2026-06-16', 'low', array['investor']::shift_audience[],
    'a7000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'davenport-ia'), 'distress', 'sheriff_sale_calendar_active',
    'Scott County Sheriff foreclosure sales scheduled through 11/03/2026 -- searchable by address',
    'Scott County''s Sheriff Sale portal (salesweb.civilview.com) shows active upcoming sale dates from 09/08/2026 through 11/03/2026, covering all of Scott County including Davenport and Bettendorf. The portal requires an interactive address/plaintiff/date search and has no crawlable public listing page, so specific pre-foreclosure addresses aren''t cited here -- check the portal directly for current inventory rather than relying on a cached list.',
    '2026-09-07', 'medium', array['investor']::shift_audience[],
    'a7000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'bettendorf-ia'), 'distress', 'sheriff_sale_calendar_active',
    'Scott County Sheriff foreclosure sales scheduled through 11/03/2026 -- searchable by address',
    'Same county-wide Sheriff Sale calendar as Davenport (09/08/2026-11/03/2026) -- Bettendorf falls under the same Scott County process and portal.',
    '2026-09-07', 'medium', array['investor']::shift_audience[],
    'a7000000-0000-4000-8000-000000000002', now()
  );

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'davenport-ia'),
    '713 W 15th St, Davenport, IA',
    null, null,
    'Tax-Delinquent Single-Family -- 14-Year Corporate Hold', 'high', 'distress', 'development',
    array['tax_delinquent_multi_year','corporate_reo_owner','long_term_neglect'],
    array[
      '14 consecutive years of tax delinquency (2011-2024) -- both Tax and Special assessments -- the longest streak in the current county-wide tax sale list',
      'Owned by Homecomings Financial LLC, a mortgage-servicing/REO entity rather than an occupant -- low likelihood of emotional attachment or negotiation friction',
      'A decade-plus of neglect on record typically means deferred maintenance and a highly motivated eventual seller once contacted',
      'Recommend a title search before outreach to confirm current lien stack and equity position -- not independently verified from tax-sale data alone'
    ],
    array['a7000000-0000-4000-8000-000000000001'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '808 E 6th St, Davenport, IA',
    null, null,
    'Newly Tax-Delinquent, LLC-Owned', 'medium', 'distress', 'development',
    array['tax_delinquent','llc_owned','early_stage_distress'],
    array[
      'Added to the 2026 tax sale list for the current year only -- an earlier-stage signal than a multi-year case, easier to catch before it becomes a competitive tax-sale bid',
      'Owner of record is 810 E 6th St Dav LLC -- a single-purpose entity, not an individual, which usually means a faster, less emotional transaction',
      'Worth a low-pressure inquiry now rather than waiting for the parcel to reach public auction'
    ],
    array['a7000000-0000-4000-8000-000000000001'::uuid],
    '2026-09-07'
  );

update opportunity_profiles set
  target_cities = array['Davenport', 'Bettendorf'],
  target_market_ids = target_market_ids || (select id from markets where slug = 'bettendorf-ia'),
  property_types = array['redevelopment', 'infill'],
  notes = notes || ' Updated 2026-09-07 per Jared: Joel specifically looks for probate/estate homes, tax liens, and pre-foreclosure distress homes in both Davenport and Bettendorf, with a preference for long ownership/high equity where estimable. Real tax-lien signals now on file for both markets (see Scott County Treasurer 2026 tax sale list); probate/estate and address-level pre-foreclosure data remain a real gap -- no non-identifying probate statistic was found, and Scott County''s Sheriff Sale listings require an interactive portal search rather than a crawlable page.'
where investor_profile_id = (select id from investor_profiles where full_name = 'Joel Kobernat');

insert into investor_markets (investor_id, market_id)
select (select id from investor_profiles where full_name = 'Joel Kobernat'), id
from markets where slug = 'bettendorf-ia'
on conflict do nothing;
