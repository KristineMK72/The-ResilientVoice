// pages/product/[id].js  ← FINAL WORKING VERSION (clicks instantly)
"use client";
export const dynamic = "force-dynamic";   // forces fresh data every time

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductPage({ params }) {
  const { id } = params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/printful-product/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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

  if (loading)
    return <p style={{ textAlign: "center", padding: "10rem", fontSize: "2rem" }}>Loading…</p>;

  if (!product)
    return <p style={{ textAlign: "center", padding: "10rem", color: "red" }}>Product not found</p>;

  return (
    <>
      <Head>
        <title>{product.name} | The Resilient Voice</title>
      </Head>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 1rem" }}>
        <div style={{ display: "grid", gap: "4rem", gridTemplateColumns: "1fr 1fr" }}>
          {/* IMAGE */}
          <div style={{ borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <Image
              src={product.image}
              alt={product.name}
              width={800}
              height={800}
              style={{ objectFit: "contain", background: "#f8f5fa" }}
              priority
            />
          </div>

          {/* DETAILS */}
          <div>
            <h1 style={{ fontSize: "3.5rem", color: "#9f6baa", margin: "0 0 1rem" }}>
              {product.name}
            </h1>
            <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "#9f6baa" }}>
              ${product.variants[0]?.price?.toFixed(2)}
            </p>

            <button
              onClick={addToCart}
              style={{
                marginTop: "2rem",
                width: "100%",
                padding: "1.4rem",
                background: "#9f6baa",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "1.4rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>

            <Link href="/saved-by-grace" style={{ display: "block", marginTop: "2rem", color: "#9f6baa" }}>
              ← Back to Collection
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
