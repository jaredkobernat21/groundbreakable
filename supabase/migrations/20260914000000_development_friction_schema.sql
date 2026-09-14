-- Development friction: answers the questions Jared asked directly --
-- "how long are projects/construction taking" and "what have the biggest
-- holdups/risks been" for a given market -- neither of which fits an
-- existing table. `market_overviews` is macro population/employer
-- narrative; `shifts`/`projects` are individual parcel-level events with
-- no place to hang a market-wide pattern ("annexation votes run ~1
-- month", "federally-funded projects slip to NEPA time"). This is a
-- new, small, market-level table in the same spirit as market_overviews:
-- a handful of human-researched, sourced rows per market, not a
-- computed rollup -- there isn't enough completed-project history in
-- `projects`/`project_events` yet to derive these patterns automatically.
--
-- `kind` is a fixed 3-value enum, not open-ended free text like
-- shift_type/opportunity_type -- unlike those, this taxonomy maps
-- directly to the two things a developer asks ("how long" / "what's the
-- risk") plus a catch-all for market-level context that's neither
-- (e.g. the city's growth-vs-utility-cost dynamic). Three values is
-- stable; no reason to expect it to grow.
create type friction_kind as enum ('timeline', 'risk', 'context');

create table development_friction_signals (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  kind friction_kind not null,
  -- severity only means something for kind='risk' -- nullable for
  -- timeline/context rows rather than forcing a meaningless default.
  -- Reuses shift_impact (low/medium/high) instead of a new enum -- same
  -- three-value low/medium/high shape, no reason to duplicate it.
  severity shift_impact,

  title text not null,
  summary text not null,

  -- Optional quantified figure backing the summary (29 days, 3500000
  -- usd, 16 months, ...). Free-text unit, not enum-constrained -- same
  -- reasoning as market_indicators.unit: the set of things worth
  -- quantifying here (days, months, usd, usd_per_lot) will keep growing.
  metric_value numeric,
  metric_unit text,

  -- Loose optional links to the specific project/shift this pattern was
  -- observed on, for a "see the example" jump-off point in the UI.
  -- Nullable: several rows here are market-wide patterns (the utility
  -- capacity/growth dynamic) with no single project to point at.
  related_project_id uuid references projects (id) on delete set null,
  related_shift_id uuid references shifts (id) on delete set null,

  observed_date date not null,
  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),

  created_at timestamptz not null default now()
);

create index development_friction_signals_market_idx on development_friction_signals (market_id, kind);

alter table development_friction_signals enable row level security;

create policy "development_friction_signals_select_with_access" on development_friction_signals
  for select using (public.has_market_access(market_id));
create policy "development_friction_signals_write_admin" on development_friction_signals
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Seed: Lawrence, researched 2026-09-14 --------------------------------
-- Every row below is grounded in either an existing sourced `shifts`/
-- `projects` row already in this market or a freshly researched news
-- article (new `sources` rows inserted here). No figure is estimated or
-- rounded from a guess -- see each summary for exactly what it's from.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a6e8b4f0-6e1a-4b8e-9b8a-1f6d9c2e4a71', 'The Lawrence Times', 'Construction of downtown Lawrence transit hub delayed; environmental review underway', 'news', 'https://lawrencekstimes.com/2025/09/05/downtown-transit-hub-construction-delayed/', '2025-09-05'),
  ('c1d4f7a2-3b9e-4a6c-8d5f-2e7b1a9c6f48', 'Lawrence Journal-World', 'Some leaders are now stating a new reason for why Lawrence''s utility rates are soaring: The city didn''t grow enough', 'news', 'https://www2.ljworld.com/news/city-government/2026/apr/04/some-leaders-are-now-stating-a-new-reason-for-why-lawrences-utility-rates-are-soaring-the-city-didnt-grow-enough/', '2026-04-04');

insert into development_friction_signals (market_id, kind, severity, title, summary, metric_value, metric_unit, related_shift_id, observed_date, source_id, confidence)
select
  m.id, 'timeline', null,
  'Annexation/rezoning: Planning Commission recommendation to final City Commission vote runs about a month',
  'Beacon Landing (288 acres, west Lawrence) moved from Planning Commission recommendation to final City Commission approval in 29 days (7/20/2026 to 8/18/2026); the earlier 65-acre NW Lawrence annexation ran PC recommendation in February to CC approval in April on a similar cadence. The commission vote itself is fast -- entitlement risk and site work afterward is the long pole, not this step.',
  29, 'days',
  sh.id, '2026-08-18',
  sh.source_id, 'reported'
from markets m
join shifts sh on sh.market_id = m.id and sh.shift_type = 'annexation_rezoning' and sh.event_date = '2026-08-18'
where m.name = 'Lawrence' and m.state = 'KS';

insert into development_friction_signals (market_id, kind, severity, title, summary, metric_value, metric_unit, related_shift_id, observed_date, source_id, confidence)
select
  m.id, 'timeline', null,
  'Entitlement-to-groundbreaking can run well over a year, even after unanimous approval and financing',
  'Floret Hill (121-unit affordable housing, SE corner K-10/Bob Billings Pkwy) already had zoning approved unanimously and a ~$6.9M city incentive package committed by 2/3/2026, with permanent financing closed by mid-2026 -- but units aren''t slated until mid-2027, and construction hadn''t been publicly confirmed as started as of this research pass (Sept 2026). Full approval and financing alignment doesn''t guarantee an immediate groundbreaking.',
  16, 'months',
  sh.id, '2026-02-03',
  sh.source_id, 'reported'
from markets m
join shifts sh on sh.market_id = m.id and sh.shift_type = 'incentive_commitment'
where m.name = 'Lawrence' and m.state = 'KS';

insert into development_friction_signals (market_id, kind, severity, title, summary, related_shift_id, observed_date, source_id, confidence)
select
  m.id, 'risk', 'high',
  'Federally-funded projects run on NEPA time, not the announced schedule',
  'The Downtown Transit Station (8th & Vermont) was targeted for Q3 2026 completion when its site was picked in Dec 2024. Because it carries KDOT/federal funding, it''s subject to mandatory NEPA environmental review -- completion has since slipped to a tentative 2027-2028. Any Lawrence project with federal dollars attached should be underwritten assuming 12+ months of review overhead beyond the stated schedule.',
  sh.id, '2025-09-05',
  'a6e8b4f0-6e1a-4b8e-9b8a-1f6d9c2e4a71', 'reported'
from markets m
join shifts sh on sh.market_id = m.id and sh.shift_type = 'transit_station'
where m.name = 'Lawrence' and m.state = 'KS';

insert into development_friction_signals (market_id, kind, severity, title, summary, related_shift_id, observed_date, source_id, confidence)
select
  m.id, 'risk', 'medium',
  'Annexation entitlement isn''t a rubber stamp, even at scale',
  'A 177-acre annexation request at K-10 and 6th St (1,000+ units per reporting) got a 4-3 recommend-denial from Planning Commission in August 2026. Kansas law lets City Commission override a Planning Commission recommendation, and coverage expects exactly that here -- but it shows large annexation requests can draw real opposition before final approval, not just procedural delay.',
  sh.id, '2026-08-24',
  sh.source_id, 'reported'
from markets m
join shifts sh on sh.market_id = m.id and sh.shift_type = 'annexation_denial_recommended'
where m.name = 'Lawrence' and m.state = 'KS';

insert into development_friction_signals (market_id, kind, severity, title, summary, metric_value, metric_unit, related_shift_id, observed_date, source_id, confidence)
select
  m.id, 'risk', 'medium',
  'Sewer/utility extension costs on the fringe are material and site-specific',
  'The city estimated roughly $3.5M to extend sewer service to the Queens Road annexation (about 168 lots) -- on the order of $20k/lot before a single house is built. Any site outside existing utility lines, especially west of the South Lawrence Trafficway, should underwrite a comparable extension cost rather than assume it''s absorbed by the city.',
  3500000, 'usd',
  sh.id, '2026-04-07',
  sh.source_id, 'reported'
from markets m
join shifts sh on sh.market_id = m.id and sh.shift_type = 'annexation_rezoning' and sh.event_date = '2026-04-07'
where m.name = 'Lawrence' and m.state = 'KS';

insert into development_friction_signals (market_id, kind, severity, title, summary, observed_date, source_id, confidence)
select
  m.id, 'context', null,
  'The city is carrying a growth bet that hasn''t paid off yet -- a plausible tailwind for annexation approvals',
  'Lawrence built a $74M sewage treatment plant (2018) and expanded water treatment capacity toward a 120K-by-2030 population plan; the actual growth trajectory is closer to 100K by 2030, and water/sewer rates have risen 9-11%/year partly because there are fewer ratepayers to spread fixed infrastructure costs across (the mayor has said so on the record). Net effect for a developer: treatment capacity is not a near-term constraint, and the City Commission has a live financial incentive to approve annexations that add ratepayers -- plausibly part of why large west-Lawrence annexations (Beacon Landing, Queens Road, and more under review) have been moving quickly in 2026.',
  '2026-04-04',
  'c1d4f7a2-3b9e-4a6c-8d5f-2e7b1a9c6f48', 'reported'
from markets m
where m.name = 'Lawrence' and m.state = 'KS';
