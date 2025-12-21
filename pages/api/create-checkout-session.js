// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

function clean(v) {
  return (v || "").toString().trim().replace(/\r/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { cart, address, shipping } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    if (!shipping || !Number.isFinite(Number(shipping.amount)) || Number(shipping.amount) <= 0) {
      return res.status(400).json({ error: "Shipping missing/invalid. Please calculate and select an option first." });
    }

    // Build product line items
    const lineItems = cart.map((item) => {
      const unit = Math.round(Number(item.price) * 100);
      const qty = Number(item.quantity || 1);

      if (!Number.isFinite(unit) || unit <= 0) throw new Error("Invalid item price");
      if (!Number.isFinite(qty) || qty <= 0) throw new Error("Invalid item quantity");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: clean(item.name),
            images: item.image ? [item.image] : [],
          },
          unit_amount: unit,
        },
        quantity: qty,
      };
    });

    // Add shipping line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: `Shipping (${clean(shipping.name || "Standard")})` },
        unit_amount: Math.round(Number(shipping.amount) * 100),
      },
      quantity: 1,
    });

    // Printful items for webhook fallback (uses sync_variant_id)
    const printful_items = cart.map((item) => ({
      sync_variant_id: Number(clean(item.sync_variant_id)),
      quantity: Number(item.quantity || 1),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      line_items: lineItems,

      metadata: {
        shipping_name: clean(shipping.name),
        shipping_amount: String(Number(shipping.amount)),
        printful_items: JSON.stringify(printful_items),
        recipient_snapshot: JSON.stringify({
          name: clean(address?.name),
          address1: clean(address?.address1),
          address2: clean(address?.address2),
          city: clean(address?.city),
          state_code: clean(address?.state_code),
          country_code: clean(address?.country_code),
          zip: clean(address?.zip),
        }),
      },

      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
}
