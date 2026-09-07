"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; text: string };

const SAMPLE_QUESTIONS = [
  "What's the strongest match for this client right now?",
  "Which market on my watchlist is moving fastest?",
  "What risks should I flag before recommending anything?",
];

// Section 10's Personalized AI Analyst -- deliberately no map/segment-
// linking like AskBar (that's tuned to one market's projects/opportunities
// with short [[key|text]] markup); this analyst spans several markets at
// once per client, so answers are plain prose grounded in the same brief
// data the page above already renders (see /api/private/ask).
export default function PrivateAnalystChat({ clientId }: { clientId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/private/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm">
      <div className="mb-3 text-xs uppercase tracking-wide text-[#1c1c1c]/40">Ask the Groundbreakable Analyst</div>

      {messages.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              className="rounded-full border border-[#1c1c1c]/15 px-3 py-1.5 text-xs text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-sm font-medium text-[#1c1c1c]" : "text-sm text-[#1c1c1c]/80"}>
            {m.role === "user" ? "You: " : "Analyst: "}
            {m.text}
          </div>
        ))}
        {loading && <div className="text-sm text-[#1c1c1c]/40">Thinking…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this client's markets, corridors, or matches…"
          className="flex-1 rounded-full border border-[#1c1c1c]/15 px-4 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]/85 disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
