// pages/social.js ← Bold, mission-driven placeholder
"use client";

import Head from "next/head";

export default function Social() {
  return (
    <>
      <Head>
        <title>Social Impact | The Resilient Voice</title>
        <meta
          name="description"
          content="Faith-fueled apparel with a mission: supporting mental health, housing, and social sustainability."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #111827 0%, #000 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* animated calming glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 180deg at 50% 50%, #6ee7b7 0deg, #3b82f6 120deg, #9333ea 240deg, #6ee7b7 360deg)",
            opacity: 0.08,
            animation: "spin 50s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        {/* Title */}
        <h1
          style={{
            fontSize: "5rem",
            fontWeight: "900",
            background: "linear-gradient(90deg, #6ee7b7, #3b82f6, #9333ea)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            margin: "1rem 0 2rem",
            letterSpacing: "0.08em",
          }}
        >
          SOCIAL IMPACT
        </h1>

        {/* Mission Message */}
        <p
          style={{
            fontSize: "2rem",
            maxWidth: "900px",
            margin: "0 auto 2rem",
            lineHeight: "1.6",
            color: "#ddd",
          }}
        >
          This collection is dedicated to healing and hope. Every piece is designed to spark conversation,
          raise awareness, and give back to nonprofits tackling housing insecurity, homelessness, mental health,
          and suicide prevention. Bold voices can change lives — and together, we build resilience.
        </p>

        {/* Coming Soon */}
        <p
          style={{
            fontSize: "1.6rem",
            fontWeight: "600",
            color: "#6ee7b7",
            marginTop: "3rem",
            letterSpacing: "0.05em",
          }}
        >
          Coming Soon · Wear your voice for change
        </p>
      </div>
    </>
  );
}
