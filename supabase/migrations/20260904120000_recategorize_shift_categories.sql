-- Rebuilds shift_category around a new 6-category taxonomy, replacing
-- the previous 5 (Distress, Compliance, Development, Construction,
-- Infrastructure). Product decision (Jared, 2026-09-04): naming reverts
-- to Groundbreakable, and categories become PLANS, BUILDING,
-- INFRASTRUCTURE, BUSINESS, PROPERTY, DISTRESS -- a fuller "local
-- change dashboard" taxonomy (contractor/rental/liquor licenses, sign/
-- elevator/electrical/solar/floodplain permits, mortgage filings,
-- easements, bond issuances, etc., all fold into the existing
-- categories via shift_type, no new categories needed for those).
--
-- Old -> new mapping for the 42 shifts already live across Topeka,
-- Lawrence, Tonganoxie, and Basehor (confirmed via direct query before
-- writing this -- every old category maps cleanly to exactly one new
-- one, no row-by-row judgment needed):
--   development    (11) -> plans          (rezonings, plats, annexations,
--                                           site plans, IRB/incentive requests)
--   construction   (10) -> building       (permits, inspections)
--   infrastructure (7)  -> infrastructure (unchanged)
--   compliance     (3)  -> distress       (code complaints, dangerous/vacant
--                                           -- all 3 existing rows are citizen
--                                           nuisance complaints, matching
--                                           DISTRESS's "code violations /
--                                           dangerous, vacant structures", not
--                                           BUILDING's "inspections")
--   distress       (11) -> distress       (unchanged: tax liens, foreclosure
--                                           auctions, probate)
--
-- business and property start empty -- no business-license or
-- property-assessment data has been sourced yet for any market.

alter type shift_category rename to shift_category_old;

create type shift_category as enum (
  'plans', 'building', 'infrastructure', 'business', 'property', 'distress'
);

alter table shifts
  alter column category type shift_category
  using (
    case category::text
      when 'development' then 'plans'
      when 'construction' then 'building'
      when 'infrastructure' then 'infrastructure'
      when 'compliance' then 'distress'
      when 'distress' then 'distress'
    end
  )::shift_category;

drop type shift_category_old;
