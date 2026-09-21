import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SladeChat from "@/components/slade/SladeChat";
import { getTodayWorklist } from "@/lib/slade/tasks";

const LINKS = [
  { href: "/dashboard/admin/slade/contacts", label: "Contacts" },
  { href: "/dashboard/admin/slade/organizations", label: "Organizations" },
  { href: "/dashboard/admin/slade/buy-boxes", label: "Buy Boxes" },
];

export const dynamic = "force-dynamic";

// Reachable via the header "SLADE" link (admin-only, dashboard/layout.tsx)
// and the AdminNav rail (admin/layout.tsx). RLS (is_admin()) is the real
// gate on every slade_* table; this check just avoids a confusing
// blank/broken page for a non-admin who lands here directly.
export default async function SladeAdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single() : { data: null };

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { tasks, followUps } = await getTodayWorklist(supabase);

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-white">SLADE</h1>
      <p className="mb-4 text-sm text-white/50">
        Internal only. Talk to it about contacts, buy boxes, sites, and opportunities — it reads and writes the real
        slade_* tables, not a demo. Prefer typing and forms for some of this? Same data, either way:
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {(tasks.length > 0 || followUps.length > 0) && (
        <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <h2 className="mb-2 text-sm font-semibold text-white">Today</h2>
          {tasks.length > 0 && (
            <ul className="mb-3 space-y-1">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 text-sm text-white/70">
                  <span>{task.title}</span>
                  <span className="shrink-0 text-xs text-white/30">
                    {task.priority}
                    {task.due_at ? ` · due ${new Date(task.due_at).toLocaleDateString()}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {followUps.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-white/30">Follow-ups due</div>
              <ul className="space-y-1">
                {followUps.map((contact) => (
                  <li key={contact.id} className="text-sm text-white/70">
                    {contact.first_name} {contact.last_name ?? ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <SladeChat />
    </div>
  );
}
