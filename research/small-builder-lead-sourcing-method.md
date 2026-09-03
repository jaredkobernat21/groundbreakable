# Small-Builder Lead Sourcing — Method

Reusable method for finding small home builders/developers as Groundbreakable sales
prospects, in any market. First run: KC metro (Leavenworth County corridor + Johnson
County), 2026-09-03 — see `research/small-builder-prospects-kc-metro/report.md` for
the full worked example this method was distilled from.

## Target persona

- **Few completed builds** — roughly 1-15 total permits/projects, or clearly
  early-stage. Not a production builder, not a company with a pipeline or a
  marketing/ops team.
- **No real team** — owner-operator or owner + 1-2 people. Currently finds sites by
  driving around or word of mouth, not by hiring an analyst. This is the "no
  land-acquisition staff" gap Groundbreakable's core service fills.
- **Publicly-sourced phone number**, from something meant for business contact — a
  license record, BBB, HBA directory, business listing, permit record, the
  company's own site. Never from a people-search/data-broker/skip-trace site (see
  guardrails).
- **Actively building now**, in or near the target market.

## Sourcing order (most reliable first)

1. **BuildZoom per-city contractor listings** — `buildzoom.com/<city>-<state>/home-builders`.
   Best objective "few builds" signal: shows a real permit/project count per
   contractor, pulled from municipal permit data. Filter to ~3-15 total permits,
   then verify each one through an independent second source.
   **Gotcha:** BuildZoom's listed phone number is frequently a shared
   call-routing/lead-tracking line — the same base number with a different
   extension across many unrelated listings. Never use a BuildZoom-listed number
   as a candidate's contact info without independent corroboration from another
   source.
2. **County/municipal contractor license or registration records** — owner name,
   license type/status, sometimes phone. The live search portal (often an
   ASP.NET form) usually blocks programmatic/scripted access — don't fight it;
   search for the records that are already indexed by a search engine instead.
3. **BBB business profiles** — phone number, and a "file opened" date that's a
   decent proxy for how new the business is.
4. **The company's own website contact page** — first-party source for phone and
   founding story.
5. **LinkedIn** — owner/founder profile matching the business name and market.
   Treat as corroborating evidence only, not standalone — it needs a second
   source before it counts as verified.
6. **Local HBA/NAHB chapter member directory** (individual indexed member pages,
   not the live search UI), Facebook Business page, Houzz/Angi/BBB, Parade of
   Homes entrant lists, local news "builder spotlight" pieces.

## Verification bar

- Aim for 2+ independent public sources per candidate before calling it
  Medium-High confidence. Single-source facts are Medium at best.
- Be honest about gaps — don't inflate confidence or invent details to hit a
  target list size. A shorter, fully-honest list beats a padded one, because
  this gets acted on directly (real calls/texts to real people).
- Actively track and report candidates that don't fully verify (partial phone,
  unclear build count) in a separate "not verified enough yet" section rather
  than silently dropping them — they're often worth a second pass.
- Also report candidates that turned out too established (real team, 10+ years,
  dozens+ permits) as "considered and excluded" — this shows the persona filter
  was actually applied, not skipped.
- Flag persona mismatches even when a business is genuinely small (e.g. a
  handyman/remodel-only operation isn't a new-construction/development prospect
  even if it's a one-person shop).

## Hard guardrails

- **No people-search/data-broker/skip-trace sites** (Spokeo, Radaris,
  BeenVerified, TruePeopleSearch, Whitepages reverse-lookup, etc.) for phone
  numbers, even if one would technically return a number. This is B2B
  prospecting from business-published contact info, not personal-data lookup.
- **Never click through a legal certification gate** on a public-records portal
  that requires attesting the data won't be used for solicitation (e.g. a KORA
  solicitation certification). Flag it in the report and use an alternate
  source instead.
- Don't force candidates into target cities if a good one turns up just outside
  them — persona fit matters more than a clean city match.

## Output format

