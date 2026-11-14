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
      return res.status(response.status).json({ error: "Printful API error", details: text });
    }

    const data = await response.json();
    const items = data.result || [];

    // TEMP DEBUG: return first item raw so we can see the shape
    return res.status(200).json({
      count: items.length,
      sample: items[0] || null,
      keys: items[0] ? Object.keys(items[0]) : [],
    });
  } catch (err) {
    console.error("printful-products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
