-- Phase 2 (dashboard data-access rewrite) needs the new tables to stay
-- current, not just correctly backfilled once. The admin UI that writes
-- projects/opportunities/opportunity_zones isn't being touched yet (that's
-- a later phase), so anything it inserts or updates from here on needs to
-- keep landing in the new schema automatically, or the two "run in
-- parallel" query paths would silently diverge the moment someone adds a
-- project or opportunity today. Every trigger below mirrors exactly the
-- mapping already verified in the Phase 1 backfill -- no new judgment
-- calls, just keeping it live going forward.

-- 'investor' wasn't in the original role list (companies/project_parties
-- didn't exist when this data model was scoped) -- projects.investor is
-- real, populated data going forward even though 0 rows have it today, so
-- the role vocabulary needs to represent it rather than silently drop it.
alter table project_parties drop constraint project_parties_role_check;
alter table project_parties add constraint project_parties_role_check
  check (role in ('developer', 'builder_gc', 'owner', 'architect_engineer', 'applicant', 'investor'));

-- Safe now that Phase 1's backfill already proved there are no case-
-- sensitive collisions among the 30 existing names -- needed so the sync
-- trigger below can upsert without creating duplicate company rows for
-- the same firm.
alter table companies add constraint companies_name_unique unique (name);

-- --- projects.category/status -> plan_category/stage ---------------------
-- Identical CASE mapping to the one-time backfill. category/status stay
-- the source of truth the current admin UI writes; plan_category/stage
-- are kept as their derived projection until a later phase's admin form
-- starts setting them directly.

create or replace function public.derive_project_plan_category_and_stage()
returns trigger
language plpgsql
as $$
begin
  new.plan_category := case new.category
    when 'active_development' then 'development'
    when 'business_announcement' then 'development'
    when 'land_transaction' then 'development'
    when 'planning_entitlement' then 'land_use'
    when 'zoning' then 'land_use'
    when 'infrastructure' then 'infrastructure'
  end;
  new.stage := case new.status
    when 'proposed' then 'proposed'
    when 'planning_review' then 'review_planning'
    when 'filed' then 'review_planning'
    when 'under_review' then 'review_planning'
    when 'approved' then 'approved'
    when 'permitted' then 'permitting'
    when 'under_construction' then 'construction'
    when 'completed' then 'complete'
    else null -- on_hold, cancelled
  end;
  return new;
end;
$$;

create trigger projects_derive_plan_category_and_stage
  before insert or update of category, status on projects
  for each row execute procedure public.derive_project_plan_category_and_stage();

-- --- projects.developer/contractor/investor -> companies/project_parties -

create or replace function public.sync_project_party(p_project_id uuid, p_name text, p_role text)
returns void
language plpgsql
as $$
declare
  v_company_id uuid;
begin
  if p_name is null then
    return;
  end if;
  insert into companies (name) values (p_name)
    on conflict (name) do nothing;
  select id into v_company_id from companies where name = p_name;
  insert into project_parties (project_id, company_id, role)
    values (p_project_id, v_company_id, p_role)
    on conflict (project_id, company_id, role) do nothing;
end;
$$;

create or replace function public.sync_project_parties()
returns trigger
language plpgsql
as $$
begin
  perform public.sync_project_party(new.id, new.developer, 'developer');
  perform public.sync_project_party(new.id, new.contractor, 'builder_gc');
  perform public.sync_project_party(new.id, new.investor, 'investor');
  return new;
end;
$$;

create trigger projects_sync_parties
  after insert or update of developer, contractor, investor on projects
  for each row execute procedure public.sync_project_parties();

-- --- opportunities.signals[] -> signals -----------------------------------
-- INSERT only: the admin UI has no "edit opportunity" action today (see
-- opportunities/actions.ts -- createOpportunity is the only write path),
-- so there's no update case to reconcile yet.

create or replace function public.sync_opportunity_signals()
returns trigger
language plpgsql
as $$
begin
  insert into signals (market_id, opportunity_id, address, latitude, longitude, signal_type, detected_date, source_id, confidence)
  select new.market_id, new.id, new.address, new.latitude, new.longitude, unnest(new.signals), new.date_identified, new.source_id, new.confidence;
  return new;
end;
$$;

create trigger opportunities_sync_signals
  after insert on opportunities
  for each row execute procedure public.sync_opportunity_signals();

-- --- opportunity_zones -> zoning_land_use ---------------------------------

create or replace function public.sync_opportunity_zone_to_zoning_land_use()
returns trigger
language plpgsql
as $$
begin
  insert into zoning_land_use (market_id, layer_type, title, description, district_code, regulatory_notes, geom, source_id, confidence, last_verified_at)
  values (
    new.market_id, 'current_zoning', new.title, new.description, new.zoning_district, new.rezoning_notes,
    ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(new.boundary::text), 4326)),
    new.source_id, new.confidence, new.last_verified_at
  );
  return new;
end;
$$;

create trigger opportunity_zones_sync_zoning_land_use
  after insert on opportunity_zones
  for each row execute procedure public.sync_opportunity_zone_to_zoning_land_use();
