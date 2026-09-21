import type Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as changeLog from "./changeLog";
import * as organizations from "./organizations";
import * as contacts from "./contacts";
import * as interactions from "./interactions";
import * as buyBoxes from "./buyBoxes";
import * as sites from "./sites";
import * as siteFacts from "./siteFacts";
import * as opportunities from "./opportunities";
import * as verification from "./verification";
import * as opportunityFeedback from "./opportunityFeedback";
import * as projects from "./projects";
import * as reports from "./reports";
import * as tasks from "./tasks";
import * as search from "./search";

// The tool surface a SLADE chat session can call -- one tool per
// SLADE/WORKFLOWS.md action, thin wrappers over dashboard/src/lib/slade/*.ts
// (the same functions any future non-chat caller would use; no logic lives
// here beyond input shaping and picking which service function to call).
// See src/app/api/slade/route.ts for the loop that calls these.

const RELATIONSHIP_TYPES = ["developer", "investor", "broker", "planner", "city_contact", "contractor", "friend_network", "other"];
const RELATIONSHIP_STATUSES = [
  "unknown",
  "prospect",
  "warm_lead",
  "active_prospect",
  "customer",
  "partner",
  "friend_network",
  "inactive",
  "do_not_contact",
];
const LEAD_STATUSES = ["never_contacted", "attempted", "no_response", "responded", "interested", "not_interested", "follow_up", "active_conversation"];
const ORGANIZATION_TYPES = ["developer", "investor", "brokerage", "contractor", "planning_firm", "partner", "municipality", "other"];
const INTERACTION_TYPES = ["call", "text", "email", "linkedin", "meeting", "report_sent", "property_sent", "follow_up", "other"];
const TASK_PRIORITIES = ["low", "medium", "high", "urgent"];
const TASK_STATUSES = ["open", "in_progress", "done", "cancelled"];
const LISTING_STATUSES = ["on_market", "off_market", "unknown"];
const SITE_STATUSES = ["identified", "researching", "verified", "archived"];
const FACT_TYPES = [
  "zoning",
  "future_land_use",
  "acreage",
  "owner",
  "sewer",
  "water",
  "floodplain",
  "wetlands",
  "permitted_uses",
  "overlays",
  "utilities",
  "road_access",
  "entitlement_history",
  "other",
];
const VERIFICATION_STATUSES = ["verified", "inferred", "needs_verification", "conflicting", "stale"];
const OPPORTUNITY_STATUSES = [
  "discovered",
  "screening",
  "researching",
  "verification_required",
  "qualified",
  "ready_to_deliver",
  "delivered",
  "rejected",
  "paused",
  "archived",
];
const FEEDBACK_TYPES = ["interested", "not_interested", "need_more_info", "rejected_price", "rejected_location", "rejected_other", "positive_signal", "other"];
const PROJECT_STATUSES = ["active", "paused", "completed", "archived"];
const REPORT_SECTION_KEYS = [
  "executive_thesis",
  "property_snapshot",
  "why_it_matters",
  "development_potential",
  "planning_zoning",
  "infrastructure",
  "entitlement_path",
  "market_context",
  "risks",
  "unknowns",
  "next_steps",
  "sources",
];

