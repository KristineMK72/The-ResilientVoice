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
      // Support multiple possible response shapes from Printful
      const syncProduct = item.sync_product || item || {};
      const variants = item.sync_variants || item.variants || [];
      const firstVariant = variants[0] || {};

      const id = String(
        syncProduct.id ||
        syncProduct.sync_product_id ||
        item.id ||
        item.sync_product_id ||
        ""
      );

      const name =
        syncProduct.name ||
        item.name ||
        firstVariant.name ||
        "Untitled";

      const image =
        firstVariant.files?.find((f) => f.type === "preview")?.preview_url ||
        firstVariant.files?.[0]?.preview_url ||
        firstVariant.preview_url ||
        syncProduct.thumbnail_url ||
        item.thumbnail_url ||
        "/images/placeholder.jpg";

      const price = parseFloat(
        firstVariant.retail_price ||
        firstVariant.price ||
        syncProduct.retail_price ||
        0
      );

      return {
        id,
        name,
        image,
        price,
        tags: (syncProduct.tags || item.tags || "").toLowerCase(),
        variants,
        thumbnail_url: image,
        preview_url: image,
        title: name,
      };
    }).filter((p) => p.id && p.id !== "undefined" && p.id !== "");

    res.status(200).json(products);
  } catch (err) {
    console.error("printful-products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
