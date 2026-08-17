-- Phase 7, Tier 3 (part 2b): extends projects.stage to cover on_hold and
-- cancelled. Phase 1 deliberately left those two mapping to null ("stage"
-- had no equivalent for them at the time) -- but that makes `stage` an
-- incomplete replacement for `status` as the "current state" column:
-- switching every status read to stage without this would make an
-- on_hold/cancelled project indistinguishable from one that simply has no
-- stage set yet. No existing Topeka row is on_hold/cancelled today (0 of
-- 47), so this is pure schema/trigger groundwork, nothing to backfill.

alter table projects drop constraint projects_stage_check;
alter table projects add constraint projects_stage_check
  check (stage in ('proposed', 'review_planning', 'approved', 'permitting', 'construction', 'complete', 'on_hold', 'cancelled'));

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
    when 'on_hold' then 'on_hold'
    when 'cancelled' then 'cancelled'
  end;
  return new;
end;
$$;
