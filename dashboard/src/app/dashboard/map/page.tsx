import { redirect } from "next/navigation";

// The dedicated Map view merged into the Overview page once Overview
// became the full shift dashboard (map + feed + filters together) --
// this route now just preserves old links/bookmarks (including the
// market search param).
export default function MapPage({ searchParams }: { searchParams: { market?: string } }) {
  redirect(searchParams.market ? `/dashboard?market=${encodeURIComponent(searchParams.market)}` : "/dashboard");
}
