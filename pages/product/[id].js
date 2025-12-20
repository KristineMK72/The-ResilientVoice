// pages/product/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function parseLabel(variantName) {
  const parts = String(variantName || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  const size = parts.length ? parts[parts.length - 1] : "Size";
  const maybeColor = parts.length >= 2 ? parts[parts.length - 2] : null;
  const color =
    maybeColor && maybeColor.length <= 24 && !maybeColor.includes(" ")
      ? maybeColor
      : null;

  return { size, color, label: color ? `${color} / ${size}` : size };
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [added, setAdded] = useState(false);

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

        // Default to first variant that has SKU
        const firstValid = data?.variants?.find((v) => (v.sku || "").trim());
        setSelectedVariantId((firstValid || data?.variants?.[0])?.sync_variant_id || null);
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

  const heroImage = selectedVariant?.preview_url || product?.thumbnail_url || "/Logo.jpeg";

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const sku = (selectedVariant.sku || "").trim();
    if (!sku) {
      alert("This size is missing a SKU in Printful (external_id). Please bulk-edit and add one.");
      return;
    }

    const cartItem = {
      sync_product_id: product.sync_product_id,
      sync_variant_id: selectedVariant.sync_variant_id,
      catalog_variant_id: selectedVariant.catalog_variant_id,

      sku, // ✅ used to find Stripe price via lookup_key

      name: selectedVariant.name || product.name,
      price: Number(selectedVariant.retail_price || 0),
      image: selectedVariant.preview_url || product.thumbnail_url || "/Logo.jpeg",
      quantity: 1,
      is_synced: true,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = existingCart.find((i) => i.sync_variant_id === cartItem.sync_variant_id);

    if (existing) existing.quantity += 1;
    else existingCart.push(cartItem);

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "white" }}>
        Loading...
      </div>
    );
  }

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
      <div style={{ maxWidth: 520, margin: "0 auto 2rem" }}>
        <Image
          src={heroImage}
          alt={product.name}
          width={700}
          height={700}
          priority
          style={{
            borderRadius: 16,
            boxShadow: "0 0 40px rgba(255,255,255,0.2)",
            objectFit: "contain",
            transition: "transform 200ms ease",
          }}
        />
      </div>

      <h1 style={{ fontSize: "2.4rem", fontWeight: 900, margin: "1rem 0" }}>
        {product.name}
      </h1>

      {!!product.description && (
        <p style={{ maxWidth: 820, margin: "1rem auto", lineHeight: 1.7, opacity: 0.9 }}>
          {product.description}
        </p>
      )}

      <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#ff6b6b", margin: "1.5rem 0" }}>
        ${currentPrice.toFixed(2)}
      </p>

      {product.variants?.length > 0 && (
        <div style={{ margin: "2rem auto", maxWidth: 760 }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: 12, fontWeight: 700 }}>
            Choose your size:
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {product.variants.map((v) => {
              const { label } = parseLabel(v.name);
              const isSelected = v.sync_variant_id === selectedVariantId;
              const hasSku = !!(v.sku || "").trim();

              return (
                <button
                  key={v.sync_variant_id}
                  onClick={() => hasSku && setSelectedVariantId(v.sync_variant_id)}
                  disabled={!hasSku}
                  title={!hasSku ? "This size is missing SKU/external_id in Printful" : ""}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: isSelected ? "2px solid #ff4444" : "1px solid rgba(255,255,255,0.2)",
                    background: isSelected ? "rgba(255,68,68,0.18)" : "rgba(255,255,255,0.04)",
                    color: !hasSku ? "rgba(255,255,255,0.35)" : isSelected ? "#ff6666" : "white",
                    cursor: !hasSku ? "not-allowed" : "pointer",
                    transform: isSelected ? "translateY(-1px)" : "translateY(0)",
                    transition: "all 180ms ease",
                    opacity: !hasSku ? 0.55 : 1,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p style={{ marginTop: 12, opacity: 0.75, fontSize: 13 }}>
            If a size is disabled, it’s missing a Printful SKU/external_id (needed for Stripe mapping).
          </p>
        </div>
      )}

      {!added ? (
        <button
          onClick={handleAddToCart}
          style={{
            padding: "1.1rem 2.4rem",
            background: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(255,68,68,0.35)",
            transition: "transform 180ms ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Add to Cart
        </button>
      ) : (
        <div style={{ margin: "1.5rem 0" }}>
          <p style={{ color: "#4ade80", fontSize: "1.3rem", fontWeight: 800 }}>
            Added to cart!
          </p>
          <Link href="/cart" style={{ color: "#fff", textDecoration: "underline" }}>
            Go to Cart →
          </Link>
        </div>
      )}

      <div style={{ marginTop: "2.5rem" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "0.9rem 1.4rem",
            background: "linear-gradient(90deg, #ff4444, #4444ff)",
            color: "white",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1.05rem",
            cursor: "pointer",
            border: "none",
          }}
        >
          ← Keep Shopping
        </button>
      </div>
    </div>
  );
}
