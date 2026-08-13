-- Expands Opportunities from a single opportunity_type per property to a
-- signals text[] -- the product now tracks a broader signal taxonomy (tax
-- delinquency, vacancy, code violations, price drops, underutilized land,
-- zoning upside, on top of the existing pre-foreclosure/tax lien/absentee/
-- high-equity/listing set) and a property can legitimately carry more than
-- one at once. Multi-signal properties ("2+ signals firing on the same
-- address") are the strongest leads, so the app highlights them -- that
-- needs an array, not a single enum column.
--
-- signals replaces opportunity_type outright rather than adding alongside
-- it: keeping both would leave two overlapping sources of truth for "what
-- kind of opportunity is this," and every existing row maps cleanly onto
-- signals = ARRAY[opportunity_type].

alter table opportunities add column signals text[];

update opportunities set signals = array[opportunity_type];

alter table opportunities alter column signals set not null;
alter table opportunities add constraint opportunities_signals_not_empty
  check (array_length(signals, 1) >= 1);
alter table opportunities add constraint opportunities_signals_valid
  check (
    signals <@ array[
      'pre_foreclosure', 'tax_lien', 'tax_delinquent', 'absentee_owner',
      'high_equity_owner', 'vacant', 'code_violation', 'listing',
      'price_drop', 'underutilized_land', 'zoning_upside'
    ]::text[]
  );

drop index if exists opportunities_market_type_idx;
alter table opportunities drop constraint if exists opportunities_opportunity_type_check;
alter table opportunities drop column opportunity_type;

create index opportunities_market_signals_idx on opportunities using gin (signals);

-- New enrichment fields for the added signal types. original_list_price
-- sits alongside the existing asking_price (read as "current price") so a
-- price_drop signal can show the drop; the rest are straightforward
-- per-signal detail, following the same "nullable, filled in only when
-- researched" pattern as the existing buildability/investment columns.
alter table opportunities
  add column original_list_price numeric,
  add column lot_size_acres numeric,
  add column code_violation_count int,
  add column code_violation_summary text,
  add column vacant_since date;
