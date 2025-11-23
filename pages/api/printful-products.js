// pages/api/printful-products.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.status}`);
    }

    const data = await response.json();

    const enrichedProducts = data.result.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      thumbnail: p.thumbnail_url,
      // ✅ Use first variant’s retail price (most common default)
      price: p.variants?.[0]?.retail_price || null,
      variants: p.variants, // keep full variant list for product/[id].js
    }));

    res.status(200).json(enrichedProducts);
  } catch (err) {
    console.error("Printful products fetch error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
