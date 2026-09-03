# Small Builder/Developer Prospects — Raleigh NC Exurbs / Wake County Growth Corridor

**Date:** 2026-09-03
**Method:** `research/small-builder-lead-sourcing-method.md`, third market run (after KC metro and Davenport/Quad Cities).
**This run's priority:** maximize candidates with a corroborated phone number — phone contact is the actual point of this exercise.

---

## 0. Method summary

**What worked, and much better than prior runs:** **nccontractorcheck.com** — a third-party mirror of the NC Licensing Board for General Contractors' (NCLBGC) public register — turned out to be the single best phone source of any market run so far. City pages (`nccontractorcheck.com/<city>/`) list every state-licensed contractor with name, license number, license level, status, address, **and phone number**, all in plain scrapable HTML. This is a structural advantage specific to NC: the official NCLBGC portal (`portal.nclbgc.org`) itself blocked scripted access exactly like the Johnson County, KS and county-level Iowa portals did, but this third-party mirror did not. Cross-referencing a candidate's name found there against BuildZoom for permit count, and a general search for years-in-business/company story, gave a fast, reliable Medium-to-Medium-High verification path.

BuildZoom per-city listings again worked as the initial persona filter, and — as in the Davenport run — permit count alone was misleading for older businesses; several low-permit BuildZoom profiles turned out to be 20-40-year-old established firms once checked independently (see §4).

The Home Builders Association of Raleigh-Wake County's member directory (branded "Atlas") is entirely client-side JavaScript — individual member profile pages are search-indexed and their URLs are findable, but the page content itself never loads via a plain fetch, so it was not usable as a source this run (a real dead end, different from KC/Iowa's HBA directories, which were merely slow to search, not technically inaccessible).

**A serious flag surfaced this run, new to the method:** one candidate (Aiken Construction Inc, Raleigh) came up with a phone number and address matching two independent sources, but a closer look showed its NC license was **revoked** (not just expired) as of 05-17-2026. Revocation is a materially different and worse signal than an ordinary lapsed/expired license — it implies the state board took action, not just an administrative gap. This candidate was disqualified outright rather than merely down-rated, and future runs should treat "revoked" as its own category, distinct from "inactive/expired." (Folded into the method doc.)

**Volume/persona filtering also caught real misses:** two additional candidates that looked plausible on a first pass (Butler Homes LLC, Believe Builders LLC — both Fuquay-Varina) turned out to be construction-and-remodeling generalists rather than primarily new-home builders once their actual service lists were checked — flagged as persona-risk rather than included.

---

## 1. Shortlist (5 verified-enough-to-approach candidates, all with corroborated phone)

| # | Business / Owner | Market | Est. build volume | Team size signal | Phone (type, source) | Confidence |
|---|---|---|---|---|---|---|
| 1 | Bosh Builders LLC — Robert "Bob" Kopp | Fuquay-Varina, NC | 5 permits (BuildZoom, top 37%); founded 2013 | 2-10 employees (LinkedIn) | (919) 770-4788 — business line; matches general search (LinkedIn/BBB) AND independently via nccontractorcheck.com's NCLBGC mirror (License L.108145, Active, qualifier Robert C. Kopp) | Medium-High |
| 2 | Carew Homes LLC — Michael Sean Carew | Rolesville, NC | 3 permits, $250,000 total (BuildZoom) | Solo-qualifier LLC; no other staff found | (919) 669-6233 — business line; nccontractorcheck.com NCLBGC record (Active) matched against BuildZoom's identical owner/address | Medium-High |
| 3 | Boreal Homes Inc — Jesse Conniff | Fuquay-Varina, NC | 15 permits/3 yrs (BuildZoom); founded 2015 | Single named incorporator; no team evidence found | (919) 291-0031 — business line; nccontractorcheck.com NCLBGC record (License L.76304, Active, Intermediate level), independently corroborated by BBB and Houzz profiles | Medium-High |
| 4 | Ed Donahue Builders LLC — Edward "Ed" Donahue III | Rolesville, NC | No permit count found; "building contractor since 2009" | Donahue is separately licensed BOTH as the LLC and as an individual qualifier at the same address/phone — a strong owner-operator signal (no other qualifier on the license) | (919) 673-8156 — business line; nccontractorcheck.com NCLBGC record matched against city-data.com business registration (same address) | Medium |
| 5 | BRC Homes Inc — Bulmaro Rodriguez | Wake Forest, NC | No permit count found for BRC Homes specifically; BRC Homes entity incorporated 2019 | Rodriguez personally licensed since 2008 (ran a roofing company since 1993) — an experienced operator, but this specific home-building venture is relatively young; no employees found | (919) 562-1081 — business line; nccontractorcheck.com NCLBGC record matched against city-data.com incorporation record | Medium |

