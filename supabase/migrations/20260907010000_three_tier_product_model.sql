-- Revises the product around the 3-tier Access/Intelligence/Partner model
-- (product spec from Jared, 2026-09-07), superseding the prior
-- "Groundbreakable Private" CRM-prospecting model from
-- 20260907000000_private_client_intelligence_schema.sql. That migration's
-- tables shipped with zero real rows (confirmed before writing this one),
-- so this repurposes them in place -- rename + re-point the ownership FK
-- from private_clients (an admin-curated sales-prospect row) to
-- investor_profiles directly (the real signed-in account), rather than
-- maintaining two parallel systems. private_clients itself is dropped:
-- a real subscriber's identity already lives in investor_profiles/
-- auth.users, and the new spec has no prospecting-CRM concept at all --
-- every tier is a real self-service account.
--
-- Tier/role live on investor_profiles as new columns, deliberately not
-- reusing its existing `role` column (that's the admin/investor
-- permission flag checked all over the app -- see is_admin()) --
-- `professional_role` is the onboarding persona (investor/contractor/
-- etc., section 1) and is unrelated to that permission flag.

alter table investor_profiles add column professional_role text check (
  professional_role in (
    'investor', 'developer', 'builder', 'general_contractor', 'concrete_contractor',
    'electrician', 'plumber', 'landscaper', 'realtor', 'other'
  )
);

alter table investor_profiles add column subscription_tier text not null default 'access' check (
  subscription_tier in ('access', 'intelligence', 'partner')
);

-- --- acquisition_profiles -> opportunity_profiles ---
-- Section 2's Detailed Opportunity Profile, self-service (any signed-in
-- investor_profiles account configures their own -- no admin curation
-- step), and now dual-shaped: the existing investor/developer criteria
-- columns are unchanged, plus a parallel contractor criteria set
-- (section 2's Contractor Opportunity Profile), discriminated by
-- `profile_type` so one table still serves both without either shape
-- straining to hold the other's fields (all contractor columns are
-- nullable/empty-default and simply unused on an investor_developer row,
-- and vice versa).

alter table acquisition_profiles rename to opportunity_profiles;

alter table opportunity_profiles drop constraint acquisition_profiles_private_client_id_fkey;
alter table opportunity_profiles rename column private_client_id to investor_profile_id;
alter table opportunity_profiles add constraint opportunity_profiles_investor_profile_id_fkey
  foreign key (investor_profile_id) references investor_profiles (id) on delete cascade;

alter table opportunity_profiles add column profile_type text not null default 'investor_developer' check (
  profile_type in ('investor_developer', 'contractor')
);

-- Contractor Opportunity Profile fields (section 2).
alter table opportunity_profiles add column trade text;
alter table opportunity_profiles add column travel_radius_mi numeric;
alter table opportunity_profiles add column preferred_project_types text[] not null default '{}' check (
  preferred_project_types <@ array[
    'residential', 'multifamily', 'commercial', 'industrial', 'infrastructure', 'subdivision'
  ]::text[]
);
alter table opportunity_profiles add column min_contract_value numeric;
alter table opportunity_profiles add column preferred_lead_time text;
alter table opportunity_profiles add column developer_type_preference text[] not null default '{}' check (
  developer_type_preference <@ array['public', 'private', 'either']::text[]
);
-- The two signals from the spec's contractor match example ("no GC has
-- been publicly identified yet") -- a contractor opting into these wants
-- Groundbreakable to specifically surface projects with an opening, not
-- just any project matching their trade/geography/size.
alter table opportunity_profiles add column requires_gc_unidentified boolean not null default false;
alter table opportunity_profiles add column requires_subs_unassigned boolean not null default false;
alter table opportunity_profiles add column licensing_capabilities text[] not null default '{}';

drop policy "acquisition_profiles_select_own_or_admin" on opportunity_profiles;
drop policy "acquisition_profiles_write_admin" on opportunity_profiles;

create policy "opportunity_profiles_select_own_or_admin" on opportunity_profiles
  for select using (public.is_admin() or investor_profile_id = auth.uid());
