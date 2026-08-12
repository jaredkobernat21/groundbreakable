"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS: { label: string; category: string }[] = [
  { label: "Home", category: "all" },
  { label: "Activity", category: "activity" },
  { label: "Opportunities", category: "opportunities" },
  { label: "Catalysts", category: "catalysts" },
];

// Category-filtered links into the Home map view -- Home resets to "all"
// (both layers on), the other three land pre-filtered to just that signal.
export default function DashboardNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "all";

  return (
    <nav className="flex gap-6 text-sm text-[#1c1c1c]/55">
      {TABS.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab.category === "all") {
          params.delete("category");
        } else {
          params.set("category", tab.category);
        }
        const query = params.toString();
        const href = `/dashboard${query ? `?${query}` : ""}`;
        const isActive = pathname === "/dashboard" && activeCategory === tab.category;

        return (
          <Link
            key={tab.category}
            href={href}
            className={`pb-1 font-medium transition ${
              isActive
                ? "border-b-2 border-[#1c1c1c] text-[#1c1c1c]"
                : "border-b-2 border-transparent hover:text-[#1c1c1c]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
