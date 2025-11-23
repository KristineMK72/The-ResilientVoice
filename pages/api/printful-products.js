// pages/api/printful-products.js   ← overwrite completely
export default async function handler(req, res) {
  // Allow CORS (important on Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!process.env.PRINTFUL_ACCESS_TOKEN) {
    console.error("Missing PRINTFUL_ACCESS_TOKEN");
    return res.status(500).json({ error: "Printful token missing" });
  }

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Printful API error:", response.status, text);
      return res.status(500).json({ error: "Printful API error", details: text });
    }

    const data = await response.json();

    // Printful sometimes returns { code: ..., result: [...] } and sometimes just { result: [...] }
    const rawProducts = data.result || data || [];

    // Super defensive mapping
    const cleaned = rawProducts.map(item => {
      const syncProduct = item.sync_product || item;
      const firstVariant = (item.sync_variants || [])[0] || {};

      return {
        id: String(syncProduct.id || item.id),
        name: (syncProduct.name || "Unnamed Product").trim(),
        price: parseFloat(firstVariant.retail_price || 0) || 29.99,
        image: syncProduct.thumbnail_url ||
               firstVariant.thumbnail_url ||
               "https://files.cdn.printful.com/o/upload/missing-image/400x400",
        slug: (syncProduct.name || "product")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      };
    });

    res.status(200).json({ result: cleaned });
  } catch (err) {
    console.error("Unexpected error in printful-products API:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
