// pages/product/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null); // this will be sync_variant_id

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/printful-product/${id}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Product fetch failed:", data);
          return;
        }
        if (cancelled) return;

        setProduct(data);

        // Default to first variant (by sync_variant_id)
        if (data?.variants?.length) {
          setSelectedVariantId(data.variants[0].sync_variant_id);
        }
      } catch (err) {
        console.error("Product fetch error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length || !selectedVariantId) return null;
    return product.variants.find((v) => v.sync_variant_id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const currentPrice = useMemo(() => {
    const p = selectedVariant?.retail_price || product?.variants?.[0]?.retail_price || "0";
    const n = Number(p);
    return Number.isFinite(n) ? n : 0;
  }, [selectedVariant, product]);

  const getMockupPaths = (syncProductId) => [
    `/${syncProductId}_1.png`,
    `/${syncProductId}_2.png`,
    `/${syncProductId}_3.png`,
  ];

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedVariantId) {
      alert("Please select a size first!");
      return;
    }

    const v = selectedVariant;
    if (!v) {
      alert("Error: Could not find variant details.");
      return;
    }

    const cartItem = {
      // ✅ keep both for debugging + future use
      sync_product_id: product.sync_product_id,
      sync_variant_id: v.sync_variant_id,         // ✅ Printful fulfillment key for synced products
      catalog_variant_id: v.catalog_variant_id,   // ✅ optional but helpful

      name: v.name || product.name,
      price: v.retail_price,
      image: v.preview_url || product.thumbnail_url || "/Logo.jpeg",
      quantity: 1,
      is_synced: true,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = existingCart.find((item) => item.sync_variant_id === cartItem.sync_variant_id);

    if (existing) {
      existing.quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: "1.5rem",
          background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
        }}
      >
        Loading...
      </div>
    );
  }

  const heroImage = selectedVariant?.preview_url || product.thumbnail_url || "/Logo.jpeg";

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
          src={heroImage}
          alt={product.name}
          width={600}
          height={600}
          priority
          style={{
            borderRadius: "16px",
            boxShadow: "0 0 40px rgba(255,255,255,0.2)",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Scrollable Mockup Gallery (optional local images) */}
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
        {getMockupPaths(product.sync_product_id).map((path, index) => (
          <img
            key={index}
            src={path}
            alt={`${product.name} mockup ${index + 1}`}
            style={{
              flex: "0 0 auto",
              width: "480px",
              height: "480px",
              objectFit: "contain",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              scrollSnapAlign: "center",
              border: index === 1 ? "5px solid #ff6b6b" : "3px solid rgba(255,255,255,0.1)",
              transition: "all 0.3s ease",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>

      {/* Product Details */}
      <h1 style={{ fontSize: "3rem", fontWeight: "900", margin: "1rem 0" }}>{product.name}</h1>

      {!!product.description && (
        <p
          style={{
            fontSize: "1.4rem",
            maxWidth: "700px",
            margin: "1.5rem auto",
            lineHeight: "1.7",
            opacity: 0.9,
          }}
        >
          {product.description}
        </p>
      )}

      {/* Price */}
      <p style={{ fontSize: "2.4rem", fontWeight: "bold", color: "#ff6b6b", margin: "1.5rem 0" }}>
        ${currentPrice.toFixed(2)}
      </p>

      {/* Variant Selection */}
      {product.variants?.length > 0 && (
        <div style={{ margin: "2rem auto 2.5rem", maxWidth: "520px" }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem", fontWeight: "600" }}>
            Choose Your Variant:
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {product.variants.map((variant) => {
              const optionLabel = variant.name.split("/").slice(-2).join("/").trim(); // e.g. "Red / M"
              const isSelected = variant.sync_variant_id === selectedVariantId;

              return (
                <button
                  key={variant.sync_variant_id}
                  onClick={() => setSelectedVariantId(variant.sync_variant_id)}
                  style={{
                    padding: "10px 16px",
                    border: isSelected ? "3px solid #ff4444" : "1px solid #475569",
                    backgroundColor: isSelected ? "#ff444420" : "transparent",
                    color: isSelected ? "#ff4444" : "white",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {optionLabel}
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
