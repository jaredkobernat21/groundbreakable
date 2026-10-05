# Groundbreakable — Data Center Potential Master Spec

Standing context for all Groundbreakable work related to: Potential Data Center site discovery,
qualification, research, scoring, ownership/parcel research, power infrastructure research,
buyer filtering, developer site intelligence, and Potential-site UI/data updates.

Authored by Jared (2026-10-05) as the canonical consolidation of the research-quality,
public-record-escalation, and presentation-simplification work done on 2026-10-04. Supersedes the
narrower draft this file previously held — nothing substantive was dropped; see the
**Implementation Appendix** at the end for how this maps onto the actual schema/code, and for two
places where the already-shipped implementation is slightly more granular than this spec's text
(flagged explicitly, not silently reconciled either direction).

The goal of the Potential category is to identify and preliminarily qualify data-center sites
BEFORE a known project exists. Groundbreakable should do as much preliminary diligence as
credible public information allows. The user should see conclusions and actionable
intelligence — not Groundbreakable's unfinished research queue.

## 1. Definition of a Potential Data Center site

A Potential Data Center site is: a specific site, parcel assemblage, industrial area, or tightly
defined opportunity area where land, power, entitlement, connectivity, energy, water, and other
fundamentals create a credible case for future data-center development, but where there is no
credible evidence that a specific data-center project is already being pursued there.

Potential answers: *"Where could a data center realistically work before a known project
exists?"*

Potential is NOT: a rumor; a planned data center; simply "land near transmission"; an entire metro
area with no site logic; an infrastructure project by itself. Potential should represent a
site-specific development thesis.

## 2. Category distinction

- **Potential** — a Groundbreakable-discovered site with credible fundamentals and no known
  specific data-center activity.
- **Possible** — upstream infrastructure or market changes that may create future data-center
  feasibility (new substations, transmission expansion, generation additions, gas infrastructure,
  utility capacity programs, water/sewer expansion, major industrial infrastructure).
- **Planned** — evidence of an actual data-center project (land acquisition, option agreement,
  rezoning, site plan, incentives, interconnection tied to a project, planning filing, public
  announcement).

Nearby Planned or Possible activity can strengthen a Potential thesis, but it does NOT change the
Potential site itself to Planned.

## 3. Core buyer questions

Every Potential site should help answer: Can I realistically get power here? What power
infrastructure is actually nearby? Is there evidence of utility expansion? How much power might
be feasible? How soon might power be deliverable? Is there enough contiguous developable land?
Who owns it? How fragmented is site control? Is BTM generation plausible? Is natural gas nearby?
Is fiber nearby? Is water/wastewater adequate or expandable? Can the site be entitled? Is the
political/community environment workable? Are there environmental or physical fatal flaws? What
is actually verified vs. inferred? What could kill the deal? What action should a developer take
next?

## 4. Primary intelligence categories

Organize each Potential site around: Power; Land + Site Control; BTM Energy; Connectivity; Water
+ Wastewater; Entitlement + Community; Physical + Environmental; Deliverability. These are
attributes of the site, not separate dashboard categories.

## 5. Power — highest priority

Power should receive the greatest research depth and scoring weight. Research: likely serving
utility; exact service territory where possible; neighboring service territories; nearest
substations (name, utility owner, address/location, distance); transmission line proximity;
transmission voltage; nearby/planned generation; planned substations; substation expansions;
transmission upgrades; utility capital plans; IRPs; utility economic-development programs;
large-load tariffs; data-center tariffs; RTO/ISO projects; regulatory filings; interconnection
activity; known large-load projects nearby; public utility capacity statements; public
constraints; publicly visible time-to-power indicators.

**Always separate**: Physical Infrastructure / Available Capacity / Time to Power. Never infer
available MW because a substation or transmission line is nearby. Never infer a firm energization
date from infrastructure proximity.

```
Serving Utility          Evergy — SUPPORTED
Nearest Substation       Whippoorwill Substation — VERIFIED
Transmission             345 kV corridor nearby — VERIFIED
Available MW             REQUIRES UTILITY CONFIRMATION
Time to Power            REQUIRES UTILITY CONFIRMATION
```

