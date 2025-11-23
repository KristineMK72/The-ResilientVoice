// pages/api/cart.js
// This is a very lightweight "server-side echo" cart — most Next.js stores use this pattern
// It just returns whatever the frontend sends (perfectly fine for Stripe Checkout)

export default function handler(req, res) {
  // Allow both GET and POST from anywhere (Vercel is safe)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // You can later connect this to cookies, Vercel KV, or a DB
    // For now just return an empty cart — frontend will hydrate from localStorage
    return res.status(200).json({ items: [] });
  }

  if (req.method === 'POST') {
    const { cartItems } = req.body;

    // Very light validation
    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'cartItems must be an array' });
    }

    // Just echo back whatever the frontend sent — this is all Stripe needs
    return res.status(200).json({ items: cartItems });
  }

  // Anything else → 405
  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
