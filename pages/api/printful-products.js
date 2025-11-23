// pages/api/printful-products.js  ← REPLACE ENTIRE FILE
export default async function handler(req, res) {
  if (!process.env.PRINTFUL_ACCESS_TOKEN) {
    return res.status(500).json({ error: "No Printful token" });
  }

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!data.result) {
      return res.status(200).json({ result: [] });
    }

    // CLEAN AND FLATTEN THE DATA — THIS IS THE FIX
    const cleaned = data.result.map(item => {
      const syncProduct = item.sync_product;
      const firstVariant = item.sync_variants[0] || {};

      return {
        id: String(syncProduct.id),
        name: syncProduct.name,
        image: syncProduct.thumbnail_url || firstVariant.files?.[0]?.preview_url || "/fallback.png",
        price: firstVariant.retail_price || "29.99",
      };
    });

    res.status(200).json({ result: cleaned });
  } catch (err) {
    console.error("Printful API error:", err);
    res.status(500).json({ result: [] });
  }
}
