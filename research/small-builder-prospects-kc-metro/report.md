# Small Builder/Developer Prospects — KC Metro (Leavenworth County corridor + Johnson County)

**Date:** 2026-09-03
**Prepared as:** sales-prospecting research, not a finished pitch — this is a first pass to identify real people worth a first outreach call/text, not a vetted, ready-to-dial list. Phone numbers below are business-published, not skip-traced; treat "cell" as inferred unless marked verified.

**Goal:** find real, currently-operating small home builders/developers in the KC metro — people who've done only a handful of builds, have no real team, and could genuinely use Groundbreakable's core service (find the next site, tell them what can be built there, tell them what could stop the build) because they don't have staff doing that work today.

---

## 0. Method summary (what was searched, what worked, what didn't)

**What worked:**
- **BuildZoom's per-city contractor listings** (`buildzoom.com/<city>-ks/home-builders`) were the single best objective signal for "few builds" — they show a total permit/project count per contractor, pulled from real municipal permit data. This is how the strongest candidates below (Strack Homes, Prairie Sun Homes, Cedar Nile Homes) were found: filtering city-by-city listings down to contractors with roughly 3-15 total permits, then verifying each one through an independent second source.
- **Johnson County's contractor-license records**, surfaced through general web search (not the license portal itself — see below), reliably returned owner name + license type + license status for anyone licensed in Johnson County, which covers Gardner, Olathe, Lenexa, Spring Hill, Overland Park, Leawood, De Soto, and Edgerton.
- **BBB profiles** were useful for phone numbers and a "BBB file opened" date, which is a decent proxy for how new a business is (a file opened in late 2025 is a strong "just getting started" signal, e.g. Heidebrecht Homes).
- Cross-checking a candidate's business address against public property/neighbor-lookup data (address-type lookups only, not phone/personal lookup) helped tell a home-based, likely-owner-answered number apart from a call-center or office line.

**What did NOT work / dead ends:**
- **The Johnson County Contractor Licensing Search System itself** (`cls.jocogov.org/clsCourseReg/searchcontractor.aspx`) is an ASP.NET form that returned a 403 to a direct fetch — it needs live form interaction, not a scriptable GET. Everything sourced from Johnson County licensing below came from general search results that had already indexed the underlying records, not from querying the portal directly.
- **Superpages' Basehor listing** and a couple of other directory-aggregator pages returned 403s.
- **Google/Facebook Business "About" pages generally did not surface phone numbers** the way expected — most small builders' own websites route everything through a contact form, not a listed number, and Facebook Business pages frequently truncated on fetch.
- **A meaningful, honest catch:** BuildZoom lists a phone number for every contractor in its directory, but nearly every one checked across nine different cities (Tonganoxie, Basehor, Gardner, Spring Hill, Bonner Springs, Lansing, Leavenworth, Edgerton, De Soto) shared the exact same base number — `(316) 854-9394` — with a different extension per listing. That is BuildZoom's own call-routing/lead-tracking line, not the contractor's real phone. **No BuildZoom-listed number was used as a candidate's contact number** — every phone number in the shortlist below was corroborated from the contractor's own site, a license record, or a BBB profile instead. This is worth flagging because it would be an easy, invisible mistake to make at scale.
- The KCHBA member directory's live search UI itself was not used (it requires session-based interaction similar to the county portal) — only individual member pages already indexed by search.
- No people-search/data-broker/skip-trace sites (Spokeo, Radaris, YellowBook, etc.) were used for phone numbers, even when they appeared in search results — several came up incidentally while researching "Strack Homes" and were deliberately ignored in favor of the Johnson County license record and address-correlation instead.

**What this means:** the confidence-graded shortlist below (5 candidates) is smaller than the 10-15 target, on purpose — a lot of what surfaces easily for "small home builder Kansas City" is actually well-established 15-40-year firms with real marketing budgets (Rob Washam Homes, Kessler Custom Homes, Craig Brett Homes, Gianni Custom Homes — all excluded, see §4), because they're the ones with the SEO presence to rank. The genuinely small, few-build operators are much harder to find by searching outward — permit-count filtering was the only approach that reliably surfaced them. §3 lists 8 more candidates that are plausible fits but didn't get a fully verified phone number or a clean read on scale in the time spent — worth a second pass, not worth calling yet.

