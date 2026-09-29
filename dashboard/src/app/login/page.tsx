"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Whether we're still checking the URL for an invite/recovery link's
  // session tokens before showing the plain sign-in form -- see the effect
  // below. Starts true so the form never flashes before a redirect fires.
  const [checkingLink, setCheckingLink] = useState(true);

  useEffect(() => {
    // Supabase's hosted invite/recovery verify link redirects with session
    // tokens in a URL fragment (#access_token=...&refresh_token=...) --
    // the "implicit flow." Fragments are never sent to a server, so
    // /auth/confirm's server-side route handler can't see them there, and
    // per standard browser behavior, a same-origin redirect that doesn't
    // specify its own fragment carries the old one forward -- landing
    // here regardless of what the email template's link actually points
    // to. Pick the tokens up directly rather than depending on getting
    // that link format exactly right.
    const hash = window.location.hash;
    if (!hash.includes("access_token")) {
      setCheckingLink(false);
      return;
    }

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) {
      setCheckingLink(false);
      return;
    }

    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (!error) {
          router.replace("/set-password");
          return;
        }
        setCheckingLink(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checkingLink) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <p className="text-sm text-[#1c1c1c]/40">Signing you in…</p>
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

        <h1 className="mb-1 text-xl font-semibold tracking-tight text-[#1c1c1c]">Sign in</h1>
        <p className="mb-6 text-sm text-[#1c1c1c]/50">Sign in to your dashboard.</p>

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

        <label className="mb-1 block text-sm text-[#1c1c1c]/70" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#1c1c1c] py-2 text-sm font-medium text-white transition hover:bg-[#1c1c1c]/85 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-6 text-xs text-[#1c1c1c]/40">
          Accounts are created by Groundbreakable — reach out if you need access.
        </p>
      </form>
    </main>
  );
}
