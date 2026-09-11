-- Seeds real signals for Davenport, IA (Jared, 2026-09-07: building a
-- profile for Joel Kobernat, an investor there). The market row already
-- existed but had zero data of any kind -- this is Groundbreakable's
-- first real content for it. All three sources are current, dated,
-- specific: the Downtown Davenport Partnership's own announced
-- investment pipeline, the city's own Riverwatch Place approval
-- announcement, and two real active land listings (one with a live MLS
-- number and price).

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a6000000-0000-4000-8000-000000000001', 'River Cities'' Reader', 'Downtown Davenport Partnership Unveils New Downtown Brand, Highlights Investment Pipeline', 'news', 'https://www.rcreader.com/news-releases/downtown-davenport-partnership-unveils-new-downtown-brand-highlights-investment', '2026-06-24'),
  ('a6000000-0000-4000-8000-000000000002', 'WQAD', 'City of Davenport breaks ground on multimillion dollar riverfront project', 'news', 'https://www.wqad.com/article/news/local/main-street-landing-project-davenport-ground-breaking/526-26038b20-fc36-4a7d-881a-c2859645b569', '2026-04-03'),
  ('a6000000-0000-4000-8000-000000000003', 'City of Davenport', 'City Council approves Riverwatch Place agreement', 'agency_document', 'https://www.davenportiowa.com/news/what_s_new/city_council_approves_riverwatch_place_agreement_', '2025-01-16'),
  ('a6000000-0000-4000-8000-000000000004', 'Mel Foster Co.', 'Davenport Lots for Sale — Iowa, Quad Cities', 'other', 'https://www.melfosterco.com/Davenport-lots-for-sale', null),
  ('a6000000-0000-4000-8000-000000000005', 'Zillow', 'Lot 1 & 2 145th St, Davenport, IA 52804 (MLS #12601149)', 'other', 'https://www.zillow.com/homedetails/LOT-1-2-145th-St-Davenport-IA-52804/461282682_zpid/', null);

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'davenport-ia'), 'plans', 'downtown_investment_pipeline',
    'Downtown Davenport Partnership announces $68M+ investment pipeline, new downtown brand',
    'Unveiled at DDP''s June 24, 2026 Annual Meeting -- catalytic gateway projects and corridor opportunities. FY26 also saw $132K+ in property improvement grants across 11 downtown buildings, leveraging $870K in additional private investment.',
    '2026-06-24', 'high', array['developer','investor']::shift_audience[],
    'a6000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'davenport-ia'), 'infrastructure', 'riverfront_park',
    'City breaks ground on Main Street Landing ($24M, 10-acre riverfront park)',
    'Playground towers, water features, hillside picnic area, and a multi-use plaza (pickleball/beach in summer, ice rink in winter). Expected complete late 2026 -- public riverfront investment often precedes nearby residential/commercial appreciation.',
    '2026-04-03', 'medium', array['developer','investor']::shift_audience[],
    'a6000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'davenport-ia'), 'building', 'hotel_mixed_use_construction',
    'Riverwatch Place ($19M, 82-room Marriott TownePlace Suites + mixed-use commercial) approved',
    'City Council approved a revised tax incentive plan 6-3 for the project at 227 LeClaire St (bordered by LeClaire St, E 3rd St, E River Drive): a 4-story extended-stay hotel with pool/rooftop patio, plus a commercial building with a restaurant, two floors of office space, and a top-floor event center. Sidewalks required within 12 months; project reported "fast track" toward ~2-year completion.',
    '2025-01-16', 'high', array['developer','investor']::shift_audience[],
    'a6000000-0000-4000-8000-000000000003', now()
  );

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'davenport-ia'),
    'Marquette St, Davenport, IA 52806 (30.02 ac surrounding the Oakbrook subdivision)',
    null, null,
    '80-Lot Concept Land — Flexible Development', 'high', 'early_project', 'development',
    array['large_land_parcel','flexible_development','near_established_subdivision'],
    array[
      '30.02 acres with an 80-lot concept plan already laid out -- purchaser can develop however they see fit, not locked into the concept',
      'Sits directly adjacent to the established, popular Oakbrook subdivision -- built-in market comps and buyer demand',
      'A real, active listing (Ryan Fick, Mel Foster Co.) -- not off-market speculation',
      'Large enough for a genuine subdivision-scale play, small enough to be a realistic single acquisition'
    ],
    array['a6000000-0000-4000-8000-000000000004'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'davenport-ia'),
    'SW corner of 145th St & 110th Ave, Davenport, IA 52804 (West Wind Hills subdivision)',
    null, null,
    'Newly Platted Estate Lots — 6 Acres Total', 'medium', 'early_project', 'development',
    array['newly_platted','utilities_available'],
    array[
      'Two identical, newly platted 3-acre parcels, listed together at $349,000 (MLS #12601149)',
      'Gas, electric, and public water already nearby -- infrastructure-ready, not raw/unimproved land',
      'Flat, usable layout with generous road frontage',
      'Minutes from Davenport amenities despite a country-style setting -- a real edge-of-city positioning'
    ],
    array['a6000000-0000-4000-8000-000000000005'::uuid],
    '2026-09-07'
  );
