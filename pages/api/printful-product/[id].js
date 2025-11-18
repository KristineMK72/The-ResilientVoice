export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Missing API Token" });
    }

    const response = await fetch(
      `https://api.printful.com/store/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        },
      }
    );

    const json = await response.json();

    if (!json.result) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(json.result);

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
}
