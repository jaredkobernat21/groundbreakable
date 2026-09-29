// Next.js App Router convention -- automatically wraps app/dashboard/page.tsx
// in a Suspense boundary and shows this while that page's data fetches
// resolve. Echoes the real layout's shape (sidebar gap, headline-height
// bar, map-height block) rather than a generic spinner, so the page
// doesn't visibly jump once the real content lands.
export default function DashboardLoading() {
  return (
    <div className="lg:pl-56">
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-40 rounded bg-[#1c1c1c]/8" />
        <div className="h-9 w-2/3 max-w-md rounded bg-[#1c1c1c]/8" />
        <div className="h-4 w-1/2 max-w-sm rounded bg-[#1c1c1c]/8" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-[#1c1c1c]/8 bg-[#1c1c1c]/4" />
          ))}
        </div>
        <div className="h-[calc(100vh-260px)] min-h-[520px] rounded-xl bg-[#1c1c1c]/6" />
      </div>
    </div>
  );
}
