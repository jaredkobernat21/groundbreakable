"use client";

import { useState } from "react";
import { acceptInvitationWithPassword } from "./actions";

// Premium, minimal, private -- same white-card language as /login rather
// than a separate "invite" visual identity. Name/email are display-only:
// Jared already supplied them when creating the invitation, so this never
// asks for information the app already has.
//
// Google sign-in removed (Jared, 2026-09-30) -- confirmed live that the
// Google provider isn't enabled in Supabase (a dashboard-only setting,
// "Unsupported provider: provider is not enabled"), and Jared chose to
// drop the option entirely rather than leave a button that errors.
// Password creation is now the only, primary path. The OAuth callback
// route (app/auth/callback/route.ts) is left in place, unused -- harmless,
// and the quickest way back to Google support later if the provider ever
// gets enabled, without re-deriving this flow from scratch.
export default function InviteCard({
  invitationId,
  firstName,
  email,
  formError,
}: {
  invitationId: string;
  firstName: string;
  email: string;
  formError?: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#1c1c1c]/10 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold tracking-tight text-[#1c1c1c]">
          You've been invited{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="mb-6 text-sm text-[#1c1c1c]/50">{email}</p>

        {formError && <p className="mb-4 text-sm text-red-600">{formError}</p>}

        <form
          action={async (formData) => {
            setSubmitting(true);
            await acceptInvitationWithPassword(invitationId, formData);
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-sm text-[#1c1c1c]/70" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#1c1c1c]/70" htmlFor="confirm_password">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              className="w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-[#1c1c1c] py-2 text-sm font-medium text-white transition hover:bg-[#1c1c1c]/85 disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
