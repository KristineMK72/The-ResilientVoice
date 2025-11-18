export default async function handler(req, res) {
  try {
    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Missing Printful API key" });
    }

    const response = await fetch("https://api.printful.com/store/products", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (!json.result || !Array.isArray(json.result)) {
      return res.status(200).json([]);
    }

    // Expand each product to get real thumbnails + prices
    const detailedProducts = await Promise.all(
      json.result.map(async (item) => {
        const detailRes = await fetch(
          `https://api.printful.com/store/products/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
            },
          }
        );

        const detailJson = await detailRes.json();

        return {
          id: item.id,
          name: item.name,
          thumbnail:
            detailJson.result?.sync_product?.thumbnail ||
            item.thumbnail_url ||
            null,
          sync_variants: detailJson.result?.sync_variants || [],
        };
      })
    );

    res.status(200).json(detailedProducts);
  } catch (error) {
    console.error("Printful API Error:", error);
    res.status(500).json([]);
  }
}
