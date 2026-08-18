import { createClient } from "@supabase/supabase-js";

// Service-role client -- bypasses RLS entirely, so it only belongs in
// server-only code with its own explicit, hardcoded scope (see
// src/app/preview/topeka/page.tsx). Never import this from client
// components or from any route that forwards caller-supplied filters.
//
// The regular server client (src/lib/supabase/server.ts) reads cookies()
// on every call, which alone forces Next.js into fully dynamic,
// uncached rendering. This client touches no request-specific API, so
// `export const dynamic = "force-dynamic"` on the route isn't reliably
// enough to stop Next.js's fetch Data Cache from caching supabase-js's
// underlying requests -- found live when growth_areas/potential_sites
// went from empty to real data and the preview route kept serving the
// old empty result while every other authenticated page updated
// immediately. Passing cache: "no-store" here bypasses that cache
// explicitly, the documented fix for third-party fetch clients in
// Next.js Server Components.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
