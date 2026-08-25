// pages/product/[id].js — Professional product detail with Printful multi-view gallery

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
  return "Wearable grit and grace — premium apparel from Grit & Grace. 10% of every sale supports healing in our community.";
}

function unique(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

export default function ProductPage({ initialProduct, productId }) {
  const router = useRouter();

  const [product] = useState(initialProduct || null);
  const [added, setAdded] = useState(false);
  const [selectedSyncVariantId, setSelectedSyncVariantId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [availability, setAvailability] = useState({});
  const [checking, setChecking] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImage, setActiveImage] = useState("/fallback.png");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const variants = product?.variants || [];

  useEffect(() => {
    if (!product?.variants?.length) return;
    const first = product.variants[0];
    setSelectedSyncVariantId(first.sync_variant_id);
    setSelectedColor(
      first.color || parseColorFromVariantName(first.name)
    );
  }, [product]);

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

  const variantsByColor = useMemo(() => {
    const map = {};
    for (const v of variants) {
      const color = v.color || parseColorFromVariantName(v.name);
      if (!map[color]) map[color] = [];
      map[color].push(v);
    }
    const sizeOrder = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
    for (const color of Object.keys(map)) {
      map[color].sort((a, b) => {
        const sa = a.size || parseSizeFromVariantName(a.name);
        const sb = b.size || parseSizeFromVariantName(b.name);
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

  const availableColors = useMemo(
    () => Object.keys(variantsByColor),
    [variantsByColor]
  );

  useEffect(() => {
    if (!variants.length) return;
    if (!selectedColor) {
      setSelectedColor(
        variants[0].color || parseColorFromVariantName(variants[0].name)
      );
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
    const match = filteredVariants.find(
      (v) => v.sync_variant_id === selectedSyncVariantId
    );
    if (match) return;
    setSelectedSyncVariantId(filteredVariants[0].sync_variant_id);
  }, [filteredVariants, selectedSyncVariantId]);

  const selectedVariant = useMemo(() => {
    if (!variants.length || !selectedSyncVariantId) return null;
    return (
      variants.find((v) => v.sync_variant_id === selectedSyncVariantId) || null
    );
  }, [variants, selectedSyncVariantId]);

  /* -----------------------------
     Gallery: Printful multi-view + local + color-aware
  ------------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function buildGallery() {
      const local = buildLocalImageList(product?.sync_product_id, 8);

      // Color-specific gallery from API when available
      const colorKey = selectedColor ? `${selectedColor}__gallery` : null;
      const colorGallery =
        (colorKey && product?.color_images?.[colorKey]) ||
        (selectedColor && product?.color_images?.[selectedColor]
          ? [product.color_images[selectedColor]]
          : []);

      const fromSelected = selectedVariant?.gallery || [];
      const fromProduct = product?.gallery_images || [];
      const remote = unique([
        ...fromSelected,
        ...colorGallery,
        selectedVariant?.preview_url,
        product?.thumbnail_url,
        ...fromProduct,
      ]);

      // Prefer Printful CDN views, then local mockups
      const candidates = unique([...remote, ...local]);

      if (!candidates.length) {
        if (!cancelled) {
          setGalleryImages(["/fallback.png"]);
          setActiveImage("/fallback.png");
        }
        return;
      }

      async function exists(src) {
        // CDN URLs from Printful are trusted — skip probe for speed
        if (
          typeof src === "string" &&
          (src.includes("printful.com") || src.includes("printful-media"))
        ) {
          return true;
        }
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });
      }

      const valid = [];
      for (const src of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await exists(src);
        if (ok) valid.push(src);
        // Cap gallery size for UI cleanliness
        if (valid.length >= 10) break;
      }

      if (cancelled) return;

      if (valid.length) {
        setGalleryImages(valid);
        // When color changes, jump to that color's first mockup
        setActiveImage(valid[0]);
      } else {
        setGalleryImages(["/fallback.png"]);
        setActiveImage("/fallback.png");
      }
    }

    buildGallery();
    return () => {
      cancelled = true;
    };
  }, [
    product?.sync_product_id,
    product?.gallery_images,
    product?.thumbnail_url,
    product?.color_images,
    selectedVariant,
    selectedColor,
  ]);

  const displayPrice = useMemo(() => {
    const p =
      selectedVariant?.retail_price ??
      filteredVariants?.[0]?.retail_price ??
      "0";
    const n = Number(p);
    return Number.isFinite(n) ? n : 0;
  }, [selectedVariant, filteredVariants]);

  const selectedSku = useMemo(
    () => (selectedVariant?.sku || "").trim(),
    [selectedVariant]
  );
  const selectedIsMissingSku = !selectedSku;
  const selectedIsUnavailable = useMemo(() => {
    if (!selectedSku) return true;
    const entry = availability[selectedSku];
    if (!entry) return false;
    return entry.available === false;
  }, [selectedSku, availability]);

  const activeImageIndex = useMemo(
    () => galleryImages.findIndex((img) => img === activeImage),
    [galleryImages, activeImage]
  );

  const goPrevImage = () => {
    if (!galleryImages.length) return;
    const prevIndex =
      activeImageIndex <= 0 ? galleryImages.length - 1 : activeImageIndex - 1;
    setActiveImage(galleryImages[prevIndex]);
  };

  const goNextImage = () => {
    if (!galleryImages.length) return;
    const nextIndex =
      activeImageIndex >= galleryImages.length - 1 ? 0 : activeImageIndex + 1;
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
      color:
        selectedVariant.color ||
        parseColorFromVariantName(selectedVariant.name),
      size:
        selectedVariant.size || parseSizeFromVariantName(selectedVariant.name),
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
      <div className="notFound">
        Product not found.
        <style jsx>{`
          .notFound {
            min-height: 100vh;
            display: grid;
            place-items: center;
            color: white;
            font-size: 1.2rem;
            background: radial-gradient(circle at center, #0f172a 0%, #000 100%);
          }
        `}</style>
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

      <div className="pd">
        <div className="pdInner">
          {/* Gallery */}
          <div className="gallery">
            <div className="mainStage">
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="stageNav prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrevImage();
                    }}
                    aria-label="Previous view"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="stageNav next"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNextImage();
                    }}
                    aria-label="Next view"
                  >
                    ›
                  </button>
                </>
              )}
              <button
                type="button"
                className="mainImgBtn"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open product image gallery"
              >
                <Image
                  src={activeImage || "/fallback.png"}
                  alt={product.name}
                  width={720}
                  height={720}
                  priority
                  className="mainImg"
                />
              </button>
              {galleryImages.length > 1 && (
                <span className="viewCount">
                  {Math.max(activeImageIndex, 0) + 1} / {galleryImages.length}
                </span>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="thumbs">
                {galleryImages.map((img, index) => {
                  const isSelected = img === activeImage;
                  return (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={isSelected ? "thumb selected" : "thumb"}
                      aria-label={`Show product view ${index + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        width={88}
                        height={88}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <p className="tapHint">
              {galleryImages.length > 1
                ? "Swipe views · Tap to enlarge"
                : "Tap image to enlarge"}
            </p>
          </div>

          {/* Details */}
          <div className="details">
            <p className="brandMark">Grit & Grace</p>
            <h1 className="title">{product.name}</h1>

            {!!product.description && (
              <p className="desc">{product.description}</p>
            )}

            <p className="price">${displayPrice.toFixed(2)}</p>
            <p className="givingNote">10% of every sale supports community healing</p>

            {variants.length > 0 && (
              <div className="options">
                {showColorPicker && (
                  <div className="optionGroup">
                    <h3>Color</h3>
                    <div className="pills">
                      {availableColors.map((color) => {
                        const isSelected = color === selectedColor;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setSelectedColor(color);
                              const first = variantsByColor[color]?.[0];
                              if (first)
                                setSelectedSyncVariantId(first.sync_variant_id);
                            }}
                            className={isSelected ? "pill selected" : "pill"}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="optionGroup">
                  <div className="sizeHeader">
                    <h3>Size</h3>
                    {checking && <span className="checking">checking…</span>}
                  </div>
                  <div className="pills">
                    {filteredVariants.map((variant) => {
                      const size =
                        variant.size || parseSizeFromVariantName(variant.name);
                      const sku = (variant.sku || "").trim();
                      const known = sku ? availability[sku] : null;
                      const disabled =
                        !sku || (known && known.available === false);
                      const isSelected =
                        variant.sync_variant_id === selectedSyncVariantId;

                      return (
                        <button
                          key={variant.sync_variant_id}
                          type="button"
                          onClick={() =>
                            !disabled &&
                            setSelectedSyncVariantId(variant.sync_variant_id)
                          }
                          disabled={disabled}
                          className={
                            disabled
                              ? "pill disabled"
                              : isSelected
                              ? "pill selected"
                              : "pill"
                          }
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

                  <div className="selectionStatus">
                    {selectedIsMissingSku ? (
                      <p className="warn">
                        This option is missing a SKU, so Stripe mapping can’t
                        happen.
                      </p>
                    ) : selectedIsUnavailable ? (
                      <p className="err">This option is currently unavailable.</p>
                    ) : (
                      <p className="ok">
                        Selected:{" "}
                        <strong>
                          {showColorPicker && selectedVariant
                            ? `${
                                selectedVariant.color ||
                                parseColorFromVariantName(selectedVariant.name)
                              } / `
                            : ""}
                          {selectedVariant?.size ||
                            parseSizeFromVariantName(selectedVariant?.name)}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!added ? (
              <button
                type="button"
                onClick={addToCart}
                disabled={selectedIsMissingSku || selectedIsUnavailable}
                className={
                  selectedIsMissingSku || selectedIsUnavailable
                    ? "addBtn disabled"
                    : "addBtn"
                }
              >
                Add to Cart
              </button>
            ) : (
              <div className="added">
                <p>Added to cart!</p>
                <Link href="/cart">Go to Cart →</Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => router.back()}
              className="backBtn"
            >
              ← Keep Shopping
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <div className="lightboxInner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lbClose"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
            >
              ×
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="lbNav prev"
                  onClick={goPrevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lbNav next"
                  onClick={goNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <div className="lbImgWrap">
              <Image
                src={activeImage || "/fallback.png"}
                alt={product.name}
                width={1000}
                height={1000}
                className="lbImg"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="lbThumbs">
                {galleryImages.map((img, index) => {
                  const isSelected = img === activeImage;
                  return (
                    <button
                      key={`${img}-lightbox-${index}`}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={isSelected ? "lbThumb selected" : "lbThumb"}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} lightbox view ${index + 1}`}
                        width={78}
                        height={78}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .pd {
          min-height: 100vh;
          background: radial-gradient(
            ellipse at 25% 15%,
            #141b2d 0%,
            #070b14 55%,
            #000 100%
          );
          padding: 2.75rem 1.25rem 4rem;
          color: #f8fafc;
        }
        .pdInner {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 2.75rem;
          align-items: start;
        }

        .gallery {
          position: sticky;
          top: 1.35rem;
        }
        .mainStage {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(160deg, #0c1220, #111827);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
        }
        .mainImgBtn {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          padding: 0;
          cursor: zoom-in;
        }
        .mainImg {
          width: 100% !important;
          height: auto !important;
          object-fit: contain;
          display: block;
        }
        .stageNav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          font-size: 1.4rem;
          font-weight: 800;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background 0.15s ease;
        }
        .stageNav:hover {
          background: rgba(0, 0, 0, 0.65);
        }
        .stageNav.prev {
          left: 10px;
        }
        .stageNav.next {
          right: 10px;
        }
        .viewCount {
          position: absolute;
          bottom: 12px;
          right: 14px;
          z-index: 3;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 0.35rem 0.65rem;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.9);
        }
        .thumbs {
          display: flex;
          gap: 0.55rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .thumb {
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 12px;
          padding: 3px;
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .thumb:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.35);
        }
        .thumb.selected {
          border: 2px solid #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
        }
        .thumb :global(img) {
          border-radius: 8px;
          object-fit: cover;
          display: block;
        }
        .tapHint {
          opacity: 0.55;
          margin: 0.75rem 0 0;
          font-size: 0.88rem;
          text-align: center;
        }

        .details {
          text-align: left;
          padding-top: 0.35rem;
        }
        .brandMark {
          margin: 0 0 0.45rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #f9a8d4;
        }
        .title {
          font-size: clamp(1.7rem, 3.4vw, 2.3rem);
          font-weight: 900;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin: 0 0 0.85rem;
        }
        .desc {
          font-size: 1.02rem;
          line-height: 1.65;
          opacity: 0.88;
          margin: 0 0 1.1rem;
        }
        .price {
          font-size: 1.9rem;
          font-weight: 900;
          color: #ff6b6b;
          margin: 0 0 0.35rem;
        }
        .givingNote {
          margin: 0 0 1.4rem;
          font-size: 0.9rem;
          color: rgba(248, 250, 252, 0.65);
        }

        .options {
          margin-bottom: 1.5rem;
        }
        .optionGroup {
          margin-bottom: 1.35rem;
        }
        .optionGroup h3 {
          font-size: 0.9rem;
          font-weight: 800;
          margin: 0 0 0.7rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: rgba(248, 250, 252, 0.8);
        }
        .sizeHeader {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.7rem;
        }
        .sizeHeader h3 {
          margin: 0;
        }
        .checking {
          font-size: 0.85rem;
          opacity: 0.7;
        }
        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .pill {
          padding: 0.62rem 1.05rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(255, 255, 255, 0.04);
          color: #f8fafc;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 750;
          transition: all 0.15s ease;
        }
        .pill:hover:not(.disabled):not(.selected) {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.08);
        }
        .pill.selected {
          border: 2px solid #ff6b6b;
          background: rgba(255, 107, 107, 0.14);
          color: #ff8a8a;
        }
        .pill.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(148, 163, 184, 0.08);
        }

        .selectionStatus {
          margin-top: 0.75rem;
          min-height: 1.4rem;
        }
        .selectionStatus p {
          margin: 0;
          font-size: 0.92rem;
        }
        .selectionStatus .warn {
          color: #fbbf24;
          font-weight: 700;
        }
        .selectionStatus .err {
          color: #f87171;
          font-weight: 700;
        }
        .selectionStatus .ok {
          opacity: 0.75;
        }
        .selectionStatus strong {
          font-weight: 800;
          color: #f8fafc;
        }

        .addBtn {
          display: block;
          width: 100%;
          max-width: 340px;
          padding: 1.08rem 1.5rem;
          background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1.12rem;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 14px 36px rgba(255, 68, 68, 0.3);
          transition: transform 0.15s ease, filter 0.15s ease;
          margin-bottom: 1rem;
        }
        .addBtn:hover:not(.disabled) {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }
        .addBtn.disabled {
          background: rgba(148, 163, 184, 0.35);
          cursor: not-allowed;
          box-shadow: none;
        }

        .added {
          margin-bottom: 1rem;
        }
        .added p {
          color: #4ade80;
          font-size: 1.25rem;
          font-weight: 900;
          margin: 0 0 0.5rem;
        }
        .added a {
          color: #93c5fd;
          font-weight: 800;
          text-decoration: none;
        }
        .added a:hover {
          text-decoration: underline;
        }

        .backBtn {
          padding: 0.8rem 1.4rem;
          background: rgba(255, 255, 255, 0.06);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.98rem;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .backBtn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.1);
        }

        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .lightboxInner {
          position: relative;
          width: 100%;
          max-width: 1100px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .lbClose {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: none;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          font-size: 1.4rem;
          cursor: pointer;
          font-weight: 900;
          z-index: 2;
        }
        .lbNav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 999px;
          border: none;
          background: rgba(255, 255, 255, 0.14);
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          font-weight: 900;
          z-index: 2;
        }
        .lbNav.prev {
          left: 6px;
        }
        .lbNav.next {
          right: 6px;
        }
        .lbImgWrap {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .lbImg {
          width: auto !important;
          max-width: 100% !important;
          max-height: 72vh !important;
          height: auto !important;
          object-fit: contain;
          border-radius: 16px;
        }
        .lbThumbs {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.55rem;
          max-width: 100%;
        }
        .lbThumb {
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 10px;
          padding: 3px;
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
        }
        .lbThumb.selected {
          border: 2px solid #ff6b6b;
        }
        .lbThumb :global(img) {
          border-radius: 8px;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 820px) {
          .pdInner {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }
          .gallery {
            position: static;
          }
          .details {
            text-align: center;
          }
          .pills {
            justify-content: center;
          }
          .sizeHeader {
            justify-content: center;
          }
          .addBtn {
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .addBtn:hover,
          .backBtn:hover,
          .thumb:hover {
            transform: none !important;
          }
        }
      `}</style>
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
      return { notFound: true };
    }

    const data = await res.json();

    if (!data || !data.sync_product_id) {
      return { notFound: true };
    }

    return {
      props: {
        initialProduct: data,
        productId: id,
      },
    };
  } catch (error) {
    console.error("getServerSideProps product error:", error);
    return { notFound: true };
  }
}