Full detail on all candidates considered is in `raw-data/candidates.json`.

---

## 2. Deep dives

### 1 — Bosh Builders LLC (Robert "Bob" Kopp), Fuquay-Varina, NC

**What Groundbreakable would offer him:** A 2-10 person shop (LinkedIn) with 5 tracked permits — small enough that a dedicated site-scouting/buildability service is a real time-saver, not a redundant service he already staffs for.
**Confidence: Medium-High.** Owner name, phone, and license status corroborated identically across a general web search (LinkedIn, BBB, ZoomInfo) and independently via nccontractorcheck.com's mirror of the state license record.
**What needs to be verified before calling:** whether the number is a personal cell or a shared office line; current build volume/location focus within Fuquay-Varina specifically.

### 2 — Carew Homes LLC (Michael Sean Carew), Rolesville, NC

**What Groundbreakable would offer him:** Only 3 tracked permits totaling $250,000 — about as clean a "few builds" signal as this project gets. A solo-qualifier LLC with no other licensed staff.
**Confidence: Medium-High.** Owner name and phone corroborated across BuildZoom (permit/address data) and nccontractorcheck.com (independent state-license mirror), both pointing to the same person/address.
**What needs to be verified before calling:** how long he's been building under this LLC (no founding date found) and whether he's actively looking for his next site now.

### 3 — Boreal Homes Inc (Jesse Conniff), Fuquay-Varina, NC

**What Groundbreakable would offer him:** Founded 2015, 15 permits over the last 3 years — a real, active small operation, right at the top edge of the "few builds" range. No employees found in any source.
**Confidence: Medium-High.** Phone and license status corroborated across nccontractorcheck.com, BBB, and Houzz independently.
**What needs to be verified before calling:** whether the current pace (roughly 5 homes/year) means he's already at capacity or still actively land-shopping; a $ project-value floor would help gauge fit.

### 4 — Ed Donahue Builders LLC (Edward "Ed" Donahue III), Rolesville, NC

**What Groundbreakable would offer him:** A "building contractor since 2009" who is his own sole license qualifier — no separate staff qualifier on file, a real owner-operator signal even without a hard permit count. Worth noting he does both residential and commercial work, which may mean less exclusive bandwidth for new-home site-finding, which is exactly the gap Groundbreakable fills.
**Confidence: Medium.** Phone and address corroborated between nccontractorcheck.com and city-data.com's business registration record, but no independent permit-count source was found, so build volume is unconfirmed — the only reason this isn't Medium-High.
**What needs to be verified before calling:** actual current build volume and whether new-home construction or general contracting is the larger share of his work today.

### 5 — BRC Homes Inc (Bulmaro Rodriguez), Wake Forest, NC

