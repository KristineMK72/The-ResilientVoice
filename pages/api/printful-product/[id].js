// pages/api/printful-product/[id].js

export default async function handler(req, res) {
  const { id } = req.query; // sync_product.id

  try {
    const token = process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;

    if (!token) {
      return res.status(500).json({ error: "Missing Printful API token" });
    }

    const response = await fetch(`https://api.printful.com/sync/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();

    if (!response.ok || !json?.result?.sync_product) {
      return res.status(404).json({
        error: "Product not found from Printful",
        details: json,
      });
    }

    const { sync_product, sync_variants = [] } = json.result;

    const productThumbnail =
      sync_product.thumbnail_url ||
      "https://files.cdn.printful.com/o/upload/missing-image/800x800.jpg";

    const variants = (sync_variants || []).map((v) => {
      const preview =
        v.files?.find((f) => f.type === "preview")?.preview_url ||
        v.files?.[0]?.preview_url ||
        productThumbnail;

      // Printful synced variants often have external_id as the SKU-ish value
      const external_id = v.external_id ? String(v.external_id).trim() : "";

      // Some Printful responses include "sku" (not always). Prefer it if present.
      const rawSku = v.sku ? String(v.sku).trim() : "";

      // Always provide a stable "sku" field for your frontend mapping logic
      const sku = rawSku || external_id;

      return {
        // IDs
        sync_variant_id: String(v.id),            // ✅ Printful sync variant id (fulfillment + shipping rates)
        catalog_variant_id: String(v.variant_id), // ✅ Printful catalog variant id (base catalog)

        // SKU-ish identifiers
        sku,         // ✅ always populated if possible
        external_id, // ✅ your 6941DA... style value

        // Display
        name: v.name || "",
        retail_price: v.retail_price ?? "",
        currency: v.currency ?? "USD",
        preview_url: preview,

        // Optional debug/helpful flags
        is_ignored: Boolean(v.is_ignored),
        is_available: Boolean(sku), // treat missing sku/external_id as not purchasable
      };
    });

    return res.status(200).json({
      // PRODUCT LEVEL
      sync_product_id: String(sync_product.id),
      name: sync_product.name || "",
      description: sync_product.description || "",
      thumbnail_url: productThumbnail,

      // VARIANTS
      variants,
    });
  } catch (err) {
    console.error("PRINTFUL FETCH ERROR:", err);
    return res.status(500).json({ error: "Server error during Printful fetch" });
  }
}
