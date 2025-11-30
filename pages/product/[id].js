"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/printful-product/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Product fetch error:", err));
  }, [id]);

  const handleAddToCart = () => {
    const cartItem = {
      id: product.variants[0].id,
      productId: product.id,
      name: product.name,
      price: product.variants[0].price,
      image: product.image,
      quantity: 1,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = existingCart.find((item) => item.id === cartItem.id);

    if (exists) {
      exists.quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (!product)
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "white", fontSize: "1.5rem" }}>
        Loading...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
        padding: "4rem 1rem",
        color: "white",
        textAlign: "center",
      }}
    >
      {/* Backdrop glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "conic-gradient(from 180deg at 50% 50%, #ff0000 0deg, #0000ff 120deg, #ff0000 360deg)",
          opacity: 0.08,
          animation: "spin 40s linear infinite",
          pointerEvents: "none",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Product Image */}
      <div style={{ maxWidth: "500px", margin: "0 auto 2rem" }}>
        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={600}
          priority
          style={{ borderRadius: "16px", boxShadow: "0 0 40px rgba(255,255,255,0.2)" }}
        />
      </div>

      {/* Product Details */}
      <h1 style={{ fontSize: "3rem", fontWeight: "900", margin: "1rem 0" }}>
        {product.name}
      </h1>
      {product.description && (
        <p style={{ fontSize: "1.4rem", maxWidth: "700px", margin: "1.5rem auto", lineHeight: "1.7", opacity: 0.9 }}>
          {product.description}
        </p>
      )}
      <p style={{ fontSize: "2.4rem", fontWeight: "bold", color: "#ff6b6b", margin: "1.5rem 0" }}>
        ${product.variants?.[0]?.price}
      </p>

      {/* Add to Cart Button – Fully Fixed & Beautiful */}
      {!added ? (
        <button
          onClick={handleAddToCart}
          style={{
            padding: "1.2rem 3rem",
            background: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.4rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(255,68,68,0.4)",
            transition: "all 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Add to Cart
        </button>
      ) : (
        <div style={{ margin: "2rem 0" }}>
          <p style={{ color: "#4ade80", fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Added to cart!
          </p>
          <Link href="/cart">
            <a
              style={{
                display: "inline-block",
                padding: "1rem 2.5rem",
                background: "white",
                color: "#ff4444",
                borderRadius: "12px",
                fontWeight: "bold",
                textDecoration: "none",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              }}
            >
              Go to Cart →
            </a>
          </Link>
        </div>
      )}

      {/* Back to Collection */}
      <div style={{ marginTop: "3rem" }}>
        <Link href="/saved-by-grace">
          <a
            style={{
              padding: "1rem 2rem",
              background: "linear-gradient(90deg, #ff4444, #4444ff)",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "1.2rem",
              display: "inline-block",
            }}
          >
            ← Explore Full Collection
          </a>
        </Link>
      </div>
    </div>
  );
}