## 6. Power research escalation

Do not give up after a normal web search.

1. **General search** — exact site + utility + substation terms.
2. **City/county** — planning commission packets, city council agendas, ordinances, special-use
   permits, zoning cases, public notices, comprehensive plans, capital plans.
3. **Utility** — utility website, tariff PDFs, service territory, economic development,
   transmission plans, IRPs, capital projects.
4. **Regulatory/RTO** — state utility commission, FERC, RTO/ISO, transmission planning documents,
   dockets, interconnection reports.
5. **Cross-reference** — substation names, street addresses, permit numbers, project names,
   transmission corridors, nearby large-load projects.

Only after exhausting relevant pathways should a field remain **Unknown** or **Requires Direct
Confirmation**.

## 7. Land + Site Control

Ownership and parcel structure are first-class intelligence. Research: parcel IDs; parcel
boundaries; legal descriptions; total/vacant/developed/contiguous/likely-usable acreage; owner of
each parcel; ownership entity; mailing address; registered agent; purchase date if useful; related
entities; listing status; broker; public business contact paths; development status;
plat/subdivision name; zoning.

Never assume "265-acre industrial park" means "265 acres available." Separate: Total Area /
Vacant Area / Contiguous Area / Developable Area.

## 8. Parcel/ownership research protocol

Before saying ownership is unresolved: (1) establish the best-supported site boundary; (2)
identify streets within the opportunity area; (3) identify plat/subdivision names; (4) search
county GIS; (5) search county assessor; (6) search tax records; (7) search recorder/deed data if
accessible; (8) search by address, parcel ID, owner, legal description, and plat name; (9) collect
parcel ID/address/legal description/acreage/owner/mailing address/development status; (10) group
parcels by owner; (11) calculate parcel count, owner count, largest owner, acreage by owner,
contiguous assemblage; (12) search entity records for owner LLCs; (13) search for public business
phone/email/website, registered agent, broker/listing contact.

Use only legitimate public information. Do not expose non-public personal information.

## 9. Site Control output

Summarize: Total Identified Parcels; Total Identified Acreage; Vacant/Available Acreage; Largest
Contiguous Assemblage; Number of Owners; Largest Owner; Acreage Controlled by Largest Owner;
Ownership Complexity (**Low** = few owners/easy assemblage; **Moderate** = several owners/
manageable assemblage; **High** = fragmented ownership). If only part of the park is resolved, say
**Partially Resolved** — never "Research Pending" after a full research pass.

## 10. BTM Energy

Research: natural gas transmission pipelines; pipeline proximity/operator/diameter/pressure if
public; compressor stations; nearby gas generation; industrial gas infrastructure; BTM generation
precedent; air/emissions permitting; state environmental requirements; local generator
restrictions. Always separate **Pipeline Proximity** from **Available Gas Capacity**.

```
Natural Gas Pipeline        0.9 miles — VERIFIED
Operator                    Southern Star — VERIFIED
Diameter                    24" — VERIFIED
Available Delivery Capacity REQUIRES OPERATOR CONFIRMATION
BTM Potential                SUPPORTED
```

## 11. Connectivity

Research: long-haul fiber; dark fiber; metro fiber; known carriers; telecom corridors; nearby
carrier hotels; IX facilities; municipal fiber; industrial fiber; nearby data centers; redundant
route potential. Try to identify actual carrier names — don't stop at "fiber needs verification"
if carrier presence can be researched. Separate **Carrier/Route Presence** from **Last-Mile
Service Availability**.

## 12. Water + Wastewater

Research: water/wastewater provider; treatment facilities; water/sewer mains and sizes if public;
treatment capacity; capital improvement plans; future expansions; industrial service; water
rights; drought constraints; municipal capacity studies. Separate **Infrastructure Exists** from
**Available Capacity**.

## 13. Entitlement + Community

