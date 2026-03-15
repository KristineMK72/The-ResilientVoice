import React, { useState } from "react";

export default function GlobalStoreAssistant() {
  const [open, setOpen] = useState(false);
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
          sessionId: `global-${Date.now()}`,
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
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          right: "16px",
          bottom: "16px",
          zIndex: 9999,
          border: "none",
          borderRadius: "999px",
          padding: "12px 18px",
          background: "#111",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        }}
      >
        {open ? "Close Chat" : "Ask Grit & Grace"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            right: "16px",
            bottom: "72px",
            width: "360px",
            maxWidth: "calc(100vw - 24px)",
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "18px",
            padding: "16px",
            zIndex: 9999,
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Ask Grit &amp; Grace
          </h3>

          <p
            style={{
              margin: "0 0 12px",
              fontSize: "14px",
              color: "#666",
              lineHeight: 1.5,
            }}
          >
            Ask about sizing, shipping, product details, or gift ideas.
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Does this shirt run true to size?"
            style={{
              width: "100%",
              minHeight: "110px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              padding: "12px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={askAssistant}
            disabled={loading}
            style={{
              marginTop: "10px",
              border: "none",
              borderRadius: "12px",
              padding: "10px 14px",
              background: "#111",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>

          {reply ? (
            <div
              style={{
                marginTop: "12px",
                borderRadius: "12px",
                background: "#f7f7f7",
                padding: "12px",
                fontSize: "14px",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {reply}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
