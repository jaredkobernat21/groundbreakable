# The Verification Gate

A mandatory pre-delivery workflow. Before an opportunity can move to `ready_to_deliver`, every
check below must pass. This is enforced two ways, deliberately redundant:

1. **A database CHECK constraint** on `slade_opportunities` — `ready_to_deliver` is physically
   impossible to set unless all nine `verification_*_ok` columns are `true`. See
   `supabase/migrations/20260921030000_slade_opportunities_schema.sql`.
2. **`dashboard/src/lib/slade/verification.ts`** — `evaluateVerificationGate(opportunity)` checks
   the same nine flags and returns which ones are missing, so SLADE can tell Jared *why* an
   opportunity isn't ready instead of just failing a write.

If any check fails, the opportunity's status is `verification_required`. No report gets
generated from an opportunity in that state (`slade_reports` generation checks opportunity status
first — see `dashboard/src/lib/slade/reports.ts`).

## The nine checks

### 1. Property identity — `verification_identity_ok`
Correct address/location. Correct parcel. Correct acreage. This sounds trivial and is the most
common way a report embarrasses Groundbreakable — confirm the site record actually matches the
physical parcel being described.

### 2. Ownership — `verification_ownership_ok`
Current owner has been checked, not assumed from a stale record. See `slade_site_facts` where
`fact_type = 'owner'` — its `verification_status` should be `verified`, not `inferred` or `stale`.

### 3. Listing — `verification_listing_ok`
Listed or off-market — confirmed, not guessed. If listed: listing agent, listing brokerage,
listing status all captured (`slade_sites.listing_*`).

### 4. Conflict check — `verification_conflict_ok`
**Mandatory, never skipped.** Determine whether the intended recipient or their company is: the
owner, the listing agent, the listing broker, a developer already involved, a consultant, or
already publicly associated with the site. Sending someone a site they already know about, or
worse, one they have an undisclosed interest in, is a credibility failure, not a minor miss.

### 5. Planning — `verification_planning_ok`
Zoning status, future land use (when relevant), key entitlement assumptions, major planning
constraints — checked against `slade_site_facts` and, where the site's market has it, the
existing `entitlement_cases`/`entitlement_approval_types` tables.

### 6. Infrastructure — `verification_infrastructure_ok`
What's verified, inferred, and unknown is explicitly stated — never claim utility availability
that isn't supported by a `verified` (or at minimum clearly-labeled `inferred`) site fact.

### 7. Client fit — `verification_client_fit_ok`
The opportunity matches the *current* active buy box, not a stale one — check
`slade_buy_boxes.active` and `last_verified_at` before confirming fit.

### 8. Prior-history check — `verification_prior_history_ok`
Confirm: this site hasn't already been sent to this client (or, depending on the deal, anyone
else); it wasn't previously rejected by this client; existing `slade_opportunity_feedback` for
this contact doesn't make the site unsuitable for reasons that still apply.

### 9. Sources — `verification_sources_ok`
Every major claim in the opportunity's thesis/upside/risks has a traceable source — a
`slade_site_facts` row with a real `source_id`/`source_url`, not an unsourced assertion.

## What "failing" looks like in practice

Failing a check is normal, not an error state — most opportunities sit in
`verification_required` for a while as facts get confirmed one at a time. The gate isn't a
formality to satisfy before delivery; it's the actual work of confirming a report is accurate
before Groundbreakable puts its name on it. Report on exactly which checks are outstanding
(`evaluateVerificationGate`'s return value), not just "not ready yet."
