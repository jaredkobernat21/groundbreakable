# Opportunity Report — structure

The reusable section structure a Groundbreakable Opportunity Report is generated from. This is
the *content* structure, not the visual template — see `SLADE/DATA_MODEL.md` §Reports for how
this maps to `slade_reports.sections` (jsonb, one entry per section below, each with its own
`source_ids`). The visual/PDF template is a separate, later concern (see `docs/LODE.md` — no PDF
engine in Phase 1).

Every section should distinguish verified fact from inference exactly the way
`SLADE_BIBLE.md` §Accuracy requires — a report is where that standard matters most, because it's
the one thing that leaves Groundbreakable's hands.

1. **Executive Thesis** — one paragraph: why this site, why this client, why now.
2. **Property Snapshot** — address, acreage, parcel, current use, ownership, listing status.
   Pull directly from `slade_sites` + `slade_site_facts`, not restated from memory.
3. **Why It Matters** — the specific signal(s) that made this worth surfacing.
4. **Development Potential** — plausible uses, scale, fit against the client's buy box.
5. **Planning & Zoning** — current zoning, future land use, key entitlement assumptions.
6. **Infrastructure** — sewer/water/road/utility status, each labeled verified/inferred/unknown.
7. **Entitlement Path** — what approval process this would realistically require.
8. **Market Context** — relevant `shifts`/`entitlement_cases`/market data for the surrounding area.
9. **Risks** — stated plainly, not softened.
10. **Unknowns** — what hasn't been confirmed yet, explicitly.
11. **Next Steps** — what Groundbreakable recommends the client do.
12. **Sources** — every citation used above, in one place.

A report cannot be generated for an opportunity that hasn't passed the verification gate
(`SLADE/docs/VERIFICATION.md`) — sections 5, 6, and 9-10 in particular depend on it directly.
