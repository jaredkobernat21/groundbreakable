# Plan Data Collection Bible

What a "Plan" record needs to hold up as development intelligence, not a raw government
document. Read this before writing or editing a collector script (`collectLawrenceCityCommission.ts`,
`collectLawrencePlanningCommission.ts`, `collectTopekaPlanningCommission.ts`, or a new one for
another market), and before manually or AI-assisted-ly entering a `shifts` row. The dashboard's
Plans feature (`dashboard/src/lib/planNarrative.ts`) derives "What Happened" / "Why It Matters" /
"Key Details" from whatever fields exist on a record — the better the fields, the less it has to
fall back to a generic label or an extracted excerpt. This doc exists so collection and display
stay in sync instead of drifting apart.

## The one rule that matters most

**`entitlement_cases.summary` (and `shifts.description`) must describe ONE case, not a whole
meeting.** A city commission or planning commission agenda/minutes document covers dozens of
unrelated items in one PDF — rezonings next to liquor licenses next to executive-session motions.
When a collector pulls text for a specific case, it must isolate *that case's own paragraph*, not
copy the surrounding agenda wholesale.

This is not hypothetical: a live-data audit (2026-09-29) found **27% of `entitlement_cases` rows
(40 of 149)** have a `summary` field containing the *entire* meeting's minutes — thousands of
characters covering unrelated proclamations, license approvals, and budget items, with the actual
case mentioned once, buried in the middle. The dashboard now works around this at display time
(extracting a window around the case number, or falling back to `entitlement_case_events` instead)
but that's a mitigation, not a fix — new collection should not reproduce this problem.

**Test before you ship a collector change**: if `summary.length` is regularly pushing past ~500
characters, or a single `summary` value would make sense attached to more than one `case_number`,
something upstream is capturing too much. Isolate the one paragraph/item that's actually about
this case.

## Fields, in priority order

Grounded in the same audit — current population rate across all 149 `entitlement_cases` rows
shown in parentheses, so you know which fields are already well-covered and which need real
attention.

**Always try, currently weak — fix these first:**
- `application_date` (0% populated) — the date the request was filed. If the source document only
  gives a hearing date, at minimum record that in `planning_commission_hearing_date`/
  `city_commission_hearing_date` rather than leaving every date field null.
- `staff_recommendation` (0% populated) — planning staff's recommendation text, when the source
  document states one. A single sentence is enough ("Staff recommends approval subject to three
  conditions"), not the full staff report.
- `proposed_units` (0% populated) — numeric unit/lot count, when the source states one (plats and
  rezonings for residential use very often do).
- `existing_zoning` / `requested_zoning` (27% populated) — even a same-jurisdiction shorthand
  ("RS7", "RM12") is enough; don't leave this blank when the source document states it.
- `acreage` (36% populated) — numeric, in acres.
- `address` (48% populated) — a real street address when the source gives one. When it doesn't,
  do **not** fabricate one — leave it null and let `parcel_id`/`planning_area`/`council_district`
  carry the location instead (the display layer already falls back through that chain; see
  `deriveLocationLabel` in `planNarrative.ts`). Never write "Address not on file" into the field
  itself — that's a display-layer fallback string, not real data.

**Always try, currently decent — keep doing this:**
- `approval_type_id` (48% populated) — link to `entitlement_approval_types` whenever the request
  type is identifiable (rezoning, final plat, preliminary plat, minor subdivision, annexation,
  special/conditional use permit, text amendment, etc. — see `REQUEST_TYPE_TO_APPROVAL_KEY` in
  `collectLawrenceCityCommission.ts` for the mapping already in use). This is the *first* thing
  the display layer checks for a human-readable case type label — a case with no linked
  approval_type falls back to guessing from the case-number prefix, which is fine but strictly
  worse.
- `entitlement_case_events` (currently the best-populated child table, 118 rows across 149 cases)
  — record one row per real hearing/vote, with `decision_body`, `event_date`, `outcome`, and vote
  counts when available. This has turned out to be a *better* source for "what happened" than the
  raw `summary` text when the summary is unusable, precisely because it's already structured.
  Keep this pattern going — anything that gets a real decision recorded here is more valuable
  than more prose in `summary`.
- `entitlement_case_parties` (173 rows across 149 cases, decent) — applicant and landowner/owner
  names when the source states them (`submittedBy`/`onBehalfOf` in the agenda parser is the right
  idea — keep splitting person vs. company names, don't just dump a raw string).

**Rarely worth the effort — don't go out of your way:**
- `entitlement_case_changes` / `entitlement_case_conditions` are essentially unused today (1 row
  and 0 rows respectively, across the whole table). Only populate these when a source document
  makes an explicit requested-vs-approved comparison or lists real conditions of approval — don't
  invent structure that isn't in the source.

## `shifts` (news/agenda-sourced Plan signals with no formal case yet)

`shifts.description` is in noticeably better shape than `entitlement_cases.summary` today — real
examples read as clean, specific paragraphs ("Final Development Plan revision: a stormwater issue
at the approved Phase 8/9 entrance... requires relocating it ~300 ft north, with associated
lot-line adjustments and added lots."), not raw dumps. Keep writing entries this way: one real
paragraph about the one thing that happened, in your own words if summarizing a source, not a
copy-paste of an entire article or agenda. `address` is close to universally populated for
shifts already (landmark-based when no literal street address resolves, e.g. "Near O'Connell Rd
and Venture Park Dr, Lawrence, KS" — never fabricated, but always *something* useful) — hold that
same bar for every new shift.

## If you're an AI/agent doing this research directly

Same rule, phrased as an instruction: when you log a Plan (a `shifts` row or an `entitlement_cases`
row) from a source document, write or extract a description of *that one case or event only*.
Never paste a multi-item agenda, full meeting minutes, or an entire news article as the
description/summary. If the source bundles many items together, find the one paragraph that's
actually about the record you're creating, and use only that. Fill every field you can from real,
stated facts in the source — never infer or fabricate an address, date, acreage, or zoning
designation that the source doesn't actually state. Leaving a field null is always better than
guessing.
