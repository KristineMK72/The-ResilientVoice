"use client";

import { PRINTFUL_PRODUCTS } from "../lib/printfulMap"; // ✅ YOU WERE MISSING THIS
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
  ].filter(Boolean).map(String);

  // ✅ fallback if the map keys aren’t present yet
  const fallback = [
    "405949039", // Your Story
    "405945273", // Retro ringer (your “;” duplicate row)
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

  // ✅ Load products (SavedByGrace pattern)
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
            setError(
              "No Social products loaded — check /api/printful-product/:id responses."
            );
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
        <title>Social Impact Collection | Grit &amp; Grace</title>
        <meta
          name="description"
          content="Apparel designed to spark healing, hope, and awareness — supporting mental health, housing insecurity, and suicide prevention."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #111827 0%, #000 100%)",
          position: "relative",
          overflow: "hidden",
          color: "white",
        }}
      >
        {/* animated calming glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 180deg at 50% 50%, #6ee7b7 0deg, #3b82f6 120deg, #9333ea 360deg)",
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

        {/* Hero */}
        <div
          style={{
            textAlign: "center",
            padding: "6rem 1rem 4rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize: "5rem",
              fontWeight: "900",
              background: "linear-gradient(90deg, #6ee7b7, #3b82f6, #9333ea)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              margin: "1rem 0 2rem",
              letterSpacing: "0.08em",
            }}
          >
            SOCIAL IMPACT
          </h1>

          <p
            style={{
              fontSize: "2rem",
              maxWidth: "900px",
              margin: "0 auto 2rem",
              lineHeight: "1.6",
              color: "#ccc",
            }}
          >
            This collection is dedicated to healing and hope. Every piece is
            designed to spark conversation, raise awareness, and give back to
            nonprofits tackling housing insecurity, homelessness, mental health,
            and suicide prevention.
          </p>
        </div>

        {/* Sticky phrase rotation */}
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 1rem",
            background: "#ffffffaa",
            backdropFilter: "blur(6px)",
            fontSize: "1.4rem",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "3rem",
            position: "sticky",
            top: 0,
            zIndex: 50,
            minHeight: "3.5rem",
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
            maxWidth: "900px",
            margin: "0 auto 4rem",
            padding: "0 1rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          {MENTAL_HEALTH_BUZZWORDS.map((word) => (
            <span
              key={word}
              style={{
                padding: "0.6rem 1.2rem",
                background: "#fff",
                borderRadius: "20px",
                fontSize: "1.1rem",
                color: "#111827",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Status */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              position: "relative",
              zIndex: 10,
            }}
          >
            <p style={{ fontSize: "2rem", color: "#6ee7b7" }}>
              Loading Social Impact collection…
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              position: "relative",
              zIndex: 10,
            }}
          >
            <p style={{ fontSize: "1.6rem", color: "#ff6b6b" }}>{error}</p>
            <p style={{ color: "#aaa" }}>Check browser console for details.</p>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && (
          <div
            style={{
              padding: "2rem 1rem 6rem",
              display: "grid",
              gap: "4rem",
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
              const price =
                firstVariant?.retail_price ?? firstVariant?.price ?? "0";

              return (
                <div
                  key={productId}
                  style={{
                    borderRadius: "28px",
                    overflow: "hidden",
                    background: "white",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                  }}
                >
                  <Link href={`/product/${productId}`}>
                    <div
                      style={{
                        height: "460px",
                        position: "relative",
                        background: "#111",
                      }}
                    >
                      <Image
                        src={product.thumbnail_url || product.preview_url}
                        alt={product.name}
                        fill
                        style={{ objectFit: "contain", padding: "40px" }}
                        priority
                      />
                    </div>
                  </Link>

                  <div style={{ padding: "2.5rem", textAlign: "center" }}>
                    <h3
                      style={{
                        margin: "0 0 1rem",
                        fontSize: "1.7rem",
                        fontWeight: "700",
                        color: "#333",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "1rem 0",
                        fontSize: "2.2rem",
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {formatPrice(price)}
                    </p>

                    <Link href={`/product/${productId}`}>
                      <a
                        style={{
                          display: "inline-block",
                          width: "100%",
                          padding: "1.4rem",
                          background: "#6ee7b7",
                          color: "black",
                          borderRadius: "16px",
                          fontSize: "1.3rem",
                          fontWeight: "bold",
                          textDecoration: "none",
                        }}
                      >
                        View Details →
                      </a>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
