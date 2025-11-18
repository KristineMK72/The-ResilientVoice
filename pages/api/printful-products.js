export default async function handler(req, res) {
  console.log("🌟🌟🌟 DEBUGGER STARTING 🌟🌟🌟");

  try {
    // 1. Check for API Key
    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      console.error("❌ ERROR: PRINTFUL_ACCESS_TOKEN is missing in .env file");
      return res.status(500).json({ error: "Missing API Token" });
    }

    // 2. Call Printful API
    const response = await fetch('https://api.printful.com/store/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const json = await response.json();

    // 3. LOG THE RESPONSE
    console.log("⬇️⬇️⬇️ PRINTFUL SAID ⬇️⬇️⬇️");
    // console.log(JSON.stringify(json, null, 2)); // Uncomment if you need to see full data
    console.log("Printful result count:", json.result ? json.result.length : "0");
    console.log("⬆️⬆️⬆️ END MESSAGE ⬆️⬆️⬆️");

    // 4. SAFETY CHECK: Did they send a list?
    if (!json.result || !Array.isArray(json.result)) {
      console.error("⚠️ API ERROR: Printful did not return a list of products.");
      return res.status(200).json([]); // Return empty list to prevent crash
    }

    // 5. Map the products
    const products = json.result.map((item) => ({
      id: item.id,
      name: item.name,
      thumbnail_url: item.thumbnail_url
    }));

    res.status(200).json(products);

  } catch (err) {
    console.error("PRINTFUL SERVER ERROR:", err);
    return res.status(500).json([]);
  }
}
