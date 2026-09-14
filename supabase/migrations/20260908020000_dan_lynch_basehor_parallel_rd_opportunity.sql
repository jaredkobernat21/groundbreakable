-- Adds a specific, directly-actionable opportunity for Dan Lynch inside
-- the #1-ranked Basehor NW Growth Corridor (Jared, 2026-09-08: "is there
-- a tax lien/land distress or even active listing... specific actionable
-- opportunity"). Checked the distress angle first: Leavenworth County
-- does NOT publish an online delinquent-tax/resale land list the way
-- Tulsa County does -- its tax sale list requires an in-person visit to
-- the County Counselor's office once a sale date is set, and its parcel
-- GIS search requires a login this session doesn't have. No tax-lien
-- opportunity could be sourced for this corridor from public online
-- records -- stated plainly rather than manufactured.
--
-- What IS real and actionable: 15020 Parallel Rd, a 92-acre active MLS
-- listing (#2254678, Heck Land Company) geocoded to ~0.25 miles from the
-- live PRZ-005-26 / PPDP-03-26 rezoning case at N 152nd St & Parallel Rd
-- already on file -- confirming this stretch of Parallel Rd is the
-- active growth edge of Basehor right now, not just the one parcel being
-- rezoned. Listing claims (zoning, utility access) are marketing
-- language, not county-confirmed -- flagged honestly below as needing
-- direct verification, same restraint as every other opportunity in
-- this account.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a1000000-0000-4000-8000-000000000014', 'Land and Farm / Heck Land Company', '15020 Parallel Road, Basehor, KS 66007 — 92-acre listing (MLS #2254678)', 'other', 'https://www.landandfarm.com/property/basehor-92-12049597/', null);

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'basehor-ks'),
    '15020 Parallel Road, Basehor, KS 66007',
    39.128711, -94.927512,
    '92-Acre Active Listing — Same Corridor as Live Rezoning Case', 'high', 'early_project', 'development',
    array['active_listing','buildable_now','utility_access','adjacent_rezoning_activity','existing_subdivision_precedent'],
    array[
      'Active MLS listing (#2254678, Heck Land Company) -- 92 acres at $650,000 (~$7,065/acre), directly purchasable today, not speculative or off-market',
      'Geocoded to ~0.25 miles from the live PRZ-005-26 / PPDP-03-26 rezoning case at N 152nd St & Parallel Rd -- confirms this stretch of Parallel Rd is the active growth edge of Basehor right now, not an isolated parcel',
      'Listing states city water, sewer, and electric are "easily accessed" and an existing subdivision already borders the west side -- a real buildability precedent, though exact utility stub distance and the listing''s "zoned for single family development" claim should be independently confirmed with Leavenworth County before underwriting (marketing copy, not a county record)',
      '1 mile from Basehor-Linwood High School, 1.3 miles from Basehor Intermediate School, 1 mile north of US-24/40, short drive to the Legends -- strong location fundamentals for family-home absorption',
      'No tax-lien/distress angle could be sourced for this corridor -- Leavenworth County does not publish an online delinquent-tax list (unlike Tulsa County); its tax sale list requires an in-person County Counselor''s office visit once a sale date is set. This active listing is the concrete, actionable path today, not a distress play'
    ],
    array['a1000000-0000-4000-8000-000000000014'::uuid],
    '2026-09-08'
  );
