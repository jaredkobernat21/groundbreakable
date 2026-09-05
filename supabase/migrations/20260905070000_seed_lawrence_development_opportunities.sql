-- Real, evidence-based Opportunities for Lawrence -- reviewed 2026-09-05
-- against every shift/project/momentum-area already on file. Only two
-- properties clear the "multiple overlapping signals" bar: both tax
-- foreclosure sales in Lawrence's data happen to also sit inside the
-- Downtown/Near-Downtown Core momentum area, one of them within
-- half a mile of two active projects. No other candidate exists yet --
-- the two permitted addresses (1626 W 23rd St, 2617 Belle Crest Dr) are
-- themselves the source of construction activity, not a distress/vacancy/
-- zoning signal on top of it, and neither the 23rd & Iowa nor West
-- Lawrence/K-10 momentum areas have a parcel-level distress, vacancy,
-- code-violation, or zoning-upside signal on file to stack against their
-- area-level momentum -- momentum alone is one signal, not "multiple
-- signals overlapping," so nothing there qualifies yet. Widening this
-- list is a matter of more source data landing (vacancy/code-violation
-- feeds, ownership-change/parcel-assemblage records), not a
-- classification choice.

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, signals, reasons, source_ids, date_identified)
select
  m.id,
  '225 N 5th St, Lawrence, KS',
  38.975493616545, -95.228981797456,
  'Distressed Property in a High-Momentum Corridor',
  'high',
  array['tax_foreclosure', 'high_momentum', 'nearby_project'],
  array[
    'Sold at Douglas County sheriff''s sale for delinquent taxes, special assessments, and costs (Case No. DG-2025-CV-000-258, Cause No. 13, $14,231.31 judgment) -- ownership is in transition.',
    'Sits inside the Downtown / Near-Downtown Core momentum area, currently rated Accelerating.',
    '0.38 miles from Urban Row, 15 row houses under construction right now two blocks away.',
    '0.55 miles from 9 Del Lofts II, a 36-unit affordable housing project just approved by the City Commission.'
  ],
  array[
    (select id from sources where url = 'https://www.dgcoks.gov/sites/default/files/2026-07/2026-07-07%20Notice%20of%20Sheriff''s%20Sale.pdf'),
    (select id from sources where url = 'https://www2.ljworld.com/weblogs/town_talk/2026/mar/09/lawrence-developer-has-trio-of-projects-underway-ranging-from-600k-row-houses-in-downtown-to-new-neighborhoods-on-citys-edge/'),
    (select id from sources where url = 'https://www2.ljworld.com/news/city-government/2025/dec/17/commissioners-pledge-80000-to-assist-loft-project-in-east-lawrence-on-condition-it-has-more-affordable-units/')
  ],
  '2026-08-12'
from markets m
where m.slug = 'lawrence-ks';

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, signals, reasons, source_ids, date_identified)
select
  m.id,
  '2139 Pennsylvania St, Lawrence, KS',
  38.944624941118, -95.229615818887,
  'Distressed Property in a High-Momentum Corridor',
  'medium',
  array['tax_foreclosure', 'high_momentum', 'nearby_infrastructure'],
  array[
    'Sold at Douglas County sheriff''s sale for delinquent taxes, special assessments, and costs (Case No. DG-2025-CV-000-258, Cause No. 7, $31,317.49 judgment) -- ownership is in transition.',
    'Sits inside the Downtown / Near-Downtown Core momentum area, currently rated Accelerating.',
    '0.6 miles from the Massachusetts Street bus stop improvement grant ($50,000, part of the upcoming 14th-23rd St multimodal reconfiguration).',
    'Roughly 1.6-1.85 miles from the corridor''s active construction (Urban Row) and the largest proposed project nearby (The Crossing) -- in the same broader momentum area, though not close enough to weight as strongly as the 225 N 5th St property.'
  ],
  array[
    (select id from sources where url = 'https://www.dgcoks.gov/sites/default/files/2026-07/2026-07-07%20Notice%20of%20Sheriff''s%20Sale.pdf'),
    (select id from sources where url = 'https://www2.ljworld.com/news/city-government/2026/sep/04/lawrence-receives-50000-grant-from-blue-cross-and-blue-shield-of-kansas-for-bus-stop-improvements-on-massachusetts-street/')
  ],
  '2026-08-12'
from markets m
where m.slug = 'lawrence-ks';
