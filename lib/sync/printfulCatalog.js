/**
 * Fetch full Printful store catalog (list + per-product detail).
 */

import { printfulFetch } from "../printful";

function firstPreviewUrl(files = []) {
  if (!Array.isArray(files)) return null;
  return (
    files.find((f) => f?.type === "preview" && f?.preview_url)?.preview_url ||
    files.find((f) => f?.preview_url)?.preview_url ||
    null
  );
}

export function mapPrintfulVariant(variant, syncProductId, productTitle) {
  const preview =
    firstPreviewUrl(variant?.files) || variant?.preview_url || null;

  return {
    printful_sync_product_id: String(syncProductId),
    printful_sync_variant_id: String(variant?.id || ""),
    name: variant?.name || "Unnamed Variant",
    product_title: productTitle,
    sku: variant?.sku || null,
    color: variant?.color || null,
    size: variant?.size || null,
    retail_price:
      variant?.retail_price != null ? Number(variant.retail_price) : null,
    currency: (variant?.currency || "USD").toUpperCase(),
    thumbnail_url: preview,
    image_url: preview,
    is_active: true,
    catalog_variant_id: variant?.variant_id
      ? String(variant.variant_id)
      : null,
  };
}

/**
 * Returns normalized products:
 * { syncProductId, title, thumbnailUrl, categoryHintSource, variants[] }
 */
export async function fetchFullPrintfulCatalog() {
  const listData = await printfulFetch("/store/products");
  const list = listData?.result || [];
  const products = [];

  for (const listItem of list) {
    const syncProductId =
      listItem?.sync_product?.id || listItem?.id || null;
    if (!syncProductId) continue;

    let detail = listItem;
    try {
      const detailData = await printfulFetch(
        `/store/products/${syncProductId}`
      );
      detail = detailData?.result || listItem;
    } catch (e) {
      console.warn(
        `Detail fetch failed for ${syncProductId}:`,
        e?.message || e
      );
    }

    const title =
      detail?.sync_product?.name ||
      detail?.name ||
      listItem?.sync_product?.name ||
      `Product ${syncProductId}`;

    const thumbnailUrl =
      detail?.sync_product?.thumbnail_url ||
      detail?.thumbnail_url ||
      listItem?.sync_product?.thumbnail_url ||
      null;

    const rawVariants = Array.isArray(detail?.sync_variants)
      ? detail.sync_variants
      : [];

    const variants = rawVariants.map((v) =>
      mapPrintfulVariant(v, syncProductId, title)
    );

    // Attach product-level thumb if variant has none
    for (const v of variants) {
      if (!v.thumbnail_url && thumbnailUrl) {
        v.thumbnail_url = thumbnailUrl;
        v.image_url = thumbnailUrl;
      }
    }

    products.push({
      syncProductId: String(syncProductId),
      title,
      thumbnailUrl,
      tags: detail?.sync_product?.tags || detail?.tags || [],
      name: title,
      sync_product: detail?.sync_product || listItem?.sync_product,
      variants,
    });
  }

  return products;
}
