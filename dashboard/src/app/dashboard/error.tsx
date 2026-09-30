"use client";

import { useEffect } from "react";

// Next.js App Router convention -- catches any error thrown while
// app/dashboard/page.tsx renders and shows this instead of the framework's
// raw error overlay. Logs the real error for us; shows the user a calm,
// understated message with a retry, never the raw error text/stack.
//
// Restyled for the national map redesign (2026-09-30) -- the old copy
// ("switch markets from the header above") referenced the pre-redesign
// per-market tabbed dashboard, and the old light theme made a genuine
// transient error look like the app had "reverted" to a completely
// different, old product instead of just hit a hiccup. Full-screen dark
// shell matching NationalMapExperience.tsx so an error here still reads as
// this same product, not a fallback to something else.
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("dashboard route error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black px-4 text-center">
      <p className="text-sm font-medium text-white/70">Something went wrong loading the map.</p>
      <p className="mt-1 max-w-sm text-sm text-white/40">This is usually temporary -- try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
      >
        Try again
      </button>
    </div>
  );
}
