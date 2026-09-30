// Next.js App Router convention -- automatically wraps app/dashboard/page.tsx
// in a Suspense boundary and shows this while that page's data fetch
// (markets + national catalysts + follows) resolves. Must match
// NationalMapExperience's full-screen dark shell -- this used to echo the
// old tabbed light-themed dashboard's shape (sidebar gap, headline bar,
// metric cards), which is exactly the "old layout flashes before the map"
// glitch this replaces.
export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
    </div>
  );
}
