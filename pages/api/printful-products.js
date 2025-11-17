// pages/api/printful-products.js

export default async function handler(req, res) {
  const token = process.env.PRINTFUL_TOKEN;

  // If you forget to set PRINTFUL_STORE_ID in Vercel, this will still work
  // (it pulls from your default/only store automatically)
  const storeId = process.env.PRINTFUL_STORE_ID;

  // Build the headers — only add X-PF-Store-Id if it's actually set
  const headers = {
    Authorization: `Bearer ${token}`,
    // Only include the store header if the env var exists and isn't empty
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

    // Printful returns { result: [...] } — we just send the array
    res.status(200).json(data.result || []);
  } catch (error) {
    console.error("Printful fetch error:", error);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
}.
