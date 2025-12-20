// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

function toCents(n) {
  const x = Number(n);
  return Math.round((Number.isFinite(x) ? x : 0) * 100);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { cart, shipping } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    const shippingCost = Number(shipping?.cost);
    const shippingName = (shipping?.name || "Shipping").toString();

    if (!Number.isFinite(shippingCost) || shippingCost <= 0) {
      return res.status(400).json({ error: "Shipping cost missing/invalid. Please calculate shipping and select an option first." });
    }

    // Build line items using existing Stripe Prices via lookup_key = sku
    const lineItems = [];
    for (const item of cart) {
      const qty = Number(item.quantity || 0);
      const sku = (item.sku || "").toString().trim();

      if (!sku) {
        return res.status(400).json({ error: `Cart item "${item.name}" is missing sku (Printful external_id).` });
      }
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const prices = await stripe.prices.list({
        lookup_keys: [sku],
        limit: 1,
      });

      const price = prices.data?.[0];
      if (!price) {
        return res.status(400).json({ error: `No Stripe price found for SKU ${sku}. Did lookup_keys get set?` });
      }

      lineItems.push({ price: price.id, quantity: qty });
    }

    // Add shipping as separate line item (no Printful metadata — webhook will ignore it)
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: shippingName },
        unit_amount: toCents(shippingCost),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      line_items: lineItems,

      // Optional: keep shipping selection on the session
      metadata: {
        shipping_name: shippingName,
        shipping_cost: String(shippingCost),
      },

      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
