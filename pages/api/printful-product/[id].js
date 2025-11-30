export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Missing API Token" });
    }

    const response = await fetch(
      // This is the line that uses the Printful API
      `https://api.printful.com/store/products/${id}`,
      {
        headers: {
          // THIS IS WHERE YOUR TOKEN IS USED
          Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        },
      }
    );

    const json = await response.json();

    if (!response.ok || !json.result) {
      // If Printful fails or the product isn't found, return 404
      return res.status(404).json({ error: "Product not found from Printful" });
    }

    res.status(200).json(json.result);

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server error during fetch" });
  }
}
