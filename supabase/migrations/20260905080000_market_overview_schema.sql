-- Market section: city-level growth/economic indicators, answering
-- "is this market growing, slowing, or changing?" -- a different kind of
-- data than everything else in this schema (shifts/projects/investments
-- are parcel-level events; this is macro population/jobs/income/housing
-- context for the market as a whole).
--
-- Two tables: `market_indicators` is one row per metric (drives the
-- card grid -- current value, prior value, computed change/trend, unit,
-- source, date). `market_overviews` is one row per market carrying the
-- short prose summary plus the non-numeric narrative fields (major
-- employers, recent employer changes, new business activity) that don't
-- fit a "current value + trend" card shape.
create table market_indicators (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  metric_key text not null, -- e.g. 'population', 'nonfarm_employment', 'unemployment_rate', 'median_household_income', 'single_family_permits' -- free text, not enum-constrained (more metrics will land as more sources get added)
  label text not null,
  unit text not null, -- 'people', 'thousands_of_jobs', 'percent', 'usd', 'permits'

  current_value numeric not null,
  current_value_date date not null,
  prior_value numeric, -- nullable: some metrics (see median_household_income handling) may ship without a clean same-methodology comparison
  prior_value_date date,
  change_absolute numeric,
  change_percent numeric,
  trend text check (trend in ('up', 'down', 'flat')), -- nullable when there's no valid comparison to trend against

  notes text, -- caveats, e.g. methodology gaps or what geography a figure actually covers
  source_id uuid references sources (id) on delete set null,
  confidence text not null check (confidence in ('verified', 'reported', 'unconfirmed')),

  created_at timestamptz not null default now(),

  unique (market_id, metric_key)
);

create index market_indicators_market_idx on market_indicators (market_id);

alter table market_indicators enable row level security;

create policy "market_indicators_select_with_access" on market_indicators
  for select using (public.has_market_access(market_id));
create policy "market_indicators_write_admin" on market_indicators
  for all using (public.is_admin()) with check (public.is_admin());

create table market_overviews (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null unique references markets (id) on delete cascade,

  summary text not null, -- the 1-2 sentence "what the data suggests" takeaway
  major_employers text[] not null default '{}',
  major_employers_note text, -- e.g. caveats about unverified employee counts / blocked primary sources
  recent_employer_changes text[] not null default '{}', -- dated expansion/closure bullets
  new_business_activity text, -- nullable -- honestly null when no public data was found, not guessed

  source_ids uuid[] not null default '{}', -- narrative-level citations (e.g. the employer-closure article); indicator-level citations live on market_indicators instead

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table market_overviews enable row level security;

create policy "market_overviews_select_with_access" on market_overviews
  for select using (public.has_market_access(market_id));
create policy "market_overviews_write_admin" on market_overviews
  for all using (public.is_admin()) with check (public.is_admin());