---

## 1. Shortlist (5 verified-enough-to-approach candidates)

| # | Business / Owner | Market | Est. build volume | Team size signal | Phone (type, source) | Confidence |
|---|---|---|---|---|---|---|
| 1 | Strack Homes — Gary E. Strack Jr. | Gardner, KS (Johnson Co.) | 3 total permits on record | Business address = his residential address; no staff found anywhere | (913) 856-7519 — likely direct/cell (tied to home address, not an office); corroborated across 2 independent sources | Medium-High |
| 2 | Prairie Sun Homes LLC / Atwood Construction Services LLC — Billy (Bill) Atwood Jr. | Basehor, KS (Leavenworth Co.) | ~8 total permits on record | Sole named principal across both related LLCs; no staff found | (913) 206-4948 — published on the company's own site AND matches the Johnson County license record for both LLCs | Medium-High |
| 3 | Cedar Nile Homes, Inc. — Byron S. Seele / Maggie Seele | Gardner, KS (Johnson Co.) | ~15 total permits over ~14 years in business (≈1/year) — a persistently tiny, lifestyle-scale operation, not a new one | Husband-and-wife principals; no employee count found, but the pace (1 home/year for 14 years) strongly implies no real crew | (913) 856-0116 — BBB-listed business line | Medium |
| 4 | Sycamore Road Homes — Ben Cox | KC metro, based Platte Co., MO side, but explicitly a "Kansas City Metro" design/build firm (deep individual experience, brand-new company) | Company founded early 2024 — under 2 years old as this entity, despite Cox's 20 years of prior industry experience elsewhere. Own words: built to do "just enough model homes." | Solo founder; mentions relationships with outside architects/engineers, not employees | (913) 620-4312 — listed on his own site's contact page, no separate office/receptionist line found anywhere | Medium |
| 5 | Heidebrecht Homes, LLC — likely Tyler Heidebrecht | Spring Hill, KS (Johnson Co.) | Unknown build count, but BBB file opened 10/27/2025 — i.e., functionally brand new as a business | LinkedIn shows a "Tyler Heidebrecht — Founder and Owner" profile tied to this business (could not be re-fetched to fully confirm — see gap below) | (913) 368-9555 — BBB-listed | Low-Medium |

Full detail on all candidates considered is in `raw-data/candidates.json`.

---

## 2. Deep dives

### 1 — Strack Homes (Gary E. Strack Jr.), Gardner, KS

**What Groundbreakable would offer him:** He's a licensed, active (Kansas Residential Contractor license #2015-2198, Johnson County) one-man operation with exactly 3 permits on record — genuinely early-stage or genuinely part-time/lifestyle-scale, either way clearly not someone with land-acquisition staff. The pitch is the simplest version of Groundbreakable's core value prop: "you're doing this alone — let us find your next lot and tell you what's buildable on it and what isn't, before you spend your own time driving around."
**Confidence: Medium-High.** Owner name, license status, and business address are all corroborated across the Johnson County license record and a second independent aggregator; the phone number is tied directly to his home address rather than a business office, which is a reasonably strong (though not certain) cell/direct-line signal.
**What needs to be verified before calling:** confirm the license is still active today (records were current as of this search, not live-checked against the county portal), and confirm the number rings to him directly rather than a shared household line.

### 2 — Prairie Sun Homes LLC / Atwood Construction Services LLC (Billy "Bill" Atwood Jr.), Basehor, KS

**What Groundbreakable would offer him:** He operates two related small LLCs (new/custom home construction under Prairie Sun Homes, general construction services under Atwood Construction) out of the same Basehor P.O. box, both Johnson-County-licensed, both apparently one-man-band operations. He's directly in the Leavenworth County corridor Groundbreakable's own prior research (`research/dan-lynch-site-search/`) already covers in depth — meaning Groundbreakable could plausibly hand him a real, already-researched short list of nearby sites (with the appropriate caveats about that data being directional, not verified) rather than starting from zero.
**Confidence: Medium-High.** The phone number is corroborated in two independent ways — it's what's published on his own company website, and it's the same number tied to both LLCs in Johnson County license records — which is a stronger signal than a single source.
**What needs to be verified before calling:** whether he's actually building in the Basehor/Tonganoxie area specifically (vs. elsewhere in the metro) and whether Prairie Sun and Atwood Construction are truly the same one-person operation or a slightly larger family business.

