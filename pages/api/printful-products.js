// pages/api/printful-products.js
export default async function handler(req, res) {
  const token = process.env.PRINTFUL_API_KEY || process.env.PRINTFUL_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing Printful token" });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const listRes = await fetch("https://api.printful.com/store/products", { headers });
    if (!listRes.ok) {
      const text = await listRes.text();
      return res.status(listRes.status).json({ error: "Printful list error", details: text });
    }

    const listData = await listRes.json();
    const items = listData.result || [];

    // Fetch details (for price) in parallel, with a small concurrency limit
    const products = [];
    for (const item of items) {
      const id = String(item.id || "");
      if (!id) continue;

      let price = null;
      try {
        const detailRes = await fetch(`https://api.printful.com/store/products/${id}`, { headers });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const variants = detail?.result?.sync_variants || detail?.result?.variants || [];
          const first = variants[0] || {};
          price = parseFloat(first.retail_price || first.price || 0) || null;
        }
      } catch {
        // ignore individual failures
      }

      products.push({
        id,
        name: item.name || "Untitled",
        image: item.thumbnail_url || "/images/placeholder.jpg",
        price,
        thumbnail_url: item.thumbnail_url || "/images/placeholder.jpg",
        preview_url: item.thumbnail_url || "/images/placeholder.jpg",
        title: item.name || "Untitled",
        variantCount: item.variants || 0,
      });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("printful-products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
