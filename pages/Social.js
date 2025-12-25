// pages/Social.js
// ✅ Same look, faster loading (parallel fetch + timeout + session cache)
// ✅ Only first 2 product images are priority (better performance)

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

  // ✅ Pull ALL products tagged category: "social" from the map
  const SOCIAL_PRODUCT_IDS = useMemo(() => {
    const ids = Object.values(PRINTFUL_PRODUCTS)
      .filter((p) => p?.category === "social" && p?.sync_product_id)
      .map((p) => String(p.sync_product_id));

    return Array.from(new Set(ids));
  }, []);

  // ✅ Phrase rotation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % SOCIAL_PHRASES.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // ✅ FAST product loading: parallel fetch + client cache + timeout
  useEffect(() => {
    let cancelled = false;

    async function loadProductsFast() {
      try {
        setLoading(true);
        setError(null);

        if (!SOCIAL_PRODUCT_IDS.length) {
          setProducts([]);
          setLoading(false);
          setError("No Social products configured — check PRINTFUL_PRODUCTS map categories.");
          return;
        }

        // session cache (makes back/forward instant)
        const cacheKey = `social_products_${SOCIAL_PRODUCT_IDS.join("_")}`;
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!cancelled && Array.isArray(parsed) && parsed.length) {
              setProducts(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore cache errors
        }

        const withTimeout = async (fn, ms = 15000) => {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), ms);
          try {
            return await fn(controller.signal);
          } finally {
            clearTimeout(t);
          }
        };

        const fetchOne = (id) =>
          withTimeout(async (signal) => {
            const res = await fetch(`/api/printful-product/${id}`, { signal });
            if (!res.ok) return { __error: true, id, status: res.status };
            return await res.json();
          });

        // concurrency limiter
        const CONCURRENCY = 6;
        const ids = [...SOCIAL_PRODUCT_IDS];
        const results = [];

        for (let i = 0; i < ids.length; i += CONCURRENCY) {
          const chunk = ids.slice(i, i + CONCURRENCY);
          const settled = await Promise.allSettled(chunk.map(fetchOne));

          settled.forEach((r) => {
            if (r.status === "fulfilled" && r.value && !r.value.__error) {
              results.push(r.value);
            } else if (r.status === "fulfilled" && r.value?.__error) {
              console.warn(`⚠️ Failed ${r.value.id}: ${r.value.status}`);
            } else {
              console.warn("⚠️ Fetch error:", r.reason?.message || r.reason);
            }
          });
        }

        results.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

        if (!cancelled) {
          setProducts(results);
          setLoading(false);

          if (results.length === 0) {
            setError("No Social products loaded — check /api/printful-product/:id responses.");
          } else {
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(results));
            } catch {
              // ignore
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          setLoading(false);
          setError(
            e?.name === "AbortError"
              ? "Loading timed out — please refresh."
              : "Failed to load products — check console."
          );
        }
      }
    }

    loadProductsFast();
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

        {/* Hero */}
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
            This collection is dedicated to healing and hope. Every piece is designed to spark
            conversation, raise awareness, and give back to nonprofits tackling mental health,
            housing insecurity, homelessness, and suicide prevention.
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

        {/* Sticky phrase rotation */}
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
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              position: "relative",
              zIndex: 10,
            }}
          >
            <p style={{ fontSize: "1.8rem", color: "#93c5fd" }}>
              Loading Social Impact collection…
            </p>
            <p style={{ color: "#cbd5e1", marginTop: "0.5rem" }}>
              Tip: after first load it should be faster (cached).
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
            <p style={{ fontSize: "1.4rem", color: "#ff6b6b" }}>{error}</p>
            <p style={{ color: "#bdbdbd" }}>Check browser console for details.</p>
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={() => location.reload()}
                style={{
                  padding: "0.85rem 1.2rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.12)",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
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
            {products.map((product, idx) => {
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
                        // ✅ only preload a couple images
                        priority={idx < 2}
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
                    <h3
                      style={{
                        margin: "0 0 0.75rem",
                        fontSize: "1.55rem",
                        fontWeight: "900",
                        color: "#1f2937",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "0.9rem 0 1.3rem",
                        fontSize: "2rem",
                        fontWeight: "900",
                        color: "#0f172a",
                      }}
                    >
                      {formatPrice(price)}
                    </p>

                    <Link
                      href={`/product/${productId}`}
                      style={{
                        display: "inline-block",
                        width: "100%",
                        padding: "1.15rem",
                        background:
                          "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 55%, #9333ea 115%)",
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
