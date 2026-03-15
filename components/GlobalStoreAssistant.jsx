import React, { useState } from "react";

export default function GlobalStoreAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I’m Sam. I’m grateful you’re here. Ask me about sizing, shipping, materials, gifts, or product details.",
    },
  ]);

  async function askAssistant() {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);

    try {
      const path =
        typeof window !== "undefined" ? window.location.pathname : "";
      const match = path.match(/^\/product\/([^/]+)/);
      const productId = match ? match[1] : null;

      const conversation = [...messages, { role: "user", text: userMessage }];

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: `sam-${Date.now()}`,
          productId,
          conversation,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `Sam hit a non-JSON response.\n\n${text.slice(0, 300)}`,
          },
        ]);
        return;
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data?.details || data?.error || "Something went wrong.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              data?.answer ||
              "I’m still gathering info on this item, but I’m happy to help with a follow-up question.",
          },
        ]);
      }
    } catch (error) {
      console.error("Sam fetch error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Sorry — I couldn’t reach Sam right now. ${error.message}`,
        },
      ]);
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
          border: "2px solid #c9a227",
          borderRadius: "999px",
          padding: "13px 18px",
          background:
            "linear-gradient(135deg, #0b1f4d 0%, #183a8f 55%, #b22234 100%)",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          cursor: "pointer",
          boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
        }}
      >
        {open ? "Close Sam" : "Ask Sam"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            right: "16px",
            bottom: "72px",
            width: "390px",
            maxWidth: "calc(100vw - 24px)",
            background: "#fffdf9",
            border: "1px solid #d9d9d9",
            borderRadius: "20px",
            padding: "16px",
            zIndex: 9999,
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              margin: "-16px -16px 14px -16px",
              padding: "14px 16px",
              background:
                "linear-gradient(135deg, #0b1f4d 0%, #1c3f95 60%, #b22234 100%)",
              color: "#fff",
              borderBottom: "2px solid #c9a227",
            }}
          >
            <h3 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: 800 }}>
              Ask Sam
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              Your patriotic Grit &amp; Grace guide for product details,
              materials, sizing, shipping, and gifts.
            </p>
          </div>

          <div
            style={{
              maxHeight: "280px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "stretch",
                  background: msg.role === "user" ? "#0b1f4d" : "#f8f8f8",
                  color: msg.role === "user" ? "#fff" : "#111",
                  border: msg.role === "user" ? "none" : "1px solid #ececec",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Sam a question..."
            style={{
              width: "100%",
              minHeight: "90px",
              borderRadius: "12px",
              border: "1px solid #d8d8d8",
              padding: "12px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
              color: "#111",
              background: "#fff",
            }}
          />

          <button
            onClick={askAssistant}
            disabled={loading}
            style={{
              marginTop: "10px",
              border: "1px solid #0b1f4d",
              borderRadius: "12px",
              padding: "10px 14px",
              background: "#0b1f4d",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "Sam is thinking..." : "Send to Sam"}
          </button>
        </div>
      )}
    </>
  );
}
