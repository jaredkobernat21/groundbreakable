-- Groundbreakable Leads: internal homeowner-vacant-land lead-gen CRM.
--
-- Separate domain from the existing investor product (leads/opportunities/
-- projects, all Topeka development-intelligence content) -- every table here
-- is prefixed gbl_ (Groundbreakable Leads) so it can never collide with or
-- be confused for those tables. This is a single-market, admin-only internal
-- tool (Spring Hill / Gardner / Olathe / Johnson County KS), so there's no
-- market_id scoping here -- access is gated entirely by is_admin(), reusing
-- the same function the existing /dashboard/admin/* pages already use.

create table gbl_properties (
  id uuid primary key default gen_random_uuid(),
  parcel_id text,
  address text not null,
  city text not null check (city in ('Spring Hill', 'Gardner', 'Olathe', 'Unincorporated Johnson County', 'Other')),
  county text not null default 'Johnson County',
  state text not null default 'KS',
  latitude double precision,
  longitude double precision,
  acreage numeric,
  zoning text,
  property_type text check (property_type in (
    'vacant_residential', 'residential_acreage', 'agricultural_potential_residential', 'agricultural', 'other'
  )),
  land_classification text,
  existing_structure boolean,
  sale_date date,
  sale_price numeric,
  assessed_value numeric,
  jurisdiction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dedupe on import: parcel_id is the strong key when present; when a CSV
-- has no parcel_id, fall back to address+sale_date as a best-effort key.
create unique index gbl_properties_parcel_id_key on gbl_properties (parcel_id) where parcel_id is not null;
create unique index gbl_properties_address_sale_date_key on gbl_properties (address, sale_date) where parcel_id is null;

create table gbl_leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references gbl_properties (id) on delete cascade,
  owner_name text not null,
  owner_type text not null default 'unknown' check (owner_type in ('individual', 'couple', 'trust', 'llc', 'unknown')),
  score int not null default 0 check (score between 0 and 100),
  -- Ordered list of {label, points, direction: 'positive'|'negative'} --
  -- the "why" behind the score, shown directly beneath it. Recomputed by
  -- lib/leads/scoring.ts whenever property/lead/intelligence data changes.
  score_reasons jsonb not null default '[]',
  pipeline_status text not null default 'discovered' check (pipeline_status in (
    'discovered', 'qualified', 'ready_to_contact', 'contacted', 'interested',
    'build_plan', 'customer', 'not_a_fit', 'do_not_contact'
  )),
  dnc_status boolean not null default false,
  dnc_checked_at date,
  dnc_notes text,
  last_contacted_at timestamptz,
  next_follow_up date,
  note text,
  source text not null default 'csv_import',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gbl_leads_property_id_idx on gbl_leads (property_id);
create index gbl_leads_pipeline_status_idx on gbl_leads (pipeline_status);
create index gbl_leads_score_idx on gbl_leads (score desc);
create index gbl_leads_next_follow_up_idx on gbl_leads (next_follow_up);

-- One row per property. Every status/confidence field distinguishes
-- verified / likely / unknown / needs_confirmation -- never invent a value.
create table gbl_property_intelligence (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references gbl_properties (id) on delete cascade,

  water_type text check (water_type in ('municipal', 'rural_water', 'well_likely', 'unknown')),
  water_provider text,
  water_confidence text not null default 'unknown' check (water_confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),

  sewer_type text check (sewer_type in ('public_sewer', 'septic_likely', 'unknown')),
  sewer_confidence text not null default 'unknown' check (sewer_confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),

  electric_provider text,
  electric_confidence text not null default 'unknown' check (electric_confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),

  gas_type text check (gas_type in ('utility', 'propane_likely', 'unknown')),
  gas_confidence text not null default 'unknown' check (gas_confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),

  road_frontage text,
  road_access_type text check (road_access_type in ('public', 'private', 'unknown')),
  road_notes text,
  road_confidence text not null default 'unknown' check (road_confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),

  topography text,
  flood_zone text,
  drainage_notes text,
  environmental_flags text,
  easements text,
  site_confidence text not null default 'unknown' check (site_confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),

  permit_found boolean,
  permit_date date,
  permit_status text,
  permit_jurisdiction text,
  permit_notes text,
  permit_confidence text not null default 'unknown' check (permit_confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),

  updated_at timestamptz not null default now()
);

create table gbl_contacts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references gbl_leads (id) on delete cascade,
  type text not null check (type in ('phone', 'email', 'mailing_address')),
  value text not null,
  phone_type text check (phone_type in ('mobile', 'landline', 'unknown')),
  source text,
  confidence text not null default 'unknown' check (confidence in ('verified', 'likely', 'unknown', 'needs_confirmation')),
  verified_at date,
  notes text,
  created_at timestamptz not null default now()
);

create index gbl_contacts_lead_id_idx on gbl_contacts (lead_id);

create table gbl_interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references gbl_leads (id) on delete cascade,
  interaction_type text not null check (interaction_type in (
    'called', 'texted', 'emailed', 'no_answer', 'interested', 'not_interested',
    'wrong_number', 'do_not_contact', 'note'
  )),
  notes text,
  outcome text,
  author text,
  created_at timestamptz not null default now()
);

create index gbl_interactions_lead_id_idx on gbl_interactions (lead_id, created_at desc);

create table gbl_research (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references gbl_properties (id) on delete cascade,
  category text not null check (category in ('zoning', 'utility', 'permit', 'site', 'other')),
  finding text not null,
  source_url text,
  verification_status text not null default 'needs_confirmation' check (verification_status in ('verified', 'likely', 'unknown', 'needs_confirmation')),
  author text,
  created_at timestamptz not null default now()
);

create index gbl_research_property_id_idx on gbl_research (property_id, created_at desc);

create table gbl_build_projects (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references gbl_leads (id) on delete cascade,
  property_id uuid not null references gbl_properties (id) on delete cascade,
  timeline text,
  desired_sqft int,
  bedrooms int,
  bathrooms numeric,
  garage text,
  basement text,
  style text,
  budget text,
  goals text,
  uncertainties text,
  architect_status text,
  builder_status text,
  lender_status text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gbl_build_projects_lead_id_idx on gbl_build_projects (lead_id);

create function gbl_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger gbl_properties_set_updated_at before update on gbl_properties
  for each row execute function gbl_set_updated_at();
create trigger gbl_leads_set_updated_at before update on gbl_leads
  for each row execute function gbl_set_updated_at();
create trigger gbl_property_intelligence_set_updated_at before update on gbl_property_intelligence
  for each row execute function gbl_set_updated_at();
create trigger gbl_build_projects_set_updated_at before update on gbl_build_projects
  for each row execute function gbl_set_updated_at();

alter table gbl_properties enable row level security;
alter table gbl_leads enable row level security;
alter table gbl_property_intelligence enable row level security;
alter table gbl_contacts enable row level security;
alter table gbl_interactions enable row level security;
alter table gbl_research enable row level security;
alter table gbl_build_projects enable row level security;

-- Internal tool: every signed-in admin (same role used by /dashboard/admin/*)
-- has full read/write. Reuses the existing is_admin() SECURITY DEFINER fn.
create policy "gbl_properties_admin_all" on gbl_properties for all using (is_admin()) with check (is_admin());
create policy "gbl_leads_admin_all" on gbl_leads for all using (is_admin()) with check (is_admin());
create policy "gbl_property_intelligence_admin_all" on gbl_property_intelligence for all using (is_admin()) with check (is_admin());
create policy "gbl_contacts_admin_all" on gbl_contacts for all using (is_admin()) with check (is_admin());
create policy "gbl_interactions_admin_all" on gbl_interactions for all using (is_admin()) with check (is_admin());
create policy "gbl_research_admin_all" on gbl_research for all using (is_admin()) with check (is_admin());
create policy "gbl_build_projects_admin_all" on gbl_build_projects for all using (is_admin()) with check (is_admin());
