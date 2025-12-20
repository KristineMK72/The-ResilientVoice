// pages/product/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function clean(v) {
  return String(v ?? "").trim().replace(/\r/g, "");
}

// Printful synced products often use external_id as the "SKU-like" identifier
function getVariantSku(variant) {
  return clean(variant?.sku || variant?.external_id || "");
}

function formatPrice(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num : 0;
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [added, setAdded] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      setPageError("");
      try {
        const res = await fetch(`/api/printful-product/${id}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Product fetch failed:", data);
          if (!cancelled) setPageError(data?.error || "Failed to load product.");
          return;
        }
        if (cancelled) return;

        setProduct(data);

        // Default to the first variant
        if (data?.variants?.length) {
          setSelectedVariantId(data.variants[0].sync_variant_id);
        }
      } catch (err) {
        console.error("Product fetch error:", err);
        if (!cancelled) setPageError("Network error loading product.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length || !selectedVariantId) return null;
    return (
      product.variants.find((v) => v.sync_variant_id === selectedVariantId) || null
    );
  }, [product, selectedVariantId]);

  const currentPrice = useMemo(() => {
    const p =
      selectedVariant?.retail_price ??
      product?.variants?.[0]?.retail_price ??
      "0";
    return formatPrice(p);
  }, [selectedVariant, product]);

  const heroImage =
    selectedVariant?.preview_url || product?.thumbnail_url || "/Logo.jpeg";

  // Optional local mockups (safe to keep; hides missing images)
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

    // IMPORTANT: treat external_id as SKU fallback
    const sku = getVariantSku(v);

    if (!sku) {
      alert("This size is missing a SKU/external_id, so it can't be purchased yet.");
      return;
    }

    const cartItem = {
      // identifiers
      sync_product_id: product.sync_product_id,
      sync_variant_id: v.sync_variant_id,
      catalog_variant_id: v.catalog_variant_id,

      // SKU-like value for Stripe lookup_key mapping (if your flow uses that)
      sku,

      // display
      name: v.name || product.name,
      price: Number(v.retail_price),
      image: v.preview_url || product.thumbnail_url || "/Logo.jpeg",
      quantity: 1,
      is_synced: true,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = existingCart.find(
      (item) => item.sync_variant_id === cartItem.sync_variant_id
    );

    if (existing) existing.quantity += 1;
    else existingCart.push(cartItem);

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "white",
          padding: "2rem",
          textAlign: "center",
          background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
        }}
      >
        <div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>Loading…</div>
          {pageError && (
            <div style={{ marginTop: "1rem", color: "#fca5a5" }}>{pageError}</div>
          )}
        </div>
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
      {/* Main Product Image */}
      <div style={{ maxWidth: "520px", margin: "0 auto 2rem" }}>
        <Image
          src={heroImage}
          alt={product.name}
          width={700}
          height={700}
          priority
          style={{
            borderRadius: "16px",
            boxShadow: "0 0 40px rgba(255,255,255,0.2)",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Optional local mockup gallery */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "16px",
          padding: "1rem",
          marginTop: "1.5rem",
          scrollSnapType: "x mandatory",
          justifyContent: "center",
        }}
      >
        {getMockupPaths(product.sync_product_id).map((path, index) => (
          <img
            key={index}
            src={path}
            alt={`${product.name} mockup ${index + 1}`}
            style={{
              flex: "0 0 auto",
              width: "420px",
              height: "420px",
              objectFit: "contain",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              scrollSnapAlign: "center",
              border: "2px solid rgba(255,255,255,0.08)",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>

      {/* Product Details */}
      <h1 style={{ fontSize: "3rem", fontWeight: 900, margin: "1.25rem 0" }}>
        {product.name}
      </h1>

      {!!product.description && (
        <p
          style={{
            fontSize: "1.15rem",
            maxWidth: "820px",
            margin: "1.25rem auto",
            lineHeight: 1.7,
            opacity: 0.92,
          }}
        >
          {product.description}
        </p>
      )}

      {/* Price */}
      <p
        style={{
          fontSize: "2.4rem",
          fontWeight: "bold",
          color: "#ff6b6b",
          margin: "1.5rem 0 0.5rem",
        }}
      >
        ${currentPrice.toFixed(2)}
      </p>

      {/* If selected size has no SKU/external_id, show a warning but don't break the whole page */}
      {selectedVariant && !getVariantSku(selectedVariant) && (
        <div style={{ marginTop: "0.75rem", color: "#fca5a5", fontWeight: 600 }}>
          This size is missing a SKU/external_id, so Stripe mapping can’t happen yet.
        </div>
      )}

      {/* Size Selection */}
      {product.variants?.length > 0 && (
        <div style={{ margin: "2rem auto 2.5rem", maxWidth: "720px" }}>
          <h3 style={{ fontSize: "1.35rem", marginBottom: "1rem", fontWeight: 700 }}>
            Choose your size:
          </h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            {product.variants.map((variant) => {
              const parts = String(variant.name || "")
                .split("/")
                .map((s) => s.trim())
                .filter(Boolean);

              // last token is usually size
              const size = parts.length ? parts[parts.length - 1] : "Size";

              // only disable if we truly have no sku/external_id
              const sku = getVariantSku(variant);
              const isUnavailable = !sku;

              const isSelected = variant.sync_variant_id === selectedVariantId;

              return (
                <button
                  key={variant.sync_variant_id}
                  onClick={() => !isUnavailable && setSelectedVariantId(variant.sync_variant_id)}
                  disabled={isUnavailable}
                  style={{
                    padding: "10px 16px",
                    border: isSelected ? "3px solid #ff4444" : "1px solid rgba(148,163,184,0.5)",
                    backgroundColor: isSelected ? "rgba(255,68,68,0.12)" : "transparent",
                    color: isUnavailable ? "rgba(148,163,184,0.8)" : isSelected ? "#ff6b6b" : "white",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: isUnavailable ? "not-allowed" : "pointer",
                    opacity: isUnavailable ? 0.45 : 1,
                    transform: isSelected ? "scale(1.03)" : "scale(1)",
                    transition: "transform 140ms ease, opacity 140ms ease, border 140ms ease",
                  }}
                  title={isUnavailable ? "Missing SKU/external_id (not purchasable yet)" : ""}
                  onMouseEnter={(e) => {
                    if (isUnavailable) return;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = isSelected ? "scale(1.03)" : "scale(1)";
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "10px", opacity: 0.7, fontSize: "0.95rem" }}>
            * Disabled sizes are missing SKU/external_id.
          </div>
        </div>
      )}

      {/* Add to Cart */}
      {!added ? (
        <button
          onClick={handleAddToCart}
          style={{
            padding: "1.1rem 3rem",
            background: "linear-gradient(90deg, #ff4444, #ff6b6b)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "1.35rem",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(255,68,68,0.35)",
            transform: "translateY(0)",
            transition: "transform 120ms ease, box-shadow 120ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 14px 38px rgba(255,68,68,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,68,68,0.35)";
          }}
        >
          Add to Cart
        </button>
      ) : (
        <div style={{ margin: "2rem 0" }}>
          <p style={{ color: "#4ade80", fontSize: "1.5rem", fontWeight: 900, marginBottom: "1rem" }}>
            Added to cart!
          </p>

          <Link href="/cart" style={{ textDecoration: "none" }}>
            <span
              style={{
                display: "inline-block",
                padding: "0.95rem 2.2rem",
                background: "white",
                color: "#ff4444",
                borderRadius: "12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Go to Cart →
            </span>
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
            border: "none",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "1.15rem",
            cursor: "pointer",
            opacity: 0.95,
          }}
        >
          ← Keep Shopping
        </button>
      </div>
    </div>
  );
}