export const SLADE_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_markets",
    description: "List Groundbreakable's operating markets (id, slug, name, state). Use to resolve a market name to a market_id.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "resolve_entity",
    description:
      "Resolve a free-text mention (a name like 'TJ' or 'Dan', or a property description like 'the Charlotte property') to candidate contacts, organizations, and sites. Always call this before acting on a named entity you haven't already confirmed the id of in this conversation.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },

  // Contacts / organizations
  {
    name: "get_contact",
    description: "Get full detail for one contact by id, including their organization.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "query_contacts",
    description: "List/filter contacts by relationship status, lead (outreach) status, relationship type, organization, or name search.",
    input_schema: {
      type: "object",
      properties: {
        relationship_statuses: { type: "array", items: { type: "string", enum: RELATIONSHIP_STATUSES } },
        lead_statuses: { type: "array", items: { type: "string", enum: LEAD_STATUSES } },
        relationship_types: { type: "array", items: { type: "string", enum: RELATIONSHIP_TYPES } },
        organization_id: { type: "string" },
        search: { type: "string" },
      },
    },
  },
  {
    name: "find_or_create_contact",
    description:
      "Find a contact by email/phone/name, or create one if none exists. Always prefer this over assuming a contact is new -- it checks for duplicates first.",
    input_schema: {
      type: "object",
      properties: {
        first_name: { type: "string" },
        last_name: { type: "string" },
        organization_id: { type: "string" },
        title: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        linkedin_url: { type: "string" },
        relationship_type: { type: "string", enum: RELATIONSHIP_TYPES },
        relationship_status: { type: "string", enum: RELATIONSHIP_STATUSES },
        lead_status: { type: "string", enum: LEAD_STATUSES },
        notes: { type: "string" },
        next_follow_up_at: { type: "string", description: "ISO 8601 datetime" },
      },
      required: ["first_name"],
    },
  },
  {
    name: "update_contact",
    description: "Update fields on an existing contact (status changes are logged to the audit trail automatically).",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        organization_id: { type: "string" },
        title: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        linkedin_url: { type: "string" },
        relationship_type: { type: "string", enum: RELATIONSHIP_TYPES },
        relationship_status: { type: "string", enum: RELATIONSHIP_STATUSES },
        lead_status: { type: "string", enum: LEAD_STATUSES },
        notes: { type: "string" },
        last_contacted_at: { type: "string" },
        next_follow_up_at: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_follow_ups_due",
    description: "List contacts whose next_follow_up_at is now or in the past.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "find_or_create_organization",
    description: "Find an organization by name, or create one if none exists.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        type: { type: "string", enum: ORGANIZATION_TYPES },
        website: { type: "string" },
        primary_market_id: { type: "string" },
        company_id: {
          type: "string",
          description:
            "Optional link to the existing `companies` table, only if this organization is clearly the same entity as one already observed in market intelligence (entitlement cases, etc). Leave unset otherwise.",
        },
        relationship_status: { type: "string", enum: RELATIONSHIP_STATUSES },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_organization",
    description: "Update fields on an existing organization.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        type: { type: "string", enum: ORGANIZATION_TYPES },
        website: { type: "string" },
        primary_market_id: { type: "string" },
        company_id: { type: "string" },
        relationship_status: { type: "string", enum: RELATIONSHIP_STATUSES },
        notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_organizations",
    description: "List/search organizations by name.",
    input_schema: { type: "object", properties: { search: { type: "string" } } },
  },

  // Interactions
  {
    name: "log_interaction",
    description: "Log a call, text, email, LinkedIn message, meeting, report/property sent, or follow-up with a contact.",
    input_schema: {
      type: "object",
      properties: {
        contact_id: { type: "string" },
        organization_id: { type: "string" },
        interaction_type: { type: "string", enum: INTERACTION_TYPES },
        direction: { type: "string", enum: ["outbound", "inbound"] },
        occurred_at: { type: "string", description: "ISO 8601 datetime; defaults to now" },
        outcome: { type: "string" },
        summary: { type: "string" },
        next_action: { type: "string" },
      },
      required: ["contact_id", "interaction_type"],
    },
  },
  {
    name: "get_contact_history",
    description: "Get every logged interaction with a contact, most recent first.",
    input_schema: { type: "object", properties: { contact_id: { type: "string" } }, required: ["contact_id"] },
  },

  // Buy boxes
  {
    name: "get_active_buy_boxes_for_contact",
    description: "Get a contact's active buy boxes.",
    input_schema: { type: "object", properties: { contact_id: { type: "string" } }, required: ["contact_id"] },
  },
  {
    name: "create_buy_box",
    description: "Create a structured buy box (acquisition criteria) for a contact.",
    input_schema: {
      type: "object",
      properties: {
        contact_id: { type: "string" },
        organization_id: { type: "string" },
        name: { type: "string", description: "Defaults to 'Primary' if omitted; use a distinct name if the contact has multiple buy boxes." },
        active: { type: "boolean" },
        target_markets: { type: "array", items: { type: "string" }, description: "Free-text market names, for markets not yet in list_markets." },
        target_market_ids: { type: "array", items: { type: "string" } },
        asset_types: { type: "array", items: { type: "string" } },
        min_acres: { type: "number" },
        max_acres: { type: "number" },
        min_price: { type: "number" },
        max_price: { type: "number" },
        preferred_deal_types: { type: "array", items: { type: "string" } },
        preferred_distress_signals: { type: "array", items: { type: "string" } },
        zoning_preferences: { type: "array", items: { type: "string" } },
        entitlement_preferences: { type: "string" },
        excluded_uses: { type: "array", items: { type: "string" } },
        requires_sewer: { type: "boolean" },
        requires_water: { type: "boolean" },
        requires_highway_access: { type: "boolean" },
        requires_rail_access: { type: "boolean" },
        notes: { type: "string" },
        source: { type: "string", description: "How this was captured: call, email, form, inferred, etc." },
        last_verified_at: { type: "string" },
      },
      required: ["contact_id"],
    },
  },
  {
    name: "update_buy_box",
    description: "Update an existing buy box. Every update is logged to the audit trail automatically.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        active: { type: "boolean" },
        target_markets: { type: "array", items: { type: "string" } },
        target_market_ids: { type: "array", items: { type: "string" } },
        asset_types: { type: "array", items: { type: "string" } },
        min_acres: { type: "number" },
        max_acres: { type: "number" },
        min_price: { type: "number" },
        max_price: { type: "number" },
        preferred_deal_types: { type: "array", items: { type: "string" } },
        preferred_distress_signals: { type: "array", items: { type: "string" } },
        zoning_preferences: { type: "array", items: { type: "string" } },
        entitlement_preferences: { type: "string" },
        excluded_uses: { type: "array", items: { type: "string" } },
        requires_sewer: { type: "boolean" },
        requires_water: { type: "boolean" },
        requires_highway_access: { type: "boolean" },
        requires_rail_access: { type: "boolean" },
        notes: { type: "string" },
        last_verified_at: { type: "string" },
      },
      required: ["id"],
    },
  },

  // Tasks
  {
    name: "get_today_worklist",
    description: "Get open/overdue tasks due today or earlier, plus contact follow-ups due today or earlier -- answers 'what should I work on today?'.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_open_tasks",
    description: "List all open/in-progress tasks.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "create_task",
    description: "Create a follow-up/task, optionally linked to a contact, opportunity, or project.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        contact_id: { type: "string" },
        opportunity_id: { type: "string" },
        project_id: { type: "string" },
        task_type: { type: "string" },
        description: { type: "string" },
        due_at: { type: "string" },
        priority: { type: "string", enum: TASK_PRIORITIES },
        status: { type: "string", enum: TASK_STATUSES },
      },
      required: ["title"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task done.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },

  // Sites
  {
    name: "get_site",
    description: "Get a site by id.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "find_or_create_site",
    description: "Find a site by parcel id or address, or create one if none exists. Always try this before creating a new site record.",
    input_schema: {
      type: "object",
      properties: {
        address: { type: "string" },
        city: { type: "string" },
        county: { type: "string" },
        state: { type: "string" },
        parcel_id: { type: "string" },
        market_id: { type: "string" },
        latitude: { type: "number" },
        longitude: { type: "number" },
        acreage: { type: "number" },
        owner_name: { type: "string" },
        current_use: { type: "string" },
        listing_status: { type: "string", enum: LISTING_STATUSES },
        listing_price: { type: "number" },
        listing_agent: { type: "string" },
        listing_broker: { type: "string" },
        status: { type: "string", enum: SITE_STATUSES },
        notes: { type: "string" },
      },
    },
  },
  {
    name: "update_site",
    description: "Update fields on an existing site.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        address: { type: "string" },
        city: { type: "string" },
        county: { type: "string" },
        state: { type: "string" },
        parcel_id: { type: "string" },
        market_id: { type: "string" },
        latitude: { type: "number" },
        longitude: { type: "number" },
        acreage: { type: "number" },
        owner_name: { type: "string" },
        current_use: { type: "string" },
        listing_status: { type: "string", enum: LISTING_STATUSES },
        listing_price: { type: "number" },
        listing_agent: { type: "string" },
        listing_broker: { type: "string" },
        status: { type: "string", enum: SITE_STATUSES },
        notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_sites_by_market",
    description: "List every site on file for a market.",
    input_schema: { type: "object", properties: { market_id: { type: "string" } }, required: ["market_id"] },
  },
  {
    name: "get_site_facts",
    description: "Get every fact recorded about a site (zoning, owner, utilities, etc.), each with its own verification status. Later checked_at rows for the same fact_type supersede earlier ones.",
    input_schema: { type: "object", properties: { site_id: { type: "string" } }, required: ["site_id"] },
  },
  {
    name: "add_site_fact",
    description:
      "Record a fact about a site with its verification status and source. Never record a fact as 'verified' without a real source_url or source_id -- use 'inferred' or 'needs_verification' otherwise.",
    input_schema: {
      type: "object",
      properties: {
        site_id: { type: "string" },
        fact_type: { type: "string", enum: FACT_TYPES },
        value: { type: "string" },
        verification_status: { type: "string", enum: VERIFICATION_STATUSES },
        source_url: { type: "string" },
        source_type: { type: "string" },
        source_date: { type: "string" },
        notes: { type: "string" },
      },
      required: ["site_id", "fact_type"],
    },
  },

  // Opportunities
  {
    name: "get_opportunity",
    description: "Get one opportunity by id, including its verification-gate flags.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "get_opportunities_for_site",
    description: "List every opportunity ever created for a site.",
    input_schema: { type: "object", properties: { site_id: { type: "string" } }, required: ["site_id"] },
  },
  {
    name: "get_opportunities_by_status",
    description: "List opportunities filtered by status.",
    input_schema: { type: "object", properties: { statuses: { type: "array", items: { type: "string", enum: OPPORTUNITY_STATUSES } } }, required: ["statuses"] },
  },
  {
    name: "has_site_been_delivered_or_rejected",
    description: "Check whether a site was already delivered to, or rejected by, a contact (or anyone). Always call before creating a new opportunity for a site.",
    input_schema: { type: "object", properties: { site_id: { type: "string" }, contact_id: { type: "string" } }, required: ["site_id"] },
  },
  {
    name: "create_opportunity",
    description: "Create an opportunity connecting a site to a contact/organization/buy box. Always created with status 'discovered' -- advancing it further is a separate, deliberate step.",
    input_schema: {
      type: "object",
      properties: {
        site_id: { type: "string" },
        contact_id: { type: "string" },
        organization_id: { type: "string" },
        buy_box_id: { type: "string" },
        market_id: { type: "string" },
        thesis: { type: "string" },
        possible_uses: { type: "array", items: { type: "string" } },
        major_upside: { type: "string" },
        major_risks: { type: "string" },
        unknowns: { type: "string" },
        next_steps: { type: "string" },
      },
      required: ["site_id"],
    },
  },
  {
    name: "update_opportunity",
    description: "Update an opportunity's thesis, risks, or verification-check flags. To change opportunity_status, use set_opportunity_status instead.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        contact_id: { type: "string" },
        organization_id: { type: "string" },
        buy_box_id: { type: "string" },
        market_id: { type: "string" },
        match_score: { type: "integer" },
        thesis: { type: "string" },
        possible_uses: { type: "array", items: { type: "string" } },
        major_upside: { type: "string" },
        major_risks: { type: "string" },
        unknowns: { type: "string" },
        next_steps: { type: "string" },
        verification_identity_ok: { type: "boolean" },
        verification_ownership_ok: { type: "boolean" },
        verification_listing_ok: { type: "boolean" },
        verification_conflict_ok: { type: "boolean" },
        verification_planning_ok: { type: "boolean" },
        verification_infrastructure_ok: { type: "boolean" },
        verification_client_fit_ok: { type: "boolean" },
        verification_prior_history_ok: { type: "boolean" },
        verification_sources_ok: { type: "boolean" },
        verification_notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "evaluate_verification_gate",
    description: "Check which of the 9 pre-delivery verification checks are still outstanding for an opportunity.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "set_opportunity_status",
    description:
      "Change an opportunity's status. Setting 'ready_to_deliver' will be rejected (both here and by the database) unless all 9 verification checks are true -- check evaluate_verification_gate first if unsure.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string" }, status: { type: "string", enum: OPPORTUNITY_STATUSES } },
      required: ["id", "status"],
    },
  },
  {
    name: "add_opportunity_feedback",
    description: "Record what happened after an opportunity was discussed with or sent to someone.",
    input_schema: {
      type: "object",
      properties: {
        opportunity_id: { type: "string" },
        contact_id: { type: "string" },
        feedback_type: { type: "string", enum: FEEDBACK_TYPES },
        feedback: { type: "string" },
        resulting_action: { type: "string" },
        occurred_at: { type: "string" },
      },
      required: ["opportunity_id"],
    },
  },
  {
    name: "get_opportunity_feedback",
    description: "Get all feedback recorded for an opportunity.",
    input_schema: { type: "object", properties: { opportunity_id: { type: "string" } }, required: ["opportunity_id"] },
  },

  // Projects
  {
    name: "list_projects",
    description: "List projects, optionally filtered by status.",
    input_schema: { type: "object", properties: { statuses: { type: "array", items: { type: "string", enum: PROJECT_STATUSES } } } },
  },
  {
    name: "create_project",
    description: "Create a project (a client search, market initiative, or engagement) that tasks and opportunities can hang off of.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        contact_id: { type: "string" },
        organization_id: { type: "string" },
        market_id: { type: "string" },
        objective: { type: "string" },
        status: { type: "string", enum: PROJECT_STATUSES },
        summary: { type: "string" },
        next_action: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_project",
    description: "Update a project's status, summary, or next action.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        objective: { type: "string" },
        status: { type: "string", enum: PROJECT_STATUSES },
        summary: { type: "string" },
        next_action: { type: "string" },
      },
      required: ["id"],
    },
  },

  // Reports
  {
    name: "create_report",
    description: "Start a report for an opportunity. Only possible once the opportunity is 'qualified' or later.",
    input_schema: {
      type: "object",
      properties: { opportunity_id: { type: "string" }, report_type: { type: "string", enum: ["opportunity_report", "market_brief", "buy_box_summary", "other"] } },
      required: ["opportunity_id"],
    },
  },
  {
    name: "update_report_section",
    description: "Write or replace the content of one section of a report.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        section: { type: "string", enum: REPORT_SECTION_KEYS },
        content: { type: "string" },
        source_ids: { type: "array", items: { type: "string" } },
      },
      required: ["id", "section", "content"],
    },
  },
  {
    name: "get_report",
    description: "Get a report by id.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
];

