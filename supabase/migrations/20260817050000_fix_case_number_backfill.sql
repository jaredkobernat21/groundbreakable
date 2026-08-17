-- Fixes the previous migration's backfill, which silently matched zero
-- rows: \b is not a word-boundary escape in PostgreSQL's regex dialect
-- (Advanced Regular Expressions) the way it is in PCRE -- the correct
-- escape is \y. \d works fine in ARE, so that part was never the issue.

update projects
set case_number = (regexp_match(title, '^([A-Z]{1,4}\d{2}[-/]\d{1,3})\y'))[1]
where title ~ '^[A-Z]{1,4}\d{2}[-/]\d{1,3}\y'
  and case_number is null;
