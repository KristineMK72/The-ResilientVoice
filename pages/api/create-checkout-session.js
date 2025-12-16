// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // DESTRUCTURING CHANGE: Now expecting 'shippingRate' from the frontend
  const { cart, shippingRate } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or invalid' });
  }
  
  // VALIDATION: Ensure a shipping rate has been selected and provided
  if (!shippingRate || !shippingRate.rate || !shippingRate.shipping_method_name) {
      return res.status(400).json({ error: 'Shipping rate details are missing or invalid.' });
  }

  try {
    /* -------------------------
       Build Stripe Line Items (Products Only)
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

    // --- DYNAMIC SHIPPING FIX ---
    // Add the calculated shipping rate as a line item
    const shippingCents = Math.round(Number(shippingRate.rate) * 100);
    
    lineItems.push({
      price_data: {
        currency: 'usd',
        // Use the method name returned by Printful V2 API for clarity
        product_data: { name: `Shipping (${shippingRate.shipping_method_name})` }, 
        unit_amount: shippingCents,
      },
      quantity: 1,
    });
    // ----------------------------

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
            // Include ALL fields the webhook needs for fulfillment
            sync_variant_id: item.sync_variant_id,
            quantity: Number(item.quantity),
            retail_price: Number(item.price).toFixed(2),
            name: item.name,              
            price: item.price,           
            design_url: item.design_url,  
            image: item.image,
          }))
        ),
        // CRITICAL: Store the Printful shipping method ID for the webhook
        shipping_method: shippingRate.shipping, 
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
