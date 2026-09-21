import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeContact, SladeTask } from "./types";
import { getFollowUpsDue } from "./contacts";

export async function createTask(
  supabase: SupabaseClient,
  input: Pick<SladeTask, "title"> & Partial<Omit<SladeTask, "id" | "created_at" | "completed_at">>
): Promise<SladeTask> {
  const { data, error } = await supabase.from("slade_tasks").insert(input).select("*").returns<SladeTask[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_tasks returned no row.");
  return data[0];
}

export async function completeTask(supabase: SupabaseClient, id: string): Promise<SladeTask> {
  const { data, error } = await supabase
    .from("slade_tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeTask[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_tasks ${id} not found`);
  return data[0];
}

export async function getOpenTasks(supabase: SupabaseClient): Promise<SladeTask[]> {
  const { data, error } = await supabase
    .from("slade_tasks")
    .select("*")
    .in("status", ["open", "in_progress"])
    .order("due_at", { ascending: true, nullsFirst: false })
    .returns<SladeTask[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

// "What should I work on today?" -- combines overdue/due-today tasks with
// contact follow-ups due, per SLADE/WORKFLOWS.md. Both come back so the
// caller (SLADE's reply) can present one prioritized list without a
// second round trip.
export async function getTodayWorklist(
  supabase: SupabaseClient,
  asOf = new Date()
): Promise<{ tasks: SladeTask[]; followUps: SladeContact[] }> {
  const endOfDay = new Date(asOf);
  endOfDay.setHours(23, 59, 59, 999);

  const [allOpenTasks, followUps] = await Promise.all([getOpenTasks(supabase), getFollowUpsDue(supabase, endOfDay)]);

  const tasks = allOpenTasks.filter((t) => !t.due_at || new Date(t.due_at) <= endOfDay);
  return { tasks, followUps };
}
