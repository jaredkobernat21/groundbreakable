-- SLADE Phase 1: internal CRM backbone (organizations, contacts,
-- interactions, audit log). SLADE is Jared's internal operating agent --
-- see SLADE/ARCHITECTURE.md at the repo root for why this is a new,
-- `slade_`-prefixed set of tables rather than a reuse of
-- investor_profiles/opportunity_profiles (that's the self-service product;
-- this is Jared's own outreach/relationship pipeline, most of which never
-- becomes a signed-up account) and rather than a revival of the
-- private_clients/acquisition_profiles concept dropped in
-- 20260907010000_three_tier_product_model.sql (that removal was about the
-- product's self-service model, not about whether Jared needs his own CRM).
--
-- Every slade_* table is admin-only, full stop -- no investor/anon access
-- of any kind, ever (see SLADE/docs/SECURITY.md). `slade_<table>_admin_all`
-- is a single combined policy rather than the usual split select/write
-- pair used elsewhere in this schema, because there is no non-admin select
-- case to carve out here.

create table slade_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (
    type in ('developer', 'investor', 'brokerage', 'contractor', 'planning_firm', 'partner', 'municipality', 'other')
  ),
  website text,
  primary_market_id uuid references markets (id) on delete set null,
  relationship_status text not null default 'unknown' check (
    relationship_status in (
      'unknown', 'prospect', 'warm_lead', 'active_prospect', 'customer', 'partner',
      'friend_network', 'inactive', 'do_not_contact'
    )
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table slade_organizations enable row level security;
create policy "slade_organizations_admin_all" on slade_organizations
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_organizations_name_idx on slade_organizations (lower(name));
create index slade_organizations_market_idx on slade_organizations (primary_market_id);

-- Contacts: relationship_type (the person's role) and relationship_status
-- (lifecycle warmth) and lead_status (outreach progress) are deliberately
-- three separate fields -- see SLADE/DATA_MODEL.md's note on why folding
-- these together produces an ambiguous status nothing can query cleanly.
create table slade_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references slade_organizations (id) on delete set null,
  -- Set only once/if this contact becomes a real signed-up dashboard
  -- account -- see investor_profiles. Nullable and expected to stay null
  -- for most rows (brokers, planners, city contacts, friends/network never
  -- get an account at all).
  investor_profile_id uuid references investor_profiles (id) on delete set null,

  first_name text not null,
  last_name text,
  title text,
  phone text,
  email text,
  linkedin_url text,

  relationship_type text check (
    relationship_type in (
      'developer', 'investor', 'broker', 'planner', 'city_contact', 'contractor',
      'friend_network', 'other'
    )
  ),
  relationship_status text not null default 'unknown' check (
    relationship_status in (
      'unknown', 'prospect', 'warm_lead', 'active_prospect', 'customer', 'partner',
      'friend_network', 'inactive', 'do_not_contact'
    )
  ),
  lead_status text not null default 'never_contacted' check (
    lead_status in (
      'never_contacted', 'attempted', 'no_response', 'responded', 'interested',
      'not_interested', 'follow_up', 'active_conversation'
    )
  ),

  notes text,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table slade_contacts enable row level security;
create policy "slade_contacts_admin_all" on slade_contacts
  for all using (public.is_admin()) with check (public.is_admin());

-- Partial unique indexes for the two identifiers reliable enough to hard-
-- dedup on. Name alone is not (see DATA_MODEL.md's duplicate-prevention
-- section) -- that dedup happens in dashboard/src/lib/slade/contacts.ts
-- via find-first-then-insert, not a DB constraint.
create unique index slade_contacts_email_unique_idx on slade_contacts (lower(email)) where email is not null;
create index slade_contacts_phone_idx on slade_contacts (phone) where phone is not null;
create index slade_contacts_name_idx on slade_contacts (lower(first_name), lower(coalesce(last_name, '')));
create index slade_contacts_organization_idx on slade_contacts (organization_id);
create index slade_contacts_follow_up_idx on slade_contacts (next_follow_up_at) where next_follow_up_at is not null;
create index slade_contacts_investor_profile_idx on slade_contacts (investor_profile_id) where investor_profile_id is not null;

-- Interactions: every meaningful touch. Answers "who have I contacted,
-- who hasn't responded, who's warm, who needs a follow-up" -- see
-- dashboard/src/lib/slade/interactions.ts.
create table slade_interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references slade_contacts (id) on delete cascade,
  organization_id uuid references slade_organizations (id) on delete set null,

  interaction_type text not null check (
    interaction_type in ('call', 'text', 'email', 'linkedin', 'meeting', 'report_sent', 'property_sent', 'follow_up', 'other')
  ),
  direction text check (direction in ('outbound', 'inbound')),
  occurred_at timestamptz not null default now(),
  outcome text,
  summary text,
  next_action text,
  source text not null default 'manual',

  created_at timestamptz not null default now()
);

alter table slade_interactions enable row level security;
create policy "slade_interactions_admin_all" on slade_interactions
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_interactions_contact_idx on slade_interactions (contact_id, occurred_at desc);
create index slade_interactions_type_idx on slade_interactions (interaction_type);

-- Generic audit log -- intentionally simple for V1 (app-layer writes via
-- dashboard/src/lib/slade/changeLog.ts, not DB triggers). Covers buy-box
-- edits, relationship-status changes, opportunity-status changes, and
-- verified site-fact updates. See SLADE/DATA_MODEL.md.
create table slade_change_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  field_name text,
  old_value text,
  new_value text,
  changed_by text,
  note text,
  changed_at timestamptz not null default now()
);

alter table slade_change_log enable row level security;
create policy "slade_change_log_admin_all" on slade_change_log
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_change_log_record_idx on slade_change_log (table_name, record_id, changed_at desc);