### 3 — Cedar Nile Homes, Inc. (Byron S. Seele / Maggie Seele), Gardner, KS

**What Groundbreakable would offer them:** 14 years in business, ~15 total permits — call it one home a year. That's not a new business finding its footing; it's a small business that has chosen to stay small. That's a different pitch than the others: less "help me get started," more "help me use my limited bandwidth more efficiently" — a one-page buildability screen before they commit to a lot could directly save them from a wasted year on a site with a hidden utility or flood problem.
**Confidence: Medium.** Owner name and years-in-business come from a single BBB profile; the permit count is BuildZoom's aggregate, not independently cross-checked against county permit records directly.
**What needs to be verified before calling:** current build pace (are they still active at ~1/year, or slowing down/winding down after 14 years — worth knowing before pitching a "next site" service), and whether Byron or Maggie is the better first contact.

### 4 — Sycamore Road Homes (Ben Cox)

**What Groundbreakable would offer him:** This is the cleanest "just getting started" story of the five — a construction veteran (COO-level experience at a larger KC builder) who deliberately launched his own small, low-volume shop in 2024. He explicitly frames the business as staying intentionally small ("just enough model homes"). A founder who has already decided not to scale a big ops/land team is a strong fit for a service that replaces that team.
**Confidence: Medium.** Founding story and phone number both came directly from his own site (a single-source but first-party source, which is reasonably reliable for a fact like "when did I start this company"). His broader location (Platte County, MO side of the metro) means he may lean Missouri-side rather than the Kansas corridor Groundbreakable's other research covers — worth confirming his actual build locations before assuming a Kansas-side pitch lands.
**What needs to be verified before calling:** whether the (913) number is genuinely his personal cell or a dedicated business line he doesn't personally answer, and how many homes he's actually completed under this entity so far (not found in this search).

### 5 — Heidebrecht Homes, LLC (likely Tyler Heidebrecht)

**What Groundbreakable would offer him:** if the LinkedIn match is correct, this is a founder who set up his BBB profile within the last year — about as early-stage as a lead gets. That's the highest-value moment to reach someone: before they've built out any of their own site-sourcing process.
**Confidence: Low-Medium — this one needs a confirmation step before outreach.** The LinkedIn profile could not be re-fetched to independently confirm Tyler Heidebrecht is in fact the owner (the fetch tool returned an unrecoverable error on that specific URL); the name match is strong circumstantial evidence (LinkedIn title reads "Founder and Owner" tied to a "Heidebrecht Homes" business, same last name as the LLC, same Spring Hill market) but is not independently corroborated the way the other four are.
**What needs to be verified before calling:** owner identity (confirm via the BBB profile phone call itself, or a fresh LinkedIn look), and basic build-count/team info, since almost nothing about scale was found beyond "the BBB file is new."

---

## 3. Good possible fits — not verified enough to contact yet

These all cleared the first filter (small, plausible KC-metro-area home builder) but either couldn't get a real phone number (as opposed to BuildZoom's shared call-tracking line) or couldn't get a clean read on build volume/team size in the time spent. Worth a second, more targeted pass rather than dropping them:

