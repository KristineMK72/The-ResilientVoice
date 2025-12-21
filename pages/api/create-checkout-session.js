// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

function num(v) {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
    }

    const { cart, shippingCost, address } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    const shipping = num(shippingCost);
    if (!Number.isFinite(shipping) || shipping <= 0) {
      return res.status(400).json({ error: "Shipping cost missing/invalid" });
    }

    // Build Stripe line items from cart (simple + reliable)
    const lineItems = cart.map((item) => {
      const price = num(item.price);
      const qty = Math.max(1, num(item.quantity || 1));

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`Invalid item price for "${item?.name || "item"}"`);
      }
      if (!item.sync_variant_id) {
        throw new Error(`Missing sync_variant_id for "${item?.name || "item"}"`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: String(item.name || "Item"),
            images: item.image ? [String(item.image)] : undefined,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: qty,
      };
    });

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Shipping (Standard)" },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });

    // Absolute URLs (Vercel-safe)
    const origin =
      (req.headers["x-forwarded-proto"] ? `${req.headers["x-forwarded-proto"]}://` : "https://") +
      req.headers.host;

    // Put Printful fulfillment payload in metadata (your webhook can read this)
    const printfulItems = cart.map((item) => ({
      sync_variant_id: Number(item.sync_variant_id),
      quantity: Number(item.quantity || 1),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,

      // Optional: let Stripe also collect address if you ever remove your form
      shipping_address_collection: { allowed_countries: ["US", "CA"] },

      metadata: {
        printful_items: JSON.stringify(printfulItems),
        shipping_cost: String(shipping),
      },

      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    // Return useful details so we can see EXACT Stripe 400 reason
    console.error("❌ Stripe checkout error:", err);
    return res.status(400).json({
      error: err?.raw?.message || err.message || "Stripe error",
      param: err?.raw?.param || null,
      type: err?.raw?.type || null,
      code: err?.raw?.code || null,
    });
  }
}
