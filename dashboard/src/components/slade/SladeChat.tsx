"use client";

import { useState, type FormEvent } from "react";

type ChatTurn = { role: "user" | "assistant"; text: string; actions?: string[] };

const STARTERS = ["Who needs a follow-up?", "What should I work on today?", "List my markets."];

// Talks to /api/slade -- see that route for the tool-use loop. Prior turns
// are sent back as plain text only (role/text), matching what the server
// persists and returns; SLADE re-resolves data fresh each turn rather than
// trusting anything cached client-side, so there's no separate "refresh"
// concept to build here.
export default function SladeChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(message: string) {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setInput("");

    const history = turns.map(({ role, text }) => ({ role, text }));
    setTurns((prev) => [...prev, { role: "user", text: message }]);

    try {
      const res = await fetch("/api/slade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setTurns((prev) => prev.slice(0, -1)); // drop the optimistic user turn on failure
        return;
      }
      setTurns([...(data.messages as ChatTurn[]).slice(0, -1), { ...data.messages.at(-1), actions: data.actions }]);
    } catch {
      setError("Couldn't reach SLADE — try again in a moment.");
      setTurns((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    send(input);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[300px] flex-col gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
        {turns.length === 0 && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center text-sm text-white/40">
            <p>Tell SLADE about a contact, buy box, site, or ask what needs attention.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <div key={i} className={turn.role === "user" ? "self-end" : "self-start"}>
            <div
              className={`max-w-xl rounded-lg px-4 py-2 text-sm leading-relaxed ${
                turn.role === "user" ? "bg-white/10 text-white" : "border border-white/10 bg-black/40 text-white/90"
              }`}
            >
              {turn.text}
            </div>
            {turn.actions && turn.actions.length > 0 && (
              <p className="mt-1 px-1 text-[11px] text-white/30">{turn.actions.join(" · ")}</p>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 self-start text-sm text-white/40">
            <svg viewBox="0 0 24 24" width="14" height="14" className="animate-spin">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
              <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Working…
          </div>
        )}

        {error && (
          <div className="self-start rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tell SLADE something, or ask it something…"
          className="flex-1 rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 rounded bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/85 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