**What Groundbreakable would offer him:** BRC Homes as an entity is young (incorporated 2019) even though Rodriguez himself is an experienced, long-licensed contractor (license since 2008; ran ABJ Roofing since 1993) — likely a deliberate pivot into home-building as a smaller, newer venture, which is exactly the kind of "getting started in a new line" moment worth catching early.
**Confidence: Medium.** Phone and incorporation date corroborated between nccontractorcheck.com and city-data.com, but no BRC Homes-specific permit count was found (his roofing company's history is well documented; his home-building venture's isn't yet) — flagged as the reason this stays Medium rather than Medium-High.
**What needs to be verified before calling:** how much of his current work is new-home construction specifically, versus his original roofing/general contracting base.

---

## 3. Good possible fits — not verified enough to contact yet

- **Built Right Homes LLC — Mark A. Anderson**, Wake Forest, NC. 2 permits/2 yrs (BuildZoom). **Gap:** BuildZoom shows no active license on file, and the phone number found ((919) 427-3629) has only one source — worth a second look, but the missing license is a real flag, not just a data gap.
- **Signature Builders — Paul Phipps**, Zebulon, NC. 7 permits, BuildZoom score in the upper-middle range. **Gap:** phone number (919) 441-8731 found but could not be independently corroborated against nccontractorcheck.com (not in the first 60-of-200 Zebulon listing) or a BBB profile — single-source only.
- **Dwelling Place Builders LLC — likely John Graham Spencer III**, Knightdale, NC. Active building license (107312). **Gap:** no phone number found anywhere in this search.
- **MB Homes Construction**, Zebulon/Youngsville, NC. 11 permits (BuildZoom). **Gap:** BuildZoom shows no active license on file; not found in nccontractorcheck.com's Youngsville listing; no phone found.
- **Provision Building Co., LLC — Chad Metzger (Managing Member), Christopher Dean (Member)**, Raleigh, NC. Phone (919) 625-3751 well corroborated (company's own site, BBB). **Gap:** 41 permits over 3 years is a real volume concern — possibly above the "few builds" ceiling — and years-in-business wasn't confirmed, so it's unclear whether this is a fast-growing young company or an established one BuildZoom's permit sample simply undercounts (per the Davenport-run lesson).
- **Berkshire Builders LLC**, Wake Forest, NC. Active license, phone (919) 437-7337 sourced directly from the state-license mirror. **Gap:** no external evidence at all of build count, team size, or even that this is a home builder rather than a general/remodeling contractor — the license record alone doesn't establish persona fit.
- **Butler Homes LLC**, Fuquay-Varina, NC. 10 permits/3 yrs, phone well corroborated. **Gap:** operates as "Butler Homes Construction & Remodeling" — real persona-mismatch risk; unclear how much of the work is new construction vs. remodeling.
- **Believe Builders LLC — Stephen Cochran**, Fuquay-Varina, NC. Founded 2016, well-corroborated phone. **Gap:** service list spans kitchen/bath remodeling, additions, decks, insurance repairs, and residential home building — persona-mismatch risk; no permit count found to gauge how much is actually new-home construction.

---

## 4. Considered and excluded

**Too established:**
- **Urban Building Solutions LLC** (Hank/Thomas H. McCullough III), Raleigh — 114 permits, business started 2007 (~19 yrs).
- **Redeeming Development Group / RDG** (Chris Hodges & Coburn Murray), Apex — 174 permits; describes itself as "a leader in the Triangle market."
- **Cornerstone Custom Home Builders Inc** (William Franklin Longson), Zebulon — founded 1995 (~30 yrs), 30 permits, despite a well-corroborated phone.
- **JVC Homes Inc** (Robert Jones), Wake Forest — 303 permits.
- **Norris Homes, Inc.** (Michael A. Norris), Clayton — incorporated 2002 (~24 yrs), 55 permits.
- **Haven Homes LLC** (Chris Sanders), Wake Forest — "over 30 years of custom home building experience."
- **Associate Builders, Inc.** (Stephen "Mike" Burrows), Wake Forest — founded 1983 (~43 yrs).
- **Blackwell Builders, Inc.** (Ginger/Karl Blackwell), Wake Forest — founded 1995 (~30 yrs), 27 permits/3 yrs.
- **Zeigler Classic Homes and Renovations, Inc.** (Julia/Craig Zeigler), Rolesville — founded 1987 (~39 yrs); also a persona mismatch (estate homes/remodeling/light commercial mix).

**Disqualified — revoked license (new category this run):**
- **Aiken Construction Inc**, Raleigh — phone and address well corroborated, but NC license #13166 was **revoked** 05-17-2026, not merely expired. A materially different and more serious flag than an administrative lapse; excluded outright.

**Data-quality dead ends (likely wrong entity, not real candidates):**
- **"Sdp Builders" / Youngsville, NC** — search results kept resolving to Stephen D. Prater Builder, Inc., a same-named but apparently unrelated business, with a suspiciously large 629-permit figure that doesn't match a small Youngsville operation; not enough clean data to treat as a real local candidate.
- **"Freeman Custom Homes" / Clayton, NC** — search results kept resolving to Freeman's Custom Homes, Inc. of Kernersville, NC (a different city/company); not pursued further.

---

## 5. Guardrails followed

- No people-search/data-broker/skip-trace sites used for any phone number — every number came from nccontractorcheck.com (an NCLBGC mirror), BuildZoom, BBB, a company's own site, or a business-registration index (city-data.com).
- No solicitation-certification gate was encountered on nccontractorcheck.com (it's a plain public mirror with no such gate) or elsewhere this run.
- A revoked license (Aiken Construction) was treated as a hard disqualifier, not just a confidence penalty.
- Persona mismatches (Butler Homes, Believe Builders) were flagged rather than silently included despite otherwise-decent phone corroboration.

---

## 6. Data sources

- nccontractorcheck.com city pages (Wake Forest, Rolesville, Knightdale, Fuquay-Varina, Zebulon, Youngsville) — third-party NCLBGC license register mirror
- BuildZoom city contractor listings: `buildzoom.com/<city>-nc/home-builders` for Wake Forest, Rolesville, Knightdale, Clayton, Fuquay-Varina, Youngsville, Zebulon
- BBB business profiles (Wake Forest, Rolesville, Fuquay-Varina, Zebulon, Raleigh, Holly Springs)
- Company sites, city-data.com business-entity records, LinkedIn (corroborating only)
- portal.nclbgc.org (official NCLBGC portal — search form confirmed to exist but blocked scripted submission, same pattern as prior county-level portals)
- Prior method reference: `research/small-builder-lead-sourcing-method.md`, KC and Davenport reports
