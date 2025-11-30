// pages/api/printful-product/[id].js
import { getProductById } from "../../../data/products";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing product ID" });
  }

  const product = await getProductById(id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json(product);
}