Research: current zoning; permitted uses; conditional/special-use requirements; comprehensive
plan; rezoning need; approval process/sequence/timeline; data-center-specific ordinances;
moratoriums; setbacks; noise restrictions; generator rules; screening requirements; recent
approvals/denials; planning commission activity; local political posture; community
opposition/support; incentives; industrial precedent. Classify: **Favorable / Neutral /
Challenging / Hostile / Unknown**, and explain why.

## 14. Physical + Environmental

Research: FEMA floodplain; wetlands; waterways; topography; brownfields; contamination; protected
lands; residential proximity; schools; hospitals; rail; highways; airport constraints; seismic;
wildfire; regional physical hazards. Identify possible fatal flaws clearly.

## 15. Deliverability

Synthesize power/time-to-power/ownership/entitlement/gas/fiber/water/community/environmental
risk. Always provide: **Primary Advantage**, **Primary Risk**, **Major Blocker**, **Next Critical
Diligence Step**.

## 16. Research status rules

- **Verified** — supported by direct authoritative evidence.
- **Supported** — supported by credible evidence, but not formally confirmed.
- **Partially Resolved** — part of the answer is verified, some component remains unresolved.
- **Estimated** — reasonable Groundbreakable-derived estimate.
- **Unknown After Public-Record Search** — relevant public research pathways were exhausted
  without a reliable answer.
- **Requires Direct Confirmation** — the answer genuinely requires utility/operator/owner/
  engineering contact.

Do NOT use "Research Pending" as a finished user-facing status.

## 17. Absence-of-evidence rule

Do not confuse lack of public evidence with a negative conclusion. No public MW figure does NOT
mean no capacity. No fiber record does NOT mean no fiber. No gas-capacity record does NOT mean no
capacity. No announced data center does NOT mean the site is weak. Use **Unknown** or **Requires
Direct Confirmation** where appropriate.

## 18. Source priority

County GIS/assessor/recorder → city planning/zoning → municipal ordinances → public notices →
utility sources → RTO/ISO → state utility commission → utility IRPs → economic development
agencies → Secretary of State/entity records → FEMA → EPA → USGS → Army Corps → PHMSA → pipeline
operator records → water/wastewater utilities → planning agendas/minutes → capital-improvement
plans → fiber/carrier sources → official property listings → developer/company sources →
reputable news → other credible secondary sources. Prefer primary sources whenever practical.

## 19. Search rules

For every Potential site, search multiple query variants — don't stop after one failed search.

- **Site**: `"[site name]"`, `"[site name] industrial park"`, `"[site address]"`, `"[site name]
  development"`
- **Parcels**: `"[site name] parcel"`, `"[site name] owner"`, `"[site name] GIS"`, `"[site name]
  legal description"`, `"[street] property"`, `"[plat name] parcel"`
- **Power**: `"[city] substation"`, `"[utility] substation [city]"`, `"[site] transmission"`,
  `"[utility] transmission [city]"`, `"[city] special use permit substation"`, `"[city] ordinance
  substation"`, `"[utility] large load tariff"`, `"[utility] IRP"`, `"[RTO] transmission [city]"`
- **Gas**: `"[site] gas pipeline"`, `"[pipeline operator] map"`, `"[city] natural gas
  transmission"`
- **Fiber**: `"[site] fiber"`, `"[industrial park] fiber"`, `"[city] Zayo"`, `"[city] Lumen"`,
  `"[city] dark fiber"`
- **Water**: `"[city] water capacity"`, `"[city] wastewater capacity"`, `"[city] capital
  improvement plan"`, `"[industrial park] sewer"`
- **Entitlement**: `"[city] data center ordinance"`, `"[city] zoning map"`, `"[site] planning
  commission"`, `"[site] special use permit"`
- **Ownership**: `"[owner LLC]"`, `"[owner LLC] secretary of state"`, `"[owner LLC] contact"`

Use site-restricted searches where helpful.

## 20. Boundary research rule

If exact opportunity boundaries are unclear, do not stop. Build the best-supported boundary using
official site descriptions, parcel legal descriptions, plat names, road boundaries, GIS,
industrial park maps, planning documents, assessor records. Classify the boundary: **Verified /
Supported / Estimated**. Then continue parcel research using that boundary.