For each market run, create `research/<name>-<market>/` containing:
- `report.md` — method summary (what worked / what didn't / access walls hit),
  a ranked shortlist table, a deep-dive card per candidate (evidence, phone +
  source, confidence, what to verify before contact, suggested pitch angle),
  a "not verified enough yet" section, and a "considered and excluded" section.
- `raw-data/candidates.json` — structured data for every candidate seriously
  considered, not just the final shortlist.
- A print-ready PDF call sheet, rendered from an HTML template via headless
  Chrome (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=<out>.pdf
  <in>.html`) — one card per lead, phone number large and bold, pitch angle
  and verification notes included, meant to actually be worked from.
- Leads get loaded into the KC Metro Builder Leads artifact tracker (or the
  market-appropriate tracker) with status and market tag, so they're workable
  day to day rather than living only in a static document.

## Notes from additional market runs

- **BuildZoom's permit count is a recent-years sample, not a career total.**
  On the Davenport/Quad Cities run (2026-09-03), three candidates with low
  BuildZoom permit counts (3-4 permits) turned out on independent search to
  be 15-30-year-old, real-team businesses — BuildZoom simply doesn't carry
  their full history. A low permit count is suggestive, not sufficient:
  always separately confirm years-in-business and team size before treating
  someone as early-stage.
- **"License status" means different things in different states — check what
  the local requirement actually is before treating it as a signal.** Johnson
  County, KS has a real contractor license, and "active" there was meaningful
  corroboration. Iowa has no general contractor license at all (only a
  Division of Labor revenue-based registration above $2,000/yr), so
  BuildZoom's Iowa "license: inactive/expired" flag showed up on plenty of
  real, active, well-reviewed businesses — it was correctly not treated as
  disqualifying in that market. Don't carry a state's license semantics into
  a different state.
- **BBB profile + BuildZoom profile matching independently (same owner name,
  phone, and ideally address) is a reliable Medium-High bar** even without a
  government license record — used for both Iowa shortlist candidates.
- **A state with a real, mandatory contractor license is a structural
  phone-yield advantage — look for a third-party mirror of the state
  register if the official portal blocks scripted access.** On the Raleigh,
  NC run (2026-09-03), the official NCLBGC license portal blocked scripted
  access the same way the KS/IA county portals did, but a third-party mirror
  (nccontractorcheck.com) exposed the same license register — including
  phone number directly — as plain scrapable HTML, city by city. That single
  source landed 5/5 shortlist candidates with a corroborated phone (KC also
  hit 5/5; Iowa, with no state license at all, hit only 2/2). When a market
  is in a state with mandatory GC licensing, actively look for this kind of
  mirror before falling back to BBB/company-site-only sourcing.
- **Treat a "revoked" license as its own category, distinct from
  "inactive/expired" — a hard disqualifier, not a confidence penalty.**
  Expired/inactive is usually administrative (a renewal lapse, or — as in
  Iowa — a state with no real licensing regime at all) and shouldn't
  disqualify on its own. Revoked means the licensing board took action
  against the contractor specifically. First seen on the Raleigh run (Aiken
  Construction Inc, NC license revoked 2026-05-17) — excluded outright
  despite an otherwise well-corroborated phone number.

## Cold-outreach opener (first text)

Short, self-identifying, references something specific to the lead, ends with
a low-commitment question rather than a pitch:

> Hey [Name], this is Jared — I run Groundbreakable, a small site-scouting
> service for [market]-area builders. Saw you're building around [City]. I
> flag buildable lots (and what'll kill a build) before builders waste time on
> them — worth a quick look at what I found near you?

Shorter alternate, optimized for reply rate over information:

> Hi [Name], Jared here — I help small [market] builders find their next
> buildable lot before the bad ones cost them time. You actively looking for
> land right now?

Rules: name yourself and the company immediately; use one specific local
detail (their city, or the pitch-angle note captured for that lead) rather
than anything generic; end with a question, not an offer; save the full pitch
(site-finding + buildability + constraints) for the reply, not the opener.
These are business-published numbers, so this is standard B2B outreach — but
where a number is only "likely direct/cell" and not confirmed, lead with a
text rather than a cold call, and honor any opt-out immediately.
