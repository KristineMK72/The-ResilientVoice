// pages/saved-by-grace.js — Auto-loads all Printful products
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SavedByGrace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/printful-products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem", fontSize: "1.8rem", color: "#9f6baa" }}>
        Loading your Grace collection…
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

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "10rem 1rem" }}>
        <p style={{ fontSize: "2rem", color: "#9f6baa" }}>No products yet</p>
        <p style={{ color: "#aaa" }}>Publish a product in Printful and it will appear here automatically.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Saved By Grace Collection | The Resilient Voice</title>
        <meta name="description" content="Faith-fueled designs that speak truth, strength, and softness." />
      </Head>

      <main style={{ padding: "5rem 1rem", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "4.5rem", color: "#9f6baa", fontWeight: "800", margin: "0 0 1rem" }}>
            Saved By Grace
          </h1>
          <p style={{ fontSize: "1.6rem", color: "#666", maxWidth: "800px", margin: "0 auto" }}>
            Strength wrapped in softness. Delicate pieces for the days you need to remember you are still whole.
          </p>
        </div>

        <div style={{ display: "grid", gap: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  borderRadius: "24px",
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 16px 50px rgba(0,0,0,0.15)",
                  transition: "transform 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-12px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ position: "relative", height: "380px", background: "#f8f5fa" }}>
                  <Image
                    src={product.image || product.thumbnail_url || "/images/placeholder.jpg"}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain", padding: "30px" }}
                    unoptimized
                  />
                </div>
                <div style={{ padding: "1.8rem", textAlign: "center" }}>
                  <h3 style={{ margin: "0 0 0.6rem", fontSize: "1.5rem", color: "#333" }}>{product.name}</h3>
                  <p style={{ color: "#9f6baa", fontWeight: "bold", fontSize: "1.4rem", margin: 0 }}>
                    ${product.price?.toFixed(2) || "View"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: "6rem", color: "#aaa", fontSize: "1.1rem" }}>
          More pieces coming every week · Hand-designed with love
        </p>
      </main>
    </>
  );
}
