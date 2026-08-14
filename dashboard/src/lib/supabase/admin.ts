import { createClient } from "@supabase/supabase-js";

// Service-role client -- bypasses RLS entirely, so it only belongs in
// server-only code with its own explicit, hardcoded scope (see
// src/app/preview/topeka/page.tsx). Never import this from client
// components or from any route that forwards caller-supplied filters.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
