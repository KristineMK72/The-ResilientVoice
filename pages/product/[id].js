// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe Secret Key is missing." });
  }

  const { cartItems } = req.body;
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  try {
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.thumbnail].filter(Boolean), // ✅ use thumbnail
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    // ✅ Fallback origin
    const origin = req.headers.origin || "https://the-resilient-voice.vercel.app";

    console.log("Origin header:", req.headers.origin);
    console.log("Success URL:", `${origin}/success?session_id={CHECKOUT_SESSION_ID}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?order_status=canceled`,
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: `Failed to create Stripe checkout session: ${err.message}` });
  }
}
