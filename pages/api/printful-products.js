// pages/api/printful-product.js   ← overwrite completely
export default async function handler(req, res) {
  const { id } = req.query;

  if (!process.env.PRINTFUL_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing Printful token" });
  }

  try {
    const response = await fetch(`https://api.printful.com/store/products/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!data.result) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = data.result.sync_product;
    const variant = data.result.sync_variants[0]; // main variant

    // THIS IS THE MAGIC THAT FIXES ALL IMAGE 400s
    const cleanProduct = {
      id: String(product.id),
      name: product.name.trim(),
      price: parseFloat(variant.retail_price),
      image: variant.files?.find(f => f.type === 'preview')?.preview_url
          || variant.files?.[0]?.preview_url
          || product.thumbnail_url
          || "https://files.cdn.printful.com/o/upload/missing-image/400x400",
      description: product.description || product.name,
      variants: data.result.sync_variants,
    };

    res.status(200).json(cleanProduct);
  } catch (err) {
    console.error("Printful product API error:", err);
    res.status(500).json({ error: "Failed to load product" });
  }
}
