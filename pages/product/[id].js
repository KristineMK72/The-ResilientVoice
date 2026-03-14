// pages/product/[id].js

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* -----------------------------
   Variant parsing helpers
------------------------------ */
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

/* -----------------------------
   Local image convention
   /public/{id}_1.png
   /public/{id}_2.png
   /public/{id}_3.png
   ...
------------------------------ */
function buildLocalImageList(syncProductId, max = 8) {
  if (!syncProductId) return [];
  return Array.from({ length: max }, (_, i) => `/${syncProductId}_${i + 1}.png`);
}

function absoluteUrl(path = "") {
  if (!path) return "https://www.gritandgrace.buzz/fallback.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `https://www.gritandgrace.buzz${path.startsWith("/") ? path : `/${path}`}`;
}

function buildDescription(product) {
  if (product?.description && String(product.description).trim()) {
    return String(product.description).trim().slice(0, 200);
  }
  return "Minnesota-inspired apparel from Grit & Grace.";
}

export default function ProductPage({ initialProduct, productId }) {
  const router = useRouter();

  const [product] = useState(initialProduct || null);
  const [added, setAdded] = useState(false);

  // Selected Printful sync_variant_id
  const [selectedSyncVariantId, setSelectedSyncVariantId] = useState(null);

  // Color selection
  const [selectedColor, setSelectedColor] = useState(null);

  // Stripe availability map
  const [availability, setAvailability] = useState({});
  const [checking, setChecking] = useState(false);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImage, setActiveImage] = useState("/fallback.png");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const variants = product?.variants || [];

  /* -----------------------------
     Default variant selection
  ------------------------------ */
  useEffect(() => {
    if (!product?.variants?.length) return;

    const first = product.variants[0];
    setSelectedSyncVariantId(first.sync_variant_id);
    setSelectedColor(parseColorFromVariantName(first.name));
  }, [product]);

  /* -----------------------------
     Optional SKU availability check
  ------------------------------ */
  useEffect(() => {
    if (!product?.variants?.length) return;

    let cancelled = false;

    (async () => {
      setChecking(true);
      try {
        const skus = (product.variants || [])
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
        console.error("SKU availability check failed:", e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [product]);

  /* -----------------------------
     Group variants by color
  ------------------------------ */
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

  /* -----------------------------
     Gallery image sources
     Priority:
     - local /{id}_1.png, /{id}_2.png, etc
     - selected variant preview
     - product thumbnail
  ------------------------------ */
  const localCandidates = useMemo(() => {
    return buildLocalImageList(product?.sync_product_id, 8);
  }, [product?.sync_product_id]);

  const remoteCandidates = useMemo(() => {
    return [
      selectedVariant?.preview_url || null,
      product?.thumbnail_url || null,
    ].filter(Boolean);
  }, [selectedVariant?.preview_url, product?.thumbnail_url]);

  useEffect(() => {
    let cancelled = false;

    async function probeImages() {
      const candidates = [...localCandidates, ...remoteCandidates].filter(Boolean);
      const uniqueCandidates = [...new Set(candidates)];

      if (!uniqueCandidates.length) {
        setGalleryImages(["/fallback.png"]);
        setActiveImage("/fallback.png");
        return;
      }

      async function exists(src) {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });
      }

      const valid = [];
      for (const src of uniqueCandidates) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await exists(src);
        if (ok) valid.push(src);
      }

      if (cancelled) return;

      if (valid.length) {
        setGalleryImages(valid);
        setActiveImage((prev) => (valid.includes(prev) ? prev : valid[0]));
      } else {
        setGalleryImages(["/fallback.png"]);
        setActiveImage("/fallback.png");
      }
    }

    probeImages();

    return () => {
      cancelled = true;
    };
  }, [localCandidates, remoteCandidates]);

  /* -----------------------------
     Price + availability
  ------------------------------ */
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

  const activeImageIndex = useMemo(() => {
    return galleryImages.findIndex((img) => img === activeImage);
  }, [galleryImages, activeImage]);

  const goPrevImage = () => {
    if (!galleryImages.length) return;
    const prevIndex = activeImageIndex <= 0 ? galleryImages.length - 1 : activeImageIndex - 1;
    setActiveImage(galleryImages[prevIndex]);
  };

  const goNextImage = () => {
    if (!galleryImages.length) return;
    const nextIndex = activeImageIndex >= galleryImages.length - 1 ? 0 : activeImageIndex + 1;
    setActiveImage(galleryImages[nextIndex]);
  };

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
      image: activeImage || product?.thumbnail_url || "/fallback.png",
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

  useEffect(() => {
    function handleKeyDown(e) {
      if (!lightboxOpen) return;

      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrevImage();
      if (e.key === "ArrowRight") goNextImage();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, activeImageIndex, galleryImages]);

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
        Product not found.
      </div>
    );
  }

  const showColorPicker =
    availableColors.length > 1 ||
    (availableColors.length === 1 && availableColors[0] !== "Default");

  const metaTitle = `${product.name} | Grit & Grace`;
  const metaDescription = buildDescription(product);
  const metaImage = absoluteUrl(
    product?.thumbnail_url || galleryImages?.[0] || "/fallback.png"
  );
  const canonicalUrl = `https://www.gritandgrace.buzz/product/${productId}`;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Grit & Grace" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:image:alt" content={product.name} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #0f172a 0%, #000 100%)",
          padding: "4rem 1rem",
          color: "white",
          textAlign: "center",
        }}
      >
        {/* Main image + gallery thumbnails */}
        <div style={{ maxWidth: "720px", margin: "0 auto 1.5rem" }}>
          <button
            onClick={() => setLightboxOpen(true)}
            style={{
              display: "block",
              width: "100%",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "zoom-in",
            }}
            aria-label="Open product image gallery"
          >
            <Image
              src={activeImage || "/fallback.png"}
              alt={product.name}
              width={700}
              height={700}
              priority
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "18px",
                boxShadow: "0 0 50px rgba(255,255,255,0.14)",
                objectFit: "contain",
                background: "rgba(255,255,255,0.02)",
              }}
            />
          </button>

          {galleryImages.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              {galleryImages.map((img, index) => {
                const isSelected = img === activeImage;

                return (
                  <button
                    key={`${img}-${index}`}
                    onClick={() => setActiveImage(img)}
                    style={{
                      border: isSelected
                        ? "2px solid #ff4444"
                        : "1px solid rgba(148,163,184,0.35)",
                      borderRadius: "12px",
                      padding: 4,
                      background: isSelected
                        ? "rgba(255,68,68,0.10)"
                        : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                    }}
                    aria-label={`Show product image ${index + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={84}
                      height={84}
                      style={{
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          <p style={{ opacity: 0.7, marginTop: 12, fontSize: "0.95rem" }}>
            Tap image to enlarge
          </p>
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
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
                selectedIsMissingSku || selectedIsUnavailable
                  ? "not-allowed"
                  : "pointer",
              boxShadow: "0 10px 26px rgba(255,68,68,0.28)",
              transition: "transform 0.12s ease",
            }}
          >
            Add to Cart
          </button>
        ) : (
          <div style={{ margin: "1.25rem 0" }}>
            <p
              style={{
                color: "#4ade80",
                fontSize: "1.35rem",
                fontWeight: 900,
                marginBottom: "0.75rem",
              }}
            >
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

      {/* Lightbox popup gallery */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1100px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                width: 42,
                height: 42,
                borderRadius: "999px",
                border: "none",
                background: "rgba(255,255,255,0.12)",
                color: "white",
                fontSize: "1.4rem",
                cursor: "pointer",
                fontWeight: 900,
              }}
              aria-label="Close gallery"
            >
              ×
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={goPrevImage}
                  style={{
                    position: "absolute",
                    left: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 48,
                    height: 48,
                    borderRadius: "999px",
                    border: "none",
                    background: "rgba(255,255,255,0.14)",
                    color: "white",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </button>

                <button
                  onClick={goNextImage}
                  style={{
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 48,
                    height: 48,
                    borderRadius: "999px",
                    border: "none",
                    background: "rgba(255,255,255,0.14)",
                    color: "white",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Image
                src={activeImage || "/fallback.png"}
                alt={product.name}
                width={1000}
                height={1000}
                style={{
                  width: "auto",
                  maxWidth: "100%",
                  maxHeight: "72vh",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "16px",
                }}
              />
            </div>

            {galleryImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 10,
                  maxWidth: "100%",
                }}
              >
                {galleryImages.map((img, index) => {
                  const isSelected = img === activeImage;

                  return (
                    <button
                      key={`${img}-lightbox-${index}`}
                      onClick={() => setActiveImage(img)}
                      style={{
                        border: isSelected
                          ? "2px solid #ff4444"
                          : "1px solid rgba(255,255,255,0.25)",
                        borderRadius: "10px",
                        padding: 4,
                        background: "rgba(255,255,255,0.04)",
                        cursor: "pointer",
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} lightbox thumbnail ${index + 1}`}
                        width={78}
                        height={78}
                        style={{
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.gritandgrace.buzz";

    const res = await fetch(`${baseUrl}/api/printful-product/${id}`);

    if (!res.ok) {
      return {
        notFound: true,
      };
    }

    const data = await res.json();

    if (!data || !data.sync_product_id) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        initialProduct: data,
        productId: id,
      },
    };
  } catch (error) {
    console.error("getServerSideProps product error:", error);

    return {
      notFound: true,
    };
  }
}
