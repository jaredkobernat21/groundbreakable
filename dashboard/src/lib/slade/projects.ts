import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectStatus, SladeProject } from "./types";

export async function getProject(supabase: SupabaseClient, id: string): Promise<SladeProject | null> {
  const { data, error } = await supabase.from("slade_projects").select("*").eq("id", id).limit(1).returns<SladeProject[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function listProjects(supabase: SupabaseClient, statuses?: ProjectStatus[]): Promise<SladeProject[]> {
  let query = supabase.from("slade_projects").select("*").order("updated_at", { ascending: false });
  if (statuses?.length) query = query.in("status", statuses);
  const { data, error } = await query.returns<SladeProject[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProject(
  supabase: SupabaseClient,
  input: Pick<SladeProject, "name"> & Partial<Omit<SladeProject, "id" | "created_at" | "updated_at">>
): Promise<SladeProject> {
  const { data, error } = await supabase.from("slade_projects").insert(input).select("*").returns<SladeProject[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_projects returned no row.");
  return data[0];
}

export async function updateProject(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<SladeProject, "id" | "created_at" | "updated_at">>
): Promise<SladeProject> {
  const { data, error } = await supabase
    .from("slade_projects")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeProject[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_projects ${id} not found`);
  return data[0];
}
