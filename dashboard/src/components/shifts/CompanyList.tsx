"use client";

import type { CompanyProfile } from "@/lib/companyProfiles";
import { PROJECT_TYPE_LABEL } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

// Replaces the old flat PeopleList grouping with a clickable roster --
// each row opens the matching CompanyDetailPanel's computed rollups
// rather than just listing every evidence record inline.
export default function CompanyList({
  profiles,
  selectedKey,
  onSelect,
}: {
  profiles: CompanyProfile[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  if (profiles.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">None identified yet for this market.</p>;
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/10">
      {profiles.map((profile) => {
        const projectCount = profile.projects.length;
        const recordCount = profile.records.length;
        return (
          <li key={profile.key}>
            <button
              type="button"
              onClick={() => onSelect(profile.key)}
              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${
                profile.key === selectedKey ? "bg-[#1c1c1c]/[0.05]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#1c1c1c]">{profile.displayName}</h3>
                  {profile.companyName && <p className="text-xs text-[#1c1c1c]/45">{profile.companyName}</p>}
                </div>
                {profile.estimatedVolume != null && (
                  <span className="shrink-0 text-xs font-medium text-[#1c1c1c]/60">{formatCurrency(profile.estimatedVolume)}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] text-[#1c1c1c]/50">
                <span>
                  {recordCount} known record{recordCount === 1 ? "" : "s"}
                </span>
                {projectCount > 0 && (
                  <>
                    <span>&middot;</span>
                    <span>
                      {projectCount} project{projectCount === 1 ? "" : "s"}
                    </span>
                  </>
                )}
                {profile.primaryType && (
                  <>
                    <span>&middot;</span>
                    <span>{PROJECT_TYPE_LABEL[profile.primaryType]}</span>
                  </>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
