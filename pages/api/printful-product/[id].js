// pages/api/printful-product/[id].js
export default async function handler(req, res) {
  const { id } = req.query;

  if (!process.env.PRINTFUL_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing Printful token" });
  }

  try {
    const response = await fetch(`https://api.printful.com/store/products/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!data.result) {
      return res.status(404).json({ error: "Product not found" });
    }

    const item = data.result;
    const syncProduct = item.sync_product;
    const variants = item.sync_variants || [];

    // Find the best preview image from the first variant
    const firstVariant = variants[0] || {};
    const bestImage =
      firstVariant.files?.find(f => f.type === "preview")?.preview_url ||
      firstVariant.files?.[0]?.preview_url ||
      syncProduct.thumbnail_url ||
      "https://files.cdn.printful.com/o/upload/missing-image/400x400";

    // Clean, ready-to-use product data
    const cleanedProduct = {
      id: String(syncProduct.id),
      name: syncProduct.name.trim(),
      image: bestImage,                          // ← THIS IS THE LINE YOU WANTED
      description: syncProduct.description || "",
      variants: variants.map(v => ({
        id: v.id,
        size: v.size || v.name || "One Size",
        price: parseFloat(v.retail_price),
        inStock: v.is_in_stock !== false,
      })),
    };

    res.status(200).json(cleanedProduct);
  } catch (err) {
    console.error("Printful product API error:", err);
    res.status(500).json({ error: "Failed to load product" });
  }
}
