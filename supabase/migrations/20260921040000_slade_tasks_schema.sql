-- SLADE Phase 1: tasks/follow-ups. Lightweight on purpose -- answers
-- "what should I work on today?" against due/overdue rows plus
-- slade_contacts.next_follow_up_at (see dashboard/src/lib/slade/tasks.ts).
-- Comes after opportunities/projects so it can reference both.

create table slade_tasks (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references slade_contacts (id) on delete set null,
  opportunity_id uuid references slade_opportunities (id) on delete set null,
  project_id uuid references slade_projects (id) on delete set null,

  task_type text,
  title text not null,
  description text,
  due_at timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),

  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table slade_tasks enable row level security;
create policy "slade_tasks_admin_all" on slade_tasks
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_tasks_due_idx on slade_tasks (due_at) where status in ('open', 'in_progress');
create index slade_tasks_contact_idx on slade_tasks (contact_id);
create index slade_tasks_status_idx on slade_tasks (status);
