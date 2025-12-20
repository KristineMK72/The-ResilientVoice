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

    if (!response.ok || !json.result) {
      return res.status(404).json({ error: "Product not found from Printful" });
    }

    const { sync_product, sync_variants = [] } = json.result;

    const productThumbnail =
      sync_product.thumbnail_url ||
      "https://files.cdn.printful.com/o/upload/missing-image/800x800.jpg";

    res.status(200).json({
      sync_product_id: String(sync_product.id),
      name: sync_product.name,
      description: sync_product.description || "",
      thumbnail_url: productThumbnail,

      variants: sync_variants.map((v) => {
        const preview =
          v.files?.find((f) => f.type === "preview")?.preview_url ||
          v.files?.[0]?.preview_url ||
          productThumbnail;

        // IMPORTANT: Printful often stores your “SKU-like” value in external_id.
        // Sometimes v.sku exists too; we’ll accept either.
        const sku = (v.sku || v.external_id || "").toString().trim();

        return {
          sync_variant_id: String(v.id),            // Printful fulfillment id
          catalog_variant_id: String(v.variant_id), // Printful catalog variant id
          name: v.name,
          retail_price: v.retail_price,
          preview_url: preview,
          sku, // ✅ this is what we’ll use to map to Stripe price lookup_key
        };
      }),
    });
  } catch (err) {
    console.error("PRINTFUL FETCH ERROR:", err);
    res.status(500).json({ error: "Server error during Printful fetch" });
  }
}
