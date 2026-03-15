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
      const path =
        typeof window !== "undefined" ? window.location.pathname : "";
      const match = path.match(/^\/product\/([^/]+)/);
      const productId = match ? match[1] : null;

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId: `sam-${Date.now()}`,
          productId,
        }),
      });

      const text = await res.text();
      console.log("Raw Sam response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setReply(`Sam got a non-JSON response.\n\n${text.slice(0, 300)}`);
        return;
      }

      if (!res.ok) {
        setReply(data?.details || data?.error || "Something went wrong.");
      } else {
        setReply(data?.answer || "No response returned.");
      }
    } catch (error) {
      console.error("Sam fetch error:", error);
      setReply(`Sorry — I couldn’t reach Sam right now. ${error.message}`);
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
            width: "370px",
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
            <h3
              style={{
                margin: "0 0 4px",
                fontSize: "19px",
                fontWeight: 800,
              }}
            >
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
              Your patriotic Grit &amp; Grace guide for sizing, shipping, gifts,
              and product questions.
            </p>
          </div>

          <div
            style={{
              marginBottom: "12px",
              fontSize: "13px",
              lineHeight: 1.6,
              color: "#444",
              background: "#fff8e8",
              border: "1px solid #f0dfaa",
              borderRadius: "12px",
              padding: "10px 12px",
            }}
          >
            Hi, I’m Sam. I’m grateful you’re here. Thanks for supporting Grit
            &amp; Grace and the good this store pours back into the community.
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Does this shirt run true to size?"
            style={{
              width: "100%",
              minHeight: "110px",
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
            {loading ? "Sam is thinking..." : "Ask Sam"}
          </button>

          <div
            style={{
              marginTop: "12px",
              borderRadius: "12px",
              background: "#f8f8f8",
              padding: "12px",
              fontSize: "14px",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
              minHeight: "76px",
              color: "#111",
              border: "1px solid #ececec",
            }}
          >
            {reply ||
              "Sam’s reply will appear here. Ask about sizing, shipping, Minnesota favorites, or gift ideas."}
          </div>
        </div>
      )}
    </>
  );
}
