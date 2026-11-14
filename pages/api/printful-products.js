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

    // List endpoint returns: { id, external_id, name, variants (count), synced, thumbnail_url, is_ignored }
    const products = items
      .map((item) => {
        const id = String(item.id || "");
        const name = item.name || "Untitled";
        const image = item.thumbnail_url || "/images/placeholder.jpg";

        return {
          id,
          name,
          image,
          price: null, // price lives on the individual product endpoint
          thumbnail_url: image,
          preview_url: image,
          title: name,
          variantCount: item.variants || 0,
        };
      })
      .filter((p) => p.id && p.id !== "undefined");

    res.status(200).json(products);
  } catch (err) {
    console.error("printful-products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
