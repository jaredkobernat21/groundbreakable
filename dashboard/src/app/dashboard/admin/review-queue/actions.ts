"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

async function resolveQueueEntry(supabase: ReturnType<typeof createClient>, reviewQueueId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("intake_review_queue")
    .update({ resolved: true, resolved_by: user?.id ?? null, resolved_at: new Date().toISOString() })
    .eq("id", reviewQueueId);
  if (error) throw new Error(error.message);
}

// The only path that writes to project_events -- and only onto a project
// that already exists, so it needs no new coordinates or category
// decision. This is the "confirm the match, log the event" case: most
// discovered items should end up here.
export async function approveAsEvent(formData: FormData) {
  const supabase = createClient();

  const reviewQueueId = str(formData, "review_queue_id");
  const intakeRecordId = str(formData, "intake_record_id");
  const projectId = str(formData, "project_id");
  if (!reviewQueueId || !intakeRecordId || !projectId) {
    throw new Error("Missing review queue, intake record, or project id.");
  }

  const { data: intakeRecord, error: intakeError } = await supabase
    .from("intake_records")
    .select("*")
    .eq("id", intakeRecordId)
    .single();
  if (intakeError || !intakeRecord) throw new Error(intakeError?.message ?? "Intake record not found.");

  const extraction = (intakeRecord.raw_payload as { extraction?: { summary?: string } } | null)?.extraction;

  // occurred_on should be when the real-world event happened (the agenda
  // item's own meeting date), not whenever an admin happens to click
  // Approve -- the collection script already parses this onto the
  // source's published_date (see collectTopekaPlanningCommission.ts's
  // meetingDate), so read it back from there rather than defaulting to
  // today. Without this, a case discovered weeks after its actual
  // hearing (as review-queue items often are) shows up on the Timeline
  // dated today, which can sort it after -- and so read as reversing --
  // a status the project already reached before that date.
  let occurredOn = new Date().toISOString().slice(0, 10);
  if (intakeRecord.source_id) {
    const { data: source } = await supabase
      .from("sources")
      .select("published_date")
      .eq("id", intakeRecord.source_id)
      .single();
    if (source?.published_date) occurredOn = source.published_date;
  }

  const { error: eventError } = await supabase.from("project_events").insert({
    project_id: projectId,
    event_type: intakeRecord.extracted_event_type ?? "planning_commission_scheduled",
    note: extraction?.summary ?? intakeRecord.extracted_title,
    occurred_on: occurredOn,
    source_id: intakeRecord.source_id,
    confidence: "reported",
    source_quality: "primary_government",
    verification_status: "human_reviewed",
  });
  if (eventError) throw new Error(eventError.message);

  const { error: updateError } = await supabase.from("intake_records").update({ status: "matched" }).eq("id", intakeRecordId);
  if (updateError) throw new Error(updateError.message);

  await resolveQueueEntry(supabase, reviewQueueId);

  revalidatePath("/dashboard/admin/review-queue");
  revalidatePath("/dashboard/timeline");
}

// The "this is genuinely new" path. Requires the reviewer to supply
// latitude/longitude by hand -- the source (a Planning Commission
// agenda listing) never states coordinates, and projects.latitude/
// longitude are not-null columns the rest of the app (the map, in
// particular) assumes are always real. Better to make a human place the
// pin deliberately than to fabricate one or loosen that guarantee for
// every project in the table.
export async function approveAsNewProject(formData: FormData) {
  const supabase = createClient();

  const reviewQueueId = str(formData, "review_queue_id");
  const intakeRecordId = str(formData, "intake_record_id");
  const latitude = num(formData, "latitude");
  const longitude = num(formData, "longitude");
  if (!reviewQueueId || !intakeRecordId || latitude === null || longitude === null) {
    throw new Error("Missing review queue/intake record id, or latitude/longitude.");
  }

  const { data: intakeRecord, error: intakeError } = await supabase
    .from("intake_records")
    .select("*")
    .eq("id", intakeRecordId)
    .single();
  if (intakeError || !intakeRecord) throw new Error(intakeError?.message ?? "Intake record not found.");

  const payload = (intakeRecord.raw_payload as { case_number?: string; extraction?: { zoning_to?: string; summary?: string } }) ?? {};
  const caseNumber: string | undefined = payload.case_number;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      market_id: intakeRecord.market_id,
      title: intakeRecord.extracted_title,
      plan_category: intakeRecord.extracted_plan_category,
      project_type: intakeRecord.extracted_project_type,
      stage: "proposed",
      description: payload.extraction?.summary ?? null,
      address: intakeRecord.extracted_address,
      latitude,
      longitude,
      case_number: caseNumber ?? null,
      source_id: intakeRecord.source_id,
      confidence: "reported",
    })
    .select("id")
    .single();
  if (projectError || !project) throw new Error(projectError?.message ?? "Failed to create project.");

  const { error: eventError } = await supabase.from("project_events").insert({
    project_id: project.id,
    event_type: intakeRecord.extracted_event_type ?? "planning_commission_scheduled",
    note: "Discovered via Planning Commission agenda collection.",
    occurred_on: new Date().toISOString().slice(0, 10),
    source_id: intakeRecord.source_id,
    confidence: "reported",
    source_quality: "primary_government",
    verification_status: "human_reviewed",
  });
  if (eventError) throw new Error(eventError.message);

  const { error: updateError } = await supabase
    .from("intake_records")
    .update({ status: "created_new", candidate_project_id: project.id })
    .eq("id", intakeRecordId);
  if (updateError) throw new Error(updateError.message);

  await resolveQueueEntry(supabase, reviewQueueId);

  revalidatePath("/dashboard/admin/review-queue");
  revalidatePath("/dashboard/projects");
}

export async function rejectIntakeRecord(formData: FormData) {
  const supabase = createClient();

  const reviewQueueId = str(formData, "review_queue_id");
  const intakeRecordId = str(formData, "intake_record_id");
  if (!reviewQueueId || !intakeRecordId) throw new Error("Missing review queue or intake record id.");

  const { error: updateError } = await supabase.from("intake_records").update({ status: "rejected" }).eq("id", intakeRecordId);
  if (updateError) throw new Error(updateError.message);

  await resolveQueueEntry(supabase, reviewQueueId);

  revalidatePath("/dashboard/admin/review-queue");
}
