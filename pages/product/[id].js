"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// 🏆 PRODUCT PAGE WITH SCROLLABLE MOCKUP GALLERY 🏆
export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  // Track selected variant
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/printful-product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
      })
      .catch((err) => console.error("Product fetch error:", err));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedVariantId) {
      alert("Please select a size first!");
      return;
    }

    const variantToAdd = product.variants.find((v) => v.id === selectedVariantId);
    if (!variantToAdd) {
      alert("Error: Could not find variant details.");
      return;
    }

    const cartItem = {
      id: selectedVariantId,
      productId: product.id,
      name: variantToAdd.name,
      price: variantToAdd.price,
      image: product.thumbnail_url,
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

  const currentPrice =
    product.variants.find((v) => v.id === selectedVariantId)?.price ||
    product.variants?.[0]?.price ||
    0;

  // Helper to build mockup paths
  const getMockupPaths = (id) => [
    `/${id}_1.png`,
    `/${id}_2.png`,
    `/${id}_3.png`,
  ];

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
      {/* Main Product Image */}
      <div style={{ maxWidth: "500px", margin: "0 auto 2rem" }}>
        <Image
          src={product.thumbnail_url || product.image || "/Logo.jpeg"}
          alt={product.name}
          width={600}
          height={600}
          priority
          style={{ borderRadius: "16px", boxShadow: "0 0 40px rgba(255,255,255,0.2)" }}
        />
      </div>

      {/* Scrollable Mockup Gallery */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "16px",
          padding: "1rem",
          marginTop: "2rem",
          scrollSnapType: "x mandatory",
        }}
      >
        {getMockupPaths(product.id).map((path, index) => (
          <img
            key={index}
            src={path}
            alt={`${product.name} mockup ${index + 1}`}
            style={{
              flex: "0 0 auto",
              width: "250px",
              height: "250px",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              scrollSnapAlign: "center",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none"; // hide if file doesn’t exist
            }}
          />
        ))}
      </div>

      {/* Product Details */}
      <h1 style={{ fontSize: "3rem", fontWeight: "900", margin: "1rem 0" }}>{product.name}</h1>
      {product.description && (
        <p style={{ fontSize: "1.4rem", maxWidth: "700px", margin: "1.5rem auto", lineHeight: "1.7", opacity: 0.9 }}>
          {product.description}
        </p>
      )}

      {/* Price */}
      <p style={{ fontSize: "2.4rem", fontWeight: "bold", color: "#ff6b6b", margin: "1.5rem 0" }}>
        ${parseFloat(currentPrice).toFixed(2)}
      </p>

      {/* Variant Selection */}
      {product.variants?.length > 0 && (
        <div style={{ margin: "2rem auto 2.5rem", maxWidth: "400px" }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem", fontWeight: "600" }}>Choose Your Size:</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {product.variants.map((variant) => {
              const sizeName = variant.name.split("/").pop().trim();
              const isSelected = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  style={{
                    padding: "10px 20px",
                    border: isSelected ? "3px solid #ff4444" : "1px solid #475569",
                    backgroundColor: isSelected ? "#ff444420" : "transparent",
                    color: isSelected ? "#ff4444" : "white",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {sizeName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to Cart */}
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
          }}
        >
          Add to Cart
        </button>
      ) : (
        <div style={{ margin: "2rem 0" }}>
          <p style={{ color: "#4ade80", fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" }}>Added to cart!</p>
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
              }}
            >
              Go to Cart →
            </a>
          </Link>
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginTop: "3rem" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "1rem 2rem",
            background: "linear-gradient(90deg, #ff4444, #4444ff)",
            color: "white",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ← Keep Shopping
        </button>
      </div>
    </div>
  );
}
