-- SLADE Phase 1: opportunities, opportunity feedback, projects, reports.
--
-- slade_opportunities is where the mandatory pre-delivery verification
-- gate (SLADE/docs/VERIFICATION.md) is enforced -- not just in application
-- code. The check constraint below makes 'ready_to_deliver' physically
-- impossible to set unless all nine verification_*_ok flags are true.
-- dashboard/src/lib/slade/verification.ts checks the same nine flags
-- ahead of the write so SLADE can explain *which* checks are outstanding
-- instead of the write just failing.

create table slade_opportunities (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references slade_sites (id) on delete cascade,
  contact_id uuid references slade_contacts (id) on delete set null,
  organization_id uuid references slade_organizations (id) on delete set null,
  buy_box_id uuid references slade_buy_boxes (id) on delete set null,
  market_id uuid references markets (id) on delete set null,

  opportunity_status text not null default 'discovered' check (
    opportunity_status in (
      'discovered', 'screening', 'researching', 'verification_required', 'qualified',
      'ready_to_deliver', 'delivered', 'rejected', 'paused', 'archived'
    )
  ),
  match_score int,

  thesis text,
  possible_uses text[] not null default '{}',
  major_upside text,
  major_risks text,
  unknowns text,
  next_steps text,

  -- The verification gate (SLADE/docs/VERIFICATION.md, checks 1-9).
  verification_identity_ok boolean not null default false,
  verification_ownership_ok boolean not null default false,
  verification_listing_ok boolean not null default false,
  verification_conflict_ok boolean not null default false,
  verification_planning_ok boolean not null default false,
  verification_infrastructure_ok boolean not null default false,
  verification_client_fit_ok boolean not null default false,
  verification_prior_history_ok boolean not null default false,
  verification_sources_ok boolean not null default false,
  verification_notes text,
  verification_completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint slade_opportunities_ready_requires_verification check (
    opportunity_status <> 'ready_to_deliver'
    or (
      verification_identity_ok and verification_ownership_ok and verification_listing_ok
      and verification_conflict_ok and verification_planning_ok and verification_infrastructure_ok
      and verification_client_fit_ok and verification_prior_history_ok and verification_sources_ok
    )
  )
);

alter table slade_opportunities enable row level security;
create policy "slade_opportunities_admin_all" on slade_opportunities
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_opportunities_site_idx on slade_opportunities (site_id);
create index slade_opportunities_contact_idx on slade_opportunities (contact_id);
create index slade_opportunities_status_idx on slade_opportunities (opportunity_status);
create index slade_opportunities_buy_box_idx on slade_opportunities (buy_box_id);

-- What happened after a site was sent -- input for SLADE/LODE to learn
-- what a developer actually likes. See SLADE/DATA_MODEL.md.
create table slade_opportunity_feedback (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references slade_opportunities (id) on delete cascade,
  contact_id uuid references slade_contacts (id) on delete set null,

  feedback_type text check (
    feedback_type in (
      'interested', 'not_interested', 'need_more_info', 'rejected_price', 'rejected_location',
      'rejected_other', 'positive_signal', 'other'
    )
  ),
  feedback text,
  resulting_action text,
  occurred_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

alter table slade_opportunity_feedback enable row level security;
create policy "slade_opportunity_feedback_admin_all" on slade_opportunity_feedback
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_opportunity_feedback_opportunity_idx on slade_opportunity_feedback (opportunity_id);

-- Active research, a client-specific search, a market initiative, or a
-- Groundbreakable engagement -- what tasks/opportunities hang off of.
create table slade_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_id uuid references slade_contacts (id) on delete set null,
  organization_id uuid references slade_organizations (id) on delete set null,
  market_id uuid references markets (id) on delete set null,

  objective text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  summary text,
  next_action text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table slade_projects enable row level security;
create policy "slade_projects_admin_all" on slade_projects
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_projects_contact_idx on slade_projects (contact_id);
create index slade_projects_status_idx on slade_projects (status);

-- Groundbreakable deliverables. Designs the structured shape a report is
-- generated *from* -- no PDF engine here (see SLADE/docs/LODE.md and
-- SLADE/templates/opportunity_report_template.md for the section
-- structure `sections` follows). Does not duplicate personalized_briefs
-- (the self-service product's automated brief for a real account) --
-- this is for Jared/SLADE-authored deliverables tied to a specific
-- slade_opportunities record.
create table slade_reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references slade_opportunities (id) on delete set null,
  site_id uuid references slade_sites (id) on delete set null,
  contact_id uuid references slade_contacts (id) on delete set null,

  report_type text not null default 'opportunity_report' check (
    report_type in ('opportunity_report', 'market_brief', 'buy_box_summary', 'other')
  ),
  version int not null default 1,
  status text not null default 'draft' check (status in ('draft', 'internal_review', 'ready', 'delivered', 'archived')),

  -- Keyed by section name (executive_thesis, property_snapshot,
  -- why_it_matters, development_potential, planning_zoning,
  -- infrastructure, entitlement_path, market_context, risks, unknowns,
  -- next_steps, sources). Each value: { content: string, source_ids: uuid[] }.
  sections jsonb not null default '{}'::jsonb,

  file_reference text,
  generated_at timestamptz,
  delivered_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table slade_reports enable row level security;
create policy "slade_reports_admin_all" on slade_reports
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_reports_opportunity_idx on slade_reports (opportunity_id);
create index slade_reports_status_idx on slade_reports (status);
