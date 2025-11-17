export default async function handler(req, res) {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing PRINTFUL_API_KEY' });

  try {
    // Printful uses BASIC AUTH (important!)
    const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');

    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        Authorization: authHeader,
        'X-PF-Store-Id': '17196995',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Printful API error: ${errorText}`);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    const simplified = data.result.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail: p.thumbnail_url || null,
      price: p.retail_price || 14.99,
    }));

    res.status(200).json(simplified);
  } catch (e) {
    console.error('Fetch error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
