-- Ports real, addressed distress signals from Joel's own "Lead Board"
-- (a client deliverable prepared 2026-08-29, found in his Desktop
-- folder) into the shared app, per Jared's explicit choice on
-- 2026-09-07: de-identify for the app -- Joel keeps the full named
-- version (deceased owners, named heirs, living owners' names) in his
-- own file outside the product. That original document is not a
-- source cited here; the underlying primary public records it was
-- built from are (Scott County Sheriff's civil sale docket and
-- foreclosure petitions, Scott County Treasurer's 2026 tax sale list).
--
-- development_opportunities is market-scoped via RLS (has_market_access),
-- not client-scoped -- anyone ever granted Davenport/Bettendorf access
-- would see these rows, which is exactly why no personal name appears
-- anywhere below, including for living owners in tax/auction distress,
-- not just the probate cases. Institution names (banks, credit unions,
-- government programs) and sheriff file numbers are kept -- those are
-- public legal parties and case identifiers, not private individuals.
--
-- No coordinates were available for any of these (the source document
-- links to a parcel-search tool, not a geocode) -- latitude/longitude
-- left null throughout, consistent with this project's standing rule.
--
-- Selection: all 5 "act this week" probate+auction properties (the
-- highest-signal tier), all 5 "high priority" auction/lien properties,
-- and the 3 standout entries from an 18-property tax-delinquent table
-- that carried a second or third signal (absentee ownership, high
-- equity, or landed in Bettendorf where addressed single-family
-- distress data was otherwise thin). The other 15 tax-delinquent rows
-- were single-signal, routine-level entries -- skipped, same standard
-- applied to routine permits elsewhere in this audit.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a9000000-0000-4000-8000-000000000001', 'Scott County Sheriff''s Office', 'Civil Sale Docket & Foreclosure Petitions (compiled Aug 29, 2026)', 'public_record', 'https://www.scottcountyiowa.gov/sheriff/sales', '2026-08-29'),
  ('a9000000-0000-4000-8000-000000000002', 'Scott County & Davenport Assessors', 'Parcel Ownership, Tenure & Value Records (compiled Aug 29, 2026)', 'public_record', 'https://beacon.schneidercorp.com/Application.aspx?AppID=1024&PageType=Search', '2026-08-29');

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'davenport-ia'),
    '907 Warren St, Davenport, IA 52804',
    null, null,
    'Probate Property -- Sheriff''s Sale Scheduled', 'high', 'distress', 'development',
    array['probate_estate','sheriff_sale_scheduled','federal_tax_lien','heavy_lien_stack','high_equity'],
    array[
      'Both owners of record are deceased; the foreclosing credit union had to sue named and unknown heirs to force the sale -- a clear probate/estate situation',
      'The deed has been in the family 19 years, so there is real equity behind what is likely a small remaining loan balance',
      'The IRS and Iowa Department of Revenue are both on title -- a federal tax lien carries a 120-day redemption right after any sheriff''s sale, so order a title search before acting',
      'Sheriff''s sale scheduled September 29, 2026, 11:30 a.m. (Sheriff file 26005558) -- pre-sale outreach to the heirs is the higher-leverage path before the courthouse deadline'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '1120 Gaines St, Davenport, IA 52804',
    null, null,
    'Probate Property -- Sheriff''s Sale Scheduled', 'high', 'distress', 'development',
    array['probate_estate','sheriff_sale_scheduled','state_tax_lien','heavy_lien_stack'],
    array[
      'The recorded owner is deceased and the bank sued her unknown heirs -- a probate/estate situation',
      'The Iowa Estate Recovery Program (the state''s Medicaid claw-back against a deceased person''s estate) is named on title -- typically signals a prior nursing-home stay and an unmanaged property',
      'Estate Recovery claims are frequently negotiable for less than face value, making a pre-sale purchase realistic',
      'Sheriff''s sale scheduled October 13, 2026, 11:30 a.m. (Sheriff file 26005892)'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '4915 Western Ave, Davenport, IA 52806',
    null, null,
    'Probate Property -- Sheriff''s Sale Scheduled', 'high', 'distress', 'development',
    array['probate_estate','sheriff_sale_scheduled','federal_tax_lien','heavy_lien_stack'],
    array[
      'The recorded owner is deceased; the foreclosing credit union named multiple heirs as defendants, along with the IRS, Iowa DHS and Iowa Revenue',
      'Multiple named heirs generally means multiple chances at a yes -- heirs living out of the area often prefer cash over managing the property',
      'Sheriff''s sale scheduled October 27, 2026, 11:30 a.m. (Sheriff file 26006215) -- the longest runway of this probate tier'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '1936 Iowa St, Davenport, IA 52803',
    null, null,
    'Probate Property -- Likely Vacant, Sheriff''s Sale Scheduled', 'high', 'distress', 'development',
    array['probate_estate','sheriff_sale_scheduled','federal_tax_lien','likely_vacant'],
    array[
      'The recorded owner is deceased and the foreclosing bank could not identify a single heir -- the petition runs against "all unknown claimants," along with the IRS and Iowa HHS',
      'When a bank cannot find anyone to serve, the property is generally unoccupied -- worth a drive-by before assuming otherwise',
      'Title will need care: unknown heirs plus a federal lien is a genuinely complex combination -- budget for a real title search',
      'Sheriff''s sale scheduled October 27, 2026, 11:30 a.m. (Sheriff file 26006186)'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '1829 Valley Dr, Davenport, IA 52806',
    null, null,
    'Probate Property -- Sheriff''s Sale Scheduled', 'medium', 'distress', 'development',
    array['probate_estate','sheriff_sale_scheduled','heavy_lien_stack'],
    array[
      'Foreclosing plaintiff is a bank acting as trustee for a 2005 subprime mortgage-backed securitization -- a twenty-year-old loan finally reaching the courthouse',
      'The Iowa Estate Recovery Program is also on title, indicating a death in the ownership chain, plus two debt-buyer judgments stacked on top',
      'Heavy junior-lien stacks like this one often clear cheaply at sale since those liens get wiped out',
      'Sheriff''s sale scheduled September 29, 2026, 11:30 a.m. (Sheriff file 26004172)'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '3025 Oak St, Davenport, IA 52804',
    null, null,
    'Scheduled Sheriff Sale -- Heavy Lien Stack', 'medium', 'distress', 'development',
    array['sheriff_sale_scheduled','heavy_lien_stack'],
    array[
      'Active sheriff''s sale scheduled for September 15, 2026, with multiple liens stacked against the parcel',
      'In the target ZIP (52804) with the shortest runway to sale in this tier -- pre-sale contact is time-sensitive',
      'Confirm current sale status and lien payoff amounts with the Sheriff''s Office and Treasurer before reaching out'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '2439 W 61st St, Davenport, IA 52806',
    null, null,
    'Scheduled Sheriff Sale -- Tax & Municipal Liens', 'medium', 'distress', 'development',
    array['sheriff_sale_scheduled','state_tax_lien','municipal_lien','heavy_lien_stack'],
    array[
      'Active sheriff''s sale scheduled for September 29, 2026, carrying a state tax lien, a municipal lien, and additional liens',
      'A stacked-lien parcel like this often has a motivated party willing to negotiate before the courthouse date',
      'Confirm current sale status and lien payoff amounts with the Sheriff''s Office and Treasurer before reaching out'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '2110 W 58th St, Davenport, IA 52806',
    null, null,
    'Scheduled Sheriff Sale -- Municipal Lien', 'medium', 'distress', 'development',
    array['sheriff_sale_scheduled','municipal_lien'],
    array[
      'Active sheriff''s sale scheduled for September 15, 2026, with a municipal lien on the parcel',
      'A single-signal case, but the sale date is imminent',
      'Confirm current status directly with the Sheriff''s Office before reaching out -- sale dates can move'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '2353 Jackson Ave, Davenport, IA 52802',
    null, null,
    'Scheduled Sheriff Sale -- Municipal Lien', 'medium', 'distress', 'development',
    array['sheriff_sale_scheduled','municipal_lien'],
    array[
      'Active sheriff''s sale scheduled for September 15, 2026, with a municipal lien on the parcel',
      'A single-signal case, but the sale date is imminent',
      'Confirm current status directly with the Sheriff''s Office before reaching out -- sale dates can move'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '1717 W 10th St, Davenport, IA 52804',
    null, null,
    'Tax-Delinquent Parcel -- In Target ZIP', 'medium', 'distress', 'development',
    array['tax_lien','auction_adjacent'],
    array[
      'On the 2026 Scott County tax sale list -- one year delinquent, roughly $55,990 assessed value against a $644 amount owed, a very easy cure for the current owner or a low bar for a negotiated buyout',
      'Sits in ZIP 52804, the specific target area',
      'Confirm current redemption status with the Treasurer -- the owner can redeem right up until a tax deed issues'
    ],
    array['a7000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'bettendorf-ia'),
    '1511 Timberline Dr, Bettendorf, IA 52722',
    null, null,
    'Scheduled Sheriff Sale -- State Tax Lien', 'medium', 'distress', 'development',
    array['sheriff_sale_scheduled','state_tax_lien'],
    array[
      'Active sheriff''s sale scheduled for October 6, 2026, with a state tax lien on the parcel',
      'A genuine addressed single-family distress signal in Bettendorf -- most Bettendorf tax-roll activity found elsewhere in this research was manufactured-home-park liens, not site-built homes, which makes this one notable',
      'Confirm current sale status directly with the Sheriff''s Office before reaching out'
    ],
    array['a9000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '1319 Myrtle St, Davenport, IA 52804',
    null, null,
    'Tax-Delinquent, Absentee-Owned, High-Equity Parcel', 'medium', 'distress', 'development',
    array['tax_lien','auction_adjacent','absentee_out_of_state','high_equity'],
    array[
      'On the 2026 Scott County tax sale list -- roughly $21,490 assessed value against $1,794 owed',
      'Owner mailing address is out of state -- an absentee owner is generally easier to reach by mail than to negotiate with in person, and less attached to the property day-to-day',
      'Three overlapping signals (tax lien, absentee ownership, high equity) on one parcel in the target ZIP (52804) -- stronger than most single-signal cases'
    ],
    array['a7000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    '802 W 5th St, Davenport, IA 52802',
    null, null,
    'Tax-Delinquent, Absentee-Owned Parcel', 'low', 'distress', 'development',
    array['tax_lien','auction_adjacent','absentee_out_of_state'],
    array[
      'On the 2026 Scott County tax sale list -- roughly $39,910 assessed value against $1,625 owed',
      'Owner mailing address is out of state -- an absentee owner, generally easier to reach by mail than in person',
      'Confirm current redemption status with the Treasurer before sending a letter'
    ],
    array['a7000000-0000-4000-8000-000000000001'::uuid],
    '2026-08-29'
  );

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'davenport-ia'), 'distress', 'high_equity_absentee_pool',
    '3,692 candidate long-ownership/absentee parcels identified in ZIP 52804 alone',
    'A parcel-record screen (owner mailing address off-property, 35+ years on the deed, price band within reach of a small operator) surfaces 3,692 candidate parcels in ZIP 52804. No individual owner is named here -- this is a pool size, not a lead list -- consistent with keeping named private-owner data out of shared market intelligence. The profile is the classic "tired landlord / estate-transition" case: minimal remaining mortgage, decades of rental ownership, no listing agent involved. These are letter-and-postcard leads rather than urgent calls, but a large, real pool worth direct-mail outreach.',
    '2026-08-29', 'medium', array['investor']::shift_audience[],
    'a9000000-0000-4000-8000-000000000002', now()
  );
