// pages/api/create-checkout-session.js

// This file runs on the server (safe place for your secret key)
import Stripe from 'stripe';

// Initialize Stripe with your secret key
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
      // Stripe requires prices in cents/lowest currency unit
      const unit_amount = Math.round(parseFloat(item.price) * 100); 

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image].filter(Boolean), // Use the image URL
          },
          unit_amount: unit_amount,
        },
        quantity: item.quantity,
      };
    });

    // 4. Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      // Redirect back to your site on success or failure
      success_url: `${req.headers.origin}/?order_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart?order_status=canceled`,
    });

    // 5. Send the Session URL back to the client
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: `Failed to create Stripe checkout session: ${err.message}` });
  }
}
