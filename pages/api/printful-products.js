// pages/api/printful-products.js  ← FINAL WORKING VERSION
export default async function handler(req, res) {
  // Make sure you have this in .env.local:
  // PRINTFUL_ACCESS_TOKEN=your_real_token_here

  if (!process.env.PRINTFUL_ACCESS_TOKEN) {
    return res.status(500).json({ result: [] });
  }

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Printful API failed");

    const data = await response.json();

    // CLEAN + SIMPLIFY DATA FOR ProductGrid
    const cleaned = data.result.map(item => {
      const variant = item.sync_variants[0] || {};
      const preview = variant.files?.find(f => f.type === "preview")?.preview_url
                  || variant.files?.[0]?.preview_url
                  || item.sync_product.thumbnail_url
                  || "/fallback.png";

      return {
        id: String(item.sync_product.id),
        name: item.sync_product.name,
        image: preview,
        price: variant.retail_price || "29.99",
      };
    });

    res.status(200).json({ result: cleaned });
  } catch (err) {
    console.error("Printful error:", err);
    res.status(200).json({ result: [] }); // Never crash — just show empty
  }
}
