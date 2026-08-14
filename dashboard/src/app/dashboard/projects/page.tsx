import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { selectMarket } from "@/lib/selectMarket";
import { resolveActivityPhase } from "@/lib/activityPhase";
import { formatCurrency, formatDate, formatRelativeVerified } from "@/lib/format";
import { projectIconSvgMarkup, resolveProjectPhaseIcon } from "@/lib/markerIcons";
import {
  ACTIVITY_PHASE_COLOR,
  ACTIVITY_PHASE_LABEL,
  PROJECT_CATEGORY_LABEL,
  type Market,
  type ProjectWithSource,
} from "@/lib/types";

export const dynamic = "force-dynamic";

// A dedicated, scannable list of every planning + active project (deal
// context: developer, investor, contractor, timeline, stage) -- the map is
// great for "where," this page is for "what's the state of every deal at
// once." Completed projects don't belong here; they're historical, not
// something an investor is actively tracking deal terms for.
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { market?: string };
}) {
  const supabase = createClient();

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const market = selectMarket(markets ?? [], searchParams.market);

  if (!market) {
    return (
      <p className="text-sm text-[#1c1c1c]/50">
        You don't have access to a market yet — an admin needs to grant you access in Supabase.
      </p>
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*, source:sources(*)")
    .eq("market_id", market.id)
    .order("date_updated", { ascending: false })
    .returns<ProjectWithSource[]>();

  const activeProjects = (projects ?? []).filter((p) => {
    const phase = resolveActivityPhase(p.status, p.date_updated);
    return phase === "planning" || phase === "active";
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1c1c1c]">Projects</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/50">
          Every planning and active development in {market.name}, {market.state} — timeline, stage, and who's
          behind it.
        </p>
      </div>

      {activeProjects.length === 0 ? (
        <p className="text-sm text-[#1c1c1c]/50">No planning or active projects for {market.name} right now.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#1c1c1c]/10 text-[11px] uppercase tracking-wide text-[#1c1c1c]/40">
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Timeline</th>
                <th className="px-4 py-3 font-medium">Developer</th>
                <th className="px-4 py-3 font-medium">Investor</th>
                <th className="px-4 py-3 font-medium">Contractor / Builder</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Verified</th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.map((project) => {
                const phase = resolveActivityPhase(project.status, project.date_updated)!;
                const color = ACTIVITY_PHASE_COLOR[phase];
                return (
                  <tr key={project.id} className="border-b border-[#1c1c1c]/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1c1c1c]">{project.title}</div>
                      <div className="text-xs text-[#1c1c1c]/40">{PROJECT_CATEGORY_LABEL[project.category]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium uppercase tracking-wide"
                        style={{ borderColor: `${color}55`, color, backgroundColor: `${color}1a` }}
                      >
                        <span
                          className="flex h-3 w-3 items-center justify-center"
                          dangerouslySetInnerHTML={{
                            __html: projectIconSvgMarkup(resolveProjectPhaseIcon(phase), {
                              size: 11,
                              stroke: color,
                              strokeWidth: 2,
                            }),
                          }}
                        />
                        {ACTIVITY_PHASE_LABEL[phase]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1c1c1c]/60">
                      {project.date_announced ? formatDate(project.date_announced) : "—"} →{" "}
                      {formatDate(project.date_updated)}
                    </td>
                    <td className="px-4 py-3 text-[#1c1c1c]/70">{project.developer ?? "—"}</td>
                    <td className="px-4 py-3 text-[#1c1c1c]/70">{project.investor ?? "—"}</td>
                    <td className="px-4 py-3">
                      {project.contractor ? (
                        <span className="text-[#1c1c1c]/70">{project.contractor}</span>
                      ) : (
                        <span className="text-[#1c1c1c]/35">Not yet assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#1c1c1c]/70">{formatCurrency(project.project_value) ?? "—"}</td>
                    <td className="px-4 py-3 text-[#1c1c1c]/40">{formatRelativeVerified(project.last_verified_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Link
        href={`/dashboard?market=${market.slug}&category=activity`}
        className="inline-block text-sm text-[#1c1c1c]/50 underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]"
      >
        View on the map →
      </Link>
    </div>
  );
}