-- Self-service: the account owner can create/edit/delete their own
-- profile(s) directly -- this is the core behavior change from the prior
-- admin-CRUD model (spec section 2: "Intelligence users create a
-- detailed Opportunity Profile").
create policy "opportunity_profiles_write_own_or_admin" on opportunity_profiles
  for all using (public.is_admin() or investor_profile_id = auth.uid())
  with check (public.is_admin() or investor_profile_id = auth.uid());

-- --- private_client_watchlist_items -> watchlist_items ---

alter table private_client_watchlist_items rename to watchlist_items;

alter table watchlist_items drop constraint private_client_watchlist_items_private_client_id_fkey;
alter table watchlist_items rename column private_client_id to investor_profile_id;
alter table watchlist_items add constraint watchlist_items_investor_profile_id_fkey
  foreign key (investor_profile_id) references investor_profiles (id) on delete cascade;

drop policy "watchlist_select_own_or_admin" on watchlist_items;
drop policy "watchlist_write_own_or_admin" on watchlist_items;

create policy "watchlist_items_select_own_or_admin" on watchlist_items
  for select using (public.is_admin() or investor_profile_id = auth.uid());
create policy "watchlist_items_write_own_or_admin" on watchlist_items
  for all using (public.is_admin() or investor_profile_id = auth.uid())
  with check (public.is_admin() or investor_profile_id = auth.uid());

-- --- private_briefs -> personalized_briefs ---
-- Section 2's "Weekly personalized brief" / Personalized Opportunity
-- Feed history -- same 8-section shape as before, just re-owned.

alter table private_briefs rename to personalized_briefs;

alter table personalized_briefs drop constraint private_briefs_private_client_id_fkey;
alter table personalized_briefs rename column private_client_id to investor_profile_id;
alter table personalized_briefs add constraint personalized_briefs_investor_profile_id_fkey
  foreign key (investor_profile_id) references investor_profiles (id) on delete cascade;

drop policy "private_briefs_select_own_or_admin" on personalized_briefs;
drop policy "private_briefs_write_admin" on personalized_briefs;

create policy "personalized_briefs_select_own_or_admin" on personalized_briefs
  for select using (public.is_admin() or investor_profile_id = auth.uid());
create policy "personalized_briefs_write_own_or_admin" on personalized_briefs
  for all using (public.is_admin() or investor_profile_id = auth.uid())
  with check (public.is_admin() or investor_profile_id = auth.uid());

-- --- drop the old prospecting-CRM table ---
-- Nothing else references it after the renames/FK swaps above.
drop table private_clients;

-- --- partner_requests ---
-- Section 3's Partner Desk: research requests and outreach-assistance
-- requests, plus the internal operator workflow (section "MVP Priority").
-- One table for both request types (`request_type`) since they share the
-- same lifecycle shape (submit -> operator works it -> resolution) --
-- the outreach-specific fields are simply unused/null on a research
-- request. `subject_*` is polymorphic (no FK), same convention as
-- watchlist_items.item_id -- a request can be about a development
-- opportunity, a shift, a corridor, a market, or nothing specific
-- ('custom', e.g. "compare this opportunity with another site").
create table partner_requests (
  id uuid primary key default gen_random_uuid(),
  investor_profile_id uuid not null references investor_profiles (id) on delete cascade,

  request_type text not null check (request_type in ('research', 'outreach')),
  subject_type text check (subject_type in ('opportunity', 'shift', 'corridor', 'market', 'custom')),
  subject_id uuid,
  subject_label text,
  question text not null,

  -- The exact pipeline from the spec, in order -- an operator dashboard
  -- filter/kanban reads directly off this.
  status text not null default 'submitted' check (
    status in (
      'submitted', 'reviewing', 'researching', 'ready', 'outreach_requested',
      'contacted', 'interested', 'not_interested', 'introduction_made', 'closed'
    )
  ),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  assigned_to text,

  -- Research Brief output (spec's bullet list, consolidated: the
  -- narrative fields that are naturally prose -- what we found, why it
  -- matters, important facts, development context -- collapse into one
  -- authored summary, same "one paragraph over many columns" convention
  -- as investments.why_it_matters; the fields with genuinely distinct
  -- shape stay separate).
  findings_summary text,
  ownership_notes text,
  planning_history text,
  infrastructure_notes text,
  zoning_notes text,
  risks text,
  suggested_next_steps text,
  source_links text[] not null default '{}',

  -- Outreach-assistance fields (research requests leave these null).
  -- Deliberately no negotiation/offer/price fields anywhere on this
  -- table -- Partner's outreach boundary per spec is
  -- research -> qualification -> initial interest -> introduction, full
  -- stop; the client takes it from there.
  contact_name text,
  contact_method text,
  contact_notes text,
  outreach_message text,
  response_notes text,

  internal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index partner_requests_investor_idx on partner_requests (investor_profile_id, created_at desc);
create index partner_requests_status_idx on partner_requests (status, created_at desc);

alter table partner_requests enable row level security;

create policy "partner_requests_select_own_or_admin" on partner_requests
  for select using (public.is_admin() or investor_profile_id = auth.uid());
-- A client can submit a request for themselves; only an operator
-- (admin) works it after that -- status/findings/outreach fields are
-- all admin-only writes, matching "manual work behind the scenes is
-- acceptable" for the MVP.
create policy "partner_requests_insert_own" on partner_requests
  for insert with check (investor_profile_id = auth.uid());
create policy "partner_requests_update_admin" on partner_requests
  for update using (public.is_admin()) with check (public.is_admin());
create policy "partner_requests_delete_admin" on partner_requests
  for delete using (public.is_admin());
