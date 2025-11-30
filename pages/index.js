// pages/index.js  ← YOUR CODE + PRODUCT TEASER BELOW LOGO
"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";  // ← Added for fetch (one line)

export default function Home() {
  const [featuredProduct, setFeaturedProduct] = useState(null);  // ← For product data

  useEffect(() => {
    fetch("/api/printful-product/402034024")  // ← Your product ID
      .then(res => res.ok ? res.json() : null)
      .then(data => setFeaturedProduct(data))
      .catch(() => {});  // Silent fail if needed
  }, []);

  return (
    <>
      <Head>
        <title>Grit & Grace | Patriotic Truth Wear</title>
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
        {/* animated glow background */}
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

        {/* Logo */}
        <div style={{ marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <Image
            src="/Logo.jpeg"
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

        {/* FIXED PRODUCT TEASER + WORKING BUTTON */}
        {featuredProduct && (
          <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "16px", maxWidth: "400px" }}>
            <Image
              src={featuredProduct.image}
              alt={featuredProduct.name}
              width={300}
              height={300}
              style={{ borderRadius: "12px", marginBottom: "1rem" }}
            />
            <h3 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem", color: "#fff" }}>{featuredProduct.name}</h3>
            <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#ff6b6b", margin: "0 0 1rem" }}>
              ${featuredProduct.variants?.[0]?.price}
            </p>

            {/* THIS IS THE WORKING BUTTON */}
            <Link href="/product/402034024" legacyBehavior>
              <a style={{ 
                display: "inline-block", 
                padding: "0.8rem 1.5rem", 
                background: "#ff6b6b", 
                color: "white", 
                borderRadius: "8px", 
                textDecoration: "none",
                fontWeight: "600"
              }}>
                View Product
              </a>
            </Link>
          </div>
        )}

        {/* Title */}
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
          GRIT & GRACE
        </h1>

        {/* Mission Statement */}
        <p
          style={{
            fontSize: "1.9rem",
            maxWidth: "800px",
            margin: "0 auto 2rem",
            lineHeight: "1.6",
          }}
        >
          GRIT & GRACE by Resilient Voice is more than apparel — it's a movement that unites Christianity, patriotism, and social sustainability.
          Every design speaks truth with boldness, while proceeds support nonprofits tackling homelessness, housing insecurity,
          mental health, and suicide prevention. Wear your story. Live your values. Stand for hope.
        </p>

        {/* CTA */}
        <Link
          href="/saved-by-grace"
          style={{
            marginTop: "2rem",
            padding: "1.2rem 2.4rem",
            fontSize: "1.6rem",
            fontWeight: "600",
            background: "linear-gradient(90deg, #ff4444, #4444ff)",
            color: "white",
            borderRadius: "12px",
            textDecoration: "none",
            boxShadow: "0 0 25px rgba(255,255,255,0.2)",
            zIndex: 10,
          }}
        >
          Explore the Collection
        </Link>
      </div>
    </>
  );
}
