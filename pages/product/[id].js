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

  // Printful sync_variant_id
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  // Stripe Price ID for selected variant (important!)
  const [selectedStripePriceId, setSelectedStripePriceId] = useState(null);
  const [priceLookupError, setPriceLookupError] = useState("");

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

        // Default to first variant
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

  const heroImage =
    selectedVariant?.preview_url || product?.thumbnail_url || "/Logo.jpeg";

  const getMockupPaths = (syncProductId) => [
    `/${syncProductId}_1.png`,
    `/${syncProductId}_2.png`,
    `/${syncProductId}_3.png`,
  ];

  // ✅ Whenever selected variant changes, look up Stripe price id by SKU
  useEffect(() => {
    if (!selectedVariant) return;

    // SKU must exist for mapping
    const sku = (selectedVariant.sku || "").toString().trim();
    if (!sku) {
      setSelectedStripePriceId(null);
      setPriceLookupError("This variant is missing a SKU, so Stripe mapping can’t happen.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setPriceLookupError("");
        setSelectedStripePriceId(null);

        const res = await fetch(`/api/stripe-price-by-sku?sku=${encodeURIComponent(sku)}`);
        const data = await res.json();

        if (!res.ok) {
          if (!cancelled) setPriceLookupError(data?.error || "Could not find Stripe price for this SKU.");
          return;
        }

        if (!cancelled) setSelectedStripePriceId(data.price_id);
      } catch (e) {
        if (!cancelled) setPriceLookupError("Stripe lookup failed. Try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedVariant]);

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

    const sku = (v.sku || "").toString().trim();
    if (!sku) {
      alert("This variant has no SKU. It can’t be checked out yet.");
      return;
    }

    // This is the key to make checkout + Printful fulfillment work
    if (!selectedStripePriceId) {
      alert("Stripe price is still loading (or missing). Please wait a second and try again.");
      return;
    }

    const cartItem = {
      // Printful identifiers
      sync_product_id: product.sync_product_id,
      sync_variant_id: v.sync_variant_id,
      catalog_variant_id: v.catalog_variant_id,

      // ✅ Stripe mapping
      sku,
      stripe_price_id: selectedStripePriceId,

      // Display
      name: v.name || product.name,
      price: Number(v.retail_price),
      image: v.preview_url || product.thumbnail_url || "/Logo.jpeg",
      quantity: 1,

      is_synced: true,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = existingCart.find(
      (item) => item.stripe_price_id === cartItem.stripe_price_id
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
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
          marginTop: "2rem",
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
              border: index === 1 ? "5px solid #ff6b6b" : "3px solid rgba(255,255,255,0.1)",
              transition: "all 0.3s ease",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>

      <h1 style={{ fontSize: "3rem", fontWeight: "900", margin: "1.25rem 0" }}>
        {product.name}
      </h1>

      {!!product.description && (
        <p
          style={{
            fontSize: "1.2rem",
            maxWidth: "820px",
            margin: "1.25rem auto",
            lineHeight: "1.7",
            opacity: 0.9,
          }}
        >
          {product.description}
        </p>
      )}

      <p style={{ fontSize: "2.4rem", fontWeight: "bold", color: "#ff6b6b", margin: "1.5rem 0" }}>
        ${currentPrice.toFixed(2)}
      </p>

      {/* Stripe mapping status (helpful while testing) */}
      <div style={{ maxWidth: 720, margin: "0 auto 12px", opacity: 0.9 }}>
        {priceLookupError ? (
          <p style={{ color: "#f87171" }}>{priceLookupError}</p>
        ) : selectedStripePriceId ? (
          <p style={{ color: "#4ade80" }}>Stripe price linked ✅</p>
        ) : (
          <p style={{ color: "#eab308" }}>Linking Stripe price…</p>
        )}
      </div>

      {/* Variant Selection */}
      {product.variants?.length > 0 && (
        <div style={{ margin: "2rem auto 2.5rem", maxWidth: "720px" }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem", fontWeight: "600" }}>
            Choose Your Variant:
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {product.variants.map((variant) => {
              const parts = String(variant.name || "")
                .split("/")
                .map((s) => s.trim())
                .filter(Boolean);

              const size = parts.length ? parts[parts.length - 1] : "Variant";
              const maybeColor = parts.length >= 2 ? parts[parts.length - 2] : null;
              const color =
                maybeColor && maybeColor.length <= 20 && !maybeColor.includes(" ")
                  ? maybeColor
                  : null;

              const optionLabel = color ? `${color} / ${size}` : size;
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
          disabled={!selectedStripePriceId}
          style={{
            padding: "1.2rem 3rem",
            background: !selectedStripePriceId ? "#64748b" : "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.4rem",
            fontWeight: "bold",
            cursor: !selectedStripePriceId ? "not-allowed" : "pointer",
            boxShadow: "0 10px 30px rgba(255,68,68,0.4)",
            opacity: !selectedStripePriceId ? 0.8 : 1,
          }}
        >
          {selectedStripePriceId ? "Add to Cart" : "Linking Price…"}
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
