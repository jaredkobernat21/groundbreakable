-- Backfills Bonner Springs Industrial Park's EXISTING researched facts (from
-- 20261002090000_kc_metro_potential_data_center_sites.sql) into the new granular buyer-
-- intelligence columns added in 20261004000000_potential_data_center_buyer_intelligence.sql.
-- Reorganization only -- no new research, no invented numbers. Every fact set here already
-- exists in that migration's power_notes/land_notes/risk_notes prose; every column left null
-- here (potential_load_mw_*, contiguous_acreage, zoning_status, gas/fiber specifics) is a
-- genuinely unresearched fact, and unknowns_to_verify already lists most of them -- this update
-- only ADDS to that array where the buyer-facing framing calls out something the existing list
-- didn't already say explicitly (zoning, total parcels).

update catalysts set
  serving_utility = 'Evergy (large-load power-service tariff territory, 75MW+) -- distinct from BPU, which serves the Kansas Speedway corridor ~3-4 miles away. Whether all Bonner Springs Industrial Park parcels fall within Evergy vs. BPU territory is itself unconfirmed (the city spans Wyandotte, Leavenworth, and Johnson counties).',
  available_capacity_status = 'requires_verification',
  total_acreage = 265,
  available_acreage_status = 'Under Verification -- 20+ existing businesses already occupy part of the park; true vacant/available acreage not confirmed',
  floodplain_status = 'Above 100-year floodplain, flat topography',
  floodplain_constrained = false,
  zoning_status = 'Light Industrial (established, with 20+ operating businesses as real precedent)',
  primary_advantage = 'Large (~265-acre) established industrial park, entirely above the 100-year floodplain, in Evergy''s large-load tariff territory with a real industrial-use entitlement precedent already in place.',
  primary_risk = 'Available contiguous acreage and actual Evergy substation capacity/interconnection timeline for a large continuous load are both unconfirmed -- the primary open question is deliverability, not site suitability.',
  unknowns_to_verify = array[
    'How much of the ~265 acres remains vacant/available versus already occupied by the 20+ existing businesses',
    'Confirmed Evergy substation capacity or interconnection timeline for a large continuous load at this specific site',
    'Fiber carrier presence',
    'Whether any portion of this park falls within BPU rather than Evergy service territory, given Bonner Springs spans Wyandotte, Leavenworth, and Johnson counties',
    'Total parcel count and current ownership of the park''s vacant parcels',
    'Natural gas pipeline proximity for potential behind-the-meter generation'
  ],
  last_verified_at = now()
where title = 'Bonner Springs Industrial Park';
