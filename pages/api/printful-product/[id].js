import { supabaseAdmin } from "../../../lib/supabase-admin";
import { printfulFetch } from "../../../lib/printful";

function firstPreviewUrl(files = []) {
  if (!Array.isArray(files)) return null;

  const preview =
    files.find((f) => f?.type === "preview" && f?.preview_url)?.preview_url ||
    files.find((f) => f?.preview_url)?.preview_url ||
    null;

  return preview;
}

function mapVariant(variant) {
  return {
    sync_variant_id: String(variant?.id || ""),
    catalog_variant_id: variant?.variant_id ? String(variant.variant_id) : null,
    sku: variant?.sku || null,
    name: variant?.name || "Unnamed Variant",
    retail_price: variant?.retail_price || null,
    currency: variant?.currency || "USD",
    preview_url:
      firstPreviewUrl(variant?.files) ||
      variant?.preview_url ||
      null,
    image_url:
      firstPreviewUrl(variant?.files) ||
      variant?.preview_url ||
      null,
    color: variant?.color || null,
    size: variant?.size || null,
    in_stock: true,
  };
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
    const variants = Array.isArray(item?.sync_variants)
      ? item.sync_variants.map(mapVariant)
      : [];

    const { data: override, error: overrideError } = await supabaseAdmin
      .from("product_content")
      .select("*")
      .eq("sync_product_id", String(id))
      .maybeSingle();

    if (overrideError) {
      console.error("product_content lookup error:", overrideError);
    }

    if (override?.hidden) {
      return res.status(404).json({ error: "Product hidden" });
    }

    const overrideImages = Array.isArray(override?.images)
      ? override.images.filter(Boolean)
      : [];

    const printfulThumbnail =
      syncProduct?.thumbnail_url ||
      item?.thumbnail_url ||
      variants[0]?.preview_url ||
      null;

    const mergedProduct = {
      sync_product_id: String(syncProduct?.id || item?.id || id),
      id: String(syncProduct?.id || item?.id || id),

      // editable fields from admin first
      name:
        override?.title ||
        syncProduct?.name ||
        item?.name ||
        "Product",

      description:
        override?.description ||
        syncProduct?.description ||
        item?.description ||
        "",

      thumbnail_url:
        overrideImages[0] ||
        printfulThumbnail ||
        "/fallback.png",

      gallery_images: overrideImages,

      featured: Boolean(override?.featured),
      hidden: Boolean(override?.hidden),

      // keep raw references if you need them
      sync_product: syncProduct,
      variants,
    };

    return res.status(200).json(mergedProduct);
  } catch (error) {
    console.error("printful-product [id] error:", error);
    return res.status(500).json({
      error: "Failed to load product",
      details: error?.message || "Unknown error",
    });
  }
}
