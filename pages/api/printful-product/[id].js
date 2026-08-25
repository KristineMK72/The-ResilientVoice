import { printfulFetch } from "../../../lib/printful";

const BAD_MARKERS = [
  "REPLACE_WITH_REAL_THUMB",
  "PUT_THE_IMAGE_URL_HERE",
  "missing-image",
  "placeholder",
];

function isUsableUrl(url) {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (!u.startsWith("http")) return false;
  if (BAD_MARKERS.some((m) => u.includes(m))) return false;
  return true;
}

/** Collect every usable mockup URL from a files array */
function collectFileUrls(files = []) {
  if (!Array.isArray(files)) return [];
  const out = [];
  for (const f of files) {
    const type = String(f?.type || "preview").toLowerCase();
    // Prefer preview URLs; also accept file url when it's a rendered mockup
    const candidates = [f?.preview_url, f?.thumbnail_url, f?.url].filter(
      isUsableUrl
    );
    for (const url of candidates) {
      out.push({ url, type });
    }
  }
  return out;
}

function firstPreviewUrl(files = []) {
  const all = collectFileUrls(files);
  const preview =
    all.find((x) => x.type === "preview") ||
    all.find((x) => x.type === "default") ||
    all[0];
  return preview?.url || null;
}

function mapVariant(variant) {
  const files = variant?.files || [];
  const preview = firstPreviewUrl(files);
  const gallery = collectFileUrls(files);

  return {
    sync_variant_id: String(variant?.id || ""),
    catalog_variant_id: variant?.variant_id ? String(variant.variant_id) : null,
    sku: variant?.sku || null,
    name: variant?.name || "Unnamed Variant",
    retail_price: variant?.retail_price || null,
    currency: variant?.currency || "USD",
    preview_url: preview || variant?.preview_url || null,
    image_url: preview || variant?.preview_url || null,
    color: variant?.color || null,
    size: variant?.size || null,
    in_stock: true,
    // Per-variant mockups (front / back / etc.)
    gallery: gallery.map((g) => g.url),
    gallery_detail: gallery,
  };
}

/** Deduplicate URLs while preserving order */
function uniqueUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const u of urls) {
    if (!isUsableUrl(u) || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing product id" });
  }

  try {
    const detailData = await printfulFetch(`/store/products/${id}`);
    const item = detailData?.result;

    if (!item) {
      return res.status(404).json({ error: "Product not found in Printful" });
    }

    const syncProduct = item?.sync_product || {};
    const rawVariants = Array.isArray(item?.sync_variants)
      ? item.sync_variants
      : [];
    const variants = rawVariants.map(mapVariant);

    // Product-level thumbnail
    const productThumbnail =
      (isUsableUrl(syncProduct?.thumbnail_url) && syncProduct.thumbnail_url) ||
      (isUsableUrl(item?.thumbnail_url) && item.thumbnail_url) ||
      variants[0]?.preview_url ||
      null;

    // Build full gallery: product thumb + every unique mockup across variants
    const fromVariants = variants.flatMap((v) => v.gallery || []);
    const gallery_images = uniqueUrls([
      productThumbnail,
      ...fromVariants,
      ...variants.map((v) => v.preview_url),
    ]);

    // Color → representative mockup (first usable image for that color)
    const color_images = {};
    for (const v of variants) {
      const color = v.color || "Default";
      if (!color_images[color] && isUsableUrl(v.preview_url)) {
        color_images[color] = v.preview_url;
      }
      // Prefer richer per-variant galleries when present
      if (v.gallery?.length && !color_images[`${color}__gallery`]) {
        color_images[`${color}__gallery`] = uniqueUrls(v.gallery);
      }
    }

    res.setHeader(
      "Cache-Control",
      "s-maxage=120, stale-while-revalidate=600"
    );

    return res.status(200).json({
      sync_product_id: String(syncProduct?.id || item?.id || id),
      id: String(syncProduct?.id || item?.id || id),
      name: syncProduct?.name || item?.name || "Product",
      description: syncProduct?.description || item?.description || "",
      thumbnail_url: productThumbnail || "/fallback.png",
      gallery_images,
      color_images,
      variants,
    });
  } catch (error) {
    console.error("printful-product [id] error:", error);
    return res.status(500).json({
      error: "Failed to load product",
      details: error?.message || "Unknown error",
    });
  }
}
