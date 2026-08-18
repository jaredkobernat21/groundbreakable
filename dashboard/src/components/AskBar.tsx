"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

const SUGGESTIONS = [
  "What changed this week?",
  "Where is early development happening?",
  "Show opportunities near early development.",
  "What areas should I be watching?",
];

const ROTATE_MS = 3200;

// Mirrors AskSegment in src/app/api/ask/route.ts -- the server already
// resolves each mention to a real project/opportunity id (via the [[key|
// text]] markup it asks the model to write inline), so rendering here is
// just "walk the list, render text or a link" -- no client-side text
// matching involved.
export type AskSegment = { text: string; type?: "project" | "opportunity"; id?: string };

// "Ask about {Market}" -- a real Claude-backed Q&A over this market's live
// data (see src/app/api/ask/route.ts), not a canned FAQ. The rotating
// suggestions are both a placeholder loop (idle state) and clickable
// one-tap questions.
//
// `demo`, when provided, renders a pre-baked question/answer instead and
// makes the bar display-only (input read-only, suggestions and submit
// disabled) -- used by the marketing screenshot page
// (src/app/marketing-preview/page.tsx) and the no-login tester preview
// (src/app/preview/topeka/page.tsx), neither of which can make a real,
// session-authenticated call to /api/ask.
export default function AskBar({
  marketName,
  marketSlug,
  demo,
}: {
  marketName: string;
  marketSlug: string;
  demo?: { question: string; segments: AskSegment[] };
}) {
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [question, setQuestion] = useState(demo?.question ?? "");
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<AskSegment[]>(demo?.segments ?? []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) return; // static demo state -- never rotate suggestions under it
    if (question) return; // stop cycling once the user starts typing
    const interval = setInterval(() => {
      setSuggestionIndex((i) => (i + 1) % SUGGESTIONS.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [question, demo]);

  async function ask(q: string) {
    if (demo) return; // demo mode is display-only -- never calls the live endpoint
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setSegments([]);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketSlug, question: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setSegments(data.segments ?? []);
      }
    } catch {
      setError("Couldn't reach AI search — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    ask(question.trim() || SUGGESTIONS[suggestionIndex]);
  }

  function handleSuggestionClick(suggestion: string) {
    setQuestion(suggestion);
    ask(suggestion);
  }

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-[#1c1c1c]/35"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          readOnly={!!demo}
          placeholder={`Ask about ${marketName}… "${SUGGESTIONS[suggestionIndex]}"`}
          className="flex-1 bg-transparent text-sm text-[#1c1c1c] outline-none placeholder:text-[#1c1c1c]/35 read-only:cursor-default"
        />
        <button
          type="submit"
          disabled={loading || !!demo}
          className="shrink-0 rounded-full bg-[#1c1c1c] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#1c1c1c]/85 disabled:opacity-40"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={!!demo}
            onClick={() => handleSuggestionClick(suggestion)}
            className="rounded-full border border-[#1c1c1c]/10 px-3 py-1 text-xs text-[#1c1c1c]/50 transition hover:border-[#1c1c1c]/25 hover:text-[#1c1c1c] disabled:pointer-events-none disabled:opacity-40"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[#1c1c1c]/40">
          <svg viewBox="0 0 24 24" width="16" height="16" className="animate-spin">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
            <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Thinking it through…
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {segments.length > 0 && !loading && (
        <div className="mt-4 rounded-lg border border-[#1c1c1c]/10 bg-[#faf9f6] p-4">
          <p className="text-[15px] leading-relaxed text-[#1c1c1c]">
            {segments.map((segment, i) =>
              segment.type && segment.id ? (
                <Link
                  key={i}
                  href={`/dashboard/map?market=${marketSlug}&category=${segment.type === "project" ? "plans" : "opportunities"}&select=${segment.id}&selectType=${segment.type}`}
                  className="font-semibold text-[#1c1c1c] underline decoration-2 decoration-[#1c1c1c]/40 underline-offset-2 hover:decoration-[#1c1c1c]"
                >
                  {segment.text}
                </Link>
              ) : (
                <span key={i}>{segment.text}</span>
              )
            )}
          </p>
        </div>
      )}
    </div>
  );
}
