"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { acceptInvitationWithPassword } from "./actions";

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "google_failed") return "Google sign-in didn't go through. Try again, or use email/password below.";
  if (code === "invalid") return "This invitation is no longer valid.";
  if (code.startsWith("email_mismatch:")) {
    const invitedEmail = code.slice("email_mismatch:".length);
    return `This invitation was sent to ${invitedEmail}. Please continue with a Google account using that address.`;
  }
  if (code === "apply_failed") return "Something went wrong setting up your account. Please try again.";
  return "Something went wrong. Please try again.";
}

// Premium, minimal, private -- same white-card language as /login rather
// than a separate "invite" visual identity. Name/email are display-only:
// Jared already supplied them when creating the invitation, so this never
// asks for information the app already has.
export default function InviteCard({
  invitationId,
  firstName,
  email,
  error,
  formError,
}: {
  invitationId: string;
  firstName: string;
  email: string;
  error?: string;
  formError?: string;
}) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function continueWithGoogle() {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?invitation=${invitationId}`;
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  }

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

        {(errorMessage(error) || formError) && (
          <p className="mb-4 text-sm text-red-600">{errorMessage(error) ?? formError}</p>
        )}

        <button
          type="button"
          onClick={continueWithGoogle}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded border border-[#1c1c1c]/15 bg-white py-2 text-sm font-medium text-[#1c1c1c] transition hover:bg-[#1c1c1c]/5"
        >
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13.5 24 13.5c2.8 0 5.3 1 7.3 2.7l6-6C33.6 6.5 29 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z" />
            <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13-5.1l-6-4.9c-1.9 1.4-4.3 2.2-7 2.2-5.3 0-9.7-3.5-11.3-8.3l-6.5 5C9.6 39 16.3 43.5 24 43.5z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6 4.9c3.5-3.2 5.7-8 5.7-14.3 0-1.2-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>

        {!showEmailForm ? (
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full text-center text-xs text-[#1c1c1c]/40 hover:text-[#1c1c1c]/70"
          >
            Or create a password instead
          </button>
        ) : (
          <form
            action={async (formData) => {
              setSubmitting(true);
              await acceptInvitationWithPassword(invitationId, formData);
            }}
            className="mt-2 space-y-3 border-t border-[#1c1c1c]/10 pt-4"
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
        )}
      </div>
    </main>
  );
}
