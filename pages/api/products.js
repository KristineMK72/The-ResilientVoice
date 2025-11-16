export default async function handler(req, res) {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing PRINTFUL_API_KEY' });

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: { Authorization: `Bearer ${apiKey}`, 'X-PF-Store-Id': '17196995' },
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
      price: p.retail_prices?.[0]?.amount || 14.99, // Fallback price
    }));

    res.status(200).json(simplified);
  } catch (e) {
    console.error('Fetch error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
