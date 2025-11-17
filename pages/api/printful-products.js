// /pages/api/printful-products.js
export default async function handler(req, res) {
  try {
    const result = await fetch("https://api.printful.com/sync/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    const json = await result.json();
    if (!json.result) return res.status(500).json([]);

    // Map each product into a clean format
    const products = json.result.map(p => {
      const name = p.name || "";
      const lower = name.toLowerCase();

      // extract the collection from the title after " - "
      const collection = name.includes(" - ")
        ? name.split(" - ").pop().replace("collection", "").trim().toLowerCase()
        : "";

      return {
        id: p.id,
        name: p.name,
        collection, // <-- NEW FIXED FIELD
        thumbnail: p.thumbnail,
        sync_variants: p.sync_variants || [],
      };
    });

    res.status(200).json(products);

  } catch (err) {
    console.error("PRINTFUL ERROR:", err);
    res.status(500).json([]);
  }
}
