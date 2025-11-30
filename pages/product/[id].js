// pages/api/printful-product/[id].js
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const response = await fetch(`https://api.printful.com/sync/products/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    if (!response.ok) throw new Error("Not found");

    const data = await response.json();
    const product = data.result.sync_product;
    const variants = data.result.sync_variants;

    res.status(200).json({
      id: product.id,
      name: product.name,
      image: product.thumbnail_url || "/fallback.png",
      description: product.description || "",
      variants: variants.map(v => ({
        id: v.id,
        size: v.name.split(" / ").pop() || "One Size",
        price: v.retail_price,
      })),
    });
  } catch (error) {
    console.error("Printful error:", error);
    res.status(404).json({ error: "Product not found" });
  }
}
