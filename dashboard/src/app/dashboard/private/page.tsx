import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPrivateClients } from "@/lib/queries/privateClients";
import { PRIVATE_CLIENT_STATUS_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PrivateClientListPage() {
  const supabase = createClient();
  const clients = await getPrivateClients(supabase);
  const { data: markets } = await supabase.from("markets").select("*");
  const trackedCount = markets?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable Private</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#1c1c1c]/60">
          Where are cities quietly creating the conditions for future development before the opportunity becomes
          obvious? Select a client to see their personalized brief, built from every signal Groundbreakable tracks
          across {trackedCount} market{trackedCount === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients
          .filter((c) => c.status !== "inactive")
          .map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/private/${c.id}`}
              className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm transition hover:border-[#1c1c1c]/30"
            >
              <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">{PRIVATE_CLIENT_STATUS_LABEL[c.status]}</div>
              <div className="mt-1 text-lg font-medium text-[#1c1c1c]">{c.full_name}</div>
              <div className="text-sm text-[#1c1c1c]/50">{[c.title, c.company].filter(Boolean).join(" · ") || "—"}</div>
              {c.location && <div className="mt-2 text-xs text-[#1c1c1c]/40">{c.location}</div>}
            </Link>
          ))}
      </div>

      {clients.length === 0 && (
        <p className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6 text-sm text-[#1c1c1c]/50">
          No private clients yet.{" "}
          <Link href="/dashboard/admin/private-clients" className="underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]">
            Add one in the prospecting CRM
          </Link>
          .
        </p>
      )}
    </div>
  );
}