- **Gingerbread Homes LLC — Timothy J. Mayes**, Spring Hill, KS. Holds a Wood Framing Contractor license + 1 other with Johnson County. No phone found from any source other than BuildZoom's shared number.
- **Integrity Custom Homes LLC — Marc Waller**, Leavenworth, KS (15385 Price Rd). BBB shows "business started 9/17/2014" (~11 years — more established than ideal, but still small-volume per BuildZoom's ~9-permit count). **Name-collision warning:** there is a second, unrelated "Integrity Custom Homes LLC" serving Southwest Missouri/Southeast Kansas with a different (417 area code) phone number — do not use that number for the Leavenworth business; no confirmed phone was found for the actual Leavenworth entity.
- **Von Tersch Custom Homes**, Basehor/Bonner Springs area (Linwood Rd address). Facebook page exists but wouldn't fully render on fetch; no owner name or phone confirmed.
- **Da Homes**, Tonganoxie, KS. 18-24 permits over the last 3 years per BuildZoom — likely too high-volume to be "few builds," but flagged in case a closer look shows otherwise. No independently confirmed phone.
- **Jim Perry Homes Inc**, Lansing, KS. ~20 total permits, but only 2 reviews at a 1.0 rating — a real quality/reputation flag worth investigating before any outreach, not just a data gap. No independently confirmed phone.
- **Leahy Homes LLC**, Edgerton, KS. BuildZoom flags "no active license on file" — could mean lapsed/renewal-pending or genuinely unlicensed; worth a direct county license check before outreach. No independently confirmed phone.
- **Monster Construction / Remington Custom Homes**, De Soto, KS. Same "no active license on file" flag as above. No independently confirmed phone.
- **Bob the Builder, LLC — Robert (Bob) Findley**, Basehor, KS. Genuinely small, owner-operated (business started 2018, 30 years personal experience) — but his actual work is home improvement/handyman/remodeling (kitchens, baths, decks, roofing), not new-home construction or land development, so the core "find your next place to build" pitch may not land the way it would for an actual builder. Included for completeness, not a strong persona fit.

---

## 4. Considered and excluded — too established for this list

These all came up prominently in search but were excluded because they're well past the "few builds, no team" persona — including them would be padding the list, not helping it:

- **Gianni Custom Homes, LLC (Joseph Gianni)**, Leawood, KS — 196 permits on record, ~$2.5M in permitted value, 10 years in business. A real small-to-mid business, but not "a few builds."
- **Kessler Custom Homes, Inc. (Jennifer & Kyle Kessler)**, Gardner, KS — 28 years of stated experience, a Parade of Homes winning builder.
- **Rob Washam Homes**, Blue Springs, MO — 36 years in business.
- **Craig Brett Homes, LLC**, Gardner, KS — ~20 years of experience, has a team.
- **All Under One Roof (Bryan ___)**, serving the KC metro — "Serving KS & MO since 2005," with a named AIA architect and PE engineer on staff — a real small firm, but has professional staff, not owner-operator scale.
- **Legacy Custom Homes, LLC** — turned out to be based in Lee's Summit, MO, not Bonner Springs as the initial listing suggested; excluded on a geography/data-quality basis, not persona.

---

## 5. Guardrails followed

- No phone numbers came from people-search/data-broker/skip-trace sites (Spokeo, Radaris, YellowBook, BeenVerified, etc.), even where they appeared in search results.
- No BuildZoom-listed phone number was used as a contact number for any candidate — see §0 for why that number is actually a shared call-tracking line, not the contractor's own line.
- No license-portal solicitation-certification gate was clicked through (none was actually encountered this time — Johnson County's portal blocked programmatic access outright rather than gating behind a certification, so the issue didn't arise, but the same caution from the Dan Lynch research applies if it does next time).
- Confidence levels are deliberately conservative — "Medium-High" here is not "verified" the way owner names were verified against county GIS parcel records in the Dan Lynch report; it means "corroborated across two independent public sources," a lower bar. Every number below needs a real dial-tone check before it goes into any outreach sequence.

---

## 6. Data sources (for independent verification)

- BuildZoom city contractor listings: `buildzoom.com/<city>-ks/home-builders` for Tonganoxie, Basehor, Gardner, Spring Hill, Bonner Springs, Lansing, Leavenworth, Edgerton, De Soto
- Johnson County Contractor Licensing (records surfaced via search, not the live portal): https://www.jocogov.org/department/contractor-licensing
- BBB business profiles (Basehor, Tonganoxie, Gardner, Spring Hill, Overland Park custom-home-builder categories): bbb.org
- Individual company sites: prairiesunhomes.com, sycamoreroadhomes.com, giannihomes.com, craigbretthomes.com, auorkc.com, bobthebuilderllc.net, integritycustomhomes.net
- KCHBA member directory (individual indexed member pages only, not the live search): members.kchba.org
- Prior Groundbreakable research for market/corridor context: `research/dan-lynch-site-search/report.md`, `research/dan-lynch-emerging-area/report.md`
