// pages/product/[id].js  ← FIXED: NO MORE LOADING HANG
"use client";
export const dynamic = "force-dynamic";  // forces fresh data every visit

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductPage({ params }) {
  const { id } = params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Fetch with timeout to prevent infinite hang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    fetch(`/api/printful-product/${id}`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        console.error("Product load error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem", minHeight: "100vh" }}>
        <p style={{ fontSize: "2rem", color: "#9f6baa" }}>Loading your piece…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "12rem 1rem", minHeight: "100vh" }}>
        <p style={{ fontSize: "2rem", color: "#ff6b6b" }}>Product not found</p>
        <p style={{ color: "#aaa", marginTop: "1rem" }}>ID: {id}</p>
        <Link href="/saved-by-grace" style={{ color: "#9f6baa", textDecoration: "underline" }}>
          ← Back to Collection
        </Link>
      </div>
    );
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i) => i.id === product.id);
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
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto", minHeight: "100vh" }}>
        <div style={{ display: "grid", gap: "4rem", gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
          {/* IMAGE */}
          <div style={{ borderRadius: "28px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ position: "relative", height: "600px", background: "#f8f5fa" }}>
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
          <div style={{ padding: "2rem 0" }}>
            <h1 style={{ fontSize: "3.5rem", margin: "0 0 1rem", color: "#9f6baa", fontWeight: "700" }}>
              {product.name}
            </h1>
            <p style={{ fontSize: "1.6rem", color: "#666", lineHeight: "1.6", marginBottom: "2rem" }}>
              {product.description || "A bold piece from The Resilient Voice — designed with purpose, worn with pride."}
            </p>
            <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "#9f6baa", margin: "2rem 0" }}>
              ${basePrice.toFixed(2)}
            </p>
            <p style={{ color: "#aaa", marginBottom: "2rem", fontSize: "1.1rem" }}>
              Sizes: {product.variants.map((v) => v.size).join(", ")} · All in stock
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
            </Link>

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
