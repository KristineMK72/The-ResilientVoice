// This file runs on the server (safe place for your secret key)
import Stripe from 'stripe';

// Initialize Stripe with your secret key
console.log("Stripe key prefix:", process.env.STRIPE_SECRET_KEY?.slice(0, 8)); // ✅ Debug log
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // 1. Check for the secret key
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe Secret Key is missing. Check your Vercel/local environment settings." });
  }

  // 2. Get the items from the client's request
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  try {
    // 3. Transform cart items into Stripe line items
    const line_items = cartItems.map((item) => {
      const unit_amount = Math.round(parseFloat(item.price) * 100); // Stripe requires cents

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image].filter(Boolean),
          },
          unit_amount: unit_amount,
        },
        quantity: item.quantity,
      };
    });

    // 4. Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/?order_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart?order_status=canceled`,
    });

    // 5. Send the Session ID back to the client
    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: `Failed to create Stripe checkout session: ${err.message}` });
  }
}
