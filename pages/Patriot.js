// pages/patriot.js
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

const PATRIOT_PRODUCT_IDS = [
  "405190886", // 👈 your newest shirt
  // add other Patriot product IDs here
];

export default function Patriot() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      const loaded = [];
      let hasError = false;

      for (const id of PATRIOT_PRODUCT_IDS) {
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

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    const productImage = product.thumbnail_url || product.preview_url;

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.variants?.[0]?.price) || 29.99,
        image: productImage,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <>
      <Head>
        <title>Patriot Collection | The Resilient Voice</title>
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
        {/* animated patriotic glow */}
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
          <div style={{ marginBottom: "2rem" }}>
            <Image
              src="/IMG_8198.jpeg"
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

          <p
            style={{
              fontSize: "2rem",
              maxWidth: "900px",
              margin: "0 auto 2rem",
              lineHeight: "1.6",
              color: "#ccc",
            }}
          >
            For those who stand unapologetically for faith, freedom, and country.
            This collection is a tribute to bold voices, sacred values, and the
            American spirit. Designed to speak truth — and built to give back.
          </p>
        </div>

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
                color: "#ff0000",
                gridColumn: "1/-1",
              }}
            >
              Loading Patriot collection…
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
              No Patriot products loaded yet
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
                    color: "#ff0000",
                  }}
                >
                  {formatPrice(product.variants?.[0]?.price)}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    width: "100%",
                    padding: "1.4rem",
                    background: "#ff0000",
                    color: "white",
                    border: "none",
                    borderRadius: "16px",
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
