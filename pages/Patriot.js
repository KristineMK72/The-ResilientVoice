// pages/patriot.js ← Bold, mission-driven placeholder
"use client";

import Head from "next/head";
import Image from "next/image";

export default function Patriot() {
  return (
    <>
      <Head>
        <title>Patriot Collection | The Resilient Voice</title>
        <meta name="description" content="Bold truthwear for those who stand for faith, freedom, and country." />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)",
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
        {/* animated patriotic glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "conic-gradient(from 180deg at 50% 50%, #ff0000 0deg, #ffffff 120deg, #0000ff 360deg)",
            opacity: 0.08,
            animation: "spin 40s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Optional logo */}
        <div style={{ marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <Image
            src="/IMG_8198.jpeg"
            alt="Patriot Collection"
            width={600}
            height={600}
            priority
            style={{
              maxWidth: "90vw",
              height: "auto",
              filter: "drop-shadow(0 0 40px rgba(255,255,255,0.6))",
            }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "5rem",
            fontWeight: "900",
            background: "linear-gradient(90deg, #ff0000, #ffffff, #0000ff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            margin: "1rem 0 2rem",
            letterSpacing: "0.08em",
          }}
        >
          PATRIOT COLLECTION
        </h1>

        {/* Mission Message */}
        <p
          style={{
            fontSize: "2rem",
            maxWidth: "900px",
            margin: "0 auto 2rem",
            lineHeight: "1.6",
            color: "#ccc",
          }}
        >
          For those who stand unapologetically for faith, freedom, and country. This collection is a tribute to
          bold voices, sacred values, and the American spirit. Designed to speak truth — and built to give back.
        </p>

        {/* Coming Soon */}
        <p
          style={{
            fontSize: "1.6rem",
            fontWeight: "600",
            color: "#ff4444",
            marginTop: "3rem",
            letterSpacing: "0.05em",
          }}
        >
          Coming Soon · Launching with purpose
        </p>
      </div>
    </>
  );
}
