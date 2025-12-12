// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cart, shippingCost, address } = req.body;

  // ----------------------------------------------------
  // *** TEMPORARY DIAGNOSTIC FIX: HARDCODE SHIPPING ***
  // We use this to check if the crash is caused by shippingCost being NaN
  // ----------------------------------------------------
  const FIXED_SHIPPING_USD = 7.00; 
  const FIXED_SHIPPING_CENTS = Math.round(FIXED_SHIPPING_USD * 100);
  // ----------------------------------------------------

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],

      line_items: [
        // Your products (fixed syntax)
        ...cart.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(Number(item.price) * 100),
          },
          quantity: item.quantity,
        })),

        // Shipping as a fixed line item (using hardcoded value)
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping (Standard)',
            },
            unit_amount: FIXED_SHIPPING_CENTS, // <-- FIXED VALUE HERE
          },
          quantity: 1,
        },
      ],

      mode: 'payment',

      // Save address & cart for the webhook
      metadata: {
        address: JSON.stringify(address),
        cart: JSON.stringify(cart),
      },

      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
}
