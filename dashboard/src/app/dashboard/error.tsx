"use client";

import { useEffect } from "react";

// Next.js App Router convention -- catches any error thrown while
// app/dashboard/page.tsx renders (a failed Supabase query, a bad market
// param, etc.) and shows this instead of the framework's raw error
// overlay. Logs the real error for us; shows the user a calm, understated
// message with a retry, never the raw error text/stack.
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("dashboard route error:", error);
  }, [error]);

  return (
    <div className="lg:pl-56">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-[#1c1c1c]/70">Something went wrong loading this market.</p>
        <p className="mt-1 max-w-sm text-sm text-[#1c1c1c]/45">
          This is usually temporary. Try again in a moment, or switch markets from the header above.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
