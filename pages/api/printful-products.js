// pages/api/printful-products.js
export default async function handler(req, res) {
  const token = process.env.PRINTFUL_API_KEY || process.env.PRINTFUL_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing Printful token" });
  }

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Printful store products error:", response.status, text);
      return res.status(response.status).json({ error: "Printful API error", details: text });
    }

    const data = await response.json();
    const items = data.result || [];

    const products = items.map((item) => {
      const syncProduct = item.sync_product || {};
      const variants = item.sync_variants || [];
      const firstVariant = variants[0] || {};

      const image =
        firstVariant.files?.find((f) => f.type === "preview")?.preview_url ||
        firstVariant.files?.[0]?.preview_url ||
        syncProduct.thumbnail_url ||
        "/images/placeholder.jpg";

      return {
        id: String(syncProduct.id),
        name: syncProduct.name || "Untitled",
        image,
        price: parseFloat(firstVariant.retail_price || 0),
        tags: (syncProduct.tags || "").toLowerCase(),
        variants,
        thumbnail_url: image,
        preview_url: image,
        title: syncProduct.name || "Untitled",
      };
    });

    res.status(200).json(products);
  } catch (err) {
    console.error("printful-products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
