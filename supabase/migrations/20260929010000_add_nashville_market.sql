-- New watchlist market, same shell-row pattern as the other markets added
-- without a dedicated collector yet (see e.g. wichita-ks, tulsa-ok,
-- st-louis-mo -- 0 entitlement_cases/investments, a handful of manually
-- logged shifts). No fabricated data accompanies this: no shifts,
-- investments, market_indicators, or entitlement_cases are seeded here --
-- those get added as real sources are found, per
-- docs/DATA_INTELLIGENCE_PIPELINE.md section 14's onboarding workflow.
insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
values ('nashville-tn', 'Nashville', 'TN', 36.1627, -86.7816, 12)
on conflict (slug) do nothing;
