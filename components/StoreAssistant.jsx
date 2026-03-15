"use client";

import { useState } from "react";

export default function StoreAssistant({ productSlug }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAssistant() {
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId: `session-${Date.now()}`,
          productSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReply(data?.error || "Something went wrong.");
      } else {
        setReply(data?.answer || "");
      }
    } catch (error) {
      console.error(error);
      setReply("Sorry — I couldn’t reach the assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 bg-white">
      <h3 className="text-lg font-semibold">Ask Grit &amp; Grace</h3>
      <p className="text-sm opacity-80 mb-3">
        Ask about sizing, shipping, or product details.
      </p>

      <textarea
        className="w-full rounded-xl border p-3 min-h-[110px]"
        placeholder="Example: Does this run true to size?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={askAssistant}
        disabled={loading}
        className="mt-3 rounded-xl px-4 py-2 border"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {reply ? (
        <div className="mt-4 rounded-xl bg-neutral-50 p-3 text-sm leading-6">
          {reply}
        </div>
      ) : null}
    </div>
  );
}
