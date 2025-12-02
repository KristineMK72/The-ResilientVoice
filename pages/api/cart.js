// pages/api/cart.js  
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET')  return res.status(200).json({ items: [] });

  if (req.method === 'POST') {
    
    const body = req.body || {};

    // If they sent a single item (most common mistake)
    if (body.id || body.name) {
      return res.status(200).json({ items: [body] });
    }

    // If they sent { cartItems: [...] } (correct way)
    if (Array.isArray(body.cartItems)) {
      return res.status(200).json({ items: body.cartItems });
    }

    // If they sent a raw array directly
    if (Array.isArray(body)) {
      return res.status(200).json({ items: body });
    }

    // Fallback — just acknowledge
    return res.status(200).json({ items: [] });
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).end();
}
