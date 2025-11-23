// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Always use a recent, pinned version
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Safety checks
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key missing on server' });
  }

  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    // Your production domain – change only this one place if you ever move!
    const BASE_URL = 'https://the-resilient-voice.vercel.app';

    const line_items = cartItems.map((item) => {
      // Printful gives you thumbnail_url or sometimes a full array – we handle both
      const printfulImageUrl =
        item.thumbnail_url || // most common
        item.image ||         // fallback if you renamed it
        (item.images && item.images[0]) ||
        'https://files.cdn.printful.com/o/upload/missing-image/400x400';

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || 'Unnamed Product',
            images: [printfulImageUrl], // Printful URLs are always absolute & public → perfect for Stripe
          },
          unit_amount: Math.round(parseFloat(item.price) * 100), // e.g. 29.99 → 2999
        },
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`, // Stripe auto-replaces this
      cancel_url: `${BASE_URL}/cart?status=canceled`,
      // Optional but nice:
      metadata: {
        source: 'the-resilient-voice-store',
      },
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Stripe Checkout Session Error:', err);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: err.message,
    });
  }
}
