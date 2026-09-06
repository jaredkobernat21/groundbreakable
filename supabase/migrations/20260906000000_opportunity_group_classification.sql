-- Development Intelligence restructure (Jared, 2026-09-06): Opportunities
-- gets a second, orthogonal dimension on top of the existing
-- distress/zoning/early_project `category` (which stays -- Jared's own
-- Sept 5 categorization work) -- `opportunity_group`, answering "who is
-- this for" (Development / Builder / Contractor) rather than "why is this
-- an opportunity". distress and zoning are unambiguously land/entitlement
-- signals aimed at developers/investors, so they default straight to
-- 'development'. early_project rows vary per row -- each one's reasons
-- text already states, as a fact already on file, whether it's a
-- residential-lot subdivision (Builder Opportunity) or a single larger
-- building needing a GC (Contractor Opportunity), so those 3 rows are
-- classified explicitly below rather than guessed generically.
alter table development_opportunities
  add column opportunity_group text not null default 'development'
    check (opportunity_group in ('development', 'builder', 'contractor'));

alter table development_opportunities alter column opportunity_group drop default;

-- KU Innovation Park: 341-unit market-rate apartment complex -- a single
-- multifamily building, the spec's "GC not identified" Contractor case.
update development_opportunities
set opportunity_group = 'contractor'
where address = 'Near 23rd St & Iowa St (KU Innovation Park), Lawrence, KS';

-- Peterson Rd annexation (161 SF lots + 14 duplex) and Peterson Rd/
-- Monterey Way (130-home SF subdivision) -- both residential-lot
-- subdivisions with a developer but no vertical/home builder named yet,
-- the spec's Builder Opportunity case.
update development_opportunities
set opportunity_group = 'builder'
where address in (
  'E 1000 Rd & N 1700 Rd (Peterson Rd), Lawrence, KS',
  'Near Peterson Rd & Monterey Way, Lawrence, KS'
);
