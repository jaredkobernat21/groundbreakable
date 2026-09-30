"use client";

import { useEffect } from "react";

// Scoped to /dashboard/admin/** so a failed admin page doesn't fall back to
// the parent app/dashboard/error.tsx boundary -- that one is generic/
// full-screen and (until this file existed) replaced AdminNav entirely,
// stranding an admin with no way back to the map. admin/layout.tsx keeps
// rendering around this (error.tsx only swaps the page segment), so the
// nav -- including its "Back to map" link -- stays visible even here.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("admin route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-start rounded-lg border border-white/10 bg-white/5 p-6">
      <p className="text-sm font-medium text-white/70">Something went wrong loading this page.</p>
      <p className="mt-1 text-sm text-white/40">This is usually temporary -- try again in a moment.</p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-white/25">Error ID: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
      >
        Try again
      </button>
    </div>
  );
}
