"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Lands here from /auth/confirm after a Supabase invite/reset link
// establishes a session. Same minimal card treatment as /login rather than
// a new visual language -- this is still "auth," just one screen further.
export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error, data } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Clears the admin-set-temporary-password flag, if this account has
    // one -- a no-op update for accounts that came through some other
    // path. RLS already allows a user to update their own profile row.
    if (data.user) {
      await supabase.from("investor_profiles").update({ must_change_password: false }).eq("id", data.user.id);
    }

    router.push("/welcome");
    router.refresh();
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

        <h1 className="mb-1 text-xl font-semibold tracking-tight text-[#1c1c1c]">Set your password</h1>
        <p className="mb-6 text-sm text-[#1c1c1c]/50">Choose a password for your account.</p>

        <label className="mb-1 block text-sm text-[#1c1c1c]/70" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
        />

        <label className="mb-1 block text-sm text-[#1c1c1c]/70" htmlFor="confirm_password">
          Confirm Password
        </label>
        <input
          id="confirm_password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-6 w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#1c1c1c] py-2 text-sm font-medium text-white transition hover:bg-[#1c1c1c]/85 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Set Password"}
        </button>
      </form>
    </main>
  );
}
