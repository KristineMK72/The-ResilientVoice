// pages/api/printful-product/[id].js
export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const response = await fetch(`https://api.printful.com/store/products/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Printful product fetch error:", response.status, text);
      return res.status(response.status).json({ error: "Printful product fetch failed" });
    }

    const data = await response.json();

    const product = {
      id: data.result.id,
      name: data.result.name,
      description: data.result.description || "No description available.",
      thumbnail: data.result.thumbnail_url,
      variants: data.result.variants || [],
    };

    res.status(200).json(product);
  } catch (err) {
    console.error("Printful product fetch error:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}
