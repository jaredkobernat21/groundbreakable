import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SladeChat from "@/components/slade/SladeChat";

export const dynamic = "force-dynamic";

// Direct-URL only, unlinked from nav -- same convention as every other
// /dashboard/admin/* page (see src/app/dashboard/admin/layout.tsx). RLS
// (is_admin()) is the real gate on every slade_* table; this check just
// avoids a confusing blank/broken page for a non-admin.
export default async function SladeAdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single() : { data: null };

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-white">SLADE</h1>
      <p className="mb-6 text-sm text-white/50">
        Internal only. Talk to it about contacts, buy boxes, sites, and opportunities — it reads and writes the real
        slade_* tables, not a demo.
      </p>
      <SladeChat />
    </div>
  );
}
