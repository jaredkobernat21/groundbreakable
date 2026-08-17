-- Phase 6 (collection pipeline v1) needs reliable entity resolution, and
-- the cleanest signal for it -- the case/application number every
-- Planning Commission item carries (Z26/07, CPA26/01, ...) -- was never
-- given its own column; it only ever existed embedded in free-text
-- titles. Adding it properly here, plus a pg_trgm similarity RPC as the
-- fallback match path when no case number is available or it doesn't
-- match anything on file.

alter table projects add column case_number text;

create index projects_case_number_idx on projects (case_number) where case_number is not null;

-- Backfill from the existing title convention ("Z26/04 -- Kanza OZ LLC
-- Rezoning, SE Madison Street" -> case_number "Z26/04"). Checked against
-- the real data first: 13 of 47 titles match this pattern cleanly; the
-- other 34 (business announcements, infrastructure projects, etc.) never
-- had a case number to begin with, so they correctly stay null rather
-- than have one invented.
update projects
set case_number = (regexp_match(title, '^([A-Z]{1,4}\d{2}[-/]\d{1,3})\b'))[1]
where title ~ '^[A-Z]{1,4}\d{2}[-/]\d{1,3}\b';

-- Fallback match path for the collection pipeline: when an intake
-- record's extracted case number doesn't match anything on file (a
-- typo, a source that doesn't expose one, or a genuinely new case),
-- fall back to trigram similarity over title -- same pg_trgm extension
-- already enabled in Phase 1 for companies.name. Admin/service-role
-- only; this is a matching primitive for the intake pipeline, not
-- something the investor-facing app has any use for.
create or replace function public.match_projects_by_text(p_market_id uuid, p_query text, p_limit int default 5)
returns table(id uuid, title text, case_number text, address text, similarity real)
language sql
stable
as $$
  select id, title, case_number, address, similarity(title, p_query) as similarity
  from projects
  where market_id = p_market_id
  order by similarity(title, p_query) desc
  limit p_limit;
$$;

revoke all on function public.match_projects_by_text(uuid, text, int) from public;
grant execute on function public.match_projects_by_text(uuid, text, int) to service_role;
