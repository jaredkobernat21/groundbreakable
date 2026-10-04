-- Developer-facing presentation cleanup (Jared, 2026-10-04 "simplify the presentation" update).
-- Rewrites the CURRENT VALUES of the columns the developer-facing panel actually renders to be
-- short, clean, and free of research-process language ("this pass," "VERIFIED this pass,"
-- "resolves the prior finding," etc.) -- the full pass-by-pass research narrative is NOT deleted
-- anywhere; it remains permanently in the prior migration files (20261004040000 through
-- 20261004090000) and git history, which already serve as the durable research/methodology
-- record this update's "admin/research view" concept asks for. Fields the panel no longer
-- renders directly (power_notes, interconnection_notes, natural_gas_notes, land_notes,
-- risk_notes, incentives_notes, development_environment_notes, entitlement_velocity_notes,
-- city_receptiveness_notes, community_friction_notes) are intentionally left untouched -- they
-- are correctly understood as internal/research-history fields now, not stale data needing a fix.
--
-- Also populates the two new presentation fields (nearest_substation_name, ownership_coverage)
-- from facts already established in the prior passes -- no new research, pure promotion of an
-- already-known fact into a clean structured field.

update catalysts set
  why_this_site = 'Established industrial park with favorable zoning, confirmed utility service, and identifiable site control. Large-load power deliverability is the principal item remaining to confirm.',
  serving_utility = 'Evergy — Verified',
  nearest_substation_name = 'Whippoorwill Substation (120 S. 110th St)',
  available_acreage_status = 'Partially Resolved',
  zoning_status = 'Light Industrial (I-1)',
  floodplain_status = 'Outside 100-Year Floodplain',
  gas_pipeline_operator = 'Atmos Energy',
  fiber_notes = 'Zayo regional long-haul route nearby',
  water_notes = 'City of Bonner Springs',
  ownership_coverage = 'partial',
  primary_advantage = 'Established industrial location with favorable zoning, confirmed Evergy electric service, and two identified parcel owners.',
  primary_risk = 'Large-load power capacity and full contiguous site control remain the two primary gating items.',
  developer_takeaway = 'Bonner Springs Industrial Park offers established industrial zoning, confirmed Evergy electric service, and a nearby distribution substation. Water and wastewater capacity are confirmed with available headroom, and two parcel owners have been identified. The critical gating item is confirmation of available large-load capacity and time-to-power. If adequate power is confirmed, the site warrants deeper diligence.',
  next_steps = array[
    'Request a large-load capacity assessment from Evergy.',
    'Confirm gas delivery capacity with Atmos Energy.',
    'Contact identified landowners regarding site control.',
    'Confirm fiber last-mile availability with a carrier.'
  ],
  unknowns_to_verify = array[
    'Available MW',
    'Firm energization timeline',
    'Full parcel ownership',
    'Gas delivery capacity',
    'Fiber last-mile service'
  ]
where title = 'Bonner Springs Industrial Park';

update catalysts set
  why_this_site = 'Two established, publicly owned industrial parks with confirmed utility service and verified water and wastewater capacity. Large-load power deliverability and current land availability are the principal items remaining to confirm.',
  serving_utility = 'Evergy — Verified',
  available_acreage_status = 'Partially Resolved',
  zoning_status = 'Light Industrial (I-1)',
  floodplain_status = 'Outside 100-Year Floodplain',
  gas_pipeline_operator = 'Kansas Gas Service',
  fiber_notes = 'AT&T Fiber and Spectrum present regionally',
  water_notes = 'City of Leavenworth',
  ownership_coverage = 'full',
  primary_advantage = 'Two established, publicly owned industrial parks with confirmed water, wastewater, and gas utility service.',
  primary_risk = 'Large-load power infrastructure was not identified near this corridor, and current vacant acreage at the Business and Technology Park is unconfirmed.',
  developer_takeaway = 'Eisenhower Road offers two established, publicly owned industrial parks with confirmed water (6 MGD) and wastewater (44% utilized) capacity, plus Kansas Gas Service headquartered locally. No substation was identified near this corridor, making power deliverability the central open question. Gary Carlson Business Center is largely leased, so the Business and Technology Park''s current availability is the more relevant acreage to evaluate. A developer should confirm power capacity and current vacant acreage before advancing.',
  next_steps = array[
    'Request a large-load capacity assessment from Evergy.',
    'Confirm current available acreage at the Business and Technology Park with the Leavenworth County Development Corporation.',
    'Confirm gas delivery capacity with Kansas Gas Service.',
    'Confirm fiber last-mile availability with a carrier.'
  ],
  unknowns_to_verify = array[
    'Available MW / nearest substation',
    'Firm energization timeline',
    'Current vacant acreage',
    'Fiber last-mile service'
  ]
where title = 'Eisenhower Road Business Park Corridor';

update catalysts set
  why_this_site = 'Fully entitled 85-acre industrial parcel with confirmed zoning and minimal flood risk. Large-load power deliverability and formal ownership verification are the principal items remaining to confirm.',
  serving_utility = 'Evergy — Verified',
  available_acreage_status = 'Verified',
  zoning_status = 'Light Industrial (I-1)',
  floodplain_status = 'Outside 100-Year Floodplain',
  gas_pipeline_operator = 'Southern Star Central Gas Pipeline',
  fiber_notes = 'AT&T Fiber and Spectrum present regionally',
  water_notes = 'City of Lansing',
  ownership_coverage = 'full',
  primary_advantage = 'Fully entitled 85-acre industrial parcel with confirmed zoning, minimal flood risk, and an identified owner.',
  primary_risk = 'Large-load power infrastructure and formal ownership verification are the two primary gating items.',
  developer_takeaway = 'This K-7/McIntyre Road parcel offers a fully entitled 85-acre industrial tract with confirmed I-1 zoning and minimal flood risk. Ownership has been identified (Epic Estates 3 LLC) but not yet formally verified against state or county records. The critical gating item is confirmation of available power capacity and energization timeline. If power deliverability is confirmed, the site warrants deeper diligence.',
  next_steps = array[
    'Request a large-load capacity assessment from Evergy.',
    'Formally verify ownership against Kansas Secretary of State and county records.',
    'Confirm gas delivery capacity with Southern Star Central Gas Pipeline.',
    'Contact the identified landowner regarding site control.'
  ],
  unknowns_to_verify = array[
    'Available MW / nearest substation',
    'Firm energization timeline',
    'Formal ownership verification',
    'Gas delivery capacity'
  ]
where title = 'K-7 / McIntyre Road Industrial Rezoning';
