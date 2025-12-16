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

  // ✅ EXACTLY like SavedByGrace: build IDs from specific map keys + dedupe
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

  // Load products (same pattern as Saved by Grace)
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
            setError("No Patriot products loaded — check /api/printful-product/:id responses.");
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem" }}>
        <p style={{ fontSize: "2rem", color: "#ff0000" }}>Loading Patriot collection…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "10rem 1rem" }}>
        <p style={{ fontSize: "1.8rem", color: "#ff6b6b" }}>{error}</p>
        <p style={{ color: "#aaa" }}>Check browser console for details.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Patriot Collection | Grit &amp; Grace</title>
        <meta
          name="description"
          content="Bold truthwear for those who stand for faith, freedom, and country."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)",
          position: "relative",
          overflow: "hidden",
          color: "white",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 180deg at 50% 50%, #ff0000 0deg, #ffffff 120deg, #0000ff 360deg)",
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

        <div style={{ textAlign: "center", padding: "6rem 1rem 4rem", position: "relative", zIndex: 10 }}>
          <div style={{ marginBottom: "2rem" }}>
            <Image
              src="/gritngrlogo.png"
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

          <h1
            style={{
              fontSize: "5rem",
              fontWeight: "900",
              background: "linear-gradient(90deg, #ff0000, #ffffff, #0000ff)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              margin: "1rem 0 2rem",
              letterSpacing: "0.08em",
            }}
          >
            PATRIOT COLLECTION
          </h1>

          <p style={{ fontSize: "2rem", maxWidth: "900px", margin: "0 auto 2rem", lineHeight: "1.6", color: "#ccc" }}>
            For those who stand unapologetically for faith, freedom, and country — and for those who serve to protect it.
            We honor veterans, active-duty military, law enforcement, and EMS. Every purchase helps us give back.
          </p>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 1rem",
            background: "#ffffffaa",
            backdropFilter: "blur(6px)",
            fontSize: "1.4rem",
            fontWeight: "600",
            color: "#0000ff",
            marginBottom: "3rem",
            position: "sticky",
            top: 0,
            zIndex: 5,
            minHeight: "3.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "4px solid #ff0000",
          }}
        >
          {PATRIOTIC_PHRASES[currentPhrase]}
        </div>

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
          {SERVICE_BUZZWORDS.map((word) => (
            <span
              key={word}
              style={{
                padding: "0.6rem 1.2rem",
                background: "#fff",
                borderRadius: "20px",
                fontSize: "1.1rem",
                color: "#ff0000",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                fontWeight: "700",
                textTransform: "uppercase",
                border: "2px solid #0000ff",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* ✅ Product grid (key + links use sync_product_id) */}
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
            const productId = String(product?.sync_product_id ?? product?.id ?? "");
            const firstVariant = product?.variants?.[0];
            const price = firstVariant?.retail_price ?? firstVariant?.price ?? "0";

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
                  <div style={{ height: "460px", position: "relative", background: "#111" }}>
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
                  <h3 style={{ margin: "0 0 1rem", fontSize: "1.7rem", fontWeight: "700", color: "#333" }}>
                    {product.name}
                  </h3>

                  <p style={{ margin: "1rem 0", fontSize: "2.2rem", fontWeight: "bold", color: "#ff0000" }}>
                    {formatPrice(price)}
                  </p>

                  <Link href={`/product/${productId}`}>
                    <a
                      style={{
                        display: "inline-block",
                        width: "100%",
                        padding: "1.4rem",
                        background: "#ff0000",
                        color: "white",
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
      </div>
    </>
  );
}
