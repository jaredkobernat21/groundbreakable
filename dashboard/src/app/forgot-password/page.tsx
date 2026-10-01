"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Self-service companion to the admin-triggered reset link in
// /dashboard/admin/users (2026-10-01). That admin tool exists specifically
// because this page's delivery depends on Supabase Auth's own email sending
// for this project actually being configured/deliverable, which nothing in
// this repo can confirm -- if a user's email never arrives, Jared still has
// a guaranteed way to hand them a working link directly. Both paths land on
// the same already-working /auth/confirm -> /login (fragment fallback) ->
// /set-password pages.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });

    setLoading(false);
    // Always show the same confirmation regardless of whether the email
    // matches an account -- a different message for "no account" would let
    // someone enumerate who has access.
    if (error) {
      setError("Something went wrong. Please try again in a moment.");
      return;
    }
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
          <h1 className="mb-2 text-xl font-semibold tracking-tight text-[#1c1c1c]">Check your email</h1>
          <p className="text-sm text-[#1c1c1c]/50">
            If an account exists for {email}, we&apos;ve sent a link to reset your password. It&apos;s
            single-use and expires in about an hour.
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
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

        <label className="mb-1 block text-sm text-[#1c1c1c]/70" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

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
