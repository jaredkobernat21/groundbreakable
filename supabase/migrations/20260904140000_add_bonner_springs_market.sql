-- Adds Bonner Springs, KS as a new market. City spans Wyandotte,
-- Leavenworth, and Johnson counties (most of it in southwestern
-- Wyandotte County), part of the KC metro. Center point is downtown
-- (Oak St & W Front St), same convention as the other markets.

insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
values ('bonner-springs-ks', 'Bonner Springs', 'KS', 39.055295041621, -94.88142598884, 13);
