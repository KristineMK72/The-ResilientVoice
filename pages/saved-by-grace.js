// pages/saved-by-grace.js (or pages/SavedByGrace.js — keep your existing filename)
// ✅ Same exact look, faster loading (parallel fetch + timeout + session cache)
// ✅ Also fixes the Next.js <Link><a> nesting issue (Next 13/14)

"use client";

import { PRINTFUL_PRODUCTS } from "../lib/printfulMap";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

export default function SavedByGrace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scriptures = [
    "“My grace is sufficient for you.” — 2 Corinthians 12:9",
    "“He restores my soul.” — Psalm 23:3",
    "“You are chosen, holy, and dearly loved.” — Colossians 3:12",
    "“Fear not, for I have redeemed you.” — Isaiah 43:1",
  ];
  const [currentScripture, setCurrentScripture] = useState(0);

  const YOUR_PRODUCT_IDS = useMemo(() => {
    const ids = [
      PRINTFUL_PRODUCTS.joy?.sync_product_id,
      PRINTFUL_PRODUCTS.strength?.sync_product_id,
      PRINTFUL_PRODUCTS.courageous?.sync_product_id,
      PRINTFUL_PRODUCTS.builder?.sync_product_id,
      PRINTFUL_PRODUCTS.power?.sync_product_id,
      PRINTFUL_PRODUCTS.redeemed?.sync_product_id,
      PRINTFUL_PRODUCTS.unshaken?.sync_product_id,
      PRINTFUL_PRODUCTS.radiant?.sync_product_id,
      PRINTFUL_PRODUCTS.love?.sync_product_id,
      PRINTFUL_PRODUCTS.faith?.sync_product_id,
    ]
      .filter(Boolean)
      .map(String);

    return Array.from(new Set(ids));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScripture((prev) => (prev + 1) % scriptures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FAST load (parallel fetch + concurrency limit + timeout + session cache)
  useEffect(() => {
    let cancelled = false;

    async function loadProductsFast() {
      try {
        setLoading(true);
        setError(null);

        if (!YOUR_PRODUCT_IDS.length) {
          setProducts([]);
          setLoading(false);
          setError("No products configured — check PRINTFUL_PRODUCTS map.");
          return;
        }

        // quick client cache so back/forward feels instant
        const cacheKey = `saved_by_grace_${YOUR_PRODUCT_IDS.join("_")}`;
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

        // timeout wrapper
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

        // concurrency limiter (keeps things snappy on mobile)
        const CONCURRENCY = 6;
        const ids = [...YOUR_PRODUCT_IDS];
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
            setError("No products loaded — check /api/printful-product/:id responses.");
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
  }, [YOUR_PRODUCT_IDS]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem" }}>
        <p style={{ fontSize: "2rem", color: "#9f6baa" }}>
          Loading your Grace collection…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "10rem 1rem" }}>
        <p style={{ fontSize: "1.8rem", color: "#ff6b6b" }}>{error}</p>
        <p style={{ color: "#aaa" }}>Check browser console for details.</p>
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => location.reload()}
            style={{
              padding: "0.85rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.7)",
              color: "#7a4f85",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Saved By Grace Collection | The Resilient Voice</title>
        <meta
          name="description"
          content="Faith-fueled designs that speak truth, strength, and softness — all while giving back."
        />
      </Head>

      <div
        style={{
          background: "linear-gradient(135deg, #fff8f2 0%, #fdf3e7 100%)",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft glow accents */}
        <div
          style={{
            position: "absolute",
            top: "-220px",
            left: "-220px",
            width: "650px",
            height: "650px",
            background: "rgba(159,107,170,0.20)",
            filter: "blur(140px)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-220px",
            right: "-220px",
            width: "650px",
            height: "650px",
            background: "rgba(255,182,193,0.20)",
            filter: "blur(140px)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />

        {/* subtle sparkle/shine */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%), radial-gradient(circle at 80% 35%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)",
            opacity: 0.5,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Hero */}
        <div
          style={{
            textAlign: "center",
            padding: "5.5rem 1rem 3.2rem",
            position: "relative",
            zIndex: 2,
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
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <Image
              src="/faithLogo.png"
              alt="Faith logo"
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
              color: "#9f6baa",
              margin: "0 0 0.9rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Saved By Grace
          </h1>

          <p
            style={{
              fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)",
              color: "#444",
              maxWidth: "880px",
              margin: "0 auto",
              lineHeight: "1.8",
            }}
          >
            A collection shaped by grace. These pieces speak life through words
            like <strong>Redeemed</strong>, <strong>Chosen</strong>,{" "}
            <strong>Strength</strong>, and <strong>Hope</strong> — echoing the
            scriptures that uplift weary hearts and remind us of God’s unshakable
            love.
            <br />
            <span style={{ color: "#6b6b6b" }}>
              Wear His truth. Walk in grace. Give with purpose.
            </span>
          </p>

          {/* small “pill” note */}
          <div
            style={{
              marginTop: "1.8rem",
              display: "inline-flex",
              gap: "10px",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.75)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              fontWeight: 700,
              color: "#7a4f85",
              fontSize: "0.95rem",
            }}
          >
            <span>10% donated</span>
            <span style={{ opacity: 0.6 }}>•</span>
            <span>mental health + housing support</span>
          </div>
        </div>

        {/* Scripture rotation */}
        <div
          style={{
            textAlign: "center",
            padding: "1.15rem 1rem",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(10px)",
            fontSize: "1.15rem",
            fontWeight: "700",
            color: "#7a4f85",
            marginBottom: "2.5rem",
            position: "sticky",
            top: 0,
            zIndex: 5,
            borderTop: "1px solid rgba(0,0,0,0.05)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {scriptures[currentScripture]}
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
            zIndex: 2,
          }}
        >
          {[
            "Redeemed",
            "Chosen",
            "Grace",
            "Hope",
            "Strength",
            "Beloved",
            "Restored",
            "Faith",
            "Light",
            "Courage",
            "Mercy",
            "Peace",
          ].map((word) => (
            <span
              key={word}
              style={{
                padding: "0.55rem 1rem",
                background: "rgba(255,255,255,0.9)",
                borderRadius: "999px",
                fontSize: "1rem",
                color: "#7a4f85",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                fontWeight: "700",
                border: "1px solid rgba(159,107,170,0.12)",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Product grid */}
        <div
          style={{
            padding: "2rem 1rem 6rem",
            display: "grid",
            gap: "3rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            maxWidth: "1600px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          {products.map((product, idx) => {
            const productId = String(product?.sync_product_id ?? product?.id ?? "");
            const firstVariant = product?.variants?.[0];
            const price = firstVariant?.retail_price ?? firstVariant?.price ?? "0";

            return (
              <div
                key={productId}
                style={{
                  borderRadius: "28px",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "0 18px 55px rgba(0,0,0,0.12)",
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 24px 70px rgba(0,0,0,0.16)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 18px 55px rgba(0,0,0,0.12)";
                }}
              >
                <Link href={`/product/${productId}`}>
                  <div
                    style={{
                      height: "430px",
                      position: "relative",
                      background:
                        "linear-gradient(180deg, #faf7ff 0%, #f6f1fb 100%)",
                    }}
                  >
                    <Image
                      src={product.thumbnail_url || product.preview_url}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain", padding: "36px" }}
                      // ✅ do NOT preload every image
                      priority={idx < 2}
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        padding: "8px 12px",
                        borderRadius: "999px",
                        background: "rgba(159,107,170,0.12)",
                        color: "#7a4f85",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        border: "1px solid rgba(159,107,170,0.18)",
                      }}
                    >
                      Grace Collection
                    </div>
                  </div>
                </Link>

                <div style={{ padding: "2.2rem", textAlign: "center" }}>
                  <h3
                    style={{
                      margin: "0 0 0.75rem",
                      fontSize: "1.55rem",
                      fontWeight: "800",
                      color: "#2b2b2b",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      margin: "0.9rem 0 1.3rem",
                      fontSize: "2rem",
                      fontWeight: "900",
                      color: "#9f6baa",
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
                        "linear-gradient(135deg, #9f6baa 0%, #c08bd0 100%)",
                      color: "white",
                      borderRadius: "16px",
                      fontSize: "1.15rem",
                      fontWeight: "900",
                      textDecoration: "none",
                      boxShadow: "0 14px 30px rgba(159,107,170,0.28)",
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "5rem 1rem",
            color: "#8a8a8a",
            fontSize: "1.05rem",
          }}
        >
          More pieces coming every week · Designed with love · Powered by purpose
        </div>
      </div>
    </>
  );
}
