// /pages/api/printful-products.js

export default async function handler(req, res) {
  try {
    const result = await fetch("https://api.printful.com/sync/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    const json = await result.json();

    // --- DEBUGGING: Add this line ---
    // This will print exactly what Printful says to your terminal
    console.log("PRINTFUL API RESPONSE:", JSON.stringify(json, null, 2)); 

    // --- SAFETY CHECK: Fix the crash ---
    // We check if result exists AND if it is actually a list (array)
    if (!json.result || !Array.isArray(json.result)) {
      console.error("Printful API Error: Data is not a list.", json);
      // Return an empty list so the website doesn't crash
      return res.status(200).json([]); 
    }

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
