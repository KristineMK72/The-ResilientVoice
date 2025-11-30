"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/printful-product/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error("Product fetch error:", err));
  }, [id]);

  if (!product) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        color: "white",
      }}
    >
      {/* Product Image */}
      <Image
        src={product.image}
        alt={product.name}
        width={400}
        height={400}
        style={{ borderRadius: "12px", marginBottom: "1rem" }}
      />

      {/* Product Info */}
      <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>{product.name}</h1>
      <p style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>{product.description}</p>
      <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#ff6b6b" }}>
        ${product.variants?.[0]?.price}
      </p>

      {/* Add to Cart Button */}
      <button
        style={{
          padding: "0.8rem 1.5rem",
          background: "#ff6b6b",
          color: "white",
          borderRadius: "8px",
          border: "none",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
        onClick={() => alert("Add to cart logic goes here")}
      >
        Add to Cart
      </button>

      {/* Link back to collection */}
      <Link
        href="/saved-by-grace"
        style={{
          padding: "0.8rem 1.5rem",
          background: "linear-gradient(90deg, #ff4444, #4444ff)",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600",
        }}
      >
        Explore Collection
      </Link>
    </div>
  );
}
