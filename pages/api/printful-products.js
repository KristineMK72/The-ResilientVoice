// pages/api/printful-products.js

export default async function handler(req, res) {
  const token = process.env.PRINTFUL_TOKEN;
  const storeId = process.env.PRINTFUL_STORE_ID;

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(storeId && { "X-PF-Store-Id": storeId }),
  };

  try {
    const response = await fetch(
      "https://api.printful.com/store/products?limit=100",
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Printful API error:", response.status, errorText);
      return res
        .status(response.status)
        .json({ error: "Printful API error", details: errorText });
    }

    const data = await response.json();
    res.status(200).json(data.result || []);
  } catch (error) {
    console.error("Printful fetch error:", error);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
}