export interface ToolContext {
  changedBy?: string | null;
}

// Dispatches a tool_use call to the matching lib/slade/*.ts function. Every
// handler returns a plain JSON-serializable value -- the caller (the /api/slade
// route) stringifies it into the tool_result block. Throws on unknown tool
// name or a missing required field; the route catches and reports that back
// to the model as a tool error rather than failing the whole request.
export async function executeSladeTool(supabase: SupabaseClient, name: string, input: Record<string, unknown>, ctx: ToolContext = {}): Promise<unknown> {
  const changedBy = ctx.changedBy ?? undefined;

  switch (name) {
    case "list_markets": {
      const { data, error } = await supabase.from("markets").select("id, slug, name, state").order("name");
      if (error) throw new Error(error.message);
      return data;
    }
    case "resolve_entity":
      return search.resolveEntity(supabase, str(input.query));

    case "get_contact":
      return contacts.getContact(supabase, str(input.id));
    case "query_contacts":
      return contacts.queryContacts(supabase, {
        relationshipStatuses: input.relationship_statuses as never,
        leadStatuses: input.lead_statuses as never,
        relationshipTypes: input.relationship_types as never,
        organizationId: input.organization_id as string | undefined,
        search: input.search as string | undefined,
      });
    case "find_or_create_contact":
      return contacts.findOrCreateContact(supabase, input as never);
    case "update_contact": {
      const { id, ...patch } = input;
      return contacts.updateContact(supabase, str(id), patch as never, changedBy);
    }
    case "get_follow_ups_due":
      return contacts.getFollowUpsDue(supabase);

    case "find_or_create_organization":
      return organizations.findOrCreateOrganization(supabase, input as never);
    case "update_organization": {
      const { id, ...patch } = input;
      return organizations.updateOrganization(supabase, str(id), patch as never, changedBy);
    }
    case "list_organizations":
      return organizations.listOrganizations(supabase, { search: input.search as string | undefined });

    case "log_interaction":
      return interactions.logInteraction(supabase, input as never);
    case "get_contact_history":
      return interactions.getContactHistory(supabase, str(input.contact_id));

    case "get_active_buy_boxes_for_contact":
      return buyBoxes.getActiveBuyBoxesForContact(supabase, str(input.contact_id));
    case "create_buy_box":
      return buyBoxes.createBuyBox(supabase, input as never);
    case "update_buy_box": {
      const { id, ...patch } = input;
      return buyBoxes.updateBuyBox(supabase, str(id), patch as never, changedBy);
    }

    case "get_today_worklist":
      return tasks.getTodayWorklist(supabase);
    case "get_open_tasks":
      return tasks.getOpenTasks(supabase);
    case "create_task":
      return tasks.createTask(supabase, input as never);
    case "complete_task":
      return tasks.completeTask(supabase, str(input.id));

    case "get_site":
      return sites.getSite(supabase, str(input.id));
    case "find_or_create_site":
      return sites.findOrCreateSite(supabase, input as never);
    case "update_site": {
      const { id, ...patch } = input;
      return sites.updateSite(supabase, str(id), patch as never);
    }
    case "list_sites_by_market":
      return sites.listSitesByMarket(supabase, str(input.market_id));
    case "get_site_facts":
      return siteFacts.getSiteFacts(supabase, str(input.site_id));
    case "add_site_fact":
      return siteFacts.addSiteFact(supabase, input as never);

    case "get_opportunity":
      return opportunities.getOpportunity(supabase, str(input.id));
    case "get_opportunities_for_site":
      return opportunities.getOpportunitiesForSite(supabase, str(input.site_id));
    case "get_opportunities_by_status":
      return opportunities.getOpportunitiesByStatus(supabase, input.statuses as never);
    case "has_site_been_delivered_or_rejected":
      return opportunities.hasSiteBeenDeliveredOrRejected(supabase, str(input.site_id), input.contact_id as string | undefined);
    case "create_opportunity":
      return opportunities.createOpportunity(supabase, input as never);
    case "update_opportunity": {
      const { id, ...patch } = input;
      return opportunities.updateOpportunity(supabase, str(id), patch as never);
    }
    case "evaluate_verification_gate": {
      const opportunity = await opportunities.getOpportunity(supabase, str(input.id));
      if (!opportunity) throw new Error(`Opportunity ${str(input.id)} not found`);
      return verification.evaluateVerificationGate(opportunity);
    }
    case "set_opportunity_status":
      return verification.setOpportunityStatus(supabase, str(input.id), input.status as never);
    case "add_opportunity_feedback":
      return opportunityFeedback.addOpportunityFeedback(supabase, input as never);
    case "get_opportunity_feedback":
      return opportunityFeedback.getOpportunityFeedback(supabase, str(input.opportunity_id));

    case "list_projects":
      return projects.listProjects(supabase, input.statuses as never);
    case "create_project":
      return projects.createProject(supabase, input as never);
    case "update_project": {
      const { id, ...patch } = input;
      return projects.updateProject(supabase, str(id), patch as never);
    }

    case "create_report": {
      const opportunity = await opportunities.getOpportunity(supabase, str(input.opportunity_id));
      if (!opportunity) throw new Error(`Opportunity ${str(input.opportunity_id)} not found`);
      return reports.createReport(supabase, opportunity, { report_type: input.report_type as never });
    }
    case "update_report_section":
      return reports.updateReportSection(supabase, str(input.id), input.section as never, str(input.content), (input.source_ids as string[]) ?? []);
    case "get_report":
      return reports.getReport(supabase, str(input.id));

    default:
      throw new Error(`Unknown SLADE tool: ${name}`);
  }
}

function str(value: unknown): string {
  if (typeof value !== "string" || !value) throw new Error("Expected a non-empty string argument.");
  return value;
}

// Exported for tests/reuse -- also used by the route to log every tool call
// made in a turn into slade_change_log-adjacent visibility for the client
// ("what SLADE did"), per SLADE_BIBLE.md's "always show the work".
export function describeToolCall(name: string, input: Record<string, unknown>): string {
  const id = (input.id as string) ?? (input.contact_id as string) ?? (input.site_id as string) ?? (input.opportunity_id as string);
  return id ? `${name}(${id.slice(0, 8)})` : name;
}
