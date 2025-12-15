// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cart } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or invalid' });
  }

  // Fixed shipping
  const FIXED_SHIPPING_USD = 7.0;
  const FIXED_SHIPPING_CENTS = Math.round(FIXED_SHIPPING_USD * 100);

  try {
    /* -------------------------
       Build Stripe Line Items
    -------------------------- */
    const lineItems = cart.map(item => {
      if (!item.sync_variant_id) {
        throw new Error('Missing sync_variant_id on cart item');
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity),
      };
    });

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping (Standard)' },
        unit_amount: FIXED_SHIPPING_CENTS,
      },
      quantity: 1,
    });

    /* -------------------------
       Create Checkout Session
    -------------------------- */
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },

      line_items: lineItems,

      metadata: {
        cart: JSON.stringify(
          cart.map(item => ({
            sync_variant_id: item.sync_variant_id,
            quantity: Number(item.quantity),
            retail_price: Number(item.price).toFixed(2),
          }))
        ),
      },

      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe checkout error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
