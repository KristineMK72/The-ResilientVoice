// pages/index.js  ← FIXED & READY TO DEPLOY
"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>The Resilient Voice | Patriotic Truth Wear</title>
        <meta name="description" content="American-made apparel for those who refuse to be silenced." />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
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
        {/* Subtle animated glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "conic-gradient(from 180deg at 50% 50%, #ff0000 0deg, #0000ff 120deg, #ff0000 360deg)",
            opacity: 0.08,
            animation: "spin 30s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* YOUR LOGO — using your exact filename */}
        <div style={{ marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <Image
            src="/IMG_8198.jpeg"
            alt="The Resilient Voice"
            width={700}
            height={700}
            priority
            style={{
              maxWidth: "95vw",
              height: "auto",
              filter: "drop-shadow(0 0 50px rgba(255,255,255,0.7))",
            }}
          />
        </div>

        <h1
          style={{
            fontSize: "4.8rem",
            fontWeight: "900",
            background: "linear-gradient(90deg, #ff4444, #ffffff, #4444ff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            margin: "1rem 0 2rem",
            letterSpacing: "0.08em",
          }}
        >
          RESILIENT VOICE
        </h1>

        <p style={{ fontSize: "1.9rem", maxWidth: "800px", margin: "0 auto 3rem", opacity: 0.9 }}>
          We don’t whisper. We roar.<br />
          American-made truth wear for patriots who refuse to be silenced.
        </p>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/saved-by-grace">
            <button
              style={{
                padding: "1.5rem 3.5rem",
                fontSize: "1.6rem",
                fontWeight: "bold",
                background: "linear-gradient(45deg, #cc0000, #ff4444)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 15px 40px rgba(255,0,0,0.5)",
              }}
            >
              SHOP GRACE COLLECTION
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
