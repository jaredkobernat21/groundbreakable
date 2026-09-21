import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeChangeLogEntry } from "./types";

// Simple, app-layer audit log -- see SLADE/DATA_MODEL.md. Call this
// wherever a meaningful field changes (buy-box edits, relationship-status
// changes, opportunity-status changes, verified site facts) rather than
// relying on a DB trigger for V1.
export async function logChange(
  supabase: SupabaseClient,
  entry: {
    tableName: string;
    recordId: string;
    fieldName?: string;
    oldValue?: string | null;
    newValue?: string | null;
    changedBy?: string | null;
    note?: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from("slade_change_log").insert({
    table_name: entry.tableName,
    record_id: entry.recordId,
    field_name: entry.fieldName ?? null,
    old_value: entry.oldValue ?? null,
    new_value: entry.newValue ?? null,
    changed_by: entry.changedBy ?? null,
    note: entry.note ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function getChangeHistory(
  supabase: SupabaseClient,
  tableName: string,
  recordId: string
): Promise<SladeChangeLogEntry[]> {
  const { data, error } = await supabase
    .from("slade_change_log")
    .select("*")
    .eq("table_name", tableName)
    .eq("record_id", recordId)
    .order("changed_at", { ascending: false })
    .returns<SladeChangeLogEntry[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}
