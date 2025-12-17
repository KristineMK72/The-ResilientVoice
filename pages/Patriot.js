// pages/Patriot.js
"use client";

import { PRINTFUL_PRODUCTS } from "../lib/printfulMap";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

const PATRIOTIC_PHRASES = [
  "Freedom isn't free. Thank a veteran.",
  "Honor the oath. Respect the service.",
  "Always faithful. Always prepared.",
  "First Responders: Courage under fire.",
  "United we stand, for Faith, Freedom, and Family.",
  "Land of the free, because of the brave.",
  "Support those who protect and serve.",
  "God, Country, Corps.",
];

const SERVICE_BUZZWORDS = [
  "Valor",
  "Duty",
  "Honor",
  "Military",
  "Veterans",
  "Service",
  "Police",
  "Fire",
  "EMS",
  "Freedom",
  "Liberty",
  "Sacrifice",
  "Patriot",
];

export default function Patriot() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPhrase, setCurrentPhrase] = useState(0);

  const PATRIOT_PRODUCT_IDS = useMemo(() => {
    const ids = [
      PRINTFUL_PRODUCTS.freedom_long_sleeve?.sync_product_id,
      PRINTFUL_PRODUCTS.patriot_sweatshirt?.sync_product_id,
      PRINTFUL_PRODUCTS.womens_patriot_tee?.sync_product_id,
      PRINTFUL_PRODUCTS.patriot_crew_neck?.sync_product_id,
      PRINTFUL_PRODUCTS.patriot_hoodie?.sync_product_id,
      PRINTFUL_PRODUCTS.we_the_people?.sync_product_id,
      PRINTFUL_PRODUCTS.patriot_leggings?.sync_product_id,
      PRINTFUL_PRODUCTS.patriot_boxy_jersey?.sync_product_id,
      PRINTFUL_PRODUCTS.multi_color_joggers?.sync_product_id,
      PRINTFUL_PRODUCTS.multicolor_sweatshirt?.sync_product_id,
    ]
      .filter(Boolean)
      .map(String);

    return Array.from(new Set(ids));
  }, []);

  // Phrase rotation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % PATRIOTIC_PHRASES.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Load products
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const results = [];

        for (const id of PATRIOT_PRODUCT_IDS) {
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
              "No Patriot products loaded — check /api/printful-product/:id responses."
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
  }, [PATRIOT_PRODUCT_IDS]);

  return (
    <>
      <Head>
        <title>Patriot Collection | The Resilient Voice</title>
        <meta
          name="description"
          content="Bold truthwear for those who stand for faith, freedom, and country — honoring veterans, first responders, and service."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          color: "white",
          // ✅ black + red + blue background (clean + premium)
          background:
            "radial-gradient(circle at 20% 15%, rgba(59,130,246,0.28) 0%, rgba(2,6,23,1) 45%, rgba(0,0,0,1) 100%), radial-gradient(circle at 80% 20%, rgba(239,68,68,0.22) 0%, rgba(0,0,0,0) 55%)",
        }}
      >
        {/* subtle animated glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 180deg at 50% 50%, rgba(239,68,68,1) 0deg, rgba(255,255,255,1) 120deg, rgba(59,130,246,1) 360deg)",
            opacity: 0.06,
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

        {/* Hero (same sizing system as SavedByGrace/Social) */}
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
          {/* logo block */}
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
            {/* You can swap this image to a Patriot-specific one anytime */}
            <Image
              src="/gritngrlogo.png"
              alt="Grit & Grace"
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
              background: "linear-gradient(90deg, #ef4444, #ffffff, #3b82f6)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Patriot Collection
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
            For those who stand unapologetically for faith, freedom, and country — and
            for those who serve to protect it. We honor veterans, active-duty
            military, law enforcement, and EMS.
            <br />
            <span style={{ color: "#9ca3af" }}>
              Wear your values. Stand for what matters. Give with purpose.
            </span>
          </p>

          {/* pill note */}
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
            <span>veterans + community support</span>
          </div>
        </div>

        {/* Sticky phrase rotation (soft + premium like SavedByGrace) */}
        <div
          style={{
            textAlign: "center",
            padding: "1.15rem 1rem",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(10px)",
            fontSize: "1.15rem",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "2.5rem",
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderTop: "1px solid rgba(0,0,0,0.05)",
            borderBottom: "1px solid rgba(0,0,0,0.10)",
            minHeight: "3.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {PATRIOTIC_PHRASES[currentPhrase]}
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
          {SERVICE_BUZZWORDS.map((word) => (
            <span
              key={word}
              style={{
                padding: "0.55rem 1rem",
                background: "rgba(255,255,255,0.92)",
                borderRadius: "999px",
                fontSize: "1rem",
                color: "#111827",
                boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                fontWeight: "900",
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
            <p style={{ fontSize: "1.8rem", color: "#93c5fd" }}>Loading Patriot collection…</p>
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
              const productId = String(product?.sync_product_id ?? product?.id ?? "");
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

                      {/* corner badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          padding: "8px 12px",
                          borderRadius: "999px",
                          background: "rgba(239,68,68,0.12)",
                          color: "#ef4444",
                          fontWeight: 900,
                          fontSize: "0.9rem",
                          border: "1px solid rgba(239,68,68,0.20)",
                        }}
                      >
                        Patriot
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
                        background: "linear-gradient(135deg, #ef4444 0%, #ffffff 50%, #3b82f6 115%)",
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
