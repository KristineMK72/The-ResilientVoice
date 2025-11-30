// pages/api/printful-product/[id].js
export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const token = process.env.PRINTFUL_API_KEY || process.env.PRINTFUL_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Missing API Token" });
    }

    const response = await fetch(
      `https://api.printful.com/sync/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await response.json();

    if (!response.ok || !json.result) {
      return res.status(404).json({ error: "Product not found from Printful" });
    }

    const product = json.result.sync_product;
    const variants = json.result.sync_variants || [];
    const firstVariant = variants[0] || {};

    const bestImage =
      firstVariant.files?.find(f => f.type === "preview")?.preview_url ||
      firstVariant.files?.[0]?.preview_url ||
      product.thumbnail_url ||
      "https://files.cdn.printful.com/o/upload/missing-image/800x800.jpg";

    res.status(200).json({
      id: String(product.id),
      name: product.name,
      description: product.description || "",
      thumbnail_url: bestImage,
      variants: variants.map(v => ({
        id: v.id,
        name: v.name,
        price: v.retail_price,
        files: v.files,
      })),
    });
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server error during fetch" });
  }
}
