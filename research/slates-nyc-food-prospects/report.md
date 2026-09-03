# New NYC Food Establishment Prospects — SLATES

**Date:** 2026-09-03
**Persona:** brand-new, independent food trucks/restaurants/cafes in NYC likely to still need a website, payment setup, branding, and Google Maps/Business presence.
**Source:** NYC DOHMH Restaurant Inspection Results open dataset (Socrata API, `data.cityofnewyork.us/resource/43nn-pn8j.json`), filtered to establishments with `inspection_date = 1/1/1900` — the dataset's own documented signal for "applied for a permit, not yet inspected."

---

## 0. Method summary

**What worked:** The dataset's `phone` field is populated for essentially every record (owner/manager-provided at permit application) — this is the best phone-yield source found across this whole project family, and by a wide margin: 100% fill rate at real volume, versus 5/5 for KC and Raleigh's builder runs (much smaller pools) and 2/5 for Iowa. The `inspection_date = 1900-01-01` filter, explicitly defined in the dataset's Socrata metadata description, is a clean, high-confidence "genuinely new, not yet inspected" signal.

**A real mistake, caught and corrected mid-run:** The first approach computed, per restaurant (CAMIS), the minimum `inspection_date` across all queryable records and treated a minimum "since June 2026" as evidence of a new business. This produced an 801-restaurant pool that looked great, but the first 8 restaurants individually web-checked from it (freshest first) were **all** long-established, well-reviewed businesses (Oslo Coffee Roasters since 2003, Lion's Milk since 2015, Liu Ji Sichuan Noodle House with 131 reviews, etc.) — their only inspection visible in the current data window happened to fall recently, because the dataset only retains inspections up to three years prior to the most recent one. An infrequently-inspected old restaurant can look brand-new under that heuristic. This was caught by the web-presence-check step built into the research directive — exactly what that step is for — and the pull was redone entirely against the dataset's own documented `1900-01-01` "not yet inspected" flag instead.

**Filtering applied to the 3,741 raw "not yet inspected" records:**
- Removed missing-borough and missing-phone rows.
- Removed name matches against an ~85-term chain/franchise keyword list (McDonald's, Subway, Starbucks, Dunkin', Sodexo, Aramark, Eataly, etc.) → 3,548 remain.
- Removed any phone number appearing 3+ times across the pool — a proxy for institutional/corporate foodservice operators running many named "concepts" under one contact number. Confirmed this pattern directly: a "SODEXO OPERATIONS LLC@META NYC 380" entry shared a phone with 6 other differently-named "restaurants" at the same Manhattan office address, alongside Wells Fargo's and Société Générale's corporate cafeterias.
- Individually web-checked a stratified sample of 42 (every Nth record across the 3,548, for borough/name diversity) for: (a) does the name/address match a real, findable business, (b) does it already have an owned website, (c) any signal it's actually an established business, a reopening, or a chain the keyword filter missed.

**Result:** of 42 checked, 15 are genuinely good SLATES prospects (new + no/minimal owned web presence), 6 are moderate/uncertain (some ambiguity in the match or a partial web presence), and 21 were excluded (established businesses, chains missed by keyword filtering, permanently closed, wrong-entity data matches, or not actually a restaurant/food business).

**Volume note:** 3,548 clean, phone-having, not-yet-inspected NYC food establishments remain in the pool beyond what was individually checked here — this supports a substantially longer list in a follow-up pass. The 42-item sample was sized for what could be responsibly hand-verified in one pass, not a hard ceiling on the channel.

**Chain-filter gotcha for future runs:** the keyword blocklist still missed several real chains (Matto Espresso — 9-location Manhattan chain; Grizzly Coffee — established Brooklyn mini-chain with press coverage; CoCo Tea/CoCo Fresh Tea & Juice — international bubble tea franchise; 375° Chicken 'n Fries — 3-location small chain) that only surfaced as chains during the individual web-check. Keyword filtering alone is insufficient; the per-candidate check is load-bearing, not optional.

---

## 1. Shortlist — 15 candidates, genuinely new with no/minimal owned web presence

| # | Business | Borough/Area | Phone | Web presence found | Confidence |
|---|---|---|---|---|---|
| 1 | Jayden 11 Palace Inc | Bronx (Castle Hill) | (718) 824-3403 | **None** beyond the official NYC inspection-grade listing | High |
| 2 | JDA Food LLC | Brooklyn (Williamsburg) | (347) 394-8905 | **None** — only the NYC inspection-grade listing exists | High |
| 3 | M A Pizza & Hotdog Inc | Manhattan (Lower East Side) | (646) 642-7988 | **None** found — entity formed Sept 2025, zero web/delivery/social presence | High |
| 4 | Garry Vilbon | Brooklyn (Flatbush Ave) | (718) 737-3433 | **None** found under this name anywhere | Medium (existence itself unconfirmed beyond the permit record) |
| 5 | Smash Time Burger Co | Bronx (E Tremont Ave) | (917) 993-3501 | No owned website; DoorDash/Grubhub/Seamless/Yelp only | Medium-High |
| 6 | Casa Mulberry | Manhattan (Mulberry St) | (via Toast/Grubhub only) | No owned website found; Toast/Grubhub/Seamless only | Medium |
| 7 | A Taste of Seafood | Brooklyn | (718) 483-8920 | No owned website; ChowNow/DoorDash/Uber Eats/Instagram only | Medium |
| 8 | Bar Lento | Manhattan (Chelsea) | not yet published | Pre-opening as of press coverage; no website found yet | Medium |
| 9 | Canarsie Fish and Chips | Brooklyn | (347) 715-4841 | No owned website; Yelp/Seamless only | Medium |
| 10 | The Roosevelt Pizza (Roosevelt Pizza Express) | Queens (Jackson Heights) | (718) 433-9324 | No owned website; likely a reopening at the same address | Medium |
| 11 | Urban Crust Pizza & Grill | Brooklyn (Liberty Ave) | via delivery platforms | No confirmed owned website | Low-Medium |
| 12 | Fuleen Palace (New Fuleen Palace Restaurant) | Queens (Howard Beach) | (718) 848-5877 | No owned website; possibly a reopening/rename | Low-Medium |
| 13 | Pony's NYC | Brooklyn (Red Hook) | via press only | No owned website despite press coverage | Low-Medium |
| 14 | Burmese Bites | Queens (Astoria) | (917) 560-2480 | Facebook page exists; no owned website | Low-Medium |
| 15 | Mazaji Specialty Coffee Corp | Brooklyn (Bay Ridge) | (347) 492-0114 | Already has an owned domain — deprioritize | Low (deprioritize — has a site already) |

Full detail on every candidate considered is in `raw-data/candidates.json`.

---

## 2. Notable profiles

**Jayden 11 Palace Inc** and **JDA Food LLC** are the cleanest possible SLATES prospects this method can produce: both are directly confirmed by NYC's own restaurant-grades site as not yet having completed their first inspection cycle, and neither has *any* findable web presence — not a website, not a delivery-platform listing, not social media. About as close to "day one, no digital footprint at all" as a real business gets.

**M A Pizza & Hotdog Inc** is similar — a business entity formed in September 2025 with zero findable online presence under its own name, on the Lower East Side (a dense, competitive restaurant corridor where lacking any web presence is a real handicap).

**Bar Lento** is a distinct, valuable case: press coverage exists (a "coming soon" write-up) but as of that coverage no opening date or website had been announced — this is the single best-timed prospect in the list if still pre-launch, since the pitch (website, payments, branding, Maps) can be in place before their doors even open.

**Garry Vilbon** could not be independently confirmed as an actual operating business at all beyond appearing in the permit data — flagged rather than dropped, since a business this invisible is either exactly the target profile or hasn't opened yet; worth a direct outreach attempt to find out which.

---

## 3. Not verified enough / ambiguous (not included above, but not dropped silently)

- **Supermarket El Bodegon Latino** (Queens) — data resolved to conflicting entities (a Florida chain, and a differently-spelled Corona, Queens grocery); likely a grocery store rather than a restaurant proper.
- **VSM NY Cafe** (Manhattan, 2131 Broadway) — same address as the established Fairway Market café; relationship unclear.
- **Waylon & Caribbean Flames** — search resolved to multiple unrelated entities; too ambiguous to place confidently.
- **Soy or Spicy** — address signals point toward Nassau County, likely outside NYC's five boroughs despite the "Queens" borough tag in the source data — a possible geocoding/borough-tag issue.
- **Lanzhou Hand-Pulled Noodles** — an extremely common restaurant-name pattern in Flushing; could not confidently isolate the specific new one from established namesakes.
- **Stand 50B** — search only surfaced an unrelated, long-established comedy club/restaurant.

---

## 4. Considered and excluded

**Established businesses / expansions by experienced operators:** Amber Room, Oodles, Smør, Starz Coffee Cafe, Thamel NYC, Oyishi Sushi (owner's third sushi restaurant), Loopy's Eatery, Ler Lers (expansion by Klom Klorm's owners), Bicchiere Wine & Pasta Bar (from the Madame Bonté group), Ferguson's Country (from the Baba team), Essex Pearl, Janet's Pizzeria, Kirbee's (nationally famous, press-covered Texas BBQ pitmasters), Elora's (established since 1995).

**Chains/franchises the keyword filter missed:** Matto Espresso (9-location Manhattan chain), Grizzly Coffee & Tea House (Brooklyn mini-chain with press coverage), CoCo Tea JH (CoCo Fresh Tea & Juice franchise), 375° Chicken 'n Fries (3-location small chain).

**Data-quality / wrong-entity or category mismatches:** Tumbao (a fashion/retail pop-up, not a restaurant), Ama Ba (permanently closed as of Dec 2025), Wilt's Berries (appears to be a Philadelphia business, not Brooklyn).

---

## 5. Guardrails followed

- All phone numbers came directly from the official NYC DOHMH open-data field (owner/manager-provided at permit application) — no people-search/data-broker/skip-trace sites used at any point.
- No "new" date or web-presence-absence finding was asserted without an actual check; ambiguous cases are reported as ambiguous (§3), not silently dropped or silently included.
- Institutional/corporate-cafeteria entries (Sodexo, bank cafeterias) were identified via the shared-phone-number pattern and excluded rather than counted as independent small-business leads.

---

## 6. Data sources

- NYC DOHMH Restaurant Inspection Results, Socrata dataset `43nn-pn8j` (`data.cityofnewyork.us`), including its own metadata/data-dictionary description.
- Individual web searches per candidate (news/press, Yelp, Google-indexed business listings, delivery platforms, Instagram/Facebook, company sites) for the persona/web-presence check.
