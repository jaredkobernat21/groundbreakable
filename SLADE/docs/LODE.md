# LODE — Groundbreakable Opportunity Discovery Engine

LODE lives inside Groundbreakable (see `SLADE_BIBLE.md`). It is not a separate business, product,
or repo. Its purpose: find overlooked, underutilized, off-market, mispriced, or otherwise
valuable sites with development potential that match a specific developer or investor's buy box.

## The pipeline

```
1. Receive a buy box (slade_buy_boxes, active = true)
2. Determine relevant markets (buy_box.target_market_ids, or research a new market)
3. Discover candidate properties (site research → slade_sites)
4. Exclude previously rejected sites (opportunity_status = 'rejected' for this contact)
5. Exclude sites already delivered to this contact (opportunity_status = 'delivered')
6. Research ownership (slade_sites.owner_name, slade_site_facts fact_type='owner')
7. Identify motivation/distress signals when available
8. Evaluate development potential
9. Review zoning/planning (slade_site_facts fact_type in zoning/future_land_use, or shifts/
   entitlement_cases for the site's market)
10. Review infrastructure (slade_site_facts fact_type in sewer/water/road_access/utilities)
11. Identify entitlement upside
12. Identify risks
13. Compare the site to the buy box
14. Create a slade_opportunities record (opportunity_status = 'discovered')
15. Send qualified candidates to SLADE for deeper review
```

**LODE does not deliver to clients.** Step 14 creates a `discovered` opportunity, not a
`ready_to_deliver` one. Every candidate LODE surfaces still goes through the verification gate
(`SLADE/docs/VERIFICATION.md`) before it can reach `ready_to_deliver`. Discovery is finding a
plausible match; delivery is staking Groundbreakable's credibility on a specific claim to a
specific client. Those require different confidence levels and different levels of human
judgment, and the data model keeps them as separate states so neither gets rushed into the other.

## What Phase 1 builds vs. what it doesn't

Phase 1 builds the data model LODE writes to (`slade_sites`, `slade_site_facts`,
`slade_opportunities`) and the service functions to query/write it
(`dashboard/src/lib/slade/sites.ts`, `siteFacts.ts`, `opportunities.ts`). It does **not** build:

- An automated site-discovery pipeline (web scraping, GIS ingestion automation) — the existing
  `research/` folder shows this is currently a real, careful, source-by-source human/Claude
  research process (see `research/small-builder-lead-sourcing-method.md`), and automating any
  part of it is a deliberate Phase 2+ decision, not a default.
- A match-scoring algorithm — `slade_opportunities.match_score` exists as a column for when one
  is warranted, left null until there's a real basis for it (same reasoning the codebase already
  applies elsewhere — see `lib/leads/scoring.ts`'s comment about not awarding points a data source
  doesn't yet support).
- A "run LODE" button or automation trigger of any kind.

## How a LODE run should actually work today

Until there's real automation, "running LODE" means: SLADE, working from a buy box and Jared's
direction, does the research (reusing the existing methodology in `research/`), and writes what
it finds directly into `slade_sites` / `slade_site_facts` / `slade_opportunities` as it goes,
instead of producing another one-off markdown report that the structured data never sees. The
markdown research folder isn't replaced — it's still where a full narrative research writeup
belongs (see `research/dan-lynch-site-search/report.md` for the standard) — but the facts that
belong in the CRM/opportunity model belong in Supabase too, so the next conversation doesn't have
to re-read the markdown to know what's already been found.
