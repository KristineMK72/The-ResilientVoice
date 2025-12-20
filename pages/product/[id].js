// pages/product/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function money(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(2) : "0.00";
}

function parseVariantLabel(variantName) {
  const parts = String(variantName || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  // Size is usually last segment
  const size = parts.length ? parts[parts.length - 1] : "Size";

  // Try to guess color (2nd-to-last) only if it looks like a short token
  const maybeColor = parts.length >= 2 ? parts[parts.length - 2] : null;
  const color =
    maybeColor && maybeColor.length <= 20 && !maybeColor.includes(" ")
      ? maybeColor
      : null;

  return { size, color };
}

/**
 * Define "available" for checkout.
 * The #1 reason your site shows "missing a SKU, so Stripe mapping can’t happen":
 * - if a variant has no SKU, you can’t look up Stripe prices by lookup_key reliably.
 *
 * So we disable anything without a SKU.
 *
 * If you want different rules later, change only this function.
 */
function isVariantPurchasable(v) {
  const sku = String(v?.sku || "").trim();
  const price = Number(v?.retail_price);
  if (!sku) return false;
  if (!Number.isFinite(price) || price <= 0) return false;
  if (!v?.sync_variant_id) return false;
  return true;
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  // Selected Printful sync_variant_id
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  // UX messages
  const [variantMsg, setVariantMsg] = useState("");

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

        // Default select: first purchasable variant, else just first variant
        const variants = data?.variants || [];
        const firstGood = variants.find(isVariantPurchasable);
        const fallback = variants[0];

        if (firstGood?.sync_variant_id) {
          setSelectedVariantId(firstGood.sync_variant_id);
        } else if (fallback?.sync_variant_id) {
          setSelectedVariantId(fallback.sync_variant_id);
        }
      } catch (err) {
        console.error("Product fetch error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const variants = useMemo(() => product?.variants || [], [product]);

  const selectedVariant = useMemo(() => {
    if (!variants.length || !selectedVariantId) return null;
    return variants.find((v) => v.sync_variant_id === selectedVariantId) || null;
  }, [variants, selectedVariantId]);

  const heroImage =
    selectedVariant?.preview_url || product?.thumbnail_url || "/Logo.jpeg";

  const currentPrice = useMemo(() => {
    // Prefer selected variant price, fallback to first purchasable variant, then first variant.
    const chosen =
      selectedVariant ||
      variants.find(isVariantPurchasable) ||
      variants[0] ||
      null;

    const p = chosen?.retail_price ?? "0";
    const n = Number(p);
    return Number.isFinite(n) ? n : 0;
  }, [selectedVariant, variants]);

  const availability = useMemo(() => {
    // Map: sync_variant_id -> purchasable boolean
    const map = new Map();
    for (const v of variants) {
      map.set(v.sync_variant_id, isVariantPurchasable(v));
    }
    return map;
  }, [variants]);

  const selectedIsPurchasable = useMemo(() => {
    if (!selectedVariant) return false;
    return availability.get(selectedVariant.sync_variant_id) === true;
  }, [selectedVariant, availability]);

  const handleSelectVariant = (variant) => {
    setVariantMsg("");

    const ok = isVariantPurchasable(variant);
    if (!ok) {
      // Let them tap it, but explain why it’s disabled for checkout.
      setVariantMsg(
        "That size isn’t available for checkout yet (missing SKU / price mapping)."
      );
      return;
    }

    setSelectedVariantId(variant.sync_variant_id);
  };

  const handleAddToCart = () => {
    setVariantMsg("");

    if (!product) return;

    if (!selectedVariant) {
      setVariantMsg("Please choose a size.");
      return;
    }

    if (!selectedIsPurchasable) {
      setVariantMsg(
        "That size can’t be purchased yet (missing SKU / price mapping)."
      );
      return;
    }

    const v = selectedVariant;

    const cartItem = {
      sync_product_id: product.sync_product_id,
      sync_variant_id: v.sync_variant_id,
      catalog_variant_id: v.catalog_variant_id,

      // Helpful for Stripe mapping / debugging
      sku: v.sku,

      // Display
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

    if (existing) {
      existing.quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: "1.25rem",
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
        padding: "3.5rem 1rem 5rem",
        color: "white",
        textAlign: "center",
      }}
    >
      {/* HERO */}
      <div style={{ maxWidth: "560px", margin: "0 auto 1.75rem" }}>
        <div
          style={{
            borderRadius: "18px",
            padding: "10px",
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 0 40px rgba(255,255,255,0.12)",
          }}
        >
          <Image
            src={heroImage}
            alt={product.name}
            width={900}
            height={900}
            priority
            style={{
              borderRadius: "14px",
              objectFit: "contain",
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      </div>

      {/* TITLE / DESC */}
      <h1 style={{ fontSize: "2.3rem", fontWeight: 900, margin: "1rem 0" }}>
        {product.name}
      </h1>

      {!!product.description && (
        <p
          style={{
            fontSize: "1.05rem",
            maxWidth: "860px",
            margin: "0.75rem auto 0",
            lineHeight: 1.7,
            opacity: 0.92,
            padding: "0 8px",
          }}
        >
          {product.description}
        </p>
      )}

      {/* PRICE */}
      <p
        style={{
          fontSize: "2.1rem",
          fontWeight: "bold",
          color: "#ff6b6b",
          margin: "1.4rem 0 0.25rem",
        }}
      >
        ${money(currentPrice)}
      </p>

      {/* SIZE PICKER */}
      {variants.length > 0 && (
        <div style={{ margin: "2rem auto 1.5rem", maxWidth: "820px" }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: 700 }}>
            Choose Your Size:
          </h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
              padding: "0 6px",
            }}
          >
            {variants.map((variant) => {
              const { size, color } = parseVariantLabel(variant.name);
              const label = color ? `${size} · ${color}` : size;

              const purchasable = isVariantPurchasable(variant);
              const isSelected = variant.sync_variant_id === selectedVariantId;

              return (
                <button
                  key={variant.sync_variant_id}
                  onClick={() => handleSelectVariant(variant)}
                  disabled={!purchasable}
                  title={
                    purchasable
                      ? "Select size"
                      : "Unavailable (missing SKU/price mapping)"
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    minWidth: "72px",
                    border: isSelected
                      ? "2px solid #ff4444"
                      : "1px solid rgba(148,163,184,0.55)",
                    background: isSelected
                      ? "rgba(255,68,68,0.18)"
                      : "rgba(255,255,255,0.02)",
                    color: purchasable ? "white" : "rgba(255,255,255,0.35)",
                    cursor: purchasable ? "pointer" : "not-allowed",
                    fontWeight: 700,
                    fontSize: "0.98rem",
                    letterSpacing: "0.2px",

                    // ✅ simple animation
                    transform: isSelected ? "scale(1.06)" : "scale(1)",
                    transition: "transform 160ms ease, border 160ms ease, background 160ms ease, opacity 160ms ease",
                    opacity: purchasable ? 1 : 0.55,
                    position: "relative",
                  }}
                >
                  {label}

                  {/* tiny badge for disabled */}
                  {!purchasable && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        fontSize: "0.68rem",
                        padding: "4px 6px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.16)",
                      }}
                    >
                      unavailable
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Helper message */}
          {!!variantMsg && (
            <div
              style={{
                marginTop: "14px",
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.95)",
                maxWidth: "720px",
              }}
            >
              {variantMsg}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: "1.5rem" }}>
        {!added ? (
          <button
            onClick={handleAddToCart}
            style={{
              padding: "1.05rem 2.6rem",
              background: selectedIsPurchasable ? "#ff4444" : "rgba(255,68,68,0.35)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontSize: "1.2rem",
              fontWeight: 900,
              cursor: selectedIsPurchasable ? "pointer" : "not-allowed",
              boxShadow: selectedIsPurchasable
                ? "0 10px 30px rgba(255,68,68,0.35)"
                : "none",
              transform: selectedIsPurchasable ? "translateY(0)" : "translateY(0)",
              transition: "transform 160ms ease, background 160ms ease, box-shadow 160ms ease",
            }}
            onMouseDown={(e) => {
              if (!selectedIsPurchasable) return;
              e.currentTarget.style.transform = "translateY(2px)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Add to Cart
          </button>
        ) : (
          <div style={{ marginTop: "1.2rem" }}>
            <div
              style={{
                display: "inline-block",
                padding: "12px 16px",
                borderRadius: "14px",
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.25)",
                color: "#4ade80",
                fontWeight: 900,
                fontSize: "1.1rem",
                transform: "scale(1)",
                animation: "pop 260ms ease-out",
              }}
            >
              Added to cart ✅
            </div>

            <div style={{ marginTop: "14px" }}>
              <Link href="/cart" legacyBehavior>
                <a
                  style={{
                    display: "inline-block",
                    padding: "0.95rem 2.2rem",
                    background: "white",
                    color: "#ff4444",
                    borderRadius: "14px",
                    fontWeight: 900,
                    textDecoration: "none",
                  }}
                >
                  Go to Cart →
                </a>
              </Link>
            </div>

            <style jsx>{`
              @keyframes pop {
                0% { transform: scale(0.95); opacity: 0.3; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* BACK */}
      <div style={{ marginTop: "2.6rem" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "0.95rem 1.8rem",
            background: "linear-gradient(90deg, #ff4444, #4444ff)",
            color: "white",
            borderRadius: "14px",
            fontWeight: 800,
            fontSize: "1.1rem",
            cursor: "pointer",
            border: "none",
            boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
          }}
        >
          ← Keep Shopping
        </button>
      </div>
    </div>
  );
}
