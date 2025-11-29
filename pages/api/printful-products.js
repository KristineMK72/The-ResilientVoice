// pages/api/printful-products.js   ← FINAL VERSION
export default async function handler(req, res) {
  // Use the correct env var name (you probably have PRINTFUL_API_KEY, not ACCESS_TOKEN)
  const token = process.env.PRINTFUL_API_KEY || process.env.PRINTFUL_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "Missing Printful token" });

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Printful error:", response.status, err);
      return res.status(response.status).json({ error: "Printful API error" });
    }

    const data = await response.json();

    // Printful returns: { result: [ { sync_product: {...}, sync_variants: [...] }, ... ] }
    const products = data.result || [];

    // Clean & enrich each product so your frontend loves it
    const cleaned = products.map(item => {
      const syncProduct = item.sync_product;
      const variants = item.sync_variants || [];
      const firstVariant = variants[0] || {};

      const bestImage =
        firstVariant.files?.find(f => f.type === "preview")?.preview_url ||
        firstVariant.files?.[0]?.preview_url ||
        syncProduct.thumbnail_url ||
        "https://files.cdn.printful.com/o/upload/missing-image/800x800.jpg";

      return {
        id: String(syncProduct.id),           // e.g. "403602928"
        name: syncProduct.name,
        image: bestImage,
        price: parseFloat(firstVariant.retail_price || 29.99),
        tags: (syncProduct.tags || "").toLowerCase(), // ← crucial for filtering later
        thumbnail_url: bestImage,
        sync_variants: variants,
      };
    });

    res.status(200).json(cleaned);
  } catch (error) {
    console.error("Printful fetch error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
