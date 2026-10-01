"use client";

import { useState } from "react";

// Shown once right after Invite Developer (or Reset Password) succeeds. A
// plain select-all text field would work too, but a real Copy button is the
// whole point -- the link is meant to be pasted into a text/Slack message
// immediately. Reused for both flows (2026-10-01) since they're the same
// "here's a one-time link, go send it" UX; only the heading/caption differ.
export default function CopyLinkBanner({
  email,
  link,
  heading,
  caption,
}: {
  email: string;
  link: string;
  heading?: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) -- the link
      // is still selectable text below, so this fails soft.
    }
  }

  return (
    <div className="rounded-lg border border-[#eab308]/40 bg-[#eab308]/10 p-5">
      <p className="text-sm font-semibold text-[#eab308]">{heading ?? `Invitation created for ${email}`}</p>
      <p className="mt-1 text-xs text-white/50">
        {caption ?? "Copy this link and send it however you'd like. It's single-use and expires in 7 days."}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <p className="flex-1 select-all truncate rounded border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white">
          {link}
        </p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded bg-[#eab308] px-3 py-2 text-xs font-semibold text-black transition hover:bg-[#eab308]/85"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
