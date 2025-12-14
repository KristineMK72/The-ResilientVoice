"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

const SOCIAL_PRODUCT_IDS = [
  "405949039",
  "405945273",
  "406331944",
  "406332650",
  "406370294",
  "406371194",
  "406372796",
  "407453890",
  // add more Social Impact product IDs here
];

// --- New Definitions for Rotation and Buzzwords ---

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

// --------------------------------------------------

export default function Social() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- New State for Phrase Rotation ---
  const [currentPhrase, setCurrentPhrase] = useState(0);

  // --- Product Loading Logic (Existing) ---
  useEffect(() => {
    async function loadProducts() {
      const loaded = [];
      let hasError = false;

      for (const id of SOCIAL_PRODUCT_IDS) {
        try {
          const res = await fetch(`/api/printful-product/${id}`);
          if (res.ok) {
            const data = await res.json();
            loaded.push(data);
          } else {
            console.warn(`Failed to load ${id}: ${res.status}`);
          }
        } catch (err) {
          console.error(`Error loading ${id}:`, err);
          hasError = true;
        }
      }

      setProducts(loaded);
      setLoading(false);
      if (hasError && loaded.length === 0) {
        setError("Failed to load products — check console.");
      }
    }

    loadProducts();
  }, []);

  // --- Phrase Rotation Logic (New) ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhrase(
        (prevIndex) => (prevIndex + 1) % SOCIAL_PHRASES.length
      );
    }, 5000); // Change phrase every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  // ------------------------------------

  return (
    <>
      <Head>
        <title>Social Impact Collection | Grit & Grace</title>
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

        {/* Hero section */}
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
            and suicide prevention. Bold voices can change lives — and together,
            we build resilience.
          </p>
        </div>
        
        {/* --- New: Social/Mental Health Phrase Rotation --- */}
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 1rem",
            background: "#ffffffaa",
            backdropFilter: "blur(6px)",
            fontSize: "1.4rem",
            fontWeight: "600",
            color: "#7a4f85", // Changed color to fit the existing theme, or you can use a strong color like '#111827'
            marginBottom: "3rem",
            position: "sticky",
            top: 0,
            zIndex: 5,
            minHeight: "3.5rem", // Ensures consistent height during rotation
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {SOCIAL_PHRASES[currentPhrase]}
        </div>

        {/* --- New: Buzzword cloud --- */}
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
            zIndex: 2,
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
                color: "#7a4f85", // Matching color from the phrase rotation
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              {word}
            </span>
          ))}
        </div>
        {/* ------------------------------------------------- */}


        {/* Product grid */}
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
          {loading && (
            <p
              style={{
                textAlign: "center",
                fontSize: "2rem",
                color: "#6ee7b7",
                gridColumn: "1/-1",
              }}
            >
              Loading Social Impact collection…
            </p>
          )}

          {error && (
            <p
              style={{
                textAlign: "center",
                fontSize: "1.8rem",
                color: "#ff4444",
                gridColumn: "1/-1",
              }}
            >
              {error}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p
              style={{
                textAlign: "center",
                fontSize: "2rem",
                color: "#aaa",
                gridColumn: "1/-1",
              }}
            >
              No Social Impact products loaded yet
            </p>
          )}

          {products.map((product) => (
            <div
              key={product.id}
              style={{
                borderRadius: "28px",
                overflow: "hidden",
                background: "white",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              }}
            >
              <Link href={`/product/${product.id}`}>
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
                    color: "#6ee7b7",
                  }}
                >
                  {formatPrice(product.variants?.[0]?.price)}
                </p>

                <Link href={`/product/${product.id}`}>
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
          ))}
        </div>
      </div>
    </>
  );
}
