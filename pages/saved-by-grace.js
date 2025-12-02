"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatPrice";

const YOUR_PRODUCT_IDS = [
  "402037152",
  "402181003",
  "402181469",
  "402034024",
  "403261853",
  "403262072",
  "403262589",
  "403264720",
  "403600962",
  "403601375",
  "403602081",
  "403602399",
  "403602928",
];

export default function SavedByGrace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      const loaded = [];
      let hasError = false;

      for (const id of YOUR_PRODUCT_IDS) {
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

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "10rem 1rem" }}>
        <p style={{ fontSize: "2rem", color: "#aaa" }}>No products loaded yet</p>
        <p style={{ color: "#ccc", fontSize: "1.1rem" }}>
          Try refreshing or check if products are published in Printful.
        </p>
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
          background: "linear-gradient(135deg, #fdf7ff 0%, #f8f5fa 100%)",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", padding: "6rem 1rem 4rem" }}>
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
              color: "#555",
              maxWidth: "900px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Apparel born from storms. These pieces carry messages of faith,
            resilience, and healing — while supporting nonprofits focused on
            housing, homelessness, mental health, and suicide prevention. Wear
            your story. Give with purpose.
          </p>
        </div>

        <div
          style={{
            padding: "2rem 1rem 6rem",
            display: "grid",
            gap: "4rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            maxWidth: "1600px",
            margin: "0 auto",
          }}
        >
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
                  {formatPrice(product.variants?.[0]?.price)}
                </p>
                
              </div>
            </div>
          ))}
        </div>
            <Link href={`/product/${product.id}`}>
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

        <div
          style={{
            textAlign: "center",
            padding: "6rem 1rem",
            color: "#888",
            fontSize: "1.2rem",
          }}
        >
          More pieces coming every week · Designed with love · Powered by
          purpose
        </div>
      </div>
    </>
  );
}
