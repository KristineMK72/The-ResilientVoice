// GET /api/catalog/grace | patriot | social
import { getProductsByCategory } from "../../../lib/catalog/byCategory";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const category = String(req.query.category || "")
    .toLowerCase()
    .trim();

  if (!["grace", "patriot", "social"].includes(category)) {
    return res.status(400).json({
      error: "category must be grace, patriot, or social",
    });
  }

  try {
    const result = await getProductsByCategory(category);
    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );
    return res.status(200).json({
      category,
      ...result,
      count: result.products?.length || 0,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Catalog error" });
  }
}
