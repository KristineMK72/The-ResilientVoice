export default async function handler(req, res) {
  console.log("🌟🌟🌟 NEW CODE IS RUNNING 🌟🌟🌟");

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`
      }
    });

    const json = await response.json();

    // Debugging: Print what Printful sent us
    console.log("PRINTFUL SAID:", JSON.stringify(json, null, 2));

    // Safety Check: If 'result' is missing or not a list, stop!
    if (!json.result || !Array.isArray(json.result)) {
      console.error("❌ STOPPING CRASH: Printful did not return a list.");
      return res.status(200).json([]); // Return empty list instead of crashing
    }

    // Map the products
    const products = json.result.map((item) => ({
      id: item.id,
      name: item.name,
      thumbnail_url: item.thumbnail_url
    }));

    res.status(200).json(products);

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

  } catch (err) {
    console.error("PRINTFUL SERVER ERROR:", err);
    return res.status(500).json([]);
  }
}
