"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };

// Two groups matching the actual data-model split already in the codebase:
// slade_* CRM (SLADE) vs. shifts/entitlement_cases/etc. (Market Intelligence).
// Applies to every /dashboard/admin/* route via AdminLayout -- add a route
// here when a new admin page is added, rather than leaving it unlinked.
//
// SLADE removed from this nav (Jared, 2026-09-25) -- routes/pages/data are
// untouched and still reachable by direct URL, just not linked here while
// it's shelved for a future phase.
const GROUPS: NavGroup[] = [
  {
    label: "Market Intelligence",
    items: [
      { href: "/dashboard/admin/opportunities", label: "Opportunities" },
      { href: "/dashboard/admin/intelligence", label: "Intelligence" },
      { href: "/dashboard/admin/catalysts", label: "Catalysts" },
      { href: "/dashboard/admin/decisions", label: "Decisions" },
      { href: "/dashboard/admin/potential-sites", label: "Potential Sites" },
      { href: "/dashboard/admin/growth-areas", label: "Growth Areas" },
      { href: "/dashboard/admin/opportunity-zones", label: "Opportunity Zones" },
      { href: "/dashboard/admin/review-queue", label: "Review Queue" },
    ],
  },
];

// /dashboard/admin/slade must match exactly so it doesn't stay highlighted
// on /dashboard/admin/slade/contacts -- every other item matches by prefix.
function isActive(pathname: string, href: string) {
  return href === "/dashboard/admin/slade" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {GROUPS.map((group) => (
        <div key={group.label} className="mb-5">
          <div className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-white/30">{group.label}</div>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function MobilePill({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
        active ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
      }`}
    >
      {item.label}
    </Link>
  );
}

export default function AdminNav() {
  return (
    <>
      {/* Desktop: fixed left rail, same lg:fixed/lg:w-56/lg:pl-56 offset
          pairing as the investor-facing rail in ShiftDashboardView.tsx,
          recolored for this section's dark panel rather than reskinned. */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-56 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-white/10 lg:bg-[#0b0e14] lg:px-3 lg:py-6">
        <Link href="/dashboard/admin/opportunities" className="mb-6 px-3 text-sm font-semibold tracking-tight text-white">
          Groundbreakable Admin
        </Link>
        <nav>
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile: flattened horizontal scrollable pill row -- no room for a
          two-level accordion at this width. */}
      <nav className="mb-4 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
        {GROUPS.flatMap((g) => g.items).map((item) => (
          <MobilePill key={item.href} item={item} />
        ))}
      </nav>
    </>
  );
}
