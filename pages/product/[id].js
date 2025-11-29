// pages/product/[id].js  ← FINAL VERSION — SHOWS YOUR REAL GRACE TEE
"use client";  // ← THIS MAKES FETCH RUN IN BROWSER
export const dynamic = 'force-dynamic';  // ← FORCES FRESH DATA EVERY VISIT

import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProductPage({ params }) {
  const { id } = params || {};  // ← GRABS ID FROM URL (e.g., 403602928)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/printful-product/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Product fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem" }}>
        <p style={{ fontSize: "2rem", color: "#9f6baa" }}>Loading your piece...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem" }}>
        <p style={{ fontSize: "2rem", color: "#ff6b6b" }}>Product not found</p>
        <p style={{ color: "#aaa", marginTop: "1rem" }}>{error || "ID: " + id}</p>
        <Link href="/saved-by-grace" style={{ color: "#9f6baa", textDecoration: "underline" }}>
          Back to Collection
        </Link>
      </div>
    );
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.variants[0]?.price || 29.99,
        image: product.image,
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  const basePrice = product.variants[0]?.price || 0;

  return (
    <>
      <Head>
        <title>{product.name} | The Resilient Voice</title>
        <meta name="description" content={`Discover ${product.name} from the Saved By Grace collection.`} />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto", background: "#f8f5fa" }}>
        <div style={{ display: "grid", gap: "4rem", gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
          {/* IMAGE */}
          <div style={{ borderRadius: "28px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ height: "600px", position: "relative", background: "#fff" }}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: "contain", padding: "2rem" }}
                priority
              />
            </div>
          </div>

          {/* DETAILS */}
          <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "3.5rem", margin: "0 0 1rem", color: "#9f6baa", fontWeight: "700" }}>
              {product.name}
            </h1>
            <p style={{ fontSize: "1.6rem", color: "#666", lineHeight: "1.6", marginBottom: "2rem" }}>
              {product.description || "A delicate piece from the Saved By Grace collection — feminine, beautiful, and unapologetically resilient."}
            </p>
            <p style={{ fontSize: "3rem", fontWeight: "bold", color: "#9f6baa", margin: "2rem 0" }}>
              ${basePrice.toFixed(2)}
            </p>
            <p style={{ color: "#aaa", marginBottom: "2rem", fontSize: "1.1rem" }}>
              Sizes: {product.variants.map(v => v.size).join(", ")} · All in stock
            </p>
            <button
              onClick={addToCart}
              style={{
                width: "100%",
                padding: "1.5rem",
                background: "#9f6baa",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "1.4rem",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              Add to Cart
            </button>
            <Link
              href="/saved-by-grace"
              style={{
                display: "inline-block",
                color: "#9f6baa",
                textDecoration: "underline",
                fontSize: "1.1rem",
                marginTop: "1rem",
              }}
            >
              ← Back to Collection
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
