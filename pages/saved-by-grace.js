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

  // Scripture rotation
  const scriptures = [
    "“My grace is sufficient for you.” — 2 Corinthians 12:9",
    "“He restores my soul.” — Psalm 23:3",
    "“You are chosen, holy, and dearly loved.” — Colossians 3:12",
    "“Fear not, for I have redeemed you.” — Isaiah 43:1",
  ];
  const [currentScripture, setCurrentScripture] = useState(0);

  // Build IDs from your map (and prevent duplicates)
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

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const results = [];

        for (const id of YOUR_PRODUCT_IDS) {
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

        // Sort by name (optional, makes it look nicer)
        results.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

        if (!cancelled) {
          setProducts(results);
          setLoading(false);

          if (results.length === 0) {
            setError("No products loaded — check /api/printful-product/:id responses.");
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
            top: "-200px",
            left: "-200px",
            width: "600px",
            height: "600px",
            background: "rgba(159,107,170,0.18)",
            filter: "blur(140px)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            background: "rgba(255,182,193,0.18)",
            filter: "blur(140px)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />

        {/* Hero */}
        <div
          style={{
            textAlign: "center",
            padding: "7rem 1rem 4rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontSize: "5.5rem",
              fontWeight: "800",
              color: "#9f6baa",
              margin: "0 0 1.5rem",
            }}
          >
            Saved By Grace
          </h1>

          <p
            style={{
              fontSize: "2rem",
              color: "#444",
              maxWidth: "900px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            A collection shaped by grace. These pieces speak life through words
            like <strong>Redeemed</strong>, <strong>Chosen</strong>,{" "}
            <strong>Strength</strong>, and <strong>Hope</strong> — echoing the
            scriptures that uplift weary hearts and remind us of God’s unshakable
            love. Every item carries a message of faith and restoration while
            supporting nonprofits serving housing, homelessness, mental health,
            and suicide prevention.
            <br />
            Wear His truth. Walk in grace. Give with purpose.
          </p>
        </div>

        {/* Scripture rotation */}
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 1rem",
            background: "#ffffffaa",
            backdropFilter: "blur(6px)",
            fontSize: "1.4rem",
            fontWeight: "600",
            color: "#7a4f85",
            marginBottom: "3rem",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          {scriptures[currentScripture]}
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
                padding: "0.6rem 1.2rem",
                background: "#fff",
                borderRadius: "20px",
                fontSize: "1.1rem",
                color: "#7a4f85",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                fontWeight: "600",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Product grid (FIXED: key + links use sync_product_id) */}
        <div
          style={{
            padding: "2rem 1rem 6rem",
            display: "grid",
            gap: "4rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            maxWidth: "1600px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
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
                  <div
                    style={{
                      height: "460px",
                      position: "relative",
                      background: "#f8f5fa",
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
                      color: "#9f6baa",
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
                        background: "#9f6baa",
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

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "6rem 1rem",
            color: "#888",
            fontSize: "1.2rem",
          }}
        >
          More pieces coming every week · Designed with love · Powered by purpose
        </div>
      </div>
    </>
  );
}
