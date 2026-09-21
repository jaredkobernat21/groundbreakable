# SLADE Natural-Language Workflows

How SLADE should translate what Jared says into structured database operations. This is a
reference for future Claude Code sessions acting as SLADE — the goal is to retrieve/update real
data, not to answer from memory of the conversation.

| Jared says | SLADE does |
|---|---|
| "Who have I called in Tennessee?" | `slade_interactions` where `interaction_type = 'call'`, joined to `slade_contacts`/`slade_organizations` filtered by market/state |
| "Who hasn't responded?" | `slade_contacts` where `lead_status = 'attempted'` or `'no_response'` |
| "Show me my strongest developer prospects." | `slade_contacts` where `relationship_type = 'developer'` and `relationship_status in ('warm_lead','active_prospect')`, ordered by recency of `slade_interactions` |
| "What did TJ tell me he wants?" | Resolve "TJ" via `search.ts` → `slade_buy_boxes` for that contact, plus recent `slade_interactions.summary` |
| "Update TJ's buy box." | Resolve contact → update the relevant `slade_buy_boxes` row, log the change via `changeLog.ts` |
| "Find opportunities for TJ." | Resolve contact's active buy box(es) → run/continue a LODE pass (see `docs/LODE.md`) against `slade_sites` |
| "Have we ever researched this property?" | `findSiteByParcelOrAddress` against `slade_sites`, then `slade_site_facts` for that site |
| "Has this site already been sent to anyone?" | `slade_opportunities` for that `site_id` where `opportunity_status = 'delivered'` |
| "Research this site." | Create/update `slade_sites` + `slade_site_facts`, citing sources as they're found |
| "Verify this property." | Walk `SLADE/docs/VERIFICATION.md`'s nine checks against the relevant `slade_opportunities` row |
| "Why did we reject this site?" | `slade_opportunities` where `opportunity_status = 'rejected'` for that site → `verification_notes` / linked `slade_opportunity_feedback` |
| "Generate the opportunity report." | Only if opportunity status is `qualified` or later — build `slade_reports.sections` from the opportunity's data (see `templates/opportunity_report_template.md`) |
| "Who needs a follow-up?" | `slade_contacts` where `next_follow_up_at <= now()`, plus `slade_tasks` where `status = 'open'` and `due_at <= now()` |
| "What should I work on today?" | `slade_tasks` due today/overdue + `slade_contacts` follow-ups due today, combined and prioritized |
| "Update Lawrence market intelligence." | This is the existing `shifts`/`entitlement_cases` data, not a `slade_*` table — route to the existing collection scripts/admin forms in `dashboard/`, or add a `shifts` row directly if it's a one-off finding |

## The pattern behind all of these

1. Resolve any named entity ("TJ", "the Charlotte property") to a real row via
   `dashboard/src/lib/slade/search.ts` before doing anything else. If it's ambiguous, ask which
   one rather than guessing.
2. Read before writing — check what's already known so Jared isn't asked to repeat it.
3. If the answer requires a status/fact that doesn't exist yet, say so plainly rather than
   inferring it from the conversation.
4. If Jared states something durable in the course of the conversation ("TJ wants 50+ acres now,
   not 30"), write it to the database in the same turn.
