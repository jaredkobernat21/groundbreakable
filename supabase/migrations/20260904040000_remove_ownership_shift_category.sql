-- Removes 'ownership' from shift_category. Product decision: routine
-- deed transfers and LLC-acquisition identification are hard to source
-- freely in most markets (register-of-deeds document search is
-- typically paywalled to third-party vendors, and LLC beneficial
-- ownership is opaque in most states -- see
-- reference_topeka_public_data_sources memory), so Ownership is dropped
-- as a category rather than kept mostly-empty. Probate -- previously an
-- Ownership subtype -- moves under 'distress': it's not financial
-- distress, but it's the same "motivated, non-market transition"
-- situation investors/agents already treat alongside pre-foreclosure,
-- and it's sourced the same way (a probate court docket, not a deed
-- search).
--
-- Zero shifts ever used category='ownership' (confirmed before writing
-- this), so this is a safe recreate -- no data migration needed.
-- Postgres has no `ALTER TYPE ... DROP VALUE`, hence the rename/
-- recreate/swap dance.

alter type shift_category rename to shift_category_old;

create type shift_category as enum (
  'distress', 'compliance', 'development', 'construction', 'infrastructure'
);

alter table shifts
  alter column category type shift_category
  using category::text::shift_category;

drop type shift_category_old;
