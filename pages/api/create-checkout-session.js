// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cart, shippingCost, address } = req.body; // <--- KEEP THIS LINE

  // ----------------------------------------------------
  // *** TEMPORARY DIAGNOSTIC FIX: HARDCODE SHIPPING ***
  // ----------------------------------------------------
  const FIXED_SHIPPING_USD = 7.00; // Use a reasonable value for testing
  const FIXED_SHIPPING_CENTS = Math.round(FIXED_SHIPPING_USD * 100);
  // ----------------------------------------------------

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        // Your products (NO CHANGE HERE)
        ...cart.map(item => ({
            // ... (product data lines)
            unit_amount: Math.round(Number(item.price) * 100),
          }),
          quantity: item.quantity,
        })),

        // Shipping as a fixed line item (MODIFIED)
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping (Standard)',
            },
            unit_amount: FIXED_SHIPPING_CENTS, // <-- USE HARDCODED VALUE
          },
          quantity: 1,
        },
      ],
    // ... (rest of the code is unchanged)
