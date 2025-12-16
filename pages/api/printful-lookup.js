// pages/api/printful-lookup.js
export default async function handler(req, res) {
  const q = (req.query.q || "").toString().trim();
  if (!q) return res.status(400).json({ error: "Missing q" });

  const token = process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;
  if (!token) return res.status(500).json({ error: "Missing Printful token" });

  const headers = { Authorization: `Bearer ${token}` };

  // Pull synced products list (paged)
  let offset = 0;
  const limit = 100;
  const matches = [];

  while (offset < 1000) { // safety cap
    const r = await fetch(`https://api.printful.com/sync/products?limit=${limit}&offset=${offset}`, { headers });
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json(j);

    const list = j.result || [];
    for (const p of list) {
      const name = (p.name || "").toLowerCase();
      if (name.includes(q.toLowerCase())) {
        matches.push({
          sync_product_id: String(p.id),
          name: p.name,
          thumbnail_url: p.thumbnail_url,
        });
      }
    }

    if (list.length < limit) break;
    offset += limit;
  }

  res.status(200).json({ q, matches });
}