## 21. Bonner Springs calibration example

Use Bonner Springs Industrial Park as an example of what a complete pass should attempt. Public
research has shown that information can be found through: City of Bonner Springs Industrial Park
materials; Johnson County parcel/property records; Bonner Springs planning documents; public
ordinances; public notices; Evergy tariffs; city utility materials. Publicly discoverable:
industrial park location; approximate total acreage; zoning; floodplain status; specific parcels;
parcel owners; legal descriptions; mailing addresses; Evergy serving Bonner Springs generally;
named Evergy substation projects; public substation addresses; planning approval records.

**Do not classify parcel ownership, service territory, or substation information as unresolved
until those pathways have been explored.** A named substation can often be confirmed publicly even
when voltage, headroom, available MW, and firm energization cannot.

## 22. Next Steps rule

Groundbreakable should not give the developer homework that Groundbreakable could do itself.

**Bad**: find the owner; look up zoning; check floodplain; determine utility territory; search
for gas pipelines; identify nearby substations. (Groundbreakable should research those.)

**Good**: request a utility large-load assessment; request actual MW availability; request an
energization timeline; contact the landowner regarding sale/option; request gas deliverability;
request a fiber last-mile quote; commission a wetlands/environmental study; begin engineering/
interconnection diligence.

## 23. What Still Needs Verification

After a complete research pass, this should be short — mostly: actual MW headroom; firm
energization date; utility upgrade requirements; interconnection cost; gas delivery capacity;
water capacity; fiber last mile; owner willingness; geotechnical conditions; environmental
testing; engineering feasibility. Never a backlog of unfinished public research.

## 24. Potential Score

Preserve the existing Groundbreakable Potential Score. Weight roughly: Power (highest) → Land +
Site Control (very high) → Entitlement (high) → BTM Energy / Connectivity / Water (meaningful) →
Physical/Environmental (penalty/fatal-flaw factor). Do not automatically punish unknown data as
bad. Separate **Potential Score** from **Data Confidence**.

## 25. Data Confidence

Reflects how well-supported the site thesis is. Increase when: parcel boundaries verified,
ownership verified, utility territory supported, substations identified, transmission confirmed,
zoning confirmed, source quality strong, multiple primary sources agree. Keep lower when:
boundaries approximate, ownership incomplete, service territory ambiguous, power inferred, sources
conflict, critical facts rely on secondary reporting.

## 26. Buyer search/filtering

