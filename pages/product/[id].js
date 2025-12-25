// pages/product/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function splitVariantParts(name = "") {
  return String(name)
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSizeFromVariantName(name = "") {
  const parts = splitVariantParts(name);
  return parts.length ? parts[parts.length - 1] : "Size";
}

function parseColorFromVariantName(name = "") {
  // Expected formats:
  // - "Product / Black / L"
  // - "Product / L" (no color)
  const parts = splitVariantParts(name);

  // If there are at least 3 parts, color is the second-to-last.
  if (parts.length >= 3) return parts[parts.length - 2];

  // Otherwise, treat as single-color product.
  return "Default";
}

// ✅ Optional: if you add custom images, drop them in /public/products/{sync_product_id}.png
function pickLocalImage(syncProductId) {
  if (!syncProductId) return null;
  return `/products/${syncProductId}.png`;
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  // Selected Printful sync_variant_id (fulfillment id)
  const [selectedSyncVariantId, setSelectedSyncVariantId] = useState(null);

  // Selected color label (derived from variant naming)
  const [selectedColor, setSelectedColor] = useState(null);

  // Map of SKU -> Stripe price info (optional)
  // { [sku]: { available: boolean, price_id?: string } }
  const [availability, setAvailability] = useState({});
  const [checking, setChecking] = useState(false);

  // ✅ Image fallback state (local -> printful -> fallback.png)
  const [imgSrc, setImgSrc] = useState("/fallback.png");
  const [imgTriedLocal, setImgTriedLocal] = useState(false);

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

        // Default: select first variant AND its color
        if (data?.variants?.length) {
          const first = data.variants[0];
          setSelectedSyncVariantId(first.sync_variant_id);
          setSelectedColor(parseColorFromVariantName(first.name));
        }

        // OPTIONAL: check Stripe mapping for SKUs so we can disable only truly unavailable sizes
        // If you don't have this endpoint yet, it will silently skip.
        setChecking(true);
        try {
          const skus = (data.variants || [])
            .map((v) => (v.sku || "").trim())
            .filter(Boolean);

          if (skus.length) {
            const checkRes = await fetch("/api/stripe/check-skus", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ skus }),
            });

            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (!cancelled && checkData?.availability) {
                setAvailability(checkData.availability);
              }
            }
          }
        } catch (e) {
          // ignore if endpoint doesn't exist yet
        } finally {
          if (!cancelled) setChecking(false);
        }
      } catch (err) {
        console.error("Product fetch error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const variants = product?.variants || [];

  // Group all variants by color (based on naming convention)
  const variantsByColor = useMemo(() => {
    const map = {};
    for (const v of variants) {
      const color = parseColorFromVariantName(v.name);
      if (!map[color]) map[color] = [];
      map[color].push(v);
    }

    // Keep sizes ordered nicely by common progression if possible
    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
    for (const color of Object.keys(map)) {
      map[color].sort((a, b) => {
        const sa = parseSizeFromVariantName(a.name);
        const sb = parseSizeFromVariantName(b.name);
        const ia = sizeOrder.indexOf(sa);
        const ib = sizeOrder.indexOf(sb);
        if (ia === -1 && ib === -1) return String(sa).localeCompare(String(sb));
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }

    return map;
  }, [variants]);

  const availableColors = useMemo(() => {
    const keys = Object.keys(variantsByColor);
    // If only "Default", treat as single-color
    return keys;
  }, [variantsByColor]);

  // Ensure selectedColor is always valid when variants load/change
  useEffect(() => {
    if (!variants.length) return;

    // If nothing selected yet, pick first color
    if (!selectedColor) {
      const firstColor = parseColorFromVariantName(variants[0].name);
      setSelectedColor(firstColor);
      return;
    }

    // If current selectedColor no longer exists, pick first available
    if (!variantsByColor[selectedColor]) {
      const firstColor = Object.keys(variantsByColor)[0] || "Default";
      setSelectedColor(firstColor);
      return;
    }
  }, [variants, variantsByColor, selectedColor]);

  // Variants shown in the size selector depend on selectedColor
  const filteredVariants = useMemo(() => {
    if (!selectedColor) return variants;
    return variantsByColor[selectedColor] || [];
  }, [variants, variantsByColor, selectedColor]);

  // Ensure selected variant matches selected color; if not, snap to first for that color
  useEffect(() => {
    if (!filteredVariants.length) return;

    const match = filteredVariants.find((v) => v.sync_variant_id === selectedSyncVariantId);
    if (match) return;

    setSelectedSyncVariantId(filteredVariants[0].sync_variant_id);
  }, [filteredVariants, selectedSyncVariantId]);

  const selectedVariant = useMemo(() => {
    if (!variants.length || !selectedSyncVariantId) return null;
    return variants.find((v) => v.sync_variant_id === selectedSyncVariantId) || null;
  }, [variants, selectedSyncVariantId]);

  // ✅ Prefer selected variant image (Printful), then product thumbnail, then fallback
  const heroRemote =
    selectedVariant?.preview_url || product?.thumbnail_url || "/fallback.png";

  // ✅ Prefer local image if it exists in /public/products/{sync_product_id}.png
  const heroLocal = pickLocalImage(product?.sync_product_id);

  // ✅ Reset image whenever selected variant/product changes (local-first)
  useEffect(() => {
    if (heroLocal) {
      setImgSrc(heroLocal);
      setImgTriedLocal(true);
    } else {
      setImgSrc(heroRemote);
      setImgTriedLocal(false);
    }
  }, [heroLocal, heroRemote]);

  // Price shown on page: uses Printful retail_price directly
  const displayPrice = useMemo(() => {
    const p = selectedVariant?.retail_price ?? filteredVariants?.[0]?.retail_price ?? "0";
    const n = Number(p);
    return Number.isFinite(n) ? n : 0;
  }, [selectedVariant, filteredVariants]);

  const selectedSku = useMemo(() => {
    return (selectedVariant?.sku || "").trim();
  }, [selectedVariant]);

  const selectedIsMissingSku = !selectedSku;

  // If we have availability info, use it. If we don't, treat as available (do NOT disable everything).
  const selectedIsUnavailable = useMemo(() => {
    if (!selectedSku) return true; // missing SKU really is a blocker
    const entry = availability[selectedSku];
    if (!entry) return false; // unknown = allow
    return entry.available === false;
  }, [selectedSku, availability]);

  const addToCart = () => {
    if (!product || !selectedVariant) return;

    const sku = (selectedVariant.sku || "").trim();
    if (!sku) {
      alert("This option is missing a SKU, so checkout can't map it to Stripe yet.");
      return;
    }

    // If we know it's unavailable, block
    const entry = availability[sku];
    if (entry && entry.available === false) {
      alert("That option isn't available right now.");
      return;
    }

    const cartItem = {
      sync_product_id: product.sync_product_id,
      sync_variant_id: selectedVariant.sync_variant_id, // Printful fulfillment id
      catalog_variant_id: selectedVariant.catalog_variant_id, // Printful catalog variant id (optional)

      sku, // ✅ IMPORTANT: use this later to map to Stripe lookup_key
      name: selectedVariant.name || product.name,
      price: Number(selectedVariant.retail_price || 0),
      image: heroRemote || "/fallback.png",
      quantity: 1,
      is_synced: true,

      // nice extras for UI
      color: parseColorFromVariantName(selectedVariant.name),
      size: parseSizeFromVariantName(selectedVariant.name),
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = existingCart.find((item) => item.sku === cartItem.sku);

    if (existing) existing.quantity += 1;
    else existingCart.push(cartItem);

    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: "1.2rem",
          background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
        }}
      >
        Loading...
      </div>
    );
  }

  const showColorPicker =
    availableColors.length > 1 ||
    (availableColors.length === 1 && availableColors[0] !== "Default");

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
      {/* Product Image */}
      <div style={{ maxWidth: "560px", margin: "0 auto 1.5rem" }}>
        <Image
          src={imgSrc}
          alt={product.name}
          width={700}
          height={700}
          priority
          style={{
            borderRadius: "18px",
            boxShadow: "0 0 50px rgba(255,255,255,0.14)",
            objectFit: "contain",
          }}
          onError={() => {
            // If local fails, try Printful remote; if remote fails, fallback.png
            if (imgTriedLocal && imgSrc !== heroRemote) {
              setImgSrc(heroRemote);
              setImgTriedLocal(false);
              return;
            }
            setImgSrc("/fallback.png");
          }}
        />
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "1rem 0" }}>
        {product.name}
      </h1>

      {!!product.description && (
        <p
          style={{
            fontSize: "1.05rem",
            maxWidth: "840px",
            margin: "0.75rem auto 1.25rem",
            lineHeight: 1.6,
            opacity: 0.9,
          }}
        >
          {product.description}
        </p>
      )}

      {/* Price */}
      <p
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#ff6b6b",
          margin: "1rem 0 1.25rem",
        }}
      >
        ${displayPrice.toFixed(2)}
      </p>

      {/* Options */}
      {variants.length > 0 && (
        <div style={{ margin: "1.5rem auto 1.25rem", maxWidth: "860px" }}>
          {/* Color selection */}
          {showColorPicker && (
            <div style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700 }}>
                Choose color:
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: "12px",
                }}
              >
                {availableColors.map((color) => {
                  const isSelected = color === selectedColor;
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        // snap selection to first variant in that color
                        const first = variantsByColor[color]?.[0];
                        if (first) setSelectedSyncVariantId(first.sync_variant_id);
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "999px",
                        border: isSelected
                          ? "2px solid #ff4444"
                          : "1px solid rgba(148,163,184,0.35)",
                        background: isSelected
                          ? "rgba(255,68,68,0.16)"
                          : "rgba(255,255,255,0.02)",
                        color: isSelected ? "#ff6b6b" : "white",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: 800,
                        transition: "all 0.15s ease",
                      }}
                      aria-label={`Color ${color}`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selection */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700 }}>
              Choose size:
            </h3>
            {checking && (
              <span style={{ fontSize: "0.95rem", opacity: 0.8 }}>
                checking availability…
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
              marginTop: "12px",
            }}
          >
            {filteredVariants.map((variant) => {
              const size = parseSizeFromVariantName(variant.name);
              const sku = (variant.sku || "").trim();

              // Disable only if truly missing SKU OR known unavailable
              const known = sku ? availability[sku] : null;
              const disabled = !sku || (known && known.available === false);

              const isSelected = variant.sync_variant_id === selectedSyncVariantId;

              return (
                <button
                  key={variant.sync_variant_id}
                  onClick={() => !disabled && setSelectedSyncVariantId(variant.sync_variant_id)}
                  disabled={disabled}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: isSelected
                      ? "2px solid #ff4444"
                      : "1px solid rgba(148,163,184,0.35)",
                    background: disabled
                      ? "rgba(148,163,184,0.08)"
                      : isSelected
                      ? "rgba(255,68,68,0.16)"
                      : "rgba(255,255,255,0.02)",
                    color: disabled
                      ? "rgba(255,255,255,0.35)"
                      : isSelected
                      ? "#ff6b6b"
                      : "white",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: 700,
                    opacity: disabled ? 0.7 : 1,
                    transform: isSelected ? "translateY(-1px)" : "none",
                    transition: "all 0.15s ease",
                  }}
                  title={
                    !sku
                      ? "SKU missing for this size"
                      : known?.available === false
                      ? "Not available"
                      : ""
                  }
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Clear messaging */}
          <div style={{ marginTop: 12, minHeight: 22 }}>
            {selectedIsMissingSku ? (
              <p style={{ color: "#fbbf24", margin: 0, fontWeight: 700 }}>
                This option is missing a SKU, so Stripe mapping can’t happen.
              </p>
            ) : selectedIsUnavailable ? (
              <p style={{ color: "#f87171", margin: 0, fontWeight: 700 }}>
                This option is currently unavailable.
              </p>
            ) : (
              <p style={{ opacity: 0.75, margin: 0 }}>
                Selected:{" "}
                <span style={{ fontWeight: 800 }}>
                  {showColorPicker && selectedVariant
                    ? `${parseColorFromVariantName(selectedVariant.name)} / `
                    : ""}
                  {parseSizeFromVariantName(selectedVariant?.name)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add to cart */}
      {!added ? (
        <button
          onClick={addToCart}
          disabled={selectedIsMissingSku || selectedIsUnavailable}
          style={{
            padding: "1.15rem 2.6rem",
            background:
              selectedIsMissingSku || selectedIsUnavailable
                ? "rgba(148,163,184,0.35)"
                : "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "1.25rem",
            fontWeight: 900,
            cursor:
              selectedIsMissingSku || selectedIsUnavailable ? "not-allowed" : "pointer",
            boxShadow: "0 10px 26px rgba(255,68,68,0.28)",
            transition: "transform 0.12s ease",
          }}
        >
          Add to Cart
        </button>
      ) : (
        <div style={{ margin: "1.25rem 0" }}>
          <p style={{ color: "#4ade80", fontSize: "1.35rem", fontWeight: 900, marginBottom: "0.75rem" }}>
            Added to cart!
          </p>
          <Link href="/cart" style={{ textDecoration: "none" }}>
            Go to Cart →
          </Link>
        </div>
      )}

      {/* Back */}
      <div style={{ marginTop: "2.25rem" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "0.9rem 1.7rem",
            background: "linear-gradient(90deg, #ff4444, #4444ff)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          ← Keep Shopping
        </button>
      </div>
    </div>
  );
}
