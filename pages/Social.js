// pages/Social.js
"use client";

import { PRINTFUL_PRODUCTS } from "../lib/printfulMap";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

// --- Phrases + Buzzwords ---
const SOCIAL_PHRASES = [
  "Take a deep breath. You are enough.",
  "Community is our greatest resource.",
  "Mental health is a priority, not a luxury.",
  "Small acts of kindness change the world.",
  "Be kind to your mind.",
  "Together, we build resilience.",
  "Sustainable systems support everyone.",
  "Healing starts with honest conversation.",
];

const MENTAL_HEALTH_BUZZWORDS = [
  "Compassion",
  "Empathy",
  "Wellbeing",
  "Equity",
  "Inclusion",
  "Mindfulness",
  "Connection",
  "Awareness",
  "Support",
  "Resilience",
  "Self-Care",
  "Hope",
  "Action",
];

export default function Social() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPhrase, setCurrentPhrase] = useState(0);

  const SOCIAL_PRODUCT_IDS = useMemo(() => {
    const idsFromMap = [
      PRINTFUL_PRODUCTS.your_story?.sync_product_id,
      PRINTFUL_PRODUCTS.retro_ringer?.sync_product_id,
      PRINTFUL_PRODUCTS.the_climb?.sync_product_id,
      PRINTFUL_PRODUCTS.safe?.sync_product_id,
      PRINTFUL_PRODUCTS.mind?.sync_product_id,
      PRINTFUL_PRODUCTS.multi_color_joggers_social?.sync_product_id,
      PRINTFUL_PRODUCTS.multicolor_sweatshirt_social?.sync_product_id,
      PRINTFUL_PRODUCTS.testproduct_can_cooler?.sync_product_id,
    ]
      .filter(Boolean)
      .map(String);

    // ✅ fallback if the map keys aren’t present yet
    const fallback = [
      "405949039", // Your Story
      "405945273", // Retro ringer
      "406331944", // The Climb
      "406332650", // Safe
      "406370294", // Mind
      "406371194", // Multi Color Joggers
      "406372796", // Multi Color Sweatshirt
      "407453890", // TestProduct Can Cooler
    ];

    const finalIds = idsFromMap.length ? idsFromMap : fallback;
    return Array.from(new Set(finalIds.map(String)));
  }, []);

  // ✅ Phrase rotation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % SOCIAL_PHRASES.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // ✅ Load products
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const results = [];

        for (const id of SOCIAL_PRODUCT_IDS) {
          try {
            const res = await fetch(`/api/printful-product/${id}`);
            if (!res.ok) {
              console.warn(`Failed to load ${id}: ${res.status}`);
              continue;
            }
            const data = await res.json();
            results.push(data);
          } catch (err) {
            console.error(`Error loading ${id}:`, err);
          }
        }

        results.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

        if (!cancelled) {
          setProducts(results);
          setLoading(false);

          if (results.length === 0) {
            setError("No Social products loaded — check /api/printful-product/:id responses.");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setLoading(false);
          setError("Failed to load products — check console.");
        }
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [SOCIAL_PRODUCT_IDS]);

  return (
    <>
      <Head>
        <title>Social Impact Collection | The Resilient Voice</title>
        <meta
          name="description"
          content="Apparel designed to spark healing, hope, and awareness — supporting mental health, housing insecurity, and suicide prevention."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          color: "white",
          // ✅ Indigo / charcoal background
          background:
            "radial-gradient(circle at 25% 15%, #312e81 0%, #1e293b 45%, #020617 100%)",
        }}
      >
        {/* animated calming glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 180deg at 50% 50%, #6ee7b7 0deg, #3b82f6 120deg, #9333ea 360deg)",
            opacity: 0.07,
            animation: "spin 55s linear infinite",
            pointerEvents: "none",
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

        {/* Hero (SavedByGrace sizing system) */}
        <div
          style={{
            textAlign: "center",
            padding: "5.5rem 1rem 3.2rem",
            position: "relative",
            zIndex: 10,
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* logo */}
          <div
            style={{
              width: "92px",
              height: "92px",
              margin: "0 auto 1.25rem",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <Image
              src="/faithLogo.png"
              alt="Logo"
              width={72}
              height={72}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <h1
            style={{
              fontSize: "clamp(2.6rem, 5vw, 4rem)",
              fontWeight: "900",
              margin: "0 0 0.9rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              background: "linear-gradient(90deg, #6ee7b7, #3b82f6, #9333ea)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Social Impact
          </h1>

          <p
            style={{
              fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)",
              maxWidth: "880px",
              margin: "0 auto",
              lineHeight: "1.8",
              color: "#d1d5db",
            }}
          >
            This collection is dedicated to healing and hope. Every piece is designed to spark conversation,
            raise awareness, and give back to nonprofits tackling mental health, housing insecurity,
            homelessness, and suicide prevention.
            <br />
            <span style={{ color: "#9ca3af" }}>
              Wear compassion. Spark conversation. Give with purpose.
            </span>
          </p>

          {/* small pill */}
          <div
            style={{
              marginTop: "1.8rem",
              display: "inline-flex",
              gap: "10px",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              fontWeight: 700,
              color: "#111827",
              fontSize: "0.95rem",
            }}
          >
            <span>10% donated</span>
            <span style={{ opacity: 0.6 }}>•</span>
            <span>mental health + housing support</span>
          </div>
        </div>

        {/* Sticky phrase rotation (SavedByGrace style) */}
        <div
          style={{
            textAlign: "center",
            padding: "1.15rem 1rem",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(10px)",
            fontSize: "1.15rem",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "2.5rem",
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderTop: "1px solid rgba(0,0,0,0.05)",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            minHeight: "3.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {SOCIAL_PHRASES[currentPhrase]}
        </div>

        {/* Buzzword cloud */}
        <div
          style={{
            maxWidth: "980px",
            margin: "0 auto 3.5rem",
            padding: "0 1rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.75rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          {MENTAL_HEALTH_BUZZWORDS.map((word) => (
            <span
              key={word}
              style={{
                padding: "0.55rem 1rem",
                background: "rgba(255,255,255,0.92)",
                borderRadius: "999px",
                fontSize: "1rem",
                color: "#111827",
                boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                fontWeight: "800",
                border: "1px solid rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Status */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem 1rem", position: "relative", zIndex: 10 }}>
            <p style={{ fontSize: "1.8rem", color: "#93c5fd" }}>Loading Social Impact collection…</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "2rem 1rem", position: "relative", zIndex: 10 }}>
            <p style={{ fontSize: "1.4rem", color: "#ff6b6b" }}>{error}</p>
            <p style={{ color: "#bdbdbd" }}>Check browser console for details.</p>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && (
          <div
            style={{
              padding: "2rem 1rem 6rem",
              display: "grid",
              gap: "3rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              maxWidth: "1600px",
              margin: "0 auto",
              position: "relative",
              zIndex: 10,
            }}
          >
            {products.map((product) => {
              const productId = String(product?.sync_product_id ?? "");
              if (!productId) return null;

              const firstVariant = product?.variants?.[0];
              const price = firstVariant?.retail_price ?? firstVariant?.price ?? "0";

              return (
                <div
                  key={productId}
                  style={{
                    borderRadius: "28px",
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.95)",
                    boxShadow: "0 18px 55px rgba(0,0,0,0.20)",
                    transition: "transform 180ms ease, box-shadow 180ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 24px 70px rgba(0,0,0,0.26)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 18px 55px rgba(0,0,0,0.20)";
                  }}
                >
                  <Link href={`/product/${productId}`}>
                    <div style={{ height: "460px", position: "relative", background: "#0b1220" }}>
                      <Image
                        src={product.thumbnail_url || product.preview_url}
                        alt={product.name}
                        fill
                        style={{ objectFit: "contain", padding: "40px" }}
                        priority
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          padding: "8px 12px",
                          borderRadius: "999px",
                          background: "rgba(147,197,253,0.14)",
                          color: "#93c5fd",
                          fontWeight: 900,
                          fontSize: "0.9rem",
                          border: "1px solid rgba(147,197,253,0.18)",
                        }}
                      >
                        Social Impact
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: "2.2rem", textAlign: "center" }}>
                    <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.55rem", fontWeight: "900", color: "#1f2937" }}>
                      {product.name}
                    </h3>

                    <p style={{ margin: "0.9rem 0 1.3rem", fontSize: "2rem", fontWeight: "900", color: "#0f172a" }}>
                      {formatPrice(price)}
                    </p>

                    <Link
                      href={`/product/${productId}`}
                      style={{
                        display: "inline-block",
                        width: "100%",
                        padding: "1.15rem",
                        background: "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 55%, #9333ea 115%)",
                        color: "#0b1220",
                        borderRadius: "16px",
                        fontSize: "1.15rem",
                        fontWeight: "900",
                        textDecoration: "none",
                        boxShadow: "0 14px 30px rgba(59,130,246,0.25)",
                      }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "5rem 1rem",
            color: "#a1a1aa",
            fontSize: "1.05rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          More pieces coming soon · Designed with love · Powered by purpose
        </div>
      </div>
    </>
  );
}
