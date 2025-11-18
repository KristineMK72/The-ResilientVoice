// /pages/api/printful-products.js

export default async function handler(req, res) {
  try {
    const result = await fetch("https://api.printful.com/sync/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    cconst json = await response.json();

  // --- START NEW CODE ---
  // 1. Log the actual response so we can see the error message in the terminal
  console.log("--- DEBUGGING PRINTFUL RESPONSE ---");
  console.log(JSON.stringify(json, null, 2));
  console.log("-----------------------------------");

  // 2. Safety Check: If 'result' isn't a list, stop before crashing
  if (!json.result || !Array.isArray(json.result)) {
    console.error("PRINTFUL ERROR: API did not return an array of products.");
    return res.status(500).json({ error: "Failed to fetch products", details: json });
  }
  // --- END NEW CODE ---

  const products = json.result.map((item) => { 
      // ... your existing mapping code ...
  });

    const products = json.result.map(p => {
      const name = p.name || "";
      
      // Your custom logic to extract collection from title
      const collection = name.includes(" - ")
        ? name
            .split(" - ")
            .pop()
            .replace("collection", "")
            .trim()
            .toLowerCase()
        : "";

      return {
        id: p.id,
        name: p.name,
        collection,
        thumbnail: p.thumbnail_url,
        sync_variants: p.sync_variants || [],
      };
    });

    return res.status(200).json(products);

  } catch (err) {
    console.error("PRINTFUL SERVER ERROR:", err);
    return res.status(500).json([]);
  }
}
