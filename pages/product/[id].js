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
  const parts = splitVariantParts(name);
  if (parts.length >= 3) return parts[parts.length - 2];
  return "Default";
}

// Build candidate local image URLs for a product.
// We don't know how many you have, so we try a few common slots.
function buildLocalCandidates(productId) {
  if (!productId) return [];
  const maxSlots = 6; // adjust if you ever want more
  const out = [];
  for (let i = 1; i <= maxSlots; i++) out.push(`/${productId}_${i}.png`);
  return out;
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  const [selectedSyncVariantId, setSelectedSyncVariantId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [availability, setAvailability] = useState({});
  const [checking, setChecking] = useState(false);

  // Gallery state
  const [localGallery, setLocalGallery] = useState([]); // confirmed existing local images
  const [activeImage, setActiveImage] = useState(null); // string url

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

        if (data?.variants?.length) {
          const first = data.variants[0];
          setSelectedSyncVariantId(first.sync_variant_id);
          setSelectedColor(parseColorFromVariantName(first.name));
        }

        // OPTIONAL: Stripe sku checks
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
          // ignore
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

  const variantsByColor = useMemo(() => {
    const map = {};
    for (const v of variants) {
      const color = parseColorFromVariantName(v.name);
      if (!map[color]) map[color] = [];
      map[color].push(v);
    }

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

  const availableColors = useMemo(() => Object.keys(variantsByColor), [variantsByColor]);

  useEffect(() => {
    if (!variants.length) return;

    if (!selectedColor) {
      setSelectedColor(parseColorFromVariantName(variants[0].name));
      return;
    }

    if (!variantsByColor[selectedColor]) {
      setSelectedColor(Object.keys(variantsByColor)[0] || "Default");
    }
  }, [variants, variantsByColor, selectedColor]);

  const filteredVariants = useMemo(() => {
    if (!selectedColor) return variants;
    return variantsByColor[selectedColor] || [];
  }, [variants, variantsByColor, selectedColor]);

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

  const remoteSrc =
    selectedVariant?.preview_url || product?.thumbnail_url || "/fallback.png";

  // Build/validate local gallery images whenever product changes
  useEffect(() => {
    const pid = product?.sync_product_id;
    if (!pid) return;

    let alive = true;
    const candidates = buildLocalCandidates(pid);

    // Validate existence by trying to load images in the browser
    (async () => {
      const checks = await Promise.all(
        candidates.map(
          (src) =>
            new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve(src);
              img.onerror = () => resolve(null);
              img.src = src;
            })
        )
      );

      const existing = checks.filter(Boolean);

      if (!alive) return;
      setLocalGallery(existing);

      // Set active image:
      // prefer remote (variant-specific) for accuracy; if user clicks thumb it changes
      setActiveImage(remoteSrc);
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.sync_product_id]);

  // When variant changes, reset to accurate remote image (unless user intentionally chose a local thumb)
  useEffect(() => {
    setActiveImage(remoteSrc);
  }, [remoteSrc]);

  const displayPrice = useMemo(() => {
    const p = selectedVariant?.retail_price ?? filteredVariants?.[0]?.retail_price ?? "0";
    const n = Number(p);
    return Number.isFinite(n) ? n : 0;
  }, [selectedVariant, filteredVariants]);

  const selectedSku = useMemo(() => (selectedVariant?.sku || "").trim(), [selectedVariant]);
  const selectedIsMissingSku = !selectedSku;

  const selectedIsUnavailable = useMemo(() => {
    if (!selectedSku) return true;
    const entry = availability[selectedSku];
    if (!entry) return false;
    return entry.available === false;
  }, [selectedSku, availability]);

  const addToCart = () => {
    if (!product || !selectedVariant) return;

    const sku = (selectedVariant.sku || "").trim();
    if (!sku) {
      alert("This option is missing a SKU, so checkout can't map it to Stripe yet.");
      return;
    }

    const entry = availability[sku];
    if (entry && entry.available === false) {
      alert("That option isn't available right now.");
      return;
    }

    const cartItem = {
      sync_product_id: product.sync_product_id,
      sync_variant_id: selectedVariant.sync_variant_id,
      catalog_variant_id: selectedVariant.catalog_variant_id,
      sku,
      name: selectedVariant.name || product.name,
      price: Number(selectedVariant.retail_price || 0),
      image: remoteSrc || "/fallback.png",
      quantity: 1,
      is_synced: true,
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

  // Gallery list: remote first (accurate), then local extras
  const galleryList = useMemo(() => {
    const list = [remoteSrc, ...localGallery];
    // de-dupe
    return Array.from(new Set(list.filter(Boolean)));
  }, [remoteSrc, localGallery]);

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
      <div style={{ maxWidth: "560px", margin: "0 auto 1rem" }}>
        <Image
          src={activeImage || remoteSrc}
          alt={product.name}
          width={700}
          height={700}
          priority
          style={{
            borderRadius: "18px",
            boxShadow: "0 0 50px rgba(255,255,255,0.14)",
            objectFit: "contain",
          }}
          onError={() => setActiveImage("/fallback.png")}
        />

        {/* Thumbnails */}
        {galleryList.length > 1 && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {galleryList.map((src) => {
              const isActive = (activeImage || remoteSrc) === src;
              return (
                <button
                  key={src}
                  onClick={() => setActiveImage(src)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: isActive ? "2px solid #ff4444" : "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.06)",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  aria-label="Preview image"
                >
                  <img
                    src={src}
                    alt="thumb"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "1rem 0" }}>
        {product.name}
      </h1>

      {/* Price */}
      <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#ff6b6b", margin: "1rem 0 1.25rem" }}>
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
            {checking && <span style={{ fontSize: "0.95rem", opacity: 0.8 }}>checking availability…</span>}
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
                    border: isSelected ? "2px solid #ff4444" : "1px solid rgba(148,163,184,0.35)",
                    background: disabled
                      ? "rgba(148,163,184,0.08)"
                      : isSelected
                      ? "rgba(255,68,68,0.16)"
                      : "rgba(255,255,255,0.02)",
                    color: disabled ? "rgba(255,255,255,0.35)" : isSelected ? "#ff6b6b" : "white",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: 700,
                    opacity: disabled ? 0.7 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>

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
                  {showColorPicker && selectedVariant ? `${parseColorFromVariantName(selectedVariant.name)} / ` : ""}
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
            background: selectedIsMissingSku || selectedIsUnavailable ? "rgba(148,163,184,0.35)" : "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "1.25rem",
            fontWeight: 900,
            cursor: selectedIsMissingSku || selectedIsUnavailable ? "not-allowed" : "pointer",
            boxShadow: "0 10px 26px rgba(255,68,68,0.28)",
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
