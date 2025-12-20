// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { cart, shipping } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    const shipRate = Number(shipping?.rate);
    if (!Number.isFinite(shipRate) || shipRate <= 0) {
      return res.status(400).json({ error: "Shipping cost missing/invalid" });
    }

    // Build product line items
    const lineItems = cart.map((item) => {
      if (!item.sync_variant_id) throw new Error("Missing sync_variant_id on cart item");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity || 1),
      };
    });

    // Add shipping as a separate line item (dynamic amount)
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: `Shipping (${shipping?.name || "Standard"})` },
        unit_amount: Math.round(shipRate * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      line_items: lineItems,

      // This is for your fulfillment webhook (Printful):
      metadata: {
        printful_items: JSON.stringify(
          cart.map((item) => ({
            sync_variant_id: Number(item.sync_variant_id),
            quantity: Number(item.quantity || 1),
          }))
        ),
        shipping_name: String(shipping?.name || ""),
        shipping_rate: String(shipRate),
      },

      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({ error: err.message || "Stripe error" });
  }
}