Support filters: minimum MW target; maximum time-to-power; minimum contiguous acreage; maximum
gas distance; maximum substation distance; minimum transmission voltage; maximum owner count;
ownership complexity; industrial zoning; avoid floodplain; fiber requirement; water requirement;
BTM requirement; geography; Potential Score; Data Confidence. Users combine filters (e.g. "100+ MW,
power within 24 months, 75+ contiguous acres, gas within 2 miles, max 3 owners, industrial
zoning"). Return ranked sites; explain why each matched. **Never hide negative factors to improve
the match score.**

## 27. Readiness

Use: **Discovery** (credible convergence identified) → **Screened** (core public-record diligence
completed) → **Qualified** (most major public diligence supports advancement) → **Advanced
Diligence** (direct utility/owner/engineering diligence underway). Do not call a site "ready"
based only on desk research.

## 28. Final Site Assessment

Assign: **Strong Pursuit** (immediate deeper diligence justified) / **Pursue** (strong enough to
advance) / **Watch** (interesting but major uncertainty remains) / **Weak** (insufficient
fundamentals) / **Disqualified** (major fatal flaw). Then a concise **Developer Takeaway** (3–5
sentences max) answering: why the site matters; strongest verified fact; biggest unresolved risk;
gating next step.

## 29. UX/Display

Do not turn the site panel into a research report. Keep the main UI concise. Prioritize: Site /
Location / Site Thesis → Potential Score / Data Confidence → Power / Time to Power → Land / Site
Control → BTM Energy → Connectivity + Water → Entitlement → Primary Advantage / Primary Risk →
Readiness → Next Steps / What Still Needs Verification → Sources. Use progressive disclosure for
deeper technical detail.

## 30. Source storage

For important claims, store: source title, organization, URL, document date, Groundbreakable
verification date, source type, confidence, field/category supported. Do not use one broad news
article to support unrelated claims — tie sources to specific facts.

## 31. Updating existing sites

1. Read existing verified data first. 2. Preserve valid facts. 3. Search missing fields. 4.
Replace stale facts. 5. Resolve conflicting sources. 6. Upgrade confidence where warranted. 7.
Downgrade confidence where new evidence weakens a claim. 8. Update Potential Score. 9. Update Data
Confidence. 10. Rewrite primary advantage/risk. 11. Rewrite next steps. 12. Shorten the
verification list. 13. Add new sources. **Never wipe good existing research.**

## 32. Non-fabrication rules

Never invent: MW capacity; headroom; energization date; pipeline capacity; water capacity; fiber
availability; ownership; acreage; zoning; seller willingness; interconnection status; substation
voltage. If evidence does not support it, say so.

## 33. Data-center buyer mindset

Think like a powered-land buyer or site selector. Not "is there a line nearby?" but "is there
evidence this infrastructure could realistically support a large load?" Not "is there land?" but
"is there enough contiguous, controllable, developable land?" Not "is the site industrial?" but
"can a data center actually be entitled here?" Not "is gas nearby?" but "is BTM generation
realistically plausible?" Not "is fiber nearby?" but "can redundant carrier-grade connectivity
plausibly reach the site?"

## 34. Final standard

A completed Potential Data Center site should let a developer quickly understand: what the site
is; why Groundbreakable identified it; what power infrastructure exists; what is and is not known
about deliverability; how much land may actually be available; who owns the relevant parcels; how
complex site control is; whether BTM generation is plausible; what fiber/water infrastructure
exists; whether entitlement appears workable; what physical/environmental risks exist; how
credible the evidence is; what could kill the deal; what genuinely still requires direct
confirmation; what action should happen next.

**Research first. Cross-reference second. Escalate third. Declare unknown last.**
**"Requires Direct Confirmation" is the end of public research, not the shortcut around it.**

---

# Add-on Spec — Developer-Facing Presentation

This add-on supplements the master spec above. It does **not** replace the research, sourcing,
scoring, ownership, power, site-control, filtering, or diligence rules — it governs how completed
Potential-site intelligence is *presented* to developers. The underlying research stays deep and
detailed; the developer-facing experience stays concise, professional, current-state, and
decision-oriented.

## A1. Core presentation principle

The developer-facing Potential site shows: current best intelligence; why the site matters; what
is verified; what remains uncertain; what could kill the deal; what action should happen next. It
does **not** expose Groundbreakable's internal research process. The site should feel like a
professional early-stage site intelligence brief, not a research diary.

## A2. Never show internal research commentary

Never display: "this pass found," "this clears up the previous pass," "prior research showed,"
"earlier uncertainty," "this resolves what was previously unknown," "we found," "we were able to
identify," "this pass confirmed," "could not complete this pass," "query the GIS," "further
research should," "Groundbreakable previously believed," "previous searches missed," "research
workflow," "search methodology." These may live in admin/research notes, never the developer panel.

## A3. Current state only

| Bad | Good |
|---|---|
| "This pass resolved the previous Evergy-vs-BPU uncertainty." | "Serving Utility: Evergy — Supported" |
| "We found two owners through county records." | "Identified Ownership Groups: 2" |
| "The prior pass incorrectly listed Kansas Gas Service." | "Natural Gas Provider: Atmos Energy" |

Never explain corrections unless the developer specifically asks about research history.

## A4. Admin/research layer vs. developer view

**Admin/research layer** retains: prior values; conflicting evidence; research history; search
failures; source notes; methodology; unresolved queries; why confidence changed; changes between
passes. **Developer view** shows: current conclusion; supporting status; key site metrics; major
risks; next actions; concise sources. Do not mix the two.

## A5. Developer-facing hierarchy

Potential Data Center → Site Name → Location → Short Site Thesis → Final Developer Assessment →
Potential Score / Data Confidence → Power / Time to Power → Land / Site Control → BTM Energy →
Connectivity + Water → Entitlement → Primary Advantage → Primary Risk → Readiness → Developer
Takeaway → Next Actions → What Still Needs Confirmation → Sources. Don't force a section to
display if it has no useful information.

## A6. Short Site Thesis

~1–2 sentences. Explains why the site is relevant. Don't repeat the address or explain research
history. *"Established industrial site with favorable entitlement conditions, nearby utility
infrastructure, and partial site-control visibility. Large-load power deliverability remains the
primary gating item."*

## A7. Final Developer Assessment

Strong Pursuit / Pursue / Watch / Weak / Disqualified, with ~one sentence of support. *"PURSUE —
Strong enough to advance to utility and site-control diligence."* No long narrative in the card.

## A8. Developer Takeaway

3–5 sentences max, answering only: why interesting; strongest supported facts; primary unresolved
risk; what's next. Never discuss prior passes, previous mistakes, internal changes, or which
searches succeeded/failed.

## A9. Potential Score + Data Confidence

Keep prominent, no lengthy explanation beneath the numbers (detailed scoring logic may be
expandable). Potential Score = apparent quality of the opportunity. Data Confidence = strength/
completeness of evidence.

## A10–A16. Category presentation

Power, Land, Site Control, BTM Energy, Connectivity, Water + Wastewater, and Entitlement each
render as short labeled values, not prose — see the master spec's own per-category examples
(§5, §7/§9, §10, §11, §12, §13). Never equate infrastructure presence with confirmed capacity
(Water especially). Entitlement keeps political/community analysis concise unless it's a material
project risk.

## A17–A18. Primary Advantage / Primary Risk

1–2 sentences each. Primary Risk names the single biggest gating issue (a second may be added if
truly material). No research methodology here.

## A19. Readiness

Discovery / Screened / Qualified / Advanced Diligence, with a concise description each. No
internal workflow status exposed.

## A20. Next Actions

3–5 items, developer/utility/owner/operator/engineering/formal-diligence actions only — never a
Groundbreakable-internal research task.

## A21. What Still Needs Confirmation

Short items (Available MW, firm energization timeline, largest contiguous available acreage,
seller willingness, gas deliverability, fiber last-mile service, water capacity) — never an
explanation of how/why Groundbreakable failed to resolve them.

## A22. Source presentation

Available but visually secondary; detailed links/claim-level citations expand on demand. Don't
clutter the primary narrative with source explanations.

## A23. Structured data over prose

`Serving Utility: Evergy` beats *"The utility currently believed to serve this opportunity area is
Evergy based on several public records."* `Identified Owners: 2` beats *"Two parcel owners have
currently been identified."* `Available MW: Requires Utility Confirmation` beats *"No public
source was identified that provides a specific MW availability figure."*

## A24. Language style

Factual, neutral, direct, professional, development-oriented, concise. Avoid conversational
commentary, research narration, self-referential language, unnecessary caveats, repeated
explanations, internal terminology.

## A25. Developer relevance filter

Before displaying any sentence, ask: *"Does this help a developer decide whether to advance,
reject, or investigate this site?"* If no, don't show it in the default developer view — it may
stay in admin/research notes.

## A26. Length standard

Scannable in ~30–60 seconds. Labels, short values, concise paragraphs, expandable detail — never
an essay.

## A27. Progressive disclosure

Default view: decision-critical intelligence. Expanded view: technical detail, research notes,
sources. Admin view: full research history and methodology. Don't display everything at once.

## A28. Research-update rule

Internally: record what changed and why. Externally: simply update the site to the new current
state. *(Internal: "Previous utility territory ambiguity resolved through tariff and planning
records." Developer view: "Serving Utility: Evergy — Supported.")* Never expose the internal
change log unless specifically requested.

## A29. Presentation of uncertainty

Verified / Supported / Partially Resolved / Estimated / Unknown / Requires Direct Confirmation —
concise, not hidden, not turned into explanatory paragraphs. `Available MW: Requires Utility
Confirmation` beats several sentences explaining why public records lack a capacity figure.

## A30. Final presentation standard

Quickly communicate: what is this site; why does it matter; what are the strongest facts; how good
is the opportunity; how confident are we; what is the main risk; what is still unconfirmed; what
should happen next. Everything else belongs in expandable detail or internal research notes. The
research can be complex. The presentation should not be.

---

## Implementation Appendix (how this maps onto the actual codebase)

Code: `dashboard/src/lib/catalysts/potentialSiteCriteria.ts` (source of truth for types/labels/
scoring) and `dashboard/src/lib/types.ts` (mirrors the same types). Panel:
`dashboard/src/components/map/CatalystIntelligencePanel.tsx`. Buyer filtering:
`dashboard/src/lib/catalysts/buyerCriteria.ts` + `dashboard/src/components/map/FiltersPanel.tsx`/
`BuyerMatchPanel.tsx`. Schema: `supabase/migrations/` — search `prospective_data_center_site`.

**Confidence vocabulary** (`PotentialEvidenceStatus`): `verified` / `supported` /
`partially_resolved` / `reported` / `estimated` / `indicated` / `unknown` /
`unknown_after_public_record_search` / `requires_verification` (DB value for "Requires Direct
Confirmation"). `reported`/`indicated` predate this spec and are kept for backward compatibility
with older rows — treat `supported`/`partially_resolved`/`unknown_after_public_record_search` as
the ones to use going forward.

**Power-as-a-gate extension (already implemented, 2026-10-04 Bonner Springs refinement pass —
kept, not superseded by this spec's simpler Power treatment in §5/§10 above)**: `power_qualification`
(`unqualified` / `infrastructure_indicated` / `utility_path_indicated` / `capacity_indicated` /
`capacity_confirmed`) treats power as a gate a strong score can't fully compensate for.
`target_load_mw_low/high` (demand side, defaults to 50–100+ MW when null) is kept distinct from
`potential_load_mw_low/high` (supply side — what's actually been confirmed deliverable).
`development_gates` (jsonb: power/land/site_control/entitlement/btm_gas/fiber/water/environmental
→ green/yellow/red/gray) is the decision-screen grid rendered near the top of the panel.
`nearest_substation_type` (distribution/transmission/unknown) and `gas_transmission_operator`
(the upstream pipeline company, kept distinct from `gas_pipeline_operator`, the local distribution
utility) are both real, populated fields. **Use these alongside this spec's Power/BTM sections,
not instead of them.**

**Two discrepancies between this spec's text and the live schema were raised with Jared on
2026-10-05 and resolved as follows — both decisions are now live:**

1. **Readiness stages — RESOLVED: code updated to match this spec.** `ReadinessStage` is now
   exactly the 4 stages this spec specifies: `discovery` / `screened` / `qualified` /
   `advanced_diligence` (previously 5: `discovery`/`qualified`/`feasibility`/`controlled`/
   `de_risked`). "Qualified" moved from position 2 to position 3 in the real progression. No live
   row had ever used anything but the null/discovery default, so this was a clean rename+reorder
   with no data migration needed — see
   `supabase/migrations/20261005000000_readiness_stage_four_stage_collapse.sql` for the DB
   check-constraint update alongside the `ReadinessStage` type/label/description changes in
   `potentialSiteCriteria.ts`/`types.ts`.
2. **Final Developer Assessment — RESOLVED: kept `discovered`/`screen` alongside this spec's 5
   states.** `DeveloperAssessment` stays at 7 values. `discovered` (identified, no diligence yet)
   and `screen` (strong non-power fundamentals justify a utility/site-control screen, but not yet
   power-qualified) are real, already-used production values — **Bonner Springs Industrial Park
   is currently assessed `screen`** specifically because `power_qualification` never cleared
   `utility_path_indicated`. Treat them as additional granularity ahead of "Pursue," not a
   conflict with this spec's 5-state list.
