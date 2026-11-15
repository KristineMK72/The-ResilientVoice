// pages/shop.js — Full Printful catalog with prices
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const res = await fetch("/api/printful-products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem", fontSize: "1.8rem", color: "#9f6baa" }}>
        Loading the full collection…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "10rem 1rem" }}>
        <p style={{ color: "#ff6b6b", fontSize: "1.6rem" }}>Unable to load products</p>
        <p style={{ color: "#aaa" }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Shop All | The Resilient Voice</title>
        <meta name="description" content="Browse the full collection of faith-fueled, patriotic, and purpose-driven apparel." />
      </Head>

      <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "4.5rem", color: "#9f6baa", fontWeight: "800", margin: "0 0 1rem" }}>
            Shop Everything
          </h1>
          <p style={{ fontSize: "1.5rem", color: "#666", maxWidth: "800px", margin: "0 auto" }}>
            Every piece currently published in the Resilient Voice collection.
          </p>
          <p style={{ marginTop: "1rem", color: "#9f6baa", fontWeight: "600" }}>
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <p style={{ fontSize: "1.8rem", color: "#aaa" }}>No products published yet.</p>
            <p style={{ color: "#ccc" }}>Publish something in Printful and it will appear here automatically.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "3rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    borderRadius: "24px",
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 16px 50px rgba(0,0,0,0.12)",
                    transition: "transform 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-12px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div style={{ position: "relative", height: "360px", background: "#f8f5fa" }}>
                    <Image
                      src={product.image || product.thumbnail_url || "/images/placeholder.jpg"}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain", padding: "30px" }}
                      unoptimized
                    />
                  </div>
                  <div style={{ padding: "1.6rem", textAlign: "center" }}>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem", color: "#333" }}>{product.name}</h3>
                    <p style={{ color: "#9f6baa", fontWeight: "bold", fontSize: "1.3rem", margin: 0 }}>
                      {product.price != null && product.price > 0
                        ? `$${Number(product.price).toFixed(2)}`
                        : "View"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "6rem", color: "#aaa", fontSize: "1.1rem" }}>
          New pieces appear here as soon as you publish them in Printful.
        </p>
      </main>
    </>
  );
}
