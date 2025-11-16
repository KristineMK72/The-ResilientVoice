export default async function handler(req, res) {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    console.error('Missing PRINTFUL_API_KEY in environment variables');
    return res.status(500).json({ error: 'Missing PRINTFUL_API_KEY' });
  }

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-PF-Store-Id': '17196995', // Verify this matches your Printful store ID
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Printful API error (status ${response.status}): ${errorText}`);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    if (!data.result || !Array.isArray(data.result)) {
      return res.status(500).json({ error: 'Invalid response from Printful API' });
    }

    const simplified = data.result.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail: p.thumbnail_url || '/images/default.jpg', // Fallback if thumbnail missing
      external: p.external_url || null,
    }));

    res.status(200).json(simplified);
  } catch (e) {
    console.error('Error fetching Printful products:', e.message);
    res.status(500).json({ error: e.message });
  }
}
