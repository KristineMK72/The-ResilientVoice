import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cart } = req.body;

  // Temporary fixed shipping
  const FIXED_SHIPPING_USD = 7.00;
  const FIXED_SHIPPING_CENTS = Math.round(FIXED_SHIPPING_USD * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      line_items: [
        // Product items from cart
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
        // Fixed shipping line item
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Shipping (Standard)' },
            unit_amount: FIXED_SHIPPING_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // ✅ Correct Printful-ready cart items for synced products
      metadata: {
        cart: JSON.stringify(
          cart.map(item => ({
            sync_variant_id: item.sync_variant_id,  // ← Fixed: key must be sync_variant_id
            quantity: item.quantity,
            retail_price: item.price.toString(),    // Helps Printful calculate your profit
          }))
        ),
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
