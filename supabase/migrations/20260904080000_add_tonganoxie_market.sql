-- Adds Tonganoxie, KS as the fourth ROQ Shift market (Leavenworth
-- County, KC metro). Center point is downtown (S Main St & E 4th St),
-- same convention as the other three markets.

insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
values ('tonganoxie-ks', 'Tonganoxie', 'KS', 39.109241044389, -95.084947429366, 12);
