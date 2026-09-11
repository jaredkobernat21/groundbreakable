-- Adds the single strongest off-market lead found for Aaron so far
-- (Jared, 2026-09-08, "find the perfect Tulsa off market property"):
-- 1002 E 20th St S in Maple Ridge, one of Tulsa's most prestigious
-- historic neighborhoods -- on Tulsa County's actual 2026 June tax
-- resale auction land list (parcel 25025-92-12-08940), which is itself
-- the clearest possible form of a tax-lien distress signal (3+ years
-- delinquent, per Title 68 O.S. -- see the tax_resale_list shift already
-- on file). Minimum bid $40,051.99 against the county Assessor's own
-- current Fair Cash Market Value of $695,400 -- roughly a 17x gap
-- between what it takes to acquire vs. what the county itself says it's
-- worth, independently corroborated by real neighborhood comps (Zillow/
-- Rocket Homes: Maple Ridge median home value $582K-$689K, range
-- $499K-$1.7M). Found by downloading and parsing the county's own 205-
-- page, 1,371-parcel land list PDF and ranking every improved
-- residential parcel by minimum bid -- this one topped the list by
-- neighborhood prestige, not bid size alone.
--
-- Ownership note: parcel carries a Homestead exemption and the owner's
-- mailing address matches the property address (Rachel C McCarthy
-- Trust) -- NOT an absentee-mailing-address case, so this is the
-- tax-lien signal specifically, not the absentee-owner one. Flagging
-- that plainly rather than overstating the match.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('ac000000-0000-4000-8000-000000000018', 'Tulsa County Assessor', 'Property record — 1002 E 20th St S, Maple Ridge Addn (parcel 25025-92-12-08940 / account R25025921208940)', 'agency_gis', 'https://assessor.tulsacounty.org/Property/Info?accountNo=R25025921208940', null),
  ('ac000000-0000-4000-8000-000000000019', 'Zillow / Rocket Homes', 'Maple Ridge, Tulsa neighborhood home values (median $582K-$689K, range $499K-$1.7M)', 'other', 'https://www.zillow.com/maple-ridge-tulsa-ok/home-values/', '2026-03-01');

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, address, lat, lng, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'tax_resale_delinquency',
    '1002 E 20th St S (Maple Ridge) carries a $40,052 tax-resale minimum bid against a $695,400 county market value',
    'Parcel 25025-92-12-08940, 3+ years property-tax delinquent, listed on Tulsa County''s 2026 June Resale Auction land list. Owned by the Rachel C McCarthy Trust (homestead-coded; mailing address matches the property, so this is a tax-lien signal, not an absentee-owner one). Sits in Maple Ridge, one of Tulsa''s most prestigious historic districts -- county Fair Cash Market Value jumped from $520,203 to $695,400 year-over-year, independently consistent with neighborhood comps ($582K-$689K median, $499K-$1.7M range per Zillow/Rocket Homes).',
    '2026-04-27', 'high', '1002 E 20th St S, Tulsa, OK 74120', 36.134125, -95.980429, array['investor','developer']::shift_audience[],
    'ac000000-0000-4000-8000-000000000018', now()
  );

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'tulsa-ok'),
    '1002 E 20th St S, Tulsa, OK 74120',
    36.134125, -95.980429,
    'Tax-Resale Home in a Top-Tier Historic District — 17x Bid-to-Value Gap', 'high', 'distress', 'development',
    array['tax_delinquent','off_market','high_arv_neighborhood','trust_owned'],
    array[
      'On Tulsa County''s actual 2026 June Resale Auction land list -- 3+ years property-tax delinquent, minimum bid $40,051.99 (parcel 25025-92-12-08940) -- a real, dated county record, not a scraped listing',
      'County Assessor''s own current Fair Cash Market Value is $695,400, up from $520,203 the prior year -- roughly 17x the minimum bid, the widest bid-to-value gap found in this account''s entire tracked footprint',
      'Independently corroborated: Maple Ridge''s own market comps run $582K-$689K median ($499K-$1.7M range per Zillow/Rocket Homes) -- the county''s valuation isn''t an outlier, the neighborhood itself supports it',
      'Homestead-coded with an improved structure on a 12,300 sq ft lot (not vacant land); owned by the Rachel C McCarthy Trust -- trust ownership often signals an estate/succession situation worth a direct, careful outreach conversation',
      'Real risk to underwrite before offering: owners can redeem right up to the June auction (the list shrinks daily), and a tax-resale purchase needs its own title/lien-priority confirmation -- treat the $40K minimum bid as a starting point requiring diligence, not a guaranteed price'
    ],
    array['ac000000-0000-4000-8000-000000000002'::uuid, 'ac000000-0000-4000-8000-000000000018'::uuid, 'ac000000-0000-4000-8000-000000000019'::uuid],
    '2026-09-08'
  );
