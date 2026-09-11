"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// Client-submitted; RLS (partner_requests_insert_own) enforces
// investor_profile_id = auth.uid() regardless of what's posted, and
// status always starts at 'submitted' -- everything past that point is
// operator-only (see /dashboard/admin/partner-requests).
export async function submitPartnerRequest(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");

  const requestType = str(formData, "request_type");
  const question = str(formData, "question");
  if (!requestType || !question) throw new Error("Request type and question are required.");

  const { error } = await supabase.from("partner_requests").insert({
    investor_profile_id: user.id,
    request_type: requestType,
    subject_type: str(formData, "subject_type"),
    subject_id: str(formData, "subject_id"),
    subject_label: str(formData, "subject_label"),
    question,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/partner-desk");
}
