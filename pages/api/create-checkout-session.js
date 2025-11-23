// pages/api/create-checkout-session.js   (or app/api/create-checkout-session/route.js if you're on app router)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    // Hard-coded production URL = zero surprises on Vercel
    const BASE_URL = 'https://the-resilient-voice.vercel.app';

    const line_items = cartItems.map((item) => {
      // Printful gives you thumbnail_url in the catalog/sync response
      const imageUrl = item.thumbnail_url || item.image || '';

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: imageUrl ? [imageUrl] : [], // empty array is fine – Stripe just shows no image
          },
          unit_amount: Math.round(item.price * 100), // 29.99 → 2999
        },
        quantity: item.quantity ?? 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cart?status=canceled`,
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ 
      error: 'Failed to create checkout session', 
      details: err.message 
    });
  }
}
