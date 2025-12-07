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
  // add more Social Impact product IDs here
];

export default function Social() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
