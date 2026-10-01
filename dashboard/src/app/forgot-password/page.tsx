"use client";

import { useState } from "react";
import { requestPasswordReset } from "./actions";

// Self-service companion to the admin-triggered "Reset Password" button in
// /dashboard/admin/users (2026-10-01, revised 2026-10-01). Submits to the
// requestPasswordReset Server Action rather than calling Supabase's own
// resetPasswordForEmail -- see actions.ts for why (email deliverability for
// this project is unverified, so this notifies Jared with a ready-to-send
// link instead of emailing the requester directly).
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(new FormData(e.currentTarget));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[#1c1c1c]/10 bg-white p-8 text-center shadow-sm">
          <div className="mb-6 flex items-center justify-center gap-2">
            <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
          </div>
          <h1 className="mb-2 text-xl font-semibold tracking-tight text-[#1c1c1c]">Thanks — we're on it</h1>
          <p className="text-sm text-[#1c1c1c]/50">
            If an account exists for {email}, someone from the Groundbreakable team will send you a link
            to reset your password shortly.
          </p>
          <a href="/login" className="mt-6 inline-block text-sm text-[#1c1c1c]/70 underline hover:text-[#1c1c1c]">
            Back to sign in
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[#1c1c1c]/10 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-2">
          <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold tracking-tight text-[#1c1c1c]">Reset your password</h1>
        <p className="mb-6 text-sm text-[#1c1c1c]/50">
          Enter your email and the Groundbreakable team will send you a link to set a new password.
        </p>

        <label className="mb-1 block text-sm text-[#1c1c1c]/70" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#1c1c1c] py-2 text-sm font-medium text-white transition hover:bg-[#1c1c1c]/85 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <a href="/login" className="mt-6 block text-center text-xs text-[#1c1c1c]/40 underline hover:text-[#1c1c1c]/70">
          Back to sign in
        </a>
      </form>
    </main>
  );
}
