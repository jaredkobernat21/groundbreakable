-- Potential Data Center buyer intelligence (Jared, 2026-10-04): direct feedback from a data
-- center developer/site buyer on the existing Potential Data Center Site experience. The
-- existing prospective_data_center_site fields (power_notes, land_notes, utility_timeline,
-- people, readiness_stage, etc. -- see 20261003160000_potential_site_energy_timeline_risk_people.sql
-- and 20261003000000_extend_potential_site_card_fields.sql) are KEPT; this migration adds the
-- granular Power/Land/BTM-Energy/Site-Control facts a professional buyer actually needs, so the
-- existing prose notes fields gain structured siblings instead of being replaced. All columns
-- nullable, no backfill of invented values -- every existing row renders exactly as before until
-- a future research pass populates these.
--
-- Meaningful only for catalyst_type = 'prospective_data_center_site', same convention as every
-- other Potential-tier column on this table.

alter table catalysts
  -- POWER (highest-priority section per the buyer brief -- proximity to transmission is NOT the
  -- same thing as available capacity; available_capacity_status/potential_load_mw_* must never be
  -- inferred from transmission_voltage_kv/transmission_distance_miles alone).
  add column serving_utility text,
  add column transmission_voltage_kv numeric,
  add column transmission_distance_miles numeric,
  add column substation_distance_miles numeric,
  add column potential_load_mw_low numeric,
  add column potential_load_mw_high numeric,
  -- Reuses the existing verified/reported/estimated/indicated/unknown vocabulary
  -- (lib/catalysts/potentialSiteCriteria.ts PotentialEvidenceStatus) plus one new value for the
  -- specific "we know this is a real question, not just unresearched" case the buyer brief calls
  -- out -- no CHECK constraint (every PotentialEvidenceStatus-shaped column on this table is
  -- already unconstrained text/jsonb, consistent with that).
  add column available_capacity_status text,
  add column interconnection_notes text,

  -- LAND -- total_acreage/contiguous_acreage/parcel_count are the quantified siblings of the
  -- existing prose land_notes column (kept as-is); available_acreage_status is deliberately text
  -- (not numeric) since a researcher usually has a qualifying phrase ("Under Verification") well
  -- before an exact vacant-acreage figure.
  add column total_acreage numeric,
  add column available_acreage_status text,
  add column contiguous_acreage numeric,
  add column parcel_count integer,
  add column floodplain_status text,
  -- Structured sibling of floodplain_status (prose) specifically so the Buyer Criteria "Exclude
  -- floodplain" filter has a reliable true/false/unknown to check instead of parsing free text.
  -- null = not yet researched (never treated as "clear" by the filter).
  add column floodplain_constrained boolean,
  -- Short researcher-written status (e.g. "Industrial", "Agricultural -- rezoning required"),
  -- not a formal zoning-code enum -- jurisdictions use wildly different vocabularies. Drives the
  -- Buyer Criteria "Industrial zoning required/preferred" filter via a loose text match.
  add column zoning_status text,

  -- BTM ENERGY -- natural_gas_notes (existing) stays the prose field; these are its quantified
  -- siblings, same pattern as land_notes/total_acreage above.
  add column gas_pipeline_distance_miles numeric,
  add column gas_pipeline_operator text,
  add column gas_pipeline_diameter_in text,
  add column btm_potential_status text,
  add column air_permitting_notes text,

  -- SITE CONTROL -- replaces the single `people.owner` object (see application-side PotentialSitePeople
  -- type) with a multi-owner array; `people.utility/government/development` are untouched and stay
  -- in the `people` jsonb column. Nullable/empty default -- existing rows that already have a
  -- `people.owner` keep rendering via that field until a researcher migrates them into `owners`.
  add column owners jsonb,

  -- Buyer-facing synthesis, near Readiness in the panel.
  add column primary_advantage text,
  add column primary_risk text;

comment on column catalysts.available_capacity_status is
  'Verified/Reported/Estimated/Indicated/Unknown/Requires Utility Verification -- never inferred from transmission proximity alone.';
comment on column catalysts.owners is
  'jsonb array of {name, entity, controlled_acreage, parcel_count, mailing_address, registered_agent, public_contact: {phone, email, website}, ownership_complexity, last_verified, source, notes}. Replaces the single people.owner object for prospective_data_center_site rows going forward.';
